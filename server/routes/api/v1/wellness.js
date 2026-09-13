/**
 * POST /api/v1/wellness — push daily wellness metrics (steps, active
 * calories, sleep, resting HR…) from a headless integration.
 *
 * Fills the gap left by the other three v1 write endpoints:
 *
 *   /api/v1/body-measurements → body composition only. Its FIELD_MAP and
 *       extras list are closed (weight, body fat, lean mass, BMI, visceral
 *       fat, BMR, impedance, body score); anything else in the payload is
 *       silently dropped, so `steps` posted there returns `no_fields`.
 *   /api/v1/workouts          → one workout session, plus a calories_out
 *       rollup for the dynamic-TDEE lookup.
 *   /api/v1/activity          → one diary Activity row.
 *
 * None of them can say "yesterday I walked 10 978 steps". That number is
 * a daily aggregate, not a session and not a body measurement, and until
 * now the only thing that could write it was the Android app's Health
 * Connect sync. Users who don't run the phone app — or who already have
 * the data in Home Assistant / Gadgetbridge / a Garmin scraper — had no
 * way in.
 *
 * Storage: wellness_data, one row per (user_id, date, source, metric).
 * Same table the Fitbit / Garmin / Google Health syncs write to, so the
 * data renders in Wellness and feeds the existing consumers:
 *
 *   - `steps` lights up the steps goal in the diary and Statistics.
 *   - `active_calories` feeds wearableActiveCalories() in
 *     lib/active-calories.js, which the calorie goal reads through
 *     effectiveActiveCalories() under the user's manualActivityPolicy.
 *   - `calories_out` feeds the dynamic-TDEE lookup, where it outranks
 *     LiftTrace (see routes/api/v1/workouts.js).
 *   - sleep_* / resting_hr / spo2_avg render in Wellness → Sleep + Heart.
 *
 * `source` is caller-chosen on purpose. The cross-source readers take
 * MAX() or a priority order per source, so a Home Assistant push and a
 * Fitbit sync coexist instead of overwriting each other. Re-posting the
 * same (date, source, metric) updates in place — the endpoint is safe to
 * call on a timer.
 *
 * Wire contract:
 *   {
 *     date:    "2026-09-12",          // required, YYYY-MM-DD
 *     source:  "home-assistant",      // optional, ≤64 chars, default "external"
 *     metrics: {                      // required, ≥1 known metric
 *       steps:              10978,
 *       active_calories:    794,
 *       sleep_duration_min: 416
 *     }
 *   }
 *
 * Unknown metric names are rejected rather than ignored: a typo that
 * silently writes nothing is the failure mode this endpoint exists to
 * avoid. The response echoes what was written so a caller can log it.
 */
import { Router } from 'express';
import db from '../../../db.js';
import { wrap } from '../../../logger.js';
import { requireScope } from '../../../middleware/bearer-auth.js';

const router = Router();

// Daily aggregate metrics this endpoint accepts, with sanity ranges.
// Names match what the Fitbit / Garmin / Google Health syncs already
// write, so the Wellness views and goal lookups find them without any
// per-source mapping. Body composition is deliberately absent — that is
// /api/v1/body-measurements' job, and letting both write `weight_kg`
// would give two sources of truth for the same number.
const METRICS = {
  steps:                [0, 200000],
  distance_km:          [0, 500],
  floors:               [0, 1000],
  active_calories:      [0, 10000],
  calories_out:         [0, 20000],
  active_minutes:       [0, 1440],
  active_zone_minutes:  [0, 1440],
  moderate_intensity_min: [0, 1440],
  vigorous_intensity_min: [0, 1440],
  resting_hr:           [20, 220],
  avg_heart_rate:       [20, 220],
  max_hr:               [20, 250],
  hrv_daily_rmssd:      [0, 500],
  respiratory_rate:     [0, 60],
  spo2_avg:             [50, 100],
  vo2_max:              [0, 100],
  stress_avg:           [0, 100],
  body_battery_high:    [0, 100],
  body_battery_low:     [0, 100],
  sleep_duration_min:   [0, 1440],
  sleep_deep_min:       [0, 1440],
  sleep_rem_min:        [0, 1440],
  sleep_light_min:      [0, 1440],
  sleep_awake_min:      [0, 1440],
  sleep_wake_min:       [0, 1440],
  sleep_efficiency:     [0, 100],
  sleep_score:          [0, 100],
  sleep_interruptions:  [0, 100],
  skin_temp_variation:  [-20, 20],
  water_ml:             [0, 20000],
};

router.post('/', requireScope('write:wellness'), wrap((req, res) => {
  const { date, source, metrics } = req.body || {};

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
    return res.status(400).json({ error: 'date must be YYYY-MM-DD', code: 'bad_date' });
  }
  if (!metrics || typeof metrics !== 'object' || Array.isArray(metrics)) {
    return res.status(400).json({ error: 'metrics must be an object', code: 'bad_metrics' });
  }

  const src = String(source || 'external').trim().slice(0, 64) || 'external';

  // Validate everything before writing anything: a payload with one bad
  // field should fail whole rather than leave half a day's metrics in.
  const accepted = {};
  for (const [name, raw] of Object.entries(metrics)) {
    const range = METRICS[name];
    if (!range) {
      return res.status(400).json({
        error: `unknown metric "${name}"`, code: 'unknown_metric', field: name,
        known: Object.keys(METRICS),
      });
    }
    if (raw === null) continue;           // explicit null = "no reading", skip quietly
    const v = Number(raw);
    if (!Number.isFinite(v)) {
      return res.status(400).json({ error: `${name} must be a number`, code: 'bad_value', field: name });
    }
    if (v < range[0] || v > range[1]) {
      return res.status(400).json({
        error: `${name}=${v} outside [${range[0]}..${range[1]}]`, code: 'out_of_range', field: name,
      });
    }
    accepted[name] = v;
  }

  if (Object.keys(accepted).length === 0) {
    return res.status(400).json({ error: 'no usable metrics provided', code: 'no_metrics' });
  }

  // wellness_data stores the synthetic user 0 for single-user mode, the
  // same convention body-measurements uses.
  const userId = req.apiUser.id;
  const uid = (userId === 0 || userId == null) ? 0 : userId;

  const upsert = db.prepare(`
    INSERT INTO wellness_data (user_id, date, source, metric_type, value, metadata, synced_at)
    VALUES (?, ?, ?, ?, ?, '{}', datetime('now'))
    ON CONFLICT(user_id, date, source, metric_type)
    DO UPDATE SET value = excluded.value, synced_at = excluded.synced_at
  `);
  const writeAll = db.transaction(rows => {
    for (const [name, v] of Object.entries(rows)) upsert.run(uid, date, src, name, v);
  });
  writeAll(accepted);

  res.json({ ok: true, date, source: src, written: accepted });
}));

export default router;
