/**
 * catalog-dup.js: un alimento del catálogo base que el usuario ya tiene no se
 * crea dos veces.
 *
 * Un alimento del catálogo base (barcode `fdcId_<n>`) que llega al servidor sin
 * server_id, como los que se cargan sin conexión desde el celular, se insertaba
 * siempre como fila nueva, aunque la cuenta ya tuviera esa misma comida
 * (con su foto y su enlace a CookTrace). Acá se busca esa fila: misma cuenta,
 * mismo barcode `fdcId_`, mismo nombre y las mismas calorías. Si existe, el push
 * la reutiliza en vez de duplicarla.
 */

const _name = (s) => String(s || '').trim().toLowerCase();

/** La fila viva de la cuenta que `f` repetiría, o null. */
export function findCatalogDuplicate(db, userId, f) {
  const code = typeof f?.barcode === 'string' ? f.barcode.trim() : '';
  if (!/^fdcId_\d+$/.test(code) || !f.name) return null;
  const cal = Number(f.nutrition?.calories);
  const rows = db.prepare(
    `SELECT id, name, nutrition FROM foods
      WHERE user_id IS ? AND barcode = ? AND deleted_at IS NULL
      ORDER BY usage_count DESC, id`
  ).all(userId ?? null, code);
  for (const r of rows) {
    if (_name(r.name) !== _name(f.name)) continue;
    let rc; try { rc = Number(JSON.parse(r.nutrition || '{}').calories); } catch { rc = NaN; }
    if (Number.isFinite(cal) && Number.isFinite(rc) && Math.abs(cal - rc) > 0.5) continue;
    return r;
  }
  return null;
}
