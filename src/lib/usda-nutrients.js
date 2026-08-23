/**
 * src/lib/usda-nutrients.js — USDA FoodData Central nutrient ID → NutriTrace
 * nutrition key.
 *
 * Shared by two consumers that must agree exactly:
 *   - the live FDC API client in src/lib/api.js (USDA search source), and
 *   - scripts/build-base-foods.mjs, which reads the SR Legacy CSV dump to
 *     generate the bundled base-ingredient catalogue.
 *
 * If these drifted apart, the same food would carry different nutrient keys
 * depending on whether it came from the network or the bundle, and the diary
 * totals would silently disagree. One map, one source of truth.
 */
export const USDA_NUTRIENT_MAP = {
  1008: 'calories',        // Energy kcal
  1062: 'kilojoules',      // Energy kJ
  1003: 'proteins',
  1004: 'fat',
  1258: 'saturated-fat',
  1257: 'trans-fat',
  1292: 'polyunsaturated-fat',
  1268: 'monounsaturated-fat',
  1005: 'carbohydrates',
  2000: 'sugars',
  1235: 'added-sugars',
  1079: 'fiber',
  1093: 'sodium',          // mg
  1253: 'cholesterol',     // mg
  1087: 'calcium',         // mg
  1089: 'iron',            // mg
  1092: 'potassium',       // mg
  1090: 'magnesium',       // mg
  1095: 'zinc',            // mg
  1091: 'phosphorus',      // mg
  1162: 'vitamin-c',       // mg
  1106: 'vitamin-a',       // mcg
  1114: 'vitamin-d',       // mcg
  1109: 'vitamin-e',       // mg
  1185: 'vitamin-k',       // mcg
  1165: 'b1',              // mg
  1166: 'b2',              // mg
  1167: 'b3',              // mg
  1175: 'b6',              // mg
  1177: 'b9',              // mcg (folate)
  1178: 'b12',             // mcg
};
