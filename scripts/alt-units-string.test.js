import assert from 'node:assert/strict';
import test from 'node:test';

import { scaleFactor } from '../src/lib/units.js';

// hydrateItems() re-attaches alt_units to diary items as the foods column
// stores it: a JSON string. Editing "1 rebanada" to "66 g" must still convert
// through the slice weight instead of multiplying by 66.
const pan = {
  nutrition_basis: 'g',
  alt_units: '[{"abbr":"rebanada","grams":54.7},{"abbr":"porción","grams":109.4}]',
};

test('alt_units as a JSON string converts a household unit to grams', () => {
  const f = scaleFactor(1, 'rebanada', 66, 'g', pan);
  assert.ok(Math.abs(f - 66 / 54.7) < 1e-9, `factor ${f}`);
});

test('alt_units as an array keeps working', () => {
  const f = scaleFactor(1, 'rebanada', 66, 'g', { ...pan, alt_units: JSON.parse(pan.alt_units) });
  assert.ok(Math.abs(f - 66 / 54.7) < 1e-9, `factor ${f}`);
});

test('a malformed alt_units string falls back without throwing', () => {
  assert.doesNotThrow(() => scaleFactor(1, 'rebanada', 66, 'g', { ...pan, alt_units: '{roto' }));
});
