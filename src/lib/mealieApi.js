/**
 * mealieApi.js — Mealie self-hosted recipe manager integration
 * Docs: https://docs.mealie.io/documentation/getting-started/api-usage/
 * Auth: Bearer token created at /user/profile/api-tokens in Mealie UI
 *
 * All requests are proxied through /api/mealie/proxy to avoid CORS.
 */
import { DB } from './db.js';
import { apiUrl, isNative, getServerUrl, getAuthToken } from './platform.js';
import { Nutrition } from './nutrition.js';

function _cfg() {
  const baseUrl = (DB.getSetting('mealieBaseUrl', '') || '').replace(/\/$/, '');
  const token   = DB.getSetting('mealieApiToken', '') || '';
  return { baseUrl, token };
}

async function _proxy(path) {
  const { baseUrl, token } = _cfg();
  if (!baseUrl || !token) return null;
  const csrf = !isNative ? localStorage.getItem('nt:csrf') : null;
  const res = await fetch(apiUrl('/api/mealie/proxy'), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(isNative && getServerUrl() && getAuthToken() ? { 'Authorization': `Bearer ${getAuthToken()}` } : {}),
      ...(csrf ? { 'X-CSRF-Token': csrf } : {}),
    },
    body: JSON.stringify({ baseUrl, token, path }),
  });
  if (!res.ok) return null;
  return res.json();
}


// ── Per-100 g nutrition from the ingredient list ──────────────────────────
//
// Mealie states a recipe's nutrition per serving, which is fine for eating a
// serving and useless for weighing out a portion. Converting to per 100 g only
// needs one more number: the dish's mass.
//
// That mass comes from the ingredient list rather than from the catalogue's
// nutrition, and the distinction matters. Summing each ingredient's nutrition
// requires recognising every ingredient — miss the 1.5 kg of pork in a braise
// and the total is nonsense. Summing mass mostly does not: most quantities are
// already stated in grams, so the catalogue is only consulted for the ones
// counted in spoons or units, and a missed spoonful of paprika changes
// nothing. Across this user's recipes that took usable coverage from 3-of-7
// to every recipe.
//
// The mass is of the RAW ingredients. Dishes that absorb water while cooking
// (pasta, rice, pulses) end up heavier than this, so their per-100 g figure
// reads high; roasts and braises lose water and read low. Weighing the
// finished dish and correcting the portion is the way out, which is why the
// estimate is reported rather than silently applied.

const _MASS_UNITS = {
  gramo: 1, gramos: 1, g: 1, gr: 1, kilogramo: 1000, kilogramos: 1000, kg: 1000,
  mililitro: 1, mililitros: 1, ml: 1, cc: 1, litro: 1000, litros: 1000, l: 1000,
  gram: 1, grams: 1, kilogram: 1000, milliliter: 1, milliliters: 1, liter: 1000,
};
// Mealie unit name → the alt_units label the base catalogue stores.
const _COUNT_UNITS = {
  cucharada: 'cucharada', cucharadas: 'cucharada', tablespoon: 'cucharada', tbsp: 'cucharada',
  cucharadita: 'cucharadita', cucharaditas: 'cucharadita', teaspoon: 'cucharadita', tsp: 'cucharadita',
  taza: 'taza', tazas: 'taza', cup: 'taza', cups: 'taza',
  diente: 'diente', dientes: 'diente', clove: 'diente', cloves: 'diente',
  unidad: 'unidad', unidades: 'unidad', rodaja: 'rodaja', rodajas: 'rodaja',
  filete: 'filete', filetes: 'filete',
};

/**
 * Estimated mass in grams of everything a recipe is made of.
 * Returns { grams, resolved, total, unresolved } so a caller can judge whether
 * to trust it — a recipe whose big items did not resolve should not be used.
 */
export async function estimateRecipeMass(recipe) {
  const ings = recipe?.recipeIngredient || [];
  let grams = 0, resolved = 0;
  const unresolved = [];
  let BaseFoods = null;
  for (const ing of ings) {
    const q = parseFloat(ing.quantity) || 0;
    if (!q) { continue; }                       // "sal a gusto" has no mass to add
    const unit = String(ing.unit?.name || '').toLowerCase().trim();
    let g = null;
    if (_MASS_UNITS[unit] != null) {
      g = q * _MASS_UNITS[unit];
    } else {
      // Counted in spoons or pieces: the catalogue knows what one weighs.
      const label = unit ? _COUNT_UNITS[unit] : 'unidad';
      if (label && ing.food?.name) {
        if (!BaseFoods) ({ BaseFoods } = await import('./base-foods.js'));
        const hit = (await BaseFoods.searchByNameWithMeta(ing.food.name, 1, 1)).items[0];
        const au = hit?.alt_units?.find(a => a.abbr === label || (label === 'unidad' && /^unidad/.test(a.abbr)));
        if (au) g = q * au.grams;
      }
    }
    if (g == null) unresolved.push(ing.display || ing.food?.name || '?');
    else { grams += g; resolved++; }
  }
  return { grams: Math.round(grams), resolved, total: ings.length, unresolved };
}

const Mealie = {
  isConfigured() {
    const { baseUrl, token } = _cfg();
    return !!(baseUrl && token);
  },

  /** Search recipes by name. Returns list of recipe summaries. */
  async search(query, page = 1) {
    if (!query) return [];
    try {
      const filter = `name LIKE "%${query}%"`;
      const data = await _proxy(`/api/recipes?queryFilter=${encodeURIComponent(filter)}&perPage=10&page=${page}`);
      return data?.items || [];
    } catch(e) {
      console.error('[Mealie] search failed:', e);
      return [];
    }
  },

  /** Paginated search returning items + pagination metadata for
      infinite-scroll callers. Same shape as API.searchByNameWithMeta and
      USDA.searchByNameWithMeta so Foods.svelte can treat all three
      external sources uniformly. Mealie returns `total` + `total_pages`
      on the response envelope, so hasMore is exact. #96. */
  async searchWithMeta(query, page = 1, perPage = 10) {
    if (!query) return { items: [], totalHits: 0, page, hasMore: false };
    try {
      const filter = `name LIKE "%${query}%"`;
      const data = await _proxy(`/api/recipes?queryFilter=${encodeURIComponent(filter)}&perPage=${perPage}&page=${page}`);
      const items = data?.items || [];
      const totalHits = typeof data?.total === 'number' ? data.total : items.length;
      const totalPages = typeof data?.total_pages === 'number' ? data.total_pages : Math.ceil(totalHits / perPage);
      const hasMore = page < totalPages;
      return { items, totalHits, page, hasMore };
    } catch(e) {
      console.error('[Mealie] search failed:', e);
      return { items: [], totalHits: 0, page, hasMore: false };
    }
  },

  /** Get full recipe details by slug, including nutrition. */
  async getRecipe(slug) {
    if (!slug) return null;
    try {
      return await _proxy(`/api/recipes/${slug}`);
    } catch(e) {
      console.error('[Mealie] getRecipe failed:', e);
      return null;
    }
  },

  /** Test the connection — returns true if the server can reach Mealie. */
  async testConnection() {
    try {
      const data = await _proxy('/api/recipes?perPage=1&page=1');
      return data != null;
    } catch {
      return false;
    }
  },

  /** Build the full image URL for a recipe (loaded directly by the browser — no CORS issue for <img>). */
  imageUrl(recipeId) {
    const { baseUrl } = _cfg();
    if (!baseUrl || !recipeId) return '';
    // In the browser, route through our own server rather than hitting Mealie
    // directly. A self-hosted Mealie is nearly always plain HTTP on a LAN
    // address, and when NutriTrace is served over HTTPS the browser blocks
    // those <img> requests as mixed content -- with no auto-upgrade, because
    // the host is a bare IP. The server route also supplies the Mealie bearer
    // token, which an <img> tag cannot send.
    //
    // Native keeps the direct URL: the WebView isn't subject to that rule, and
    // its bearer auth wouldn't survive an <img src> to our own API anyway.
    //
    // Only affects live thumbnails. Recipes actually saved into the library go
    // through the server's localizeImage(), which downloads the file to
    // /uploads/ -- those already worked and are untouched.
    if (!isNative) return apiUrl(`/api/mealie/image/${recipeId}`);
    return `${baseUrl}/api/media/recipes/${recipeId}/images/original.webp`;
  },

  /**
   * Map a full Mealie recipe object to the app's food structure.
   * Nutrition is per-serving; portion=100, unit='serving' so diary qty = servings.
   */
  mapRecipe(recipe) {
    const { baseUrl } = _cfg();
    const n = recipe.nutrition || {};
    const pf = v => parseFloat(v) || 0;

    let brand = '';
    if (recipe.orgURL) {
      try { brand = new URL(recipe.orgURL).hostname.replace(/^www\./, ''); } catch {}
    }

    return {
      name:      recipe.name || 'Unnamed Recipe',
      brand,
      portion:   100,
      unit:      'serving',
      quantity:  1,
      imgUrl:    recipe.id ? `${baseUrl}/api/media/recipes/${recipe.id}/images/original.webp` : '',
      dateTime:  new Date().toISOString(),
      categories: [],
      _source:   'mealie',
      _mealieSlug: recipe.slug,
      nutrition: Nutrition.deriveSodiumSalt({
        calories:        pf(n.calories),
        proteins:        pf(n.proteinContent),
        carbohydrates:   pf(n.carbohydrateContent),
        fat:             pf(n.fatContent),
        'saturated-fat': pf(n.saturatedFatContent),
        fiber:           pf(n.fiberContent),
        sugars:          pf(n.sugarContent),
        sodium:          pf(n.sodiumContent),
        cholesterol:     pf(n.cholesterolContent),
        'trans-fat':     pf(n.transFatContent),
      }),
    };
  },
};

export { Mealie };
