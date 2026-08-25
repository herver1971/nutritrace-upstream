#!/usr/bin/env node
/**
 * scripts/build-base-foods.mjs — generates src/lib/base-foods.json, the
 * bundled catalogue of base ingredients (onion, potato, almonds…) that backs
 * the "Básicos" search source in the Foods screen.
 *
 * Why a build step instead of a live API call: the USDA FoodData Central API
 * needs a per-user key, answers in English, and drowns raw ingredients under
 * thousands of branded products. Resolving the catalogue once at build time
 * and committing the result gives us Spanish names, offline search, no key,
 * and a diff a human can review when the data changes.
 *
 * Input:
 *   scripts/base-foods/*.json  — hand-curated entries. Each names the food in
 *                                Spanish/English, lists regional aliases, and
 *                                points at ONE SR Legacy row by its exact
 *                                `description` string (the `src` field).
 *   USDA SR Legacy CSV dump    — downloaded on demand into .cache/.
 *
 * Output:
 *   src/lib/base-foods.json    — committed. Nutrition per 100 g plus the
 *                                household portions ("1 unidad mediana =
 *                                110 g") that make logging a vegetable
 *                                bearable without a kitchen scale.
 *
 * Data source: USDA FoodData Central, SR Legacy release 2018-04. Works of the
 * US federal government are not subject to copyright (17 U.S.C. §105), so the
 * values can be redistributed inside NutriTrace without attribution strings
 * or licence friction. That is the whole reason this dataset was picked over
 * BEDCA (redistribution restricted) or CIQUAL (attribution required).
 *
 * Usage:  node scripts/build-base-foods.mjs [--verbose]
 *
 * The script is strict on purpose: if a curated `src` string matches zero or
 * more than one SR Legacy row, it reports every offender and exits non-zero
 * WITHOUT writing output. A silently mismatched row would attach the wrong
 * nutrition to a food name, which is far worse than a failed build.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import { USDA_NUTRIENT_MAP } from '../src/lib/usda-nutrients.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.join(__dirname, '..');
const CURATED   = path.join(__dirname, 'base-foods');
const CACHE     = path.join(ROOT, '.cache', 'fdc');
const OUT       = path.join(ROOT, 'src', 'lib', 'base-foods.json');

const SR_URL     = 'https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip';
const SR_RELEASE = '2018-04';
const SR_DIR     = path.join(CACHE, 'FoodData_Central_sr_legacy_food_csv_2018-04');

const VERBOSE = process.argv.includes('--verbose');
const log = (...a) => console.log(...a);
const vlog = (...a) => { if (VERBOSE) console.log(...a); };

// ── CSV ───────────────────────────────────────────────────────────────────
// The FDC dumps are RFC-4180: quoted fields, doubled quotes to escape, and
// embedded commas/newlines inside quotes (food descriptions are full of
// them — `Beef, chuck, 1/8" fat`). A split(',') would shred those rows, so
// this is a real character-scanner rather than a one-liner.
function parseCsv(file) {
  const txt = fs.readFileSync(file, 'utf8');
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (inQuotes) {
      if (c === '"') {
        if (txt[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  const header = rows.shift();
  // Trailing blank line yields a short row; drop anything that doesn't match
  // the header width rather than emitting objects with undefined columns.
  return rows.filter(r => r.length === header.length)
             .map(r => Object.fromEntries(header.map((h, i) => [h, r[i]])));
}

// ── Dataset fetch ─────────────────────────────────────────────────────────
function ensureDataset() {
  if (fs.existsSync(path.join(SR_DIR, 'food.csv'))) {
    vlog(`[fdc] using cached dump at ${SR_DIR}`);
    return;
  }
  fs.mkdirSync(CACHE, { recursive: true });
  const zip = path.join(CACHE, 'sr_legacy.zip');
  if (!fs.existsSync(zip)) {
    log(`[fdc] downloading SR Legacy ${SR_RELEASE} (~6 MB)…`);
    execFileSync('curl', ['-fsSL', '--retry', '3', '-o', zip, SR_URL], { stdio: 'inherit' });
  }
  log('[fdc] extracting…');
  execFileSync('unzip', ['-oq', zip, '-d', CACHE], { stdio: 'inherit' });
  if (!fs.existsSync(path.join(SR_DIR, 'food.csv'))) {
    throw new Error(`Extraction did not produce ${SR_DIR}/food.csv — did the FDC zip layout change?`);
  }
}

// ── Household portions ────────────────────────────────────────────────────
// Every SR Legacy portion row carries measure_unit_id 9999 ("undetermined"),
// so the actual unit only exists as English free text in `modifier`:
// "cup, chopped", "medium (2-1/2\" dia)", "slice, thin", "10 rings". These
// rules turn the ones worth showing into Spanish unit labels and drop the
// rest. Order matters — first match wins, and the more specific patterns
// (extra large before large, slice before medium) must come first.
const PORTION_RULES = [
  [/\bextra\s*(large|small)\b/i,        null],              // too fiddly to name; skip
  [/\bnlea\b/i,                         null],              // US label serving, meaningless here
  [/^\s*\d*\s*oz\b|\bounce\b/i,         null],              // imperial mass — grams already cover it
  [/\bcups?\b/i,                        'taza'],
  [/\b(tbsp|tablespoons?)\b/i,          'cucharada'],
  [/\b(tsp|teaspoons?)\b/i,             'cucharadita'],
  [/\bcloves?\b/i,                      'diente'],
  [/\bslices?\b/i,                      'rodaja'],
  [/\bfillets?\b/i,                     'filete'],
  [/\b(breasts?|thighs?|drumsticks?|wings?)\b/i, 'unidad'],
  [/\b(pieces?|fruits?)\b/i,            'unidad'],
  [/\bmedium\b/i,                       'unidad mediana'],
  [/\blarge\b/i,                        'unidad grande'],
  [/\bsmall\b/i,                        'unidad chica'],
  [/\bwhole\b/i,                        'unidad'],
];

// Packaging and retail quantities. "1 pint as purchased, yields 357 g" is a
// punnet of strawberries, not a strawberry; "package" is 926 g of chicken.
// Both used to slip through as "1 unidad" and would have had someone log a
// whole tray as a single berry.
const PORTION_BLOCKLIST = /\b(package|pint|quart|gallon|container|box|bag|can|jar|bottle|carton|tray|bunch|head|stalk|serving|yields|purchased)\b/i;

// When more portions survive than we want to show, keep the ones a person
// actually reaches for. "1 unidad mediana" beats "1 taza" beats "1 rodaja".
const PORTION_PRIORITY = [
  'unidad', 'unidad mediana', 'unidad grande', 'unidad chica',
  'taza', 'cucharada', 'cucharadita', 'diente', 'rodaja', 'filete',
];
const MAX_PORTIONS = 4;

/**
 * Turn one SR Legacy portion row's free-text `modifier` into a Spanish unit
 * label, or null to drop it.
 *
 * `description` is the food's own SR Legacy name, used by the last rule: a
 * modifier that just repeats the food's name ("almond" on Nuts, almonds;
 * "avocado, NS as to Florida or California" on Avocados) means one whole
 * piece of it. Requiring that echo is what separates a real unit from noise
 * like "rings", "cherry" or "jumbo", which name a shape or grade rather than
 * a countable piece and would otherwise be labelled "1 unidad" of nonsense.
 */
function classifyPortion(modifier, description) {
  const m = (modifier || '').trim();
  if (!m) return null;
  if (PORTION_BLOCKLIST.test(m)) return null;
  for (const [re, label] of PORTION_RULES) if (re.test(m)) return label;

  const first = m.toLowerCase().replace(/[^a-z\s].*$/, '').trim().split(/\s+/)[0] || '';
  if (first.length < 4) return null;
  const words = description.toLowerCase().match(/[a-z]+/g) || [];
  // Prefix match in both directions so singular/plural agree
  // ("almond" ↔ "almonds", "tomatoes" ↔ "tomato").
  if (words.some(w => w.startsWith(first.slice(0, 4)) && (w.startsWith(first) || first.startsWith(w)))) {
    return 'unidad';
  }
  return null;
}

function buildPortions(rows, description) {
  const seen = new Map();
  for (const r of rows) {
    const label = classifyPortion(r.modifier, description);
    if (!label) continue;
    const amount = Number(r.amount);
    const grams  = Number(r.gram_weight);
    if (!Number.isFinite(amount) || amount <= 0) continue;
    if (!Number.isFinite(grams) || grams <= 0) continue;
    // Rows are "amount unit = gram_weight" (e.g. 10 rings = 60 g); alt_units
    // stores grams for ONE unit, so divide back out.
    const per = grams / amount;
    if (per < 0.1 || per > 5000) continue;          // guard against junk rows
    if (seen.has(label)) continue;                  // first row per label wins
    seen.set(label, Math.round(per * 10) / 10);
  }
  return [...seen.entries()]
    .sort((a, b) => {
      const ai = PORTION_PRIORITY.indexOf(a[0]), bi = PORTION_PRIORITY.indexOf(b[0]);
      return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
    })
    .slice(0, MAX_PORTIONS)
    .map(([abbr, grams]) => ({ abbr, grams }));
}

// ── Traffic light ─────────────────────────────────────────────────────────
// A colour per food, meant as a substitution aid: "within this category, is
// this a better or worse pick than its neighbours?" It is NOT a health verdict
// on the food in isolation, and it is not one of the validated label schemes.
//
// Deliberately NOT a single formula across all categories. A first attempt at
// one scored olive oil worse than sunflower, mackerel red, and cornstarch
// green -- because what separates a good oil (its saturated share) is not what
// separates a good grain (its fibre density) or a good fish (its salt load).
// Each category is judged on the axis that actually differentiates it.
//
// The axes are weighted toward lowering LDL and liver fat: saturated fat,
// free sugars, sodium, and fibre. Thresholds are calibrated against the real
// spread in this catalogue, not taken from a standard, so they are documented
// here and easy to re-tune.
const LIGHT = { GREEN: 'green', AMBER: 'amber', RED: 'red' };

function trafficLight(cat, n) {
  const v    = k => Number(n[k] || 0);
  const sat  = v('saturated-fat'), sug = v('sugars'), na = v('sodium');
  const fib  = v('fiber'), carb = v('carbohydrates'), kcal = v('calories');
  // Lower value = better, so thresholds read in ascending order.
  const band = (x, green, amber) =>
    x <= green ? LIGHT.GREEN : x <= amber ? LIGHT.AMBER : LIGHT.RED;

  switch (cat) {
    case 'aceites': {
      // Industrial trans is the one unambiguous harm; margarine lands here.
      if (v('trans-fat') > 2) return LIGHT.RED;
      const unsat = v('monounsaturated-fat') + v('polyunsaturated-fat');
      const total = sat + unsat;
      if (!total) return LIGHT.AMBER;
      // Share of saturated, not grams: every oil is ~100 g of fat, so only
      // the composition can tell them apart.
      return band(100 * sat / total, 20, 45);
    }
    case 'carnes':  return band(sat, 3, 7);
    // Every fish here sits under 3.5 g saturated, so fat cannot separate them.
    // Salting and smoking can, and that is the real difference between a
    // fresh fillet and salt cod.
    case 'pescados': return na > 1500 ? LIGHT.RED
                          : (na > 600 || sat > 4) ? LIGHT.AMBER : LIGHT.GREEN;
    case 'lacteos': {
      // Sugar has to be checked too, or dulce de leche passes on fat alone.
      const bySugar = band(sug, 12, 25);
      const byFat   = band(sat, 2, 10);
      return [bySugar, byFat].includes(LIGHT.RED) ? LIGHT.RED
           : [bySugar, byFat].includes(LIGHT.AMBER) ? LIGHT.AMBER : LIGHT.GREEN;
    }
    case 'cereales': {
      // Fibre per gram of carbohydrate, not grams of fibre: a cooked grain is
      // mostly water, so absolute fibre would mark every cooked entry poor.
      // This ratio survives cooking and is exactly the wholegrain signal —
      // brown rice 0.047 vs white 0.016.
      if (!carb) return LIGHT.GREEN;
      return band(-(fib / carb), -0.04, -0.02);
    }
    case 'frutas':  return sug > 40 ? LIGHT.AMBER : LIGHT.GREEN;  // dried concentrates sugar
    case 'verduras': return LIGHT.GREEN;
    case 'legumbres':    return na > 600 ? LIGHT.AMBER : LIGHT.GREEN;
    case 'frutos-secos': return na > 300 ? LIGHT.AMBER : LIGHT.GREEN;
    case 'dulces':  return band(sug, 10, 40);
    case 'condimentos': return band(na, 800, 3000);
    case 'bebidas': {
      // Alcohol carries energy the sugar figure does not account for.
      if (kcal > 35 && sug < 3) return LIGHT.AMBER;
      return band(sug, 4, 10);
    }
    default: return LIGHT.GREEN;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────
function main() {
  ensureDataset();

  log('[fdc] reading CSVs…');
  const foods     = parseCsv(path.join(SR_DIR, 'food.csv'));
  const nutrients = parseCsv(path.join(SR_DIR, 'food_nutrient.csv'));
  const portions  = parseCsv(path.join(SR_DIR, 'food_portion.csv'));

  // description → [fdc_id]. Kept as an array so an ambiguous curated `src`
  // is reported instead of silently resolving to whichever row came first.
  const byDescription = new Map();
  for (const f of foods) {
    const key = f.description.trim().toLowerCase();
    if (!byDescription.has(key)) byDescription.set(key, []);
    byDescription.get(key).push(f);
  }

  const nutrientsByFood = new Map();
  for (const n of nutrients) {
    const key = USDA_NUTRIENT_MAP[Number(n.nutrient_id)];
    if (!key) continue;
    if (!nutrientsByFood.has(n.fdc_id)) nutrientsByFood.set(n.fdc_id, {});
    // SR Legacy amounts are already per 100 g of edible portion, which is
    // exactly the basis NutriTrace stores — no scaling needed here.
    const amount = Number(n.amount);
    if (Number.isFinite(amount)) nutrientsByFood.get(n.fdc_id)[key] = amount;
  }

  const portionsByFood = new Map();
  for (const p of portions) {
    if (!portionsByFood.has(p.fdc_id)) portionsByFood.set(p.fdc_id, []);
    portionsByFood.get(p.fdc_id).push(p);
  }

  // Load curated entries, one file per category.
  const files = fs.readdirSync(CURATED).filter(f => f.endsWith('.json')).sort();
  const curated = [];
  for (const file of files) {
    const entries = JSON.parse(fs.readFileSync(path.join(CURATED, file), 'utf8'));
    for (const e of entries) curated.push({ ...e, _file: file });
  }
  log(`[curated] ${curated.length} entries across ${files.length} categories`);

  const problems = [];
  const seenIds = new Set();
  const out = [];

  for (const e of curated) {
    for (const field of ['id', 'cat', 'es', 'en', 'src']) {
      if (!e[field]) problems.push(`${e._file}: entry ${e.id || '(no id)'} is missing "${field}"`);
    }
    if (seenIds.has(e.id)) problems.push(`${e._file}: duplicate id "${e.id}"`);
    seenIds.add(e.id);

    const matches = byDescription.get(String(e.src).trim().toLowerCase());
    if (!matches) { problems.push(`${e._file}: "${e.id}" → no SR Legacy row matches src ${JSON.stringify(e.src)}`); continue; }
    if (matches.length > 1) {
      problems.push(`${e._file}: "${e.id}" → src ${JSON.stringify(e.src)} matches ${matches.length} rows (${matches.map(m => m.fdc_id).join(', ')})`);
      continue;
    }
    const food = matches[0];
    const nutrition = nutrientsByFood.get(food.fdc_id);
    if (!nutrition || nutrition.calories == null) {
      problems.push(`${e._file}: "${e.id}" → fdc ${food.fdc_id} has no energy value`);
      continue;
    }

    out.push({
      id:   e.id,
      cat:  e.cat,
      fdc:  Number(food.fdc_id),
      name:  { es: e.es, en: e.en },
      alias: { es: e.alias || [] },
      nutrition,
      units: buildPortions(portionsByFood.get(food.fdc_id) || [], food.description),
      light: trafficLight(e.cat, nutrition),
    });
  }

  // Two curated entries resolving to the same SR Legacy row is not just
  // redundant data -- they end up sharing a barcode (fdcId_<n>), which is the
  // key the Foods screen uses for its keyed {#each}. Svelte throws on
  // duplicate keys, and the thrown error takes the whole search view down
  // until a full reload. ("tomate" and "tomate cherry" pointed at the same row
  // and did exactly that.) If two names should share nutrition, one of them
  // belongs in the other's `alias` list, not in a second entry.
  const byFdc = new Map();
  for (const f of out) {
    if (!byFdc.has(f.fdc)) byFdc.set(f.fdc, []);
    byFdc.get(f.fdc).push(f.id);
  }
  for (const [fdc, ids] of byFdc) {
    if (ids.length > 1) {
      problems.push(`fdc ${fdc} is claimed by ${ids.length} entries (${ids.join(', ')}) — they would share a barcode; fold all but one into the survivor's "alias" list`);
    }
  }

  if (problems.length) {
    console.error(`\n✗ ${problems.length} problem(s) — nothing written:\n`);
    for (const p of problems) console.error('  ' + p);
    process.exit(1);
  }

  out.sort((a, b) => a.name.es.localeCompare(b.name.es, 'es'));

  const doc = {
    version: 1,
    generated: new Date().toISOString().slice(0, 10),
    source: {
      name: 'USDA FoodData Central — SR Legacy',
      release: SR_RELEASE,
      url: 'https://fdc.nal.usda.gov/',
      license: 'Public domain (17 U.S.C. §105)',
    },
    categories: [...new Set(out.map(f => f.cat))].sort(),
    foods: out,
  };

  fs.writeFileSync(OUT, JSON.stringify(doc, null, 0) + '\n');

  const withUnits = out.filter(f => f.units.length).length;
  const bytes = fs.statSync(OUT).size;
  log(`\n✓ ${out.length} foods → ${path.relative(ROOT, OUT)} (${(bytes / 1024).toFixed(0)} KB)`);
  log(`  ${withUnits} with household portions, ${doc.categories.length} categories`);
}

main();
