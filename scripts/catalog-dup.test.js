/**
 * Un alimento del catálogo base que la cuenta ya tiene no se duplica en el push.
 * Caso real del 16-17/11/2026: "Manzana pelada" (#70, con foto y enlace a
 * CookTrace) se cargó sin conexión y el servidor creó #441 sin foto.
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import { findCatalogDuplicate } from '../server/lib/catalog-dup.js';

const Database = createRequire(new URL('../server/package.json', import.meta.url))('better-sqlite3');
const mk = () => {
  const db = new Database(':memory:');
  db.exec(`CREATE TABLE foods (id INTEGER PRIMARY KEY, user_id INTEGER, name TEXT, barcode TEXT,
    nutrition TEXT, usage_count INTEGER DEFAULT 0, deleted_at TEXT)`);
  const ins = db.prepare('INSERT INTO foods (id,user_id,name,barcode,nutrition,usage_count,deleted_at) VALUES (?,?,?,?,?,?,?)');
  ins.run(70, 1, 'Manzana pelada', 'fdcId_171689', '{"calories":48}', 20, null);
  ins.run(441, 1, 'Manzana pelada', 'fdcId_171689', '{"calories":48}', 0, '2026-11-17');
  ins.run(5, 2, 'Manzana pelada', 'fdcId_171689', '{"calories":48}', 3, null);
  return db;
};
const hit = { name: 'manzana pelada ', barcode: 'fdcId_171689', nutrition: { calories: 48 } };

test('reutiliza la fila viva de la misma cuenta', () => {
  assert.equal(findCatalogDuplicate(mk(), 1, hit).id, 70);
});
test('no cruza cuentas ni toma filas borradas', () => {
  const db = mk();
  assert.equal(findCatalogDuplicate(db, 2, hit).id, 5);
  assert.equal(findCatalogDuplicate(db, 3, hit), null);
  db.prepare('UPDATE foods SET deleted_at = 1 WHERE id = 70').run();
  assert.equal(findCatalogDuplicate(db, 1, hit), null);
});
test('otras calorías, otro nombre o barcode real de OFF: alimento nuevo', () => {
  const db = mk();
  assert.equal(findCatalogDuplicate(db, 1, { ...hit, nutrition: { calories: 80 } }), null);
  assert.equal(findCatalogDuplicate(db, 1, { ...hit, name: 'Manzana' }), null);
  assert.equal(findCatalogDuplicate(db, 1, { ...hit, barcode: '7790001' }), null);
  assert.equal(findCatalogDuplicate(db, 1, { ...hit, barcode: '' }), null);
});
