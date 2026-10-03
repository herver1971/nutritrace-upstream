#!/usr/bin/env python3
"""Agrega al semáforo nutricional la sección de oxalatos y marca las filas que tienen mucho.

Lee `oxalatos.json` (al lado de este archivo) y reescribe, entre marcadores, cuatro cosas
de `semaforo-nutricional.html`: los estilos, la entrada del índice, la sección
`#oxalatos` (antes de «Limitaciones») y una marca «Ox» en cada fila del semáforo cuyo
`data-id` figure en los datos. También deja la tabla en `nutricion-y-semaforo.md`.
Se puede correr las veces que haga falta: borra lo anterior antes de escribir.

Por qué: Hernán tuvo un cálculo renal hace más de 10 años (dato del 03/10/2026, tipo
desconocido). Con oxalato no se prohíbe nada: se acompaña con calcio en la misma comida,
que lo liga en el intestino y hace que se absorba MENOS (no más).

El calcio de sus lácteos sale de sus fichas de NutriTrace (solo lectura); si una ficha no
está, queda el valor del JSON. Uso: python3 docs/oxalatos.py
"""

import html
import json
import math
import re
import sqlite3
from pathlib import Path

AQUI = Path(__file__).resolve().parent
HTML = AQUI / "semaforo-nutricional.html"
MD = AQUI / "nutricion-y-semaforo.md"
BASE = AQUI.parent / "data/db/nutritrace.db"

# Calcio que liga un mg de oxalato: 1 mol de cada uno (40 / 88 g/mol). En el intestino la
# unión no es completa, por eso el recomendado redondea para arriba y tiene un mínimo.
CA_POR_MG_OX = 40 / 88
MINIMO_CA = 200


def calcio_de_fichas(lacteos):
    try:
        db = sqlite3.connect(f"file:{BASE}?mode=ro", uri=True)
    except sqlite3.Error:
        return
    for l in lacteos:
        if not l.get("ficha"):
            continue
        fila = db.execute("SELECT portion, unit, nutrition FROM foods WHERE id = ?", (l["ficha"],)).fetchone()
        if not fila:
            continue
        porcion, unidad, nutri = fila
        ca = json.loads(nutri or "{}").get("calcium")
        base = porcion if unidad in ("g", "ml") and porcion else 100
        if ca:
            l["mg_ca_100"] = round(float(ca) / base * 100)


def nivel(mg):
    if mg >= 100:
        return "muy alto", "mx"
    if mg >= 25:
        return "alto", "al"
    if mg >= 10:
        return "moderado", "md"
    return "bajo", "bj"


def calcio_recomendado(a, mg_porcion):
    if a.get("con_calcio"):
        return None, "ya trae el calcio de la leche"
    if mg_porcion < 10:
        return None, "no hace falta"
    if mg_porcion < 25:
        return 150, "cualquier lácteo en la comida"
    ca = max(MINIMO_CA, math.ceil(mg_porcion * CA_POR_MG_OX / 50) * 50)
    return ca, None


def cantidad(ca, lacteo):
    v = ca / (lacteo["mg_ca_100"] / 100)
    v = max(5, round(v / 5) * 5)
    txt = f"{v} {lacteo['medida']}"
    if "Port Salut" in lacteo["nombre"]:
        txt += f" ({v / 30:.1f} fetas)".replace(".", ",")
    elif "Yogur" in lacteo["nombre"]:
        txt += f" ({v / 175:.1f} potes)".replace(".", ",")
    return txt


def fmt(x):
    return f"{x:,.0f}".replace(",", ".")


def armar(datos):
    lacteos = datos["lacteos"]
    filas, marcas = [], {}
    for a in sorted(datos["alimentos"], key=lambda a: -a["mg_100"]):
        mg_p = a["mg_100"] * a["porcion_g"] / 100
        niv, cls = nivel(mg_p)
        ca, txt = calcio_recomendado(a, mg_p)
        con = [(l["nombre"].split(" (")[0], cantidad(ca, l)) for l in lacteos] if ca else []
        filas.append({**a, "mg_p": mg_p, "nivel": niv, "cls": cls, "ca": ca, "con": con, "sin_ca": txt})
        if cls in ("mx", "al", "md"):
            for i in a["ids"]:
                marcas[i] = (niv, cls, mg_p, a["porcion"])
    return filas, marcas


def seccion_html(datos, filas):
    e = html.escape
    lac = "; ".join(f"<strong>{e(l['nombre'])}</strong> {fmt(l['mg_ca_100'])} mg cada 100 {e(l['medida'])} "
                     f"({e(l['nota'])})" for l in datos["lacteos"])
    def tarjeta(f):
        if f["ca"]:
            ej = "".join(f"<li><b>{e(c)}</b> {e(n)}</li>" for n, c in f["con"])
            calcio = (f'<p class="oxca">Con <b>{fmt(f["ca"])} mg de calcio</b> en la misma comida; alcanza con <i>una</i> de estas:</p>'
                      f'<ul>{ej}</ul>')
        else:
            calcio = f'<p class="oxca">{e(f["sin_ca"]).capitalize()}.</p>'
        return (f'<div class="oxt {f["cls"]}"><div class="oxh"><span class="nm">{e(f["nombre"])}</span>'
                f'<span class="ox {f["cls"]}">{e(f["nivel"])}</span></div>'
                f'<p class="oxd"><b>{fmt(f["mg_p"])} mg</b> en {e(f["porcion"])} · {fmt(f["mg_100"])} mg cada 100 g '
                f'<span class="chico">({e(f["rango"])}; {e(f["fuente"])})</span></p>{calcio}</div>')

    cuerpo = "\n".join(tarjeta(f) for f in filas)
    fuentes = " · ".join(f'<a href="{e(f["url"])}">{e(f["texto"])}</a>' for f in datos["fuentes"])
    return f'''<!-- oxalatos:seccion:inicio (generado por docs/oxalatos.py; no editar a mano) -->
<section id="oxalatos" class="col">
  <h2>Oxalatos</h2>
  <p>Hernán tuvo un cálculo renal hace más de diez años. El oxalato de la comida se une al
  calcio en el riñón y forma el cálculo más común (oxalato de calcio). <strong>No se trata
  de prohibir</strong>: si en la <em>misma comida</em> hay calcio, el oxalato se une a él
  en el intestino, sale con la materia fecal y <strong>se absorbe menos</strong>. Por eso
  bajar el calcio es contraproducente.</p>
  <div class="note"><p>El <strong>calcio</strong> de cada tarjeta es lo que conviene comer
  junto con esa porción: lo que liga en teoría su oxalato (un mg de calcio por cada
  2,2 de oxalato), redondeado para arriba y con un mínimo de {MINIMO_CA} mg, porque en el
  intestino la unión no es completa. Las cantidades salen del calcio de tus fichas:
  {lac}.</p></div>
  <p>Ordenados de más a menos oxalato por 100 g. El nivel es por porción, que es lo que se come.</p>
  <div class="oxg">
{cuerpo}
  </div>
  <p><strong>Bajos en oxalato:</strong> {e(datos["bajos"])}</p>
  <h3>En la práctica</h3>
  <ul class="plain">
    <li><strong>El calcio va en la misma comida</strong>, no en otro momento: la espinaca
    con queso rallado o en salsa blanca, las almendras dentro del yogur.</li>
    <li><strong>Hervir y tirar el agua</strong> baja mucho el oxalato soluble de la espinaca
    y la acelga (la cocida de la tabla ya es más baja que la cruda por gramo).</li>
    <li><strong>Agua:</strong> orinar mucho diluye. Es la medida que más protege.</li>
    <li><strong>Sodio bajo</strong> y <strong>sin dosis grandes de vitamina C</strong> en
    suplementos (se convierte en oxalato).</li>
    <li>Con antecedentes de un solo cálculo hace años no hace falta una dieta baja en
    oxalato estricta (menos de 100 mg por día); sí <strong>evitar las porciones muy altas
    sin calcio</strong>. Conviene contárselo al médico junto con el seguimiento del riñón.</li>
  </ul>
  <p class="chico">Los valores son aproximados: el oxalato varía con la variedad, el cultivo,
  la cocción y el laboratorio. Sirven para ordenar, no como cifra exacta. Fuentes: {fuentes}.
  Las marcas <span class="ox mx">Ox</span> y <span class="ox al">Ox</span> en las tablas del
  semáforo señalan los alimentos muy altos y altos por porción.</p>
</section>
<!-- oxalatos:seccion:fin -->
'''


CSS = '''/* oxalatos:css:inicio */
.ox { display:inline-block; font:600 .68rem/1.3 Archivo,sans-serif; padding:.05rem .35rem; border-radius:3px;
      margin-left:.35rem; vertical-align:middle; white-space:nowrap; }
.ox.mx { background:#b4372f; color:#fff; } .ox.al { background:#e2a93b; color:#1d1f22; }
.ox.md { background:transparent; color:inherit; border:1px solid currentColor; opacity:.7; }
.ox.bj { background:transparent; color:inherit; opacity:.6; }
.oxg { display:grid; grid-template-columns:repeat(auto-fill,minmax(17rem,1fr)); gap:.7rem; margin:1rem 0; max-width:56rem; }
.oxt { border:1px solid var(--rule); border-left:4px solid var(--rule); border-radius:4px; padding:.7rem .85rem; }
.oxt.mx { border-left-color:#b4372f; } .oxt.al { border-left-color:#e2a93b; }
.oxh { display:flex; justify-content:space-between; align-items:baseline; gap:.5rem; }
.oxh .nm { font-weight:600; }
.oxt p { margin:.35rem 0 0; } .oxt ul { margin:.25rem 0 0; padding-left:1.1rem; }
.oxt li { margin:.1rem 0; }
.chico { font-size:.82em; opacity:.75; }
/* oxalatos:css:fin */
'''


def reemplazar(texto, inicio, fin, nuevo, ancla, antes=True):
    """Reemplaza lo que haya entre los marcadores, o lo inserta junto a `ancla` la primera vez."""
    patron = re.compile(re.escape(inicio) + r".*?" + re.escape(fin) + r"\n?", re.S)
    if patron.search(texto):
        return patron.sub(lambda _: nuevo, texto, count=1)
    i = texto.index(ancla)
    return texto[:i] + nuevo + texto[i:] if antes else texto[:i + len(ancla)] + nuevo + texto[i + len(ancla):]


def marcar_filas(texto, marcas):
    texto = re.sub(r'<span class="ox (?:mx|al|md)" data-ox[^>]*>Ox</span>', "", texto)

    def poner(m):
        fila = m.group(0)
        i = re.search(r'data-id="([^"]+)"', fila).group(1)
        if i not in marcas:
            return fila
        niv, cls, mg, porcion = marcas[i]
        marca = (f'<span class="ox {cls}" data-ox title="Oxalato {niv}: ~{fmt(mg)} mg por {html.escape(porcion)}. '
                 f'Comerlo con calcio (ver Oxalatos)">Ox</span>')
        return re.sub(r'(<td class="nm">.*?)(</td>)', lambda n: n.group(1) + marca + n.group(2), fila, count=1)

    return re.sub(r'<tr data-id="[^"]+".*?</tr>', poner, texto, flags=re.S)


def seccion_md(datos, filas):
    lineas = ["<!-- oxalatos:inicio (generado por docs/oxalatos.py) -->", "## Oxalatos", "",
              "Tuvo un cálculo renal hace más de 10 años. El calcio en la **misma comida** liga el oxalato en el",
              "intestino y hace que se absorba **menos**: no se prohíbe nada, se acompaña. Valores aproximados;",
              "el detalle, las fuentes y la columna con quesos y leche están en `semaforo-nutricional.html#oxalatos`.", "",
              "| Alimento | Porción | mg/100 g | mg/porción | Nivel | Calcio en la comida |",
              "|---|---|---:|---:|---|---:|"]
    for f in filas:
        lineas.append(f"| {f['nombre']} | {f['porcion']} | {fmt(f['mg_100'])} | {fmt(f['mg_p'])} | {f['nivel']} | "
                      f"{fmt(f['ca']) + ' mg' if f['ca'] else '—'} |")
    lineas += ["", "<!-- oxalatos:fin -->", ""]
    return "\n".join(lineas)


def main():
    datos = json.loads((AQUI / "oxalatos.json").read_text(encoding="utf-8"))
    calcio_de_fichas(datos["lacteos"])
    filas, marcas = armar(datos)

    t = HTML.resolve().read_text(encoding="utf-8")
    t = reemplazar(t, "/* oxalatos:css:inicio */", "/* oxalatos:css:fin */", CSS, "</style>")
    t = reemplazar(t, "<!-- oxalatos:indice:inicio -->", "<!-- oxalatos:indice:fin -->",
                   '<!-- oxalatos:indice:inicio --><li><a href="#oxalatos">Oxalatos</a></li><!-- oxalatos:indice:fin -->\n    ',
                   '<li><a href="#limites">')
    t = reemplazar(t, "<!-- oxalatos:seccion:inicio", "<!-- oxalatos:seccion:fin -->",
                   seccion_html(datos, filas) + "\n", '<section id="limites"')
    t = marcar_filas(t, marcas)
    HTML.resolve().write_text(t, encoding="utf-8")

    m = MD.read_text(encoding="utf-8")
    patron = re.compile(r"<!-- oxalatos:inicio.*?<!-- oxalatos:fin -->\n?", re.S)
    nuevo = seccion_md(datos, filas)
    m = patron.sub(lambda _: nuevo, m) if patron.search(m) else m.rstrip("\n") + "\n\n---\n\n" + nuevo
    MD.write_text(m, encoding="utf-8")
    print(f"{len(filas)} alimentos en la tabla · {len(marcas)} filas marcadas en el semáforo")


if __name__ == "__main__":
    main()
