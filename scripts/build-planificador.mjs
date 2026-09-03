#!/usr/bin/env node
/**
 * scripts/build-planificador.mjs — arma docs/planificador.html.
 *
 * La página necesita el catálogo de ingredientes adentro: se sirve desde la
 * app pero tiene que funcionar sin llamar a ningún endpoint para leerlo, igual
 * que el semáforo. Copiarlo a mano es exactamente el error que ya nos costó
 * dos veces en docs/ (tablas que se quedaron atrás del catálogo y prosa que
 * afirmaba números falsos), así que se inyecta acá desde la única fuente.
 *
 * El catálogo entero son 367 KB, casi todo micronutrientes que esta página no
 * mira. Se recorta a lo que usa el planificador y queda en la décima parte.
 *
 *     node scripts/build-planificador.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CAT  = path.join(ROOT, 'src/lib/base-foods.json');
const TPL  = path.join(ROOT, 'docs/planificador.template.html');
const OUT  = path.join(ROOT, 'docs/planificador.html');
const MARCA = '/*__CATALOGO__*/';

// Lo que la página realmente usa. `sat` y `na` entran porque el plato los
// muestra; el resto de los micronutrientes no aparece en ninguna vista.
const NUTRIENTES = [
  ['calories', 'kcal'], ['proteins', 'prot'], ['carbohydrates', 'carb'],
  ['fiber', 'fib'], ['fat', 'gra'], ['saturated-fat', 'sat'], ['sodium', 'na'],
  // No se muestra en ninguna tabla: lo usa el filtro que separa una fruta de
  // postre de un limón, que en hidratos son casi lo mismo (9,3 g contra 12).
  ['sugars', 'azuc'],
];

const cat = JSON.parse(fs.readFileSync(CAT, 'utf8'));

// `cooked_of` vive en los archivos curados, no en el catálogo compilado.
const CURADO = path.join(ROOT, 'scripts/base-foods');
const crudoDe = new Map();
for (const f of fs.readdirSync(CURADO).filter(x => x.endsWith('.json')))
  for (const e of JSON.parse(fs.readFileSync(path.join(CURADO, f), 'utf8')))
    if (e.cooked_of) crudoDe.set(e.id, e.cooked_of);
const foods = cat.foods.map(f => {
  const n = {};
  for (const [largo, corto] of NUTRIENTES) if (f.nutrition[largo] != null) n[corto] = f.nutrition[largo];
  return {
    id: f.id, es: f.name.es, cat: f.cat, luz: f.light[0],   // g / a / r
    n,
    // El barcode con el que la app guarda la entrada: lo necesita el botón
    // que carga el plato en el diario, para no duplicar alimentos.
    bc: (f.approx || !f.fdc) ? 'ntBase_' + f.id : 'fdcId_' + f.fdc,
    ...(f.units && f.units.length ? { u: f.units } : {}),
    // El crudo del que viene, cuando es una entrada cocida. El planificador lo
    // usa para no armar un plato con zanahoria cruda Y zanahoria hervida, que
    // es lo que proponía antes de tener este dato.
    ...(crudoDe.has(f.id) ? { crudo: crudoDe.get(f.id) } : {}),
    ...(f.note ? { nota: f.note } : {}),
  };
});

const tpl = fs.readFileSync(TPL, 'utf8');
if (!tpl.includes(MARCA)) { console.error(`✗ la plantilla no tiene ${MARCA}`); process.exit(1); }

// El planificador nombra ingredientes por id en su despensa. Un id que ya no
// exista rompería la página en silencio (una fila que no aparece), así que se
// verifica acá, que es donde todavía se puede fallar ruidosamente.
const ids = new Set(foods.map(f => f.id));
const usados = [...tpl.matchAll(/'([a-z0-9-]+)'(?=[,\]\s])/g)].map(m => m[1]);
const despensa = tpl.slice(tpl.indexOf('const DESPENSA'), tpl.indexOf('};', tpl.indexOf('const DESPENSA')));
// Sólo los valores de las listas, no las claves del objeto: `'fruto-seco':`
// es un rol, no un ingrediente, y la primera versión lo reportaba como id
// inexistente.
const faltan = [...new Set([...despensa.matchAll(/'([a-z0-9-]+)'(?!\s*:)/g)].map(m => m[1]))].filter(x => !ids.has(x));
if (faltan.length) { console.error('✗ la despensa nombra ids que no están en el catálogo:\n  ' + faltan.join('\n  ')); process.exit(1); }

const salida = tpl.replace(MARCA, JSON.stringify(foods));
fs.writeFileSync(OUT, salida);
const kb = n => (n / 1024).toFixed(0) + ' KB';
console.log(`✓ ${foods.length} alimentos → ${path.relative(ROOT, OUT)} (${kb(salida.length)}, catálogo recortado a ${kb(JSON.stringify(foods).length)} de ${kb(fs.statSync(CAT).size)})`);
