<script>
  /**
   * FoodDetailSheet — read-only slide-up bottom sheet for a saved food.
   *
   * Phase 2 of the NutritionFactsBox rollout. Replaces the previous "tap a
   * food → navigate to /foods/edit/<id>" flow on the Foods tab with a
   * lighter, in-place card view. The user sees the FDA-style Nutrition
   * Facts card immediately, can log to today's diary without leaving the
   * Foods tab, and reaches the full editor only when they explicitly tap
   * Edit.
   *
   * Visual layout is a 1:1 port of CookTrace's PantryItemSheet minus the
   * pantry-specific bits (no in-stock toggle, no on-hand quantity, no
   * category, no used-in-recipes list). Two-column grid on desktop
   * (≥768px): left column is photo + identity card, right column is stats
   * (Serving Size + Meal picker) + Nutrition Facts card + Add to Diary
   * action. Footer has Delete + Edit. Mobile collapses to single column;
   * the stats grid also collapses (<480px) for tight phone screens.
   *
   * Phase 3 will add inline edit mode + a kebab menu surfacing OFF actions
   * (Refresh from OFF, Contribute to OFF, Save as Copy). For now, Edit
   * always opens the full FoodEditor so no editor capability is lost.
   *
   * Props:
   *   open         — bind:open from the parent. Standard Sheet binding.
   *   food         — the food row to display. NT food shape (imgUrl,
   *                  portion, unit, nutrition, etc.). Null while closed.
   *   defaultMeal  — meal index (0..3) the picker opens to. Parent passes
   *                  the user's last-used meal so the common case is one
   *                  tap on Add to Diary.
   *
   * Events:
   *   edit         — user tapped Edit. Parent opens FoodEditor.
   *   addToDiary   — user tapped + Add to Diary. detail: {food, meal}.
   *   deleted      — user tapped Delete and confirmed. Parent refreshes
   *                  the foods list.
   *   close        — user dismissed the sheet without action.
   */
  import { createEventDispatcher, tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import { _, locale } from 'svelte-i18n';
  import Sheet from './Sheet.svelte';
  import ActionSheet from './ActionSheet.svelte';
  import NutritionFactsBox from './NutritionFactsBox.svelte';
  import { resolveAssetUrl } from '../../lib/platform.js';
  import { Nutrition, energyUnitSuffix } from '../../lib/nutrition.js';
  import { energyUnit, mealNames, disableAnimations } from '../../stores/settings.js';
  import { NtApi } from '../../lib/api.js';
  import { confirmDialog } from '../../stores/confirmDialog.js';
  import { showSuccess, showError } from '../../stores/toast.js';

  export let open = false;
  export let food = null;
  // Embedded mode: render the detail content inline (no Sheet
  // wrapper), used by the Foods desktop right pane. Skips the
  // slide-up modal chrome and lets the parent decide layout.
  export let embedded = false;
  // Callback fired by the embedded × button to clear the pane.
  // Only rendered in embedded mode; ignored otherwise.
  export let onDismiss = null;

  const dispatch = createEventDispatcher();

  // ── Refresh from the catalogue ────────────────────────────────────────────
  // Saving a food copies it, so later corrections to the bundled catalogue —
  // a clearer name, a fixed nutrient — never reach the saved row. The user's
  // own additions (their photo, their notes, their category) are exactly what
  // must NOT be overwritten, so only the fields the catalogue owns are pulled
  // across, and only when the user asks.
  let _catMatch = null;
  let _catDiff = [];
  let _refreshing = false;

  $: _lookUpCatalogue(_displayFood, $locale);
  async function _lookUpCatalogue(f, loc) {
    _catMatch = null; _catDiff = [];
    if (!f || typeof f.id !== 'number' || !f.barcode) return;
    let hit = null;
    try {
      const { BaseFoods } = await import('../../lib/base-foods.js');
      hit = await BaseFoods.findByBarcode(f.barcode, loc);
    } catch { return; }
    if (!hit || _displayFood?.id !== f.id) return;   // raced with a switch
    const diff = [];
    if ((f.name || '') !== hit.name) diff.push($_('foods.detail.refresh_name'));
    // A saved food stores its nutrition for ITS portion, not per 100 g — the
    // user's onion sits at 150 g, their carrot at 20 g. Comparing those
    // against the catalogue's per-100 g figures reports every nutrient as
    // different, and writing the catalogue's numbers in unscaled would quietly
    // rewrite a 150 g row as if it were 100 g.
    const factor = (Number(f.portion) > 0 ? Number(f.portion) : 100) / 100;
    // A food's portion drifts: logging one for the first time creates it with
    // whatever was eaten that day, so a tomato ends up stored as "165 g" with
    // its nutrition scaled to match. That is a diary fact living in the food
    // template. Refreshing puts the template back on the catalogue's basis and
    // says so, since it changes the amount the food defaults to.
    if (Math.abs(factor - 1) > 0.001) {
      diff.push($_('foods.detail.refresh_portion', { values: { from: f.portion, to: 100 } }));
    }
    // Only nutrients the catalogue actually carries. A saved row also holds
    // fields the app derives for itself (salt, _derived) that the catalogue
    // has no opinion on and must not lose.
    let n = 0;
    for (const k of Object.keys(hit.nutrition || {})) {
      const a = Number(f.nutrition?.[k]) / factor;
      const b = Number(hit.nutrition[k]);
      const both = Number.isFinite(a) && Number.isFinite(b);
      if (both ? Math.abs(a - b) > Math.max(0.01, Math.abs(b) * 0.005)
               : Number.isFinite(a) !== Number.isFinite(b)) n++;
    }
    if (n) diff.push($_('foods.detail.refresh_nutrients', { values: { n } }));
    if (JSON.stringify(f.alt_units || []) !== JSON.stringify(hit.alt_units || [])) {
      diff.push($_('foods.detail.refresh_units'));
    }
    if (diff.length) { _catMatch = hit; _catDiff = diff; }
  }

  async function onRefreshFromCatalogue() {
    if (!_catMatch || !_displayFood) return;
    _refreshing = true;
    try {
      // Spread the saved row first: everything the user owns survives, and
      // only the catalogue's own fields are replaced.
      // Scale back to the portion this food is stored at, and merge rather
      // than replace so anything the catalogue does not carry survives.
      // Back to the catalogue's own basis: 100 g with unscaled values.
      // Anything the catalogue does not carry (salt, derived-value flags) is
      // rescaled off the old portion so it stays consistent with the rest.
      const factor = (Number(_displayFood.portion) > 0 ? Number(_displayFood.portion) : 100) / 100;
      const nutrition = {};
      for (const [k, v] of Object.entries(_displayFood.nutrition || {})) {
        const n = Number(v);
        nutrition[k] = Number.isFinite(n) ? Math.round((n / factor) * 10000) / 10000 : v;
      }
      for (const [k, v] of Object.entries(_catMatch.nutrition || {})) nutrition[k] = v;
      const updated = await NtApi.updateFood(_displayFood.id, {
        ..._displayFood,
        name: _catMatch.name,
        portion: _catMatch.portion || 100,
        unit: _catMatch.unit || 'g',
        nutrition,
        alt_units: _catMatch.alt_units,
      });
      _displayFood = { ..._displayFood, ...updated };
      _catMatch = null; _catDiff = [];
      const { showSuccess } = await import('../../stores/toast.js');
      showSuccess($_('foods.detail.refresh_done'));
      dispatch('updated', { food: _displayFood });
    } catch (e) {
      const { showError } = await import('../../stores/toast.js');
      showError($_('foods.detail.refresh_failed', { values: { error: e.message } }));
    } finally { _refreshing = false; }
  }

  // Local copy that survives the parent setting food=null on close.
  // Without this, the sheet's content flickers blank during the slide-down
  // animation. Refresh whenever the parent opens with a new food.
  let _displayFood = null;
  $: if ((open || embedded) && food) { _displayFood = food; }
  $: if (embedded && !food) { _displayFood = null; }

  // Meal picker ActionSheet — opened when Add to Diary is tapped. The user
  // explicitly picks the destination meal as part of the log action, which
  // is clearer than the previous twin-stat pattern where a "Meal" card sat
  // next to "Serving Size" looking like passive data. Plain meal names —
  // no last-used suggestion suffix, per user preference; every tap is a
  // one-action commit so a suggestion adds noise without speeding the
  // common case.
  let _mealPickerOpen = false;
  $: _mealActions = (($mealNames || ['Breakfast','Lunch','Dinner','Snacks'])
    .map((label, value) => ({ label, value })));

  // Image URL: NT foods carry `imgUrl` (camelCase). OFF / USDA picker rows
  // that haven't been saved yet may carry `img_url` (snake_case) or one of
  // the OFF-specific fields. Try in order so the same sheet renders any of
  // these source shapes without a separate path.
  $: _ofImg = _displayFood?.imgUrl
           || _displayFood?.img_url
           || _displayFood?.image_url
           || _displayFood?.image_front_url
           || null;

  // Serving Size shown in the right-column stat card AND threaded into the
  // NutritionFactsBox so the FDA label reads consistently with the stat.
  $: servingDescription = _displayFood
    ? _formatServing(_displayFood)
    : $_('foods.detail.per_serving');

  function _formatServing(f) {
    const p = Number(f.portion);
    const u = f.unit || 'g';
    if (!Number.isFinite(p) || p <= 0) return $_('foods.detail.per_serving');
    return `${p} ${u}`;
  }

  // Calories headline for the pill below the food name. Stored kcal
  // converts to the user's preferred energy unit (kcal or kJ) for display.
  $: energyChip = (() => {
    const v = _displayFood?.nutrition?.calories;
    if (v == null || v === '') return null;
    const d = Nutrition.displayEnergy(v, $energyUnit);
    return `${d.value} ${energyUnitSuffix($energyUnit)}`;
  })();

  // Sheet → editor transition. The parent's onDetailEdit handler pushes
  // the editor route synchronously; the sheet's own slide-down animation
  // (200ms, built into Sheet.svelte) runs in parallel. Sequencing the
  // close before the navigation (with tick) keeps both motions overlapped
  // so it reads as one cohesive "opening the editor" beat rather than
  // dismiss-then-navigate.
  let _transitioning = false;
  async function onEditTap() {
    if (_transitioning) return;
    _transitioning = true;
    open = false;
    await tick();
    dispatch('edit', { food: _displayFood });
    setTimeout(() => { _transitioning = false; }, 250);
  }

  function onAddToDiaryTap() {
    if (_transitioning) return;
    // Open the meal picker; don't close the detail sheet underneath so
    // the user can still see what they're logging while choosing the meal.
    // Final commit (close detail sheet + dispatch addToDiary) happens in
    // onMealPicked once they tap a meal.
    _mealPickerOpen = true;
  }

  function onMealPicked(e) {
    const meal = Number(e.detail?.value) || 0;
    if (_transitioning) return;
    _transitioning = true;
    open = false;
    dispatch('addToDiary', { food: _displayFood, meal });
    setTimeout(() => { _transitioning = false; }, 250);
  }

  async function onDeleteTap() {
    if (_transitioning) return;
    if (!_displayFood?.id) return;
    const ok = await confirmDialog({
      title: $_('foods.detail.delete_confirm_title'),
      message: $_('foods.detail.delete_confirm_body', { values: { name: _displayFood.name } }),
      confirmLabel: $_('common.delete'),
      cancelLabel: $_('common.cancel'),
      dangerous: true,
    });
    if (!ok) return;
    _transitioning = true;
    try {
      await NtApi.deleteFood(_displayFood.id);
      open = false;
      dispatch('deleted', { food: _displayFood });
      showSuccess($_('foods.detail.deleted'));
    } catch (e) {
      showError((e?.message) || $_('common.errors.delete_failed'));
    } finally {
      setTimeout(() => { _transitioning = false; }, 250);
    }
  }

  function onClose() {
    dispatch('close');
  }
</script>

{#if embedded}
  <div class="detail-embedded" aria-live="polite" aria-atomic="true">
    {#if _displayFood}
      {#key _displayFood?.id || _displayFood?.name}
      <div class="detail-embedded-inner"
        in:fade={{ duration: $disableAnimations ? 0 : 100 }}>
      <!-- Inline header replaces the Sheet title when embedded.
           × dismiss button (only when onDismiss is wired) lets the
           user clear the pane back to the empty state. -->
      <header class="detail-embedded-header">
        <h3 class="detail-embedded-title">{_displayFood.name}</h3>
        {#if onDismiss}
          <button type="button" class="detail-embedded-close"
            on:click={onDismiss}
            aria-label="Clear detail preview"
            title="Clear preview">
            <span class="material-symbols-rounded">close</span>
          </button>
        {/if}
      </header>
      <div class="grid">
      <!-- LEFT — identity column (photo + brand + barcode pill). Matches
           CookTrace's PantryItemSheet identity card 1:1, minus the
           in-stock toggle and category pill since NT doesn't track those. -->
      <div class="col-identity">
        {#if _ofImg}
          <img class="hero-photo" src={resolveAssetUrl(_ofImg)} alt="" />
        {:else}
          <div class="hero-stub">
            <span class="material-symbols-rounded">restaurant</span>
          </div>
        {/if}
        <div class="identity-info">
          {#if _displayFood.brand}
            <div class="brand">{_displayFood.brand}</div>
          {/if}
          {#if _displayFood._note}
            <p class="food-note">{_displayFood._note}</p>
          {/if}
          {#if _catMatch}
            <div class="cat-refresh">
              <div>
                <strong>{$_('foods.detail.refresh_title')}</strong>
                <span>{_catDiff.join(' · ')}</span>
              </div>
              <button class="btn btn-secondary" on:click={onRefreshFromCatalogue} disabled={_refreshing}>
                <span class="material-symbols-rounded">sync</span>
                {$_('foods.detail.refresh_action')}
              </button>
            </div>
          {/if}
          <div class="meta-pills">
            <!-- Catalogue category. A base-catalogue entry has no brand, so this
                 is the only thing identifying where it sits. -->
            {#if _displayFood._baseCategoryLabel}
              <span class="pill pill-cat cat-{_displayFood._baseCategory}">{_displayFood._baseCategoryLabel}</span>
            {/if}
            {#if energyChip}
              <span class="pill">{energyChip}</span>
            {/if}
            {#if _displayFood.barcode}
              <span class="pill subtle" title={$_('foods.detail.barcode')}>
                <span class="material-symbols-rounded">barcode_scanner</span>
                {_displayFood.barcode}
              </span>
            {/if}
          </div>
        </div>
      </div>

      <!-- RIGHT — data column: FDA-style Nutrition Facts label + Add to
           Diary primary button. The label's first line already shows
           Serving Size, so no separate stat card above it. -->
      <div class="col-data">
        <div class="nutrition-wrap">
          <NutritionFactsBox
            nutrition={_displayFood.nutrition || {}}
            servingDescription={servingDescription} />
        </div>

        <button class="btn btn-primary add-btn"
                on:click={onAddToDiaryTap}
                aria-label={$_('foods.detail.add_to_diary_aria')}>
          <span class="material-symbols-rounded">add</span>
          {$_('foods.detail.add_to_diary')}
        </button>
      </div>
    </div>

    <div class="actions">
      <button class="btn btn-secondary danger-btn"
              on:click={onDeleteTap}
              aria-label={$_('foods.detail.delete_aria')}
              disabled={!_displayFood?.id || _transitioning}>
        <span class="material-symbols-rounded">delete</span>
        {$_('common.delete')}
      </button>
      <button class="btn btn-secondary"
              on:click={onEditTap}
              aria-label={$_('foods.detail.edit_aria')}>
        <span class="material-symbols-rounded">edit</span>
        {$_('foods.detail.edit')}
      </button>
    </div>
      </div><!-- /.detail-embedded-inner -->
      {/key}
    {:else}
      <!-- Embedded empty state — parent pane keeps its background,
           we just prompt the user to select something. -->
      <div class="detail-embedded-empty">
        <span class="material-symbols-rounded">restaurant_menu</span>
        <p>Pick a food from the list to preview.</p>
      </div>
    {/if}
  </div>
{:else}
<Sheet bind:open title={_displayFood?.name || ''} height="auto" on:close={onClose}>
  {#if _displayFood}
    <div class="grid">
      <!-- LEFT — identity column (same as embedded above). -->
      <div class="col-identity">
        {#if _ofImg}
          <img class="hero-photo" src={resolveAssetUrl(_ofImg)} alt="" />
        {:else}
          <div class="hero-stub">
            <span class="material-symbols-rounded">restaurant</span>
          </div>
        {/if}
        <div class="identity-info">
          {#if _displayFood.brand}
            <div class="brand">{_displayFood.brand}</div>
          {/if}
          {#if _displayFood._note}
            <p class="food-note">{_displayFood._note}</p>
          {/if}
          {#if _catMatch}
            <div class="cat-refresh">
              <div>
                <strong>{$_('foods.detail.refresh_title')}</strong>
                <span>{_catDiff.join(' · ')}</span>
              </div>
              <button class="btn btn-secondary" on:click={onRefreshFromCatalogue} disabled={_refreshing}>
                <span class="material-symbols-rounded">sync</span>
                {$_('foods.detail.refresh_action')}
              </button>
            </div>
          {/if}
          <div class="meta-pills">
            <!-- Catalogue category. A base-catalogue entry has no brand, so this
                 is the only thing identifying where it sits. -->
            {#if _displayFood._baseCategoryLabel}
              <span class="pill pill-cat cat-{_displayFood._baseCategory}">{_displayFood._baseCategoryLabel}</span>
            {/if}
            {#if energyChip}
              <span class="pill">{energyChip}</span>
            {/if}
            {#if _displayFood.barcode}
              <span class="pill subtle" title={$_('foods.detail.barcode')}>
                <span class="material-symbols-rounded">barcode_scanner</span>
                {_displayFood.barcode}
              </span>
            {/if}
          </div>
        </div>
      </div>
      <div class="col-data">
        <div class="nutrition-wrap">
          <NutritionFactsBox
            nutrition={_displayFood.nutrition || {}}
            servingDescription={servingDescription} />
        </div>
        <button class="btn btn-primary add-btn"
                on:click={onAddToDiaryTap}
                aria-label={$_('foods.detail.add_to_diary_aria')}>
          <span class="material-symbols-rounded">add</span>
          {$_('foods.detail.add_to_diary')}
        </button>
      </div>
    </div>
    <div class="actions">
      <button class="btn btn-secondary danger-btn"
              on:click={onDeleteTap}
              aria-label={$_('foods.detail.delete_aria')}
              disabled={!_displayFood?.id || _transitioning}>
        <span class="material-symbols-rounded">delete</span>
        {$_('common.delete')}
      </button>
      <button class="btn btn-secondary"
              on:click={onEditTap}
              aria-label={$_('foods.detail.edit_aria')}>
        <span class="material-symbols-rounded">edit</span>
        {$_('foods.detail.edit')}
      </button>
    </div>
  {/if}
</Sheet>
{/if}

<!-- Meal picker: shown after Add to Diary tap. ActionSheet layers above
     the detail sheet so the user can still see the food while choosing
     the destination meal. Tapping a meal commits + closes both sheets;
     Cancel just closes this picker, detail sheet stays open. -->
<ActionSheet
  bind:open={_mealPickerOpen}
  title={$_('foods.detail.add_to_which_meal')}
  actions={_mealActions}
  on:select={onMealPicked} />

<style>
  /* Two-column grid on desktop, single column on mobile. Mirrors CT's
     PantryItemSheet 1:1 — the only deviation is column ratio (CT uses
     1fr / 1.05fr; we match exactly so the FDA card sits where users see
     it in CookTrace too). */
  .grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 14px;
  }

  /* LEFT — identity card (photo + brand + barcode). Bordered surface so
     the photo sits on a clear background that handles non-square product
     shots gracefully (object-fit:contain + letterbox color). */
  .col-identity {
    background: var(--surface-1);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .hero-photo {
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: contain;
    background: var(--surface-2);
    display: block;
  }
  .hero-stub {
    width: 100%;
    aspect-ratio: 1 / 1;
    background: var(--surface-2);
    display: flex; align-items: center; justify-content: center;
  }
  .hero-stub .material-symbols-rounded { font-size: 64px; color: var(--text-3); }

  .identity-info {
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .brand { color: var(--text-3); font-size: 13px; font-weight: 500; }
  .cat-refresh {
    display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
    padding: 10px 12px; margin: 0 0 10px;
    background: var(--accent-dim);
    border-radius: var(--radius-md, 10px);
    font-size: 13px;
  }
  .cat-refresh > div { flex: 1; min-width: 180px; display: flex; flex-direction: column; gap: 2px; }
  .cat-refresh span { color: var(--text-2); font-size: 12px; }

  .food-note {
    margin: 4px 0 6px;
    font-size: 12px;
    line-height: 1.45;
    color: var(--text-2);
    border-left: 2px solid var(--border-strong);
    padding-left: 8px;
  }

  .pill-cat {
    --h: var(--cat-h, 220); --s: var(--cat-s, 42%);
    color: hsl(var(--h) var(--s) 30%);
    background: hsl(var(--h) var(--s) 93%);
  }
  :global([data-theme="dark"]) .pill-cat {
    color: hsl(var(--h) calc(var(--s) + 18%) 72%);
    background: hsl(var(--h) var(--s) 16%);
  }
  .meta-pills { display: flex; gap: 6px; flex-wrap: wrap; }
  .pill {
    display: inline-flex; align-items: center; gap: 4px;
    background: color-mix(in srgb, var(--accent) 14%, transparent);
    color: var(--accent);
    border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
    border-radius: var(--radius-full, 99px);
    padding: 3px 9px;
    font-size: 11px;
    font-weight: 600;
  }
  .pill.subtle { background: var(--surface-2); color: var(--text-3); border-color: var(--border); }
  .pill .material-symbols-rounded { font-size: 14px; }

  /* RIGHT — data column. */
  .col-data {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .nutrition-wrap { display: flex; justify-content: center; }

  .add-btn {
    width: 100%;
    height: 44px;
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    font-size: 14px;
  }
  .add-btn .material-symbols-rounded { font-size: 18px; }

  /* Footer — Delete + Edit. Delete is danger-styled (matches CT). Edit
     stays secondary because the primary action on this sheet is
     contextually Add to Diary (which lives in col-data above). */
  .actions {
    display: flex;
    gap: 8px;
    justify-content: space-between;
    padding-top: 12px;
    margin-top: 6px;
    border-top: 1px solid var(--border);
  }
  .actions .btn {
    flex: 1;
    height: 44px;
    font-size: 14px;
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  }
  .actions .btn .material-symbols-rounded { font-size: 18px; }
  .danger-btn {
    color: var(--danger);
    border-color: color-mix(in srgb, var(--danger) 35%, var(--border));
  }
  .danger-btn:hover:not(:disabled) {
    background: color-mix(in srgb, var(--danger) 12%, transparent);
  }

  /* Desktop (≥768px) — two-column split. Matches CT's breakpoint and
     column ratio so the layout is identical at desktop widths. */
  @media (min-width: 768px) {
    .grid {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
      gap: 16px;
      align-items: start;
    }
  }

  /* Embedded mode — no sheet chrome, just the content inline for
     the Foods desktop right-pane. Own header replaces the Sheet
     title; empty state prompts when no food is selected. */
  .detail-embedded {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  /* Force single-column stack in the pane no matter the viewport
     width. The sheet's .grid rule flips to two columns at ≥768px
     viewport, but the pane is only ~380-420px wide — media queries
     look at viewport, not container, so without this override the
     content gets squeezed into two ~180px columns and spills off
     the right edge. */
  .detail-embedded :global(.grid) {
    grid-template-columns: minmax(0, 1fr);
  }
  /* Pane hero photo — cap so it doesn't dominate the pane on tall
     images. */
  .detail-embedded :global(.hero-photo),
  .detail-embedded :global(.hero-stub) {
    max-height: 220px;
    aspect-ratio: auto;
  }
  .detail-embedded-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding: 0 4px 4px;
    border-bottom: 1px solid var(--border);
  }
  .detail-embedded-title {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: var(--text-1);
    letter-spacing: -0.01em;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .detail-embedded-close {
    background: transparent;
    border: none;
    color: var(--text-3);
    width: 26px;
    height: 26px;
    border-radius: var(--radius-full);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 120ms ease, color 120ms ease;
  }
  .detail-embedded-close:hover { background: var(--surface-2); color: var(--text-1); }
  .detail-embedded-close :global(.material-symbols-rounded) { font-size: 18px; }
  .detail-embedded-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 40px 20px;
    color: var(--text-3);
    text-align: center;
  }
  .detail-embedded-empty :global(.material-symbols-rounded) {
    font-size: 40px;
    opacity: 0.6;
  }
  .detail-embedded-empty p {
    margin: 0;
    font-size: 13px;
  }
</style>
