/**
 * Static-analysis tests for POST /api/v1/wellness wiring.
 *
 * Mirrors scripts/v1-activity-wiring.test.js: the route is only reachable
 * if the router is mounted AND the scope is registered in both
 * KNOWN_SCOPES and SCOPE_DESCRIPTIONS. Each half fails silently on its
 * own — an unmounted router 404s, an unregistered scope makes token
 * creation reject the scope — so they are asserted together.
 */
import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';

const v1Index    = readFileSync(new URL('../server/routes/api/v1/index.js', import.meta.url), 'utf8');
const wellnessJs = readFileSync(new URL('../server/routes/api/v1/wellness.js', import.meta.url), 'utf8');
const tokensJs   = readFileSync(new URL('../server/lib/api-tokens.js', import.meta.url), 'utf8');

test('v1 index imports and mounts the wellness router at /wellness', () => {
  assert.match(v1Index, /import wellnessRouter[\s\S]*from '\.\/wellness\.js'/);
  assert.match(v1Index, /router\.use\('\/wellness',\s*wellnessRouter\)/);
});

test('write:wellness scope is registered in KNOWN_SCOPES', () => {
  assert.match(tokensJs, /KNOWN_SCOPES = new Set\(\[[\s\S]*'write:wellness'[\s\S]*\]\)/);
});

test('write:wellness has a SCOPE_DESCRIPTIONS entry so the Settings UI can label it', () => {
  assert.match(tokensJs, /SCOPE_DESCRIPTIONS = \{[\s\S]*'write:wellness':[\s\S]*\}/);
});

test('POST /api/v1/wellness requires the write:wellness scope', () => {
  assert.match(wellnessJs, /router\.post\('\/',\s*requireScope\('write:wellness'\)/);
});

test('POST /api/v1/wellness validates date, metrics shape and metric names', () => {
  assert.match(wellnessJs, /bad_date/);
  assert.match(wellnessJs, /bad_metrics/);
  assert.match(wellnessJs, /unknown_metric/);
  assert.match(wellnessJs, /out_of_range/);
});

test('POST /api/v1/wellness upserts into wellness_data on (user, date, source, metric)', () => {
  assert.match(wellnessJs, /INSERT INTO wellness_data/);
  assert.match(wellnessJs, /ON CONFLICT\(user_id, date, source, metric_type\)/);
});

test('wellness endpoint does NOT write body composition (that is body-measurements territory)', () => {
  // Strip comments first: the header explains why body composition is
  // excluded, and naming the fields there must not fail the test that
  // checks they are absent from the code.
  const code = wellnessJs.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  assert.ok(!/weight_kg|body_fat_pct|lean_mass_kg/.test(code));
  assert.ok(!/diary/.test(code));
});

test('every metric declares a sanity range', () => {
  const block = wellnessJs.match(/const METRICS = \{([\s\S]*?)\n\};/)[1];
  const entries = block.split('\n').filter(l => /^\s+\w+:/.test(l));
  assert.ok(entries.length >= 20, `expected the full metric table, got ${entries.length}`);
  for (const line of entries) {
    assert.match(line, /:\s*\[-?\d+(\.\d+)?,\s*\d+\]/, `metric without a range: ${line.trim()}`);
  }
});
