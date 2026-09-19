# Nutrición y semáforo nutricional

Documento de referencia del catálogo de ingredientes base de esta instancia de
NutriTrace. Reúne el razonamiento nutricional detrás del semáforo, los datos
que lo sustentan y los criterios exactos con que se calcula.

Los valores salen de **USDA FoodData Central (SR Legacy)** y son **por 100 g**.
La única excepción es el Port Salut San Francisco, transcripto de su propio
rótulo — ver «Productos de marca».
Todo lo que figura acá es reproducible: se regenera con
`node scripts/build-base-foods.mjs`.

> Esto es material educativo y una herramienta de seguimiento personal.
> **No sustituye indicación médica.** Los objetivos de este documento
> (bajar LDL, reducir grasa hepática) están conversados con un médico.

---

## 1. Contexto

Dos objetivos simultáneos:

| Objetivo | Palanca principal |
|---|---|
| **Colesterol** ligeramente por encima del máximo, sin medicación | Bajar saturadas, reemplazar por insaturadas, subir fibra soluble |
| **Hígado graso** leve | Bajar azúcares libres y harinas refinadas; ejercicio de fuerza |

Empujan casi siempre en la misma dirección, con una diferencia que importa:
**para el hígado, el azúcar y las harinas refinadas pesan tanto como la grasa.**
La fructosa se metaboliza mayoritariamente en el hígado y estimula ahí mismo la
producción de grasa. Bebidas azucaradas y jugos son el blanco número uno.

### El techo de azúcar libre: 25 g/día

Fijado el 18/09/2026. **Azúcar libre** es el azúcar agregado más el que viene
en miel, jarabes y jugos de fruta; **no** cuenta el de la fruta entera, la
verdura ni la leche, donde viene con fibra, agua y matriz que cambian cómo se
absorbe. Es la definición de la OMS, y el techo de 25 g es su meta exigente
—el 5 % de las calorías— que es la que corresponde con hígado graso.

Por qué un techo propio y no el azúcar que ya mide la app: `sugars` es azúcar
**total**, y ahí adentro pesan lo mismo una cucharada de miel y una banana. Con
un techo sobre el total, una banana de 118 g se llevaría 14 g del presupuesto
sin ser el problema, y la miel del café pasaría desapercibida.

Dónde vive el cálculo: `~/Documentos/Hernan/Salud/azucar_libre.py`, que
clasifica cada alimento por su categoría de este catálogo —fruta, verdura,
legumbre, lácteo y frutos secos son intrínsecos; dulces y bebidas azucaradas
son libres— con una lista de excepciones para los casos que la categoría no
puede resolver sola: la granola es un cereal pero va tostada con miel, y el
jugo de naranja es una fruta pero es jugo. Lo que no se reconoce **cuenta como
libre**, para que un producto nuevo con azúcar agregada se note en vez de
pasar de largo.

> **La fruta desecada no es azúcar libre.** El dátil tiene 63 g de azúcar por
> 100 g y parece un caramelo, pero la definición solo cuenta el jugo y el
> concentrado, no la fruta entera aunque esté seca. Es el caso que más se
> presta a discutir y por eso queda escrito.

Medido sobre los 32 días cargados, el máximo fue **21 g** (04/09, un jugo de
naranja exprimido) y la mediana es 0: el techo no está para restringir lo que
ya hace, sino para que se vea el día que eso cambie.

---

## 2. Los tipos de grasa

### Las cuatro familias

**Grasas trans industriales — las únicas inequívocamente dañinas.**
Suben el LDL *y* bajan el HDL a la vez; ningún otro tipo hace ambas cosas.
Por eso están prohibidas o restringidas en muchos países.
En el catálogo saltan a la vista: la margarina tiene **14,89 g/100 g**, órdenes
de magnitud por encima de todo lo demás.

> Las trans *naturales* de rumiantes (la carne picada tiene 1,18 g) no muestran
> el mismo efecto adverso. No es lo mismo.

**Saturadas — suben el LDL.**
También suben algo el HDL, y la evidencia sobre desenlaces duros es más
discutida de lo que sugiere la versión popular. Lo bien establecido es el efecto
de **reemplazo**: cambiar saturadas por insaturadas reduce el riesgo
cardiovascular; cambiarlas por harinas refinadas, no.
**Importa por qué las reemplazás, no solo cuánto las bajás.**

**Monoinsaturadas — el pilar seguro.**
Bajan el LDL cuando desplazan saturadas y no perjudican el HDL. Es la familia
con mejor perfil riesgo-beneficio.

**Poliinsaturadas — las que más bajan el LDL.** Dos ramas:

- **Omega-6** (linoleico): las más eficaces para bajar LDL. Las acusaciones de
  que "inflaman" no se sostienen bien en ensayos controlados; el planteo real
  es de *proporción*, no de toxicidad.
- **Omega-3**: bajan triglicéridos. Los marinos (EPA/DHA — salmón, sardina,
  caballa) tienen la evidencia cardiovascular más sólida.
  El vegetal (ALA — lino, chía) **se convierte muy mal** a EPA/DHA:
  no reemplaza al pescado.

### Sobre "subir el colesterol bueno"

Conviene saberlo: **subir el HDL resultó ser un mal objetivo.**

Los fármacos diseñados específicamente para elevarlo —niacina, inhibidores de
CETP— lo lograron y **no redujeron los eventos cardiovasculares**. El HDL alto
parece ser más un *marcador* de buena salud metabólica que una causa de ella.

El objetivo con evidencia es **bajar el LDL** (o la ApoB, si el laboratorio la
mide). Y lo único que mueve el HDL de forma consistente es el **ejercicio**,
no la dieta.

---

## 3. Comparación de alimentos

### Aceites y grasas

Todos son ~100 g de grasa y ~884 kcal: **la energía no los diferencia, la
composición sí.** Ordenados por proporción de saturada.

| | Alimento | Grasa | Sat | Mono | Poli | % Sat |
|---|---|---|---|---|---|---|
| 🟢 | Aceite de canola | 100.0 | 7.4 | 63.3 | 28.1 | 7% |
| 🟢 | Aceite de almendra | 100.0 | 8.2 | 69.9 | 17.4 | 9% |
| 🟢 | Aceite de lino | 100.0 | 9.0 | 18.4 | 67.8 | 9% |
| 🟢 | Aceite de nuez | 100.0 | 9.1 | 22.8 | 63.3 | 10% |
| 🟢 | Aceite de pepita de uva | 100.0 | 9.6 | 16.1 | 69.9 | 10% |
| 🟢 | Aceite de girasol alto oleico | 100.0 | 9.9 | 83.7 | 3.8 | 10% |
| 🟢 | Aceite de girasol | 100.0 | 10.3 | 19.5 | 65.7 | 11% |
| 🟢 | Aceite de palta | 100.0 | 11.6 | 70.6 | 13.5 | 12% |
| 🟢 | Aceite de maíz | 100.0 | 12.9 | 27.6 | 54.7 | 14% |
| 🟢 | Aceite de oliva | 100.0 | 13.8 | 73.0 | 10.5 | 14% |
| 🟢 | Aceite de sésamo | 100.0 | 14.2 | 39.7 | 41.7 | 15% |
| 🟢 | Mayonesa | 74.8 | 11.7 | 16.8 | 44.7 | 16% |
| 🟢 | Mayonesa light | 22.2 | 3.4 | 5.0 | 13.0 | 16% |
| 🟢 | Aceite de soja | 100.0 | 15.7 | 22.8 | 57.7 | 16% |
| 🟢 | Aceite de maní | 100.0 | 16.9 | 46.2 | 32.0 | 18% |
| 🟢 | Aderezo de aceite y vinagre | 50.1 | 9.1 | 14.8 | 24.1 | 19% |
| 🔴 | Margarina | 80.7 | 15.2 | 38.9 | 24.3 | 19% |
| 🟡 | Aceite de salvado de arroz | 100.0 | 19.7 | 39.3 | 35.0 | 21% |
| 🟡 | Grasa de cerdo | 100.0 | 39.2 | 45.1 | 11.2 | 41% |
| 🔴 | Aceite de palma | 100.0 | 49.3 | 37.0 | 9.3 | 52% |
| 🔴 | Grasa vacuna | 100.0 | 49.8 | 41.8 | 4.0 | 52% |
| 🔴 | Aceite de coco | 99.1 | 82.5 | 6.3 | 1.7 | 91% |

El **girasol alto oleico** merece atención: 86% monoinsaturada, más que el
propio oliva. Resuelve las objeciones del girasol común. Lo que no tiene son
los polifenoles del virgen extra — que **ningún dato de USDA captura**, porque
en la tabla ambos figuran como "aceite" aunque uno sea refinado y el otro no.

### Carnes

Ordenadas por grasa saturada. Incluye los cortes argentinos mapeados a su
equivalente USDA y, para casi todos, su versión cocida. El sodio explica por
qué las curadas (jamón, panceta) quedan en rojo aunque su grasa sea baja.

| | Alimento | kcal | Grasa | Sat | Insat | Prot | Na (mg) |
|---|---|---|---|---|---|---|---|
| 🟢 | Pechuga de pavo cruda | 114 | 1.5 | 0.3 | 0.5 | 23.7 | 113 |
| 🟢 | Pechuga de pollo cruda (sin piel) | 120 | 2.6 | 0.6 | 1.1 | 22.5 | 45 |
| 🟢 | Solomillo de cerdo crudo (magro) | 109 | 2.2 | 0.7 | 1.2 | 20.9 | 53 |
| 🟢 | Pechuga de pollo al horno (sin piel) | 165 | 3.6 | 1.0 | 2.0 | 31.0 | 74 |
| 🟢 | Pata de pollo cruda (sin piel) | 120 | 4.2 | 1.1 | 2.4 | 19.2 | 96 |
| 🟢 | Nalga cruda (magra) | 121 | 2.9 | 1.1 | 1.5 | 23.6 | 54 |
| 🟢 | Solomillo de cerdo al horno (magro) | 143 | 3.5 | 1.2 | 1.8 | 26.2 | 57 |
| 🟢 | Hígado de ternera crudo | 135 | 3.6 | 1.2 | 0.9 | 20.4 | 69 |
| 🟢 | Osobuco crudo (magro) | 128 | 3.9 | 1.3 | 1.9 | 21.8 | 63 |
| 🟢 | Nalga al horno (magra) | 162 | 3.8 | 1.4 | 1.9 | 30.1 | 67 |
| 🟢 | Bola de lomo cruda (magra) | 128 | 4.3 | 1.5 | 2.0 | 22.2 | 59 |
| 🟢 | Cuadril crudo (magro) | 131 | 4.1 | 1.5 | 1.8 | 22.1 | 56 |
| 🟢 | Hígado de pollo crudo | 119 | 4.8 | 1.6 | 2.6 | 16.9 | 71 |
| 🟢 | Paleta cruda (magra) | 123 | 4.1 | 1.7 | 2.4 | 21.6 | 73 |
| 🟢 | Conejo crudo | 136 | 5.5 | 1.7 | 2.6 | 20.1 | 41 |
| 🔴 | Jamón cocido magro | 145 | 5.5 | 1.8 | 3.2 | 20.9 | 1203 |
| 🟢 | Lomo de ternera crudo (magro) | 139 | 5.7 | 2.0 | 2.5 | 21.9 | 44 |
| 🟢 | Pavo picado | 148 | 7.7 | 2.0 | 4.8 | 19.7 | 58 |
| 🟢 | Vacío crudo (magro) | 141 | 5.5 | 2.1 | 2.1 | 21.6 | 55 |
| 🟢 | Hígado de pollo estofado | 167 | 6.5 | 2.1 | 3.4 | 24.5 | 76 |
| 🟢 | Pata de pollo al horno (sin piel) | 174 | 7.8 | 2.1 | 4.7 | 24.2 | 99 |
| 🟢 | Carne picada magra (95/5) | 137 | 5.0 | 2.2 | 2.3 | 21.4 | 66 |
| 🟢 | Pechuga de pollo al horno (con piel) | 197 | 7.8 | 2.2 | 4.7 | 29.8 | 71 |
| 🟢 | Cuadril a la plancha (magro) | 183 | 5.8 | 2.2 | 2.5 | 30.6 | 64 |
| 🟢 | Bola de lomo al horno (magra) | 177 | 6.5 | 2.3 | 3.0 | 27.8 | 36 |
| 🟢 | Osobuco estofado (magro) | 201 | 6.4 | 2.3 | 3.1 | 33.7 | 64 |
| 🟢 | Pollo picado | 143 | 8.1 | 2.3 | 5.1 | 17.4 | 60 |
| 🟢 | Muslo de pollo al horno (sin piel) | 179 | 8.2 | 2.3 | 5.1 | 24.8 | 106 |
| 🟢 | Pato sin piel crudo | 135 | 6.0 | 2.3 | 2.3 | 18.3 | 74 |
| 🟢 | Bife angosto crudo (magro) | 143 | 5.7 | 2.3 | 3.1 | 23.1 | 46 |
| 🟢 | Conejo al horno | 197 | 8.1 | 2.4 | 3.7 | 29.1 | 47 |
| 🟢 | Aguja / Roast beef cruda (magra) | 137 | 6.0 | 2.5 | 3.4 | 20.6 | 85 |
| 🟢 | Pecho de ternera crudo (magro) | 157 | 7.4 | 2.6 | 3.7 | 20.7 | 79 |
| 🟢 | Paleta estofada (magra) | 196 | 7.8 | 2.6 | 3.8 | 31.5 | 61 |
| 🟢 | Pechuga de pollo con piel | 172 | 9.3 | 2.7 | 5.8 | 20.9 | 63 |
| 🟢 | Marucha cruda (magra) | 139 | 6.4 | 2.7 | 3.6 | 20.4 | 83 |
| 🟢 | Hígado de ternera estofado | 191 | 5.3 | 2.9 | 2.2 | 29.1 | 79 |
| 🟡 | Ternera picada a la plancha | 172 | 7.6 | 3.0 | 3.4 | 24.4 | 83 |
| 🟢 | Vacío a la plancha (magro) | 186 | 7.4 | 3.1 | 3.2 | 27.9 | 57 |
| 🟡 | Colita de cuadril cruda (con grasa) | 165 | 8.6 | 3.1 | 4.6 | 20.6 | 52 |
| 🟡 | Peceto crudo (con grasa) | 166 | 8.2 | 3.2 | 3.9 | 21.5 | 58 |
| 🟢 | Lomo de ternera a la parrilla (magro) | 198 | 8.3 | 3.3 | 4.3 | 30.7 | 59 |
| 🟢 | Aguja / Roast beef al horno (magra) | 183 | 8.5 | 3.4 | 4.6 | 26.6 | 80 |
| 🟢 | Bife angosto a la parrilla (magro) | 198 | 9.1 | 3.4 | 4.5 | 29.1 | 54 |
| 🟡 | Peceto al horno (con grasa) | 208 | 9.7 | 3.7 | 4.5 | 28.3 | 37 |
| 🟢 | Marucha a la parrilla (magra) | 196 | 9.2 | 3.8 | 5.0 | 28.1 | 87 |
| 🟡 | Carne picada (90/10) | 176 | 10.0 | 3.9 | 4.5 | 20.0 | 66 |
| 🟢 | Pato sin piel al horno | 201 | 11.2 | 4.0 | 5.3 | 23.5 | 65 |
| 🟡 | Tapa de asado cruda (magra) | 180 | 10.6 | 4.1 | 5.1 | 19.7 | 88 |
| 🟡 | Muslo de pollo al horno (con piel) | 232 | 14.7 | 4.1 | 9.3 | 23.3 | 102 |
| 🟡 | Chuleta de cerdo cruda (con grasa) | 198 | 12.6 | 4.4 | 7.0 | 19.7 | 50 |
| 🟡 | Muslo de pollo con piel crudo | 221 | 16.6 | 4.5 | 10.4 | 16.5 | 81 |
| 🟡 | Colita de cuadril al horno (con grasa) | 221 | 12.4 | 4.5 | 6.5 | 25.7 | 50 |
| 🟡 | Tapa de cuadril / Picanha cruda (con grasa) | 191 | 12.4 | 4.6 | 6.9 | 19.9 | 80 |
| 🟡 | Ternera picada | 197 | 13.1 | 5.1 | 6.9 | 18.6 | 103 |
| 🟡 | Tapa de cuadril / Picanha a la parrilla (con grasa) | 242 | 15.0 | 5.3 | 8.1 | 26.0 | 89 |
| 🟡 | Chuleta de cerdo al horno (con grasa) | 248 | 14.7 | 5.4 | 7.7 | 27.1 | 59 |
| 🟡 | Tapa de asado a la parrilla (magra) | 246 | 15.7 | 5.6 | 7.4 | 24.7 | 86 |
| 🔴 | Entraña cruda (con grasa) | 238 | 18.4 | 7.4 | 9.0 | 17.7 | 65 |
| 🔴 | Matambre crudo (aprox.) | 238 | 18.4 | 7.4 | 9.0 | 17.7 | 65 |
| 🔴 | Carne picada común (80/20) | 254 | 20.0 | 7.6 | 9.4 | 17.2 | 66 |
| 🔴 | Entraña a la parrilla (con grasa) | 300 | 21.6 | 7.7 | 9.9 | 26.5 | 70 |
| 🔴 | Matambre a la parrilla (aprox.) | 300 | 21.6 | 7.7 | 9.9 | 26.5 | 70 |
| 🔴 | Carne de cerdo picada | 263 | 21.2 | 7.9 | 11.3 | 16.9 | 56 |
| 🔴 | Asado de tira crudo (con grasa) | 235 | 18.3 | 8.0 | 9.9 | 17.5 | 78 |
| 🔴 | Ojo de bife crudo (con grasa) | 241 | 18.4 | 8.1 | 9.5 | 18.7 | 51 |
| 🔴 | Cordero picado a la plancha | 283 | 19.6 | 8.1 | 9.7 | 24.8 | 81 |
| 🔴 | Ojo de bife a la parrilla (con grasa) | 285 | 21.1 | 9.2 | 11.0 | 23.9 | 58 |
| 🔴 | Asado de tira cocido (con grasa) | 305 | 22.6 | 10.0 | 12.4 | 25.5 | 70 |
| 🔴 | Cordero picado | 282 | 23.4 | 10.2 | 11.4 | 16.6 | 59 |
| 🔴 | Panceta cocida | 548 | 43.3 | 14.2 | 23.9 | 35.7 | 2193 |

### Pescados y mariscos

**El más graso apenas llega a 4,2 g de saturada** (caballa cocida).
La grasa no los diferencia:
la salazón y el ahumado, sí.

| | Alimento | kcal | Grasa | Sat | Insat | Prot | Na (mg) |
|---|---|---|---|---|---|---|---|
| 🟢 | Camarón cocido | 99 | 0.3 | 0.1 | 0.1 | 24.0 | 111 |
| 🟢 | Camarón crudo | 85 | 0.5 | 0.1 | 0.2 | 20.1 | 119 |
| 🟢 | Vieira cruda | 69 | 0.5 | 0.1 | 0.2 | 12.1 | 392 |
| 🟢 | Bacalao crudo | 82 | 0.7 | 0.1 | 0.3 | 17.8 | 54 |
| 🟢 | Abadejo crudo | 76 | 0.8 | 0.1 | 0.4 | 17.2 | 159 |
| 🟢 | Bacalao cocido | 105 | 0.9 | 0.2 | 0.4 | 22.8 | 78 |
| 🟢 | Atún crudo | 109 | 0.5 | 0.2 | 0.3 | 24.4 | 45 |
| 🟢 | Langosta cruda | 77 | 0.8 | 0.2 | 0.5 | 16.5 | 423 |
| 🟡 | Almeja cruda | 86 | 1.0 | 0.2 | 0.3 | 14.7 | 601 |
| 🟡 | Almeja cocida | 148 | 1.9 | 0.2 | 0.7 | 25.6 | 1202 |
| 🟢 | Surimi | 99 | 0.9 | 0.2 | 0.6 | 15.2 | 143 |
| 🟢 | Cangrejo cocido | 83 | 0.7 | 0.2 | 0.4 | 17.9 | 395 |
| 🟢 | Langosta cocida | 89 | 0.9 | 0.2 | 0.6 | 19.0 | 486 |
| 🟢 | Cangrejo crudo | 87 | 1.1 | 0.2 | 0.6 | 18.1 | 293 |
| 🟢 | Pulpo crudo | 82 | 1.0 | 0.2 | 0.4 | 14.9 | 230 |
| 🟢 | Mero crudo | 92 | 1.0 | 0.2 | 0.5 | 19.4 | 53 |
| 🟢 | Atún al natural (lata) | 116 | 0.8 | 0.2 | 0.5 | 25.5 | 50 |
| 🟢 | Merluza cruda | 90 | 1.3 | 0.2 | 0.7 | 18.3 | 72 |
| 🟢 | Pargo crudo | 100 | 1.3 | 0.3 | 0.7 | 20.5 | 64 |
| 🟢 | Halibut crudo | 91 | 1.3 | 0.3 | 0.8 | 18.6 | 68 |
| 🟢 | Mero cocido | 118 | 1.3 | 0.3 | 0.7 | 24.8 | 53 |
| 🟢 | Halibut cocido | 111 | 1.6 | 0.4 | 0.9 | 22.5 | 82 |
| 🟢 | Calamar crudo | 92 | 1.4 | 0.4 | 0.6 | 15.6 | 44 |
| 🟢 | Pargo cocido | 128 | 1.7 | 0.4 | 0.9 | 26.3 | 57 |
| 🟢 | Merluza cocida | 116 | 1.7 | 0.4 | 1.0 | 23.5 | 132 |
| 🟢 | Mejillón crudo | 86 | 2.2 | 0.4 | 1.1 | 11.9 | 286 |
| 🟢 | Lenguado crudo | 70 | 1.9 | 0.4 | 0.9 | 12.4 | 296 |
| 🟢 | Pulpo cocido | 164 | 2.1 | 0.5 | 0.8 | 29.8 | 460 |
| 🔴 | Bacalao salado | 290 | 2.4 | 0.5 | 1.1 | 62.8 | 7027 |
| 🟢 | Ostra cruda | 81 | 2.3 | 0.5 | 1.3 | 9.4 | 106 |
| 🟢 | Lubina cruda | 97 | 2.0 | 0.5 | 1.2 | 18.4 | 68 |
| 🟢 | Lenguado cocido | 86 | 2.4 | 0.5 | 1.1 | 15.2 | 363 |
| 🟢 | Tilapia cruda | 96 | 1.7 | 0.6 | 0.9 | 20.1 | 52 |
| 🟢 | Lubina cocida | 124 | 2.6 | 0.7 | 1.5 | 23.6 | 87 |
| 🟢 | Mejillón cocido | 172 | 4.5 | 0.8 | 2.2 | 23.8 | 369 |
| 🟡 | Salmón ahumado | 117 | 4.3 | 0.9 | 3.0 | 18.3 | 672 |
| 🟢 | Tilapia cocida | 128 | 2.6 | 0.9 | 1.6 | 26.1 | 56 |
| 🟢 | Ostra cocida | 163 | 4.6 | 1.0 | 2.6 | 18.9 | 212 |
| 🟢 | Corvina cruda | 104 | 3.2 | 1.1 | 1.6 | 17.8 | 56 |
| 🟢 | Trucha cruda | 148 | 6.6 | 1.1 | 4.8 | 20.8 | 52 |
| 🟢 | Anchoa cruda | 131 | 4.8 | 1.3 | 2.8 | 20.4 | 104 |
| 🟢 | Trucha cocida | 190 | 8.5 | 1.5 | 6.1 | 26.6 | 67 |
| 🟢 | Sardina en aceite | 208 | 11.4 | 1.5 | 9.0 | 24.6 | 307 |
| 🟢 | Pez espada crudo | 144 | 6.7 | 1.6 | 4.2 | 19.7 | 81 |
| 🟢 | Pez espada cocido | 172 | 7.9 | 1.9 | 4.9 | 23.4 | 97 |
| 🟢 | Arenque crudo | 158 | 9.0 | 2.0 | 5.9 | 18.0 | 90 |
| 🟢 | Salmón cocido | 206 | 12.3 | 2.4 | 8.7 | 22.1 | 61 |
| 🟢 | Arenque cocido | 203 | 11.6 | 2.6 | 7.5 | 23.0 | 115 |
| 🟢 | Sardina en salsa de tomate | 185 | 10.4 | 2.7 | 6.9 | 20.9 | 414 |
| 🟢 | Salmón crudo | 208 | 13.4 | 3.0 | 7.7 | 20.4 | 59 |
| 🟢 | Caballa cruda | 205 | 13.9 | 3.3 | 8.8 | 18.6 | 90 |
| 🟢 | Caballa cocida | 262 | 17.8 | 4.2 | 11.3 | 23.9 | 83 |

### Legumbres

Ordenadas por **proteína**, no por grasa saturada como las carnes. Acá la
grasa casi no discrimina: ninguna legumbre hervida pasa los 0,3 g de saturada
salvo la soja (1,3 g), así que ordenarlas por ahí produce una lista plana. Lo
que se quiere saber de una legumbre es cuánta proteína y cuánta fibra aporta
como acompañamiento.

Van en dos tablas porque **el peso en seco y el peso cocido no se comparan**:
la legumbre triplica su masa al hidratarse, y sus 24 g de proteína en seco se
vuelven 9 g en el plato. Comparar un garbanzo crudo contra una pechuga cocida
da una ventaja imaginaria de 2 a 1.

#### Cocidas, como llegan al plato

| | Alimento | kcal | Prot | Carb | Fibra | Grasa | Sat | Sodio |
|---|---|---|---|---|---|---|---|---|
| 🟢 | Soja hervida | 172 | 18.2 | 8.4 | 6.0 | 9.0 | 1.3 | 1 |
| 🟢 | Poroto blanco hervido | 139 | 9.7 | 25.1 | 6.3 | 0.4 | 0.1 | 6 |
| 🟢 | Poroto cranberry hervido | 136 | 9.3 | 24.5 | 8.6 | 0.5 | 0.1 | 1 |
| 🟢 | Lenteja hervida | 116 | 9.0 | 20.1 | 7.9 | 0.4 | 0.1 | 2 |
| 🟢 | Poroto pinto hervido | 143 | 9.0 | 26.2 | 9.0 | 0.7 | 0.1 | 1 |
| 🟢 | Garbanzo hervido | 164 | 8.9 | 27.4 | 7.6 | 2.6 | 0.3 | 7 |
| 🟢 | Poroto negro hervido | 132 | 8.9 | 23.7 | 8.7 | 0.5 | 0.1 | 1 |
| 🟢 | Poroto colorado hervido | 127 | 8.7 | 22.8 | 6.4 | 0.5 | 0.1 | 1 |
| 🟢 | Arveja partida cocida | 118 | 8.3 | 21.1 | 8.3 | 0.4 | 0.1 | 2 |
| 🟢 | Poroto manteca hervido | 140 | 8.2 | 26.1 | 10.5 | 0.6 | 0.1 | 0 |
| 🟢 | Poroto pallar hervido | 115 | 7.8 | 20.9 | 7.0 | 0.4 | 0.1 | 2 |
| 🟢 | Haba seca hervida | 110 | 7.6 | 19.7 | 5.4 | 0.4 | 0.1 | 5 |
| 🟢 | Poroto adzuki hervido | 128 | 7.5 | 24.8 | 7.3 | 0.1 | 0.0 | 8 |
| 🟢 | Garbanzo en lata (escurrido) | 139 | 7.1 | 22.5 | 6.4 | 2.8 | 0.2 | 246 |
| 🟢 | Poroto mung hervido | 105 | 7.0 | 19.2 | 7.6 | 0.4 | 0.1 | 2 |

Para dimensionarlo: una porción de 200 g de lentejas hervidas son **18 g de
proteína y 16 g de fibra** por 232 kcal, con 0,2 g de saturada. Los mismos
18 g de proteína en nalga al horno entran en 60 g de carne —bastante menos
volumen— pero traen 0,8 g de saturada y ninguna fibra. No son sustitutos: el
perfil de aminoácidos y la absorción del hierro no son los mismos. Pero como
guarnición de una proteína animal, una legumbre suma proteína y fibra en vez
de solo almidón, que es lo que aporta el arroz o la papa.

El **garbanzo en lata** está para poder comparar contra el hervido en casa:
mismo garbanzo, 246 mg de sodio contra 7. Escurrir y enjuagar baja bastante
esa cifra; el valor de USDA ya es del sólido escurrido.

#### En seco y derivados

Los valores en seco sirven para pesar antes de cocinar, no para comparar con
un plato servido.

| | Alimento | kcal | Prot | Carb | Fibra | Grasa | Sat | Sodio |
|---|---|---|---|---|---|---|---|---|
| 🟢 | Soja | 446 | 36.5 | 30.2 | 9.3 | 19.9 | 2.9 | 2 |
| 🟢 | Altramuz | 371 | 36.2 | 40.4 | 18.9 | 9.7 | 1.2 | 15 |
| 🟢 | Haba seca | 341 | 26.1 | 58.3 | 25.0 | 1.5 | 0.3 | 13 |
| 🟢 | Maní | 567 | 25.8 | 16.1 | 8.5 | 49.2 | 6.3 | 18 |
| 🟢 | Lenteja | 352 | 24.6 | 63.4 | 10.7 | 1.1 | 0.2 | 6 |
| 🟢 | Maní tostado | 587 | 24.4 | 21.3 | 8.4 | 49.7 | 7.7 | 6 |
| 🟢 | Lenteja roja | 358 | 23.9 | 63.1 | 10.8 | 2.2 | 0.4 | 7 |
| 🟢 | Poroto mung | 347 | 23.9 | 62.6 | 16.3 | 1.2 | 0.3 | 15 |
| 🟢 | Poroto colorado | 333 | 23.6 | 60.0 | 24.9 | 0.8 | 0.1 | 24 |
| 🟢 | Poroto blanco | 333 | 23.4 | 60.3 | 15.2 | 0.9 | 0.2 | 16 |
| 🟢 | Poroto cranberry | 335 | 23.0 | 60.1 | 24.7 | 1.2 | 0.3 | 6 |
| 🟢 | Harina de garbanzo | 387 | 22.4 | 57.8 | 10.8 | 6.7 | 0.7 | 64 |
| 🟢 | Poroto manteca | 337 | 22.3 | 60.8 | 15.3 | 1.5 | 0.2 | 5 |
| 🟢 | Manteca de maní | 598 | 22.2 | 22.3 | 5.0 | 51.4 | 10.3 | 17 |
| 🟢 | Gandul | 343 | 21.7 | 62.8 | 15.0 | 1.5 | 0.3 | 17 |
| 🟢 | Poroto negro | 341 | 21.6 | 62.4 | 15.5 | 1.4 | 0.4 | 5 |
| 🟢 | Poroto pallar | 338 | 21.5 | 63.4 | 19.0 | 0.7 | 0.2 | 18 |
| 🟢 | Poroto pinto | 347 | 21.4 | 62.6 | 15.5 | 1.2 | 0.2 | 12 |
| 🟢 | Garbanzo | 378 | 20.5 | 63.0 | 12.2 | 6.0 | 0.6 | 24 |
| 🟢 | Tempeh | 192 | 20.3 | 7.6 | — | 10.8 | 2.5 | 9 |
| 🟢 | Poroto adzuki | 329 | 19.9 | 62.9 | 12.7 | 0.5 | 0.2 | 5 |
| 🟢 | Natto | 211 | 19.4 | 12.7 | 5.4 | 11.0 | 1.6 | 7 |
| 🟢 | Tofu | 144 | 17.3 | 2.8 | 2.3 | 8.7 | 1.3 | 14 |
| 🟢 | Edamame | 147 | 13.0 | 11.1 | 4.2 | 6.8 | 0.8 | 15 |
| 🟡 | Miso | 198 | 12.8 | 25.4 | 5.4 | 6.0 | 1.0 | 3728 |
| 🟡 | Tamari | 60 | 10.5 | 5.6 | 0.8 | 0.1 | 0.0 | 5586 |
| 🟡 | Salsa de soja | 53 | 8.1 | 4.9 | 0.8 | 0.6 | 0.1 | 5493 |
| 🟢 | Hummus | 177 | 4.9 | 20.1 | 4.0 | 8.6 | 1.1 | 242 |
| 🟢 | Leche de soja | 33 | 2.9 | 1.7 | 0.5 | 1.6 | 0.2 | 37 |

Las tres entradas 🟡 —miso, salsa de soja, tamari— lo son por sodio, y es un
falso positivo previsible: son condimentos que se usan de a cucharadas, no de
a 100 g. El criterio de la categoría los mide como si fueran un plato.

### Cereales y panes

Ordenados por **fibra sobre carbohidratos**, que es la señal de integral vs
refinado y sobrevive a la cocción (la fibra absoluta no: un grano cocido es
mayormente agua).

| | Alimento | kcal | Carb | Fibra | Fibra/Carb |
|---|---|---|---|---|---|
| 🟢 | Salvado de trigo | 216 | 64.5 | 42.8 | 0.663 |
| 🟢 | Germen de trigo | 360 | 51.8 | 13.2 | 0.255 |
| 🟢 | Trigo burgol cocido | 83 | 18.6 | 4.5 | 0.242 |
| 🟢 | Cebada integral | 354 | 73.5 | 17.3 | 0.235 |
| 🟢 | Salvado de avena | 246 | 66.2 | 15.4 | 0.233 |
| 🟢 | Centeno en grano | 338 | 75.9 | 15.1 | 0.199 |
| 🟢 | Harina integral de trigo | 332 | 74.5 | 13.1 | 0.176 |
| 🟢 | Granola | 489 | 53.9 | 8.9 | 0.165 |
| 🟢 | Trigo burgol crudo | 342 | 75.9 | 12.5 | 0.165 |
| 🟢 | Harina de centeno | 349 | 75.4 | 11.8 | 0.156 |
| 🟢 | Avena arrollada | 379 | 67.7 | 10.1 | 0.149 |
| 🟢 | Espelta cocida | 127 | 26.4 | 3.9 | 0.148 |
| 🟢 | Avena cocida | 71 | 12.0 | 1.7 | 0.142 |
| 🟢 | Teff cocido | 101 | 19.9 | 2.8 | 0.141 |
| 🟢 | Pan integral | 252 | 42.7 | 6.0 | 0.140 |
| 🟢 | Trigo sarraceno | 343 | 71.5 | 10.0 | 0.140 |
| 🟢 | Cebada perlada cocida | 123 | 28.2 | 3.8 | 0.135 |
| 🟢 | Quinoa cocida | 120 | 21.3 | 2.8 | 0.131 |
| 🟢 | Fideos integrales cocidos | 149 | 30.1 | 3.9 | 0.130 |
| 🟢 | Fideos integrales secos | 352 | 73.4 | 9.2 | 0.125 |
| 🟢 | Pan de centeno | 259 | 48.3 | 5.8 | 0.120 |
| 🟢 | Amaranto cocido | 102 | 18.7 | 2.1 | 0.112 |
| 🟢 | Quinoa cruda | 368 | 64.2 | 7.0 | 0.109 |
| 🟢 | Amaranto crudo | 371 | 65.3 | 6.7 | 0.103 |
| 🟢 | Harina de maíz blanca | 361 | 76.8 | 7.3 | 0.095 |
| 🟢 | Harina de maíz | 362 | 76.9 | 7.3 | 0.095 |
| 🟢 | Sorgo | 329 | 72.1 | 6.7 | 0.093 |
| 🟢 | Arroz salvaje cocido | 101 | 21.3 | 1.8 | 0.084 |
| 🟢 | Arroz integral cocido | 123 | 25.6 | 1.6 | 0.063 |
| 🟡 | Cuscús cocido | 112 | 23.2 | 1.4 | 0.060 |
| 🟢 | Harina de arroz integral | 363 | 76.5 | 4.6 | 0.060 |
| 🟢 | Fideos cocidos | 158 | 30.9 | 1.8 | 0.058 |
| 🟡 | Mijo cocido | 119 | 23.7 | 1.3 | 0.055 |
| 🟢 | Pan blanco de molde | 266 | 49.4 | 2.7 | 0.055 |
| 🟡 | Arroz glutinoso | 97 | 21.1 | 1.0 | 0.047 |
| 🟢 | Arroz integral crudo | 367 | 76.3 | 3.6 | 0.047 |
| 🟢 | Pan italiano | 259 | 48.1 | 2.1 | 0.044 |
| 🟢 | Gluten de trigo | 370 | 13.8 | 0.6 | 0.044 |
| 🟢 | Fideos secos | 371 | 74.7 | 3.2 | 0.043 |
| 🟢 | Pan francés (de panadería) | 272 | 51.9 | 2.2 | 0.042 |
| 🟡 | Fideos de arroz cocidos | 108 | 24.0 | 1.0 | 0.042 |
| 🟡 | Pan pita | 275 | 55.7 | 2.2 | 0.039 |
| 🔴 | Arroz blanco crudo | 365 | 80.0 | 1.3 | 0.016 |
| 🔴 | Arroz blanco cocido | 130 | 28.2 | 0.4 | 0.014 |
| 🔴 | Tapioca | 358 | 88.7 | 0.9 | 0.010 |
| 🔴 | Almidón de maíz | 381 | 91.3 | 0.9 | 0.010 |
| 🔴 | Arroz blanco de grano corto cocido | 130 | 28.7 | 0.0 | 0.000 |
| 🔴 | Arroz blanco de grano corto crudo | 358 | 79.2 | 0.0 | 0.000 |
| 🔴 | Fideos soba cocidos | 99 | 21.4 | 0.0 | 0.000 |
| 🔴 | Pasta casera al huevo | 130 | 23.5 | 0.0 | 0.000 |
| 🔴 | Pasta fresca cocida | 131 | 24.9 | 0.0 | 0.000 |

### Arroz: cuál es cuál

Tres cosas distintas que se confunden fácil:

| | Qué es | En el catálogo |
|---|---|---|
| **Grano largo** | El arroz suelto de uso diario | Arroz blanco cocido/crudo 🔴 |
| **Grano corto (japónica)** | El de sushi. **Koshihikari es este.** Se pega por su almidón, no por ser "glutinoso" | Arroz blanco de grano corto 🔴 |
| **Glutinoso** (*mochigome*) | Variedad **distinta**, para mochi y postres. No se usa para sushi | Arroz glutinoso 🟡 |

**El arroz de sushi no es arroz glutinoso.** Son variedades diferentes pese a
que ambos queden pegajosos. Para Koshihikari corresponde *grano corto*.

Nutricionalmente los tres son arroz blanco refinado y quedan igual de
desaconsejados: la diferencia entre ellos es de textura, no de salud.
El salto real es a **integral** (🟢), que triplica la fibra.

> El 🟡 del glutinoso es un **falso positivo conocido** del criterio: su fibra
> declarada en USDA (1,0 g) lo sube apenas por encima del blanco común. Sigue
> siendo refinado.

### Lácteos y huevos

| | Alimento | kcal | Grasa | Sat | Azúcar |
|---|---|---|---|---|---|
| 🟢 | Clara de huevo | 52 | 0.2 | 0.0 | 0.7 |
| 🟢 | Leche descremada | 34 | 0.1 | 0.1 | 5.1 |
| 🟢 | Yogur natural descremado | 56 | 0.2 | 0.1 | 7.7 |
| 🟢 | Yogur griego descremado | 59 | 0.4 | 0.1 | 3.2 |
| 🟢 | Leche parcialmente descremada | 42 | 1.0 | 0.6 | 5.2 |
| 🟢 | Queso cottage light | 81 | 2.3 | 1.2 | 4.0 |
| 🟢 | Queso cottage | 98 | 4.3 | 1.7 | 2.7 |
| 🟢 | Leche entera | 61 | 3.3 | 1.9 | 5.0 |
| 🟡 | Yogur natural entero | 61 | 3.3 | 2.1 | 4.7 |
| 🟡 | Yogur griego natural | 97 | 5.0 | 2.4 | 4.0 |
| 🟡 | Leche de cabra | 69 | 4.1 | 2.7 | 4.5 |
| 🟡 | Huevo crudo | 143 | 9.5 | 3.1 | 0.4 |
| 🟡 | Huevo duro | 155 | 10.6 | 3.3 | 1.1 |
| 🟡 | Huevo revuelto | 149 | 11.0 | 3.3 | 1.4 |
| 🟡 | Huevo frito | 196 | 14.8 | 4.3 | 0.4 |
| 🔴 | Dulce de leche | 315 | 7.3 | 4.5 | 49.7 |
| 🟡 | Ricota descremada | 138 | 7.9 | 4.9 | 0.3 |
| 🟡 | Ricota | 150 | 10.2 | 6.4 | 0.3 |
| 🟡 | Yema de huevo | 322 | 26.5 | 9.6 | 0.6 |
| 🔴 | Mozzarella descremada | 254 | 15.9 | 10.1 | 1.1 |
| 🔴 | Crema agria | 198 | 19.4 | 10.1 | 3.4 |
| 🔴 | Crema liviana | 195 | 19.1 | 10.2 | 3.7 |
| 🔴 | Queso fresco | 299 | 23.8 | 12.9 | 2.3 |
| 🔴 | Queso feta | 265 | 21.5 | 13.3 | 0.0 |
| 🔴 | Queso blanco | 310 | 24.3 | 13.7 | 1.8 |
| 🔴 | Queso mozzarella | 299 | 22.1 | 13.9 | 0.0 |
| 🔴 | Queso parmesano | 392 | 25.0 | 14.8 | 0.1 |
| 🔴 | Queso Port Salut San Francisco | 307 | 24.7 | 15.0 | 0.0 |
| 🔴 | Queso camembert | 300 | 24.3 | 15.3 | 0.5 |
| 🔴 | Leche en polvo entera | 496 | 26.7 | 16.7 | 38.4 |
| 🔴 | Queso provolone | 351 | 26.6 | 17.1 | 0.6 |
| 🔴 | Queso brie | 334 | 27.7 | 17.4 | 0.5 |
| 🔴 | Queso gouda | 356 | 27.4 | 17.6 | 2.2 |
| 🔴 | Queso suizo | 393 | 31.0 | 18.2 | 0.0 |
| 🔴 | Queso azul | 353 | 28.7 | 18.7 | 0.5 |
| 🔴 | Queso cheddar | 403 | 33.3 | 18.9 | 0.5 |
| 🔴 | Queso gruyere | 413 | 32.3 | 18.9 | 0.4 |
| 🔴 | Queso cremoso | 373 | 30.3 | 19.1 | 0.5 |
| 🔴 | Queso crema | 350 | 34.4 | 20.2 | 3.8 |
| 🔴 | Queso de cabra | 364 | 29.8 | 20.6 | 0.1 |
| 🔴 | Crema de leche | 340 | 36.1 | 23.0 | 2.9 |
| 🔴 | Manteca | 717 | 81.1 | 50.5 | 0.1 |
| 🔴 | Manteca con sal | 717 | 81.1 | 51.4 | 0.1 |
| 🔴 | Ghee | 900 | 100.0 | 60.0 | 0.0 |

---

### Verduras

Ordenadas por **fibra**. Las 107 son verdes, y eso no es un empate: es que el criterio de la categoría **no discrimina**, porque ninguna verdura tiene con qué salir mal parada. Estuvieron fuera de este documento por esa razón, y era un error: el color no las separa, pero los números sí, y para armar un plato la pregunta nunca es «¿es sana?» sino «¿cuál de estas me da más fibra por caloría?».

| | Alimento | kcal | Carb | Fibra | Prot | K | Na |
|---|---|---|---|---|---|---|---|
| 🟢 | Tomate secado al sol | 258 | 55.8 | 12.3 | 14.1 | 3427 | 107 |
| 🟢 | Alcaucil hervido | 53 | 12.0 | 5.7 | 2.9 | 286 | 60 |
| 🟢 | Arvejas frescas | 81 | 14.5 | 5.7 | 5.4 | 244 | 5 |
| 🟢 | Arvejas hervidas | 84 | 15.6 | 5.5 | 5.4 | 271 | 3 |
| 🟢 | Alcaucil | 47 | 10.5 | 5.4 | 3.3 | 370 | 94 |
| 🟢 | Jícama | 38 | 8.8 | 4.9 | 0.7 | 150 | 4 |
| 🟢 | Habas frescas | 72 | 11.7 | 4.2 | 5.6 | 250 | 50 |
| 🟢 | Kale | 35 | 4.4 | 4.1 | 2.9 | 348 | 53 |
| 🟢 | Achicoria | 23 | 4.7 | 4.0 | 1.7 | 420 | 45 |
| 🟢 | Kale hervido | 36 | 5.3 | 4.0 | 2.9 | 144 | 16 |
| 🟢 | Repollitos de Bruselas | 43 | 9.0 | 3.8 | 3.4 | 389 | 25 |
| 🟢 | Ají serrano | 32 | 6.7 | 3.7 | 1.7 | 305 | 10 |
| 🟢 | Colinabo | 27 | 6.2 | 3.6 | 1.7 | 350 | 20 |
| 🟢 | Espirulina seca | 290 | 23.9 | 3.6 | 57.5 | 1363 | 1048 |
| 🟢 | Chaucha amarilla | 31 | 7.1 | 3.4 | 1.8 | 209 | 6 |
| 🟢 | Brócoli hervido | 35 | 7.2 | 3.3 | 2.4 | 293 | 41 |
| 🟢 | Perejil | 36 | 6.3 | 3.3 | 3.0 | 554 | 56 |
| 🟢 | Chaucha hervida | 35 | 7.9 | 3.2 | 1.9 | 146 | 1 |
| 🟢 | Okra | 33 | 7.5 | 3.2 | 1.9 | 299 | 7 |
| 🟢 | Zapallo anco al horno | 40 | 10.5 | 3.2 | 0.9 | 284 | 4 |
| 🟢 | Endivia | 17 | 3.4 | 3.1 | 1.3 | 314 | 22 |
| 🟢 | Hinojo | 31 | 7.3 | 3.1 | 1.2 | 414 | 52 |
| 🟢 | Batata | 86 | 20.1 | 3.0 | 1.6 | 337 | 55 |
| 🟢 | Berenjena | 25 | 5.9 | 3.0 | 1.0 | 229 | 2 |
| 🟢 | Zanahoria hervida | 35 | 8.2 | 3.0 | 0.8 | 235 | 58 |
| 🟢 | Jalapeño | 29 | 6.5 | 2.8 | 0.9 | 248 | 3 |
| 🟢 | Remolacha | 43 | 9.6 | 2.8 | 1.6 | 325 | 78 |
| 🟢 | Zanahoria | 41 | 9.6 | 2.8 | 0.9 | 320 | 69 |
| 🟢 | Chaucha | 31 | 7.0 | 2.7 | 1.8 | 211 | 6 |
| 🟢 | Choclo blanco | 86 | 19.0 | 2.7 | 3.2 | 270 | 15 |
| 🟢 | Arvejas en vaina | 42 | 7.6 | 2.6 | 2.8 | 200 | 4 |
| 🟢 | Brócoli | 34 | 6.6 | 2.6 | 2.8 | 316 | 33 |
| 🟢 | Cebolla de verdeo | 32 | 7.3 | 2.6 | 1.8 | 276 | 16 |
| 🟢 | Repollitos de Bruselas hervidos | 36 | 7.1 | 2.6 | 2.6 | 317 | 21 |
| 🟢 | Batata hervida (sin cáscara) | 76 | 17.7 | 2.5 | 1.4 | 230 | 27 |
| 🟢 | Berenjena hervida | 35 | 8.7 | 2.5 | 0.8 | 123 | 1 |
| 🟢 | Ciboulette | 30 | 4.4 | 2.5 | 3.3 | 296 | 3 |
| 🟢 | Repollo | 25 | 5.8 | 2.5 | 1.3 | 170 | 18 |
| 🟢 | Choclo hervido | 96 | 21.0 | 2.4 | 3.4 | 218 | 1 |
| 🟢 | Espinaca cocida | 23 | 3.8 | 2.4 | 3.0 | 466 | 70 |
| 🟢 | Papa blanca | 69 | 15.7 | 2.4 | 1.7 | 407 | 16 |
| 🟢 | Coliflor hervida | 23 | 4.1 | 2.3 | 1.8 | 142 | 15 |
| 🟢 | Espinaca | 23 | 3.6 | 2.2 | 2.9 | 558 | 79 |
| 🟢 | Nopal | 16 | 3.3 | 2.2 | 1.3 | 257 | 21 |
| 🟢 | Papa al horno | 93 | 21.2 | 2.2 | 2.5 | 535 | 10 |
| 🟢 | Acelga hervida | 20 | 4.1 | 2.1 | 1.9 | 549 | 179 |
| 🟢 | Ajo | 149 | 33.1 | 2.1 | 6.4 | 401 | 17 |
| 🟢 | Espárrago | 20 | 3.9 | 2.1 | 2.2 | 202 | 2 |
| 🟢 | Lechuga romana | 17 | 3.3 | 2.1 | 1.2 | 247 | 8 |
| 🟢 | Morrón rojo | 26 | 6.0 | 2.1 | 1.0 | 211 | 4 |
| 🟢 | Papa | 77 | 17.5 | 2.1 | 2.1 | 425 | 6 |
| 🟢 | Repollo colorado | 31 | 7.4 | 2.1 | 1.4 | 243 | 27 |
| 🟢 | Choclo | 86 | 18.7 | 2.0 | 3.3 | 270 | 15 |
| 🟢 | Coliflor | 25 | 5.0 | 2.0 | 1.9 | 299 | 30 |
| 🟢 | Espárrago hervido | 22 | 4.1 | 2.0 | 2.4 | 224 | 14 |
| 🟢 | Jengibre | 80 | 17.8 | 2.0 | 1.8 | 415 | 13 |
| 🟢 | Remolacha hervida | 44 | 10.0 | 2.0 | 1.7 | 305 | 77 |
| 🟢 | Zapallo anco | 45 | 11.7 | 2.0 | 1.0 | 352 | 4 |
| 🟢 | Brotes de alfalfa | 23 | 2.1 | 1.9 | 4.0 | 79 | 6 |
| 🟢 | Tomatillo | 32 | 5.8 | 1.9 | 1.0 | 268 | 1 |
| 🟢 | Apio nabo | 42 | 9.2 | 1.8 | 1.5 | 300 | 100 |
| 🟢 | Brotes de soja | 30 | 5.9 | 1.8 | 3.0 | 149 | 6 |
| 🟢 | Mandioca | 160 | 38.1 | 1.8 | 1.4 | 271 | 14 |
| 🟢 | Nabo | 28 | 6.4 | 1.8 | 0.9 | 191 | 67 |
| 🟢 | Papa hervida (con cáscara) | 87 | 20.1 | 1.8 | 1.9 | 379 | 4 |
| 🟢 | Puerro | 61 | 14.2 | 1.8 | 1.5 | 180 | 20 |
| 🟢 | Cebolla | 40 | 9.3 | 1.7 | 1.1 | 146 | 4 |
| 🟢 | Chayote | 19 | 4.5 | 1.7 | 0.8 | 125 | 2 |
| 🟢 | Morrón verde | 20 | 4.6 | 1.7 | 0.9 | 175 | 3 |
| 🟢 | Papa colorada | 70 | 15.9 | 1.7 | 1.9 | 455 | 18 |
| 🟢 | Acelga | 19 | 3.7 | 1.6 | 1.8 | 379 | 213 |
| 🟢 | Aguaturma | 73 | 17.4 | 1.6 | 2.0 | 429 | 4 |
| 🟢 | Apio | 14 | 3.0 | 1.6 | 0.7 | 260 | 80 |
| 🟢 | Cardo | 17 | 4.1 | 1.6 | 0.7 | 400 | 170 |
| 🟢 | Daikon | 18 | 4.1 | 1.6 | 0.6 | 227 | 21 |
| 🟢 | Kimchi | 15 | 2.4 | 1.6 | 1.1 | 151 | 498 |
| 🟢 | Rabanito | 16 | 3.4 | 1.6 | 0.7 | 233 | 39 |
| 🟢 | Rúcula | 25 | 3.7 | 1.6 | 2.6 | 369 | 27 |
| 🟢 | Ají picante rojo | 40 | 8.8 | 1.5 | 1.9 | 322 | 9 |
| 🟢 | Ají picante verde | 40 | 9.5 | 1.5 | 2.0 | 340 | 7 |
| 🟢 | Palmito | 115 | 25.6 | 1.5 | 2.7 | 1806 | 14 |
| 🟢 | Zapallo bellota | 40 | 10.4 | 1.5 | 0.8 | 347 | 3 |
| 🟢 | Zapallo espagueti | 31 | 6.9 | 1.5 | 0.6 | 108 | 17 |
| 🟢 | Cebolla cocida | 44 | 10.2 | 1.4 | 1.4 | 166 | 3 |
| 🟢 | Zapallito hervido | 20 | 4.3 | 1.4 | 0.9 | 192 | 1 |
| 🟢 | Alga kelp | 43 | 9.6 | 1.3 | 1.7 | 89 | 233 |
| 🟢 | Lechuga criolla | 15 | 2.9 | 1.3 | 1.4 | 194 | 28 |
| 🟢 | Lechuga repollada | 14 | 3.0 | 1.2 | 0.9 | 141 | 10 |
| 🟢 | Morrón rojo cocido | 28 | 6.7 | 1.2 | 0.9 | 166 | 2 |
| 🟢 | Repollo chino | 16 | 3.2 | 1.2 | 1.2 | 238 | 9 |
| 🟢 | Tomate | 18 | 3.9 | 1.2 | 0.9 | 237 | 5 |
| 🟢 | Calabaza hervida | 20 | 4.9 | 1.1 | 0.7 | 230 | 1 |
| 🟢 | Lechuga mantecosa | 13 | 2.2 | 1.1 | 1.4 | 238 | 5 |
| 🟢 | Tomate verde | 23 | 5.1 | 1.1 | 1.2 | 204 | 13 |
| 🟢 | Zapallito | 16 | 3.4 | 1.1 | 1.2 | 262 | 2 |
| 🟢 | Pepinillo en vinagre | 12 | 2.4 | 1.0 | 0.5 | 117 | 809 |
| 🟢 | Puerro hervido | 31 | 7.6 | 1.0 | 0.8 | 87 | 10 |
| 🟢 | Cebolla dulce | 32 | 7.6 | 0.9 | 0.8 | 119 | 8 |
| 🟢 | Lechuga morada | 13 | 2.3 | 0.9 | 1.3 | 187 | 25 |
| 🟢 | Morrón amarillo | 27 | 6.3 | 0.9 | 1.0 | 212 | 2 |
| 🟢 | Radicchio | 23 | 4.5 | 0.9 | 1.4 | 302 | 22 |
| 🟢 | Pepino pelado | 10 | 2.2 | 0.7 | 0.6 | 136 | 2 |
| 🟢 | Alga wakame | 45 | 9.1 | 0.5 | 3.0 | 50 | 872 |
| 🟢 | Berro | 11 | 1.3 | 0.5 | 2.3 | 330 | 41 |
| 🟢 | Calabaza | 26 | 6.5 | 0.5 | 1.0 | 340 | 1 |
| 🟢 | Pepino | 15 | 3.6 | 0.5 | 0.7 | 147 | 2 |
| 🟢 | Alga nori | 35 | 5.1 | 0.3 | 5.8 | 356 | 48 |

La columna que decide casi siempre es la fibra. Entre 100 g de lechuga y 100 g de alcaucil hervido hay 1,3 contra 8,6 g: el mismo color, seis veces la fibra. El potasio está para el otro objetivo, y ahí la papa y la batata mandan pese a ser las más calóricas.

### Hongos

Ordenados por **fibra**. Estaban repartidos dentro de Verduras, y no son
verduras: no son plantas. Separarlos es lo que deja ver que **entre ellos casi
no hay diferencia** — 22 a 39 kcal, 1 a 4 g de proteína, menos de 1 g de grasa
y la saturada medida en centésimas. Elegir gírgola o portobello no cambia
nada nutricional; lo que cambia es el sabor y la textura, y eso es motivo
suficiente.

Lo único que sí los separa es **la salmuera**. Un champiñón fresco tiene 5 mg
de sodio; el mismo champiñón en lata, 425. Por eso la categoría se juzga por
sodio y por nada más: es el único eje donde hay algo que decidir.

| | Alimento | kcal | Prot | Carb | Fibra | K | Na | Vit D |
|---|---|---|---|---|---|---|---|---|
| 🟢 | Shiitake seco | 296 | 9.6 | 75.4 | 11.5 | 1534 | 13 | 3.9 |
| 🟢 | Chantarela | 32 | 1.5 | 6.9 | 3.8 | 506 | 9 | 5.3 |
| 🟢 | Shiitake salteado | 39 | 3.5 | 7.7 | 3.6 | 326 | 5 | 0.5 |
| 🟢 | Morilla | 31 | 3.1 | 5.1 | 2.8 | 411 | 21 | 5.1 |
| 🟢 | Enoki | 37 | 2.7 | 7.8 | 2.7 | 359 | 3 | 0.1 |
| 🟢 | Maitake | 31 | 1.9 | 7.0 | 2.7 | 204 | 1 | 28.1 |
| 🟡 | Hongos de paja en lata | 32 | 3.8 | 4.6 | 2.5 | 78 | 384 |  |
| 🟢 | Shiitake | 34 | 2.2 | 6.8 | 2.5 | 304 | 9 | 0.4 |
| 🟡 | Champiñones en lata | 25 | 1.9 | 5.1 | 2.4 | 129 | 425 | 0.2 |
| 🟢 | Gírgola | 33 | 3.3 | 6.1 | 2.3 | 420 | 18 | 0.7 |
| 🟢 | Champiñón hervido | 28 | 2.2 | 5.3 | 2.2 | 356 | 2 | 0.2 |
| 🟢 | Portobello grillado | 29 | 3.3 | 4.4 | 2.2 | 437 | 11 | 0.3 |
| 🟢 | Shiitake hervido | 56 | 1.6 | 14.4 | 2.1 | 117 | 4 | 0.7 |
| 🟢 | Champiñón salteado | 26 | 3.6 | 4.0 | 1.8 | 396 | 12 | 0.2 |
| 🟢 | Portobello | 22 | 2.1 | 3.9 | 1.3 | 364 | 9 | 0.3 |
| 🟢 | Champiñón | 22 | 3.1 | 3.3 | 1.0 | 318 | 5 | 0.2 |
| 🟢 | Champiñón marrón (crimini) | 22 | 2.5 | 4.3 | 0.6 | 448 | 6 | 0.1 |

> **Champiñón, crimini y portobello son el mismo hongo.** *Agaricus bisporus*,
> en tres momentos: la cepa blanca, la cepa marrón joven y esa misma cepa
> marrón ya abierta. Los tres dan 22 kcal y se parecen en todo lo demás. La
> góndola los cobra distinto; la comida no los distingue.

> **El shiitake seco es peso en seco.** 296 kcal y 75 g de hidratos por 100 g
> no son un hongo calórico: son un hongo sin agua, la misma situación que el
> arroz crudo. Diez gramos secos se hidratan en unos 45-50 g y ahí valen 30
> kcal. Registrar los gramos secos contra esta entrada, o los húmedos contra
> «Shiitake hervido» — nunca los gramos húmedos contra el seco.

**El maitake es el alimento con más vitamina D de todo el catálogo**: 28 µg por
100 g, por encima del salmón ahumado (17) y de la caballa (16), con una
ingesta recomendada de 15 µg al día. La chantarela y la morilla llegan a 5.
Los hongos fabrican vitamina D con luz ultravioleta, igual que la piel, así
que el número depende de si se secaron al sol: el de cultivo en galpón puede
traer bastante menos que lo que dice esta tabla.

Lo que no son los hongos es una fuente de proteína. Los mejores de la tabla
rondan los 3,5 g por 100 g — un cuarto de lo que da un huevo, un décimo de lo
que da una pechuga. Reemplazan a la carne en el plato por textura y por umami,
no por número.

### Frutas

Ordenadas por **azúcar**, que es el criterio de la categoría: fruta fresca verde, y ámbar arriba de 40 g. Las siete ámbar son todas deshidratadas, y el ámbar no dice «no comas» sino «esto es fruta con el agua sacada»: 100 g de orejones no son una fruta, son cinco.

| | Alimento | kcal | Carb | Azúcar | Fibra | K |
|---|---|---|---|---|---|---|
| 🟡 | Dátil Medjool | 277 | 75.0 | 66.5 | 6.7 | 696 |
| 🟡 | Pasas de uva | 301 | 80.0 | 65.7 | 3.3 | 746 |
| 🟡 | Dátil | 282 | 75.0 | 63.4 | 8.0 | 656 |
| 🟡 | Orejón de damasco | 241 | 62.6 | 53.4 | 7.3 | 1162 |
| 🟡 | Higo seco | 249 | 63.9 | 47.9 | 9.8 | 680 |
| 🟡 | Bayas de goji | 349 | 77.1 | 45.6 | 13.0 | — |
| 🟡 | Orejón de durazno | 239 | 61.3 | 41.7 | 8.2 | 996 |
| 🟢 | Tamarindo | 239 | 62.5 | 38.8 | 5.1 | 628 |
| 🟢 | Ciruela seca | 240 | 63.9 | 38.1 | 7.1 | 732 |
| 🟢 | Yaca | 95 | 23.3 | 19.1 | 1.5 | 448 |
| 🟢 | Plátano macho | 122 | 31.9 | 17.5 | 1.7 | 487 |
| 🟢 | Higo | 74 | 19.2 | 16.3 | 2.9 | 232 |
| 🟢 | Uva americana | 67 | 17.2 | 16.3 | 0.9 | 191 |
| 🟢 | Uva | 69 | 18.1 | 15.5 | 0.9 | 191 |
| 🟢 | Lichi | 66 | 16.5 | 15.2 | 1.3 | 171 |
| 🟢 | Granada | 83 | 18.7 | 13.7 | 4.0 | 236 |
| 🟢 | Mango | 60 | 15.0 | 13.7 | 1.6 | 168 |
| 🟢 | Chirimoya | 75 | 17.7 | 12.9 | 3.0 | 287 |
| 🟢 | Cereza | 63 | 16.0 | 12.8 | 2.1 | 222 |
| 🟢 | Caqui | 70 | 18.6 | 12.5 | 3.6 | 161 |
| 🟢 | Banana | 89 | 22.8 | 12.2 | 2.6 | 358 |
| 🟢 | Maracuyá | 97 | 23.4 | 11.2 | 10.4 | 348 |
| 🟢 | Mandarina | 53 | 13.3 | 10.6 | 1.8 | 166 |
| 🟢 | Manzana | 52 | 13.8 | 10.4 | 2.4 | 107 |
| 🟢 | Manzana pelada | 48 | 12.8 | 10.1 | 1.3 | 90 |
| 🟢 | Arándano azul | 57 | 14.5 | 10.0 | 2.4 | 77 |
| 🟢 | Ciruela | 46 | 11.4 | 9.9 | 1.4 | 157 |
| 🟢 | Ananá | 50 | 13.1 | 9.9 | 1.4 | 109 |
| 🟢 | Pera | 57 | 15.2 | 9.8 | 3.1 | 116 |
| 🟢 | Kumquat | 71 | 15.9 | 9.4 | 6.5 | 186 |
| 🟢 | Naranja | 47 | 11.8 | 9.4 | 2.4 | 181 |
| 🟢 | Damasco | 48 | 11.1 | 9.2 | 2.0 | 259 |
| 🟢 | Clementina | 47 | 12.0 | 9.2 | 1.7 | 177 |
| 🟢 | Kiwi | 61 | 14.7 | 9.0 | 3.0 | 312 |
| 🟢 | Guayaba | 68 | 14.3 | 8.9 | 5.4 | 417 |
| 🟢 | Guinda | 50 | 12.2 | 8.5 | 1.6 | 173 |
| 🟢 | Durazno | 39 | 9.5 | 8.4 | 1.5 | 190 |
| 🟢 | Melón honeydew | 36 | 9.1 | 8.1 | 0.8 | 228 |
| 🟢 | Morera | 43 | 9.8 | 8.1 | 1.7 | 194 |
| 🟢 | Nectarina | 44 | 10.6 | 7.9 | 1.7 | 201 |
| 🟢 | Melón | 34 | 8.2 | 7.9 | 0.9 | 267 |
| 🟢 | Papaya | 43 | 10.8 | 7.8 | 1.7 | 182 |
| 🟢 | Pera asiática | 42 | 10.7 | 7.1 | 3.6 | 121 |
| 🟢 | Pomelo | 32 | 8.1 | 7.0 | 1.1 | 139 |
| 🟢 | Coco | 354 | 15.2 | 6.2 | 9.0 | 356 |
| 🟢 | Sandía | 30 | 7.6 | 6.2 | 0.4 | 112 |
| 🟢 | Frutilla | 32 | 7.7 | 4.9 | 2.0 | 153 |
| 🟢 | Mora | 43 | 9.6 | 4.9 | 5.3 | 162 |
| 🟢 | Frambuesa | 52 | 11.9 | 4.4 | 6.5 | 151 |
| 🟢 | Arándano rojo | 46 | 12.0 | 4.3 | 3.6 | 80 |
| 🟢 | Carambola | 31 | 6.7 | 4.0 | 2.8 | 133 |
| 🟢 | Agua de coco | 19 | 3.7 | 2.6 | 1.1 | 250 |
| 🟢 | Jugo de limón | 22 | 6.9 | 2.5 | 0.3 | 103 |
| 🟢 | Limón | 29 | 9.3 | 2.5 | 2.8 | 138 |
| 🟢 | Lima | 30 | 10.5 | 1.7 | 2.8 | 102 |
| 🟢 | Ruibarbo | 21 | 4.5 | 1.1 | 1.8 | 288 |
| 🟢 | Palta | 160 | 8.5 | 0.7 | 6.7 | 485 |
| 🟢 | Palta Hass | 167 | 8.6 | 0.3 | 6.8 | 507 |
| 🟢 | Acerola | 32 | 7.7 | — | 1.1 | 146 |
| 🟢 | Grosella negra | 63 | 15.4 | — | — | 322 |
| 🟢 | Membrillo | 57 | 15.3 | — | 1.9 | 197 |
| 🟢 | Níspero | 47 | 12.1 | — | 1.7 | 266 |
| 🟢 | Physalis | 53 | 11.2 | — | — | — |
| 🟢 | Pomelo chino | 38 | 9.6 | — | 1.0 | 216 |
| 🟢 | Tuna | 41 | 9.6 | — | 3.6 | 220 |

La fruta entera fresca no tiene techo práctico en este esquema. La fibra que la acompaña es la diferencia con el jugo, que está en Bebidas y sale peor parado justamente por eso.

### Frutos secos y semillas

Ordenados por **proporción de saturada** sobre la grasa total, no por gramos: son todos 50 % grasa o más, así que la cantidad no los separa y la composición sí. Es el mismo criterio que se usa con los aceites.

| | Alimento | kcal | Grasa | Sat | % sat | Prot | Fibra | Na |
|---|---|---|---|---|---|---|---|---|
| 🔴 | Leche de coco | 230 | 23.8 | 21.1 | 94 | 2.3 | 2.2 | 15 |
| 🔴 | Coco rallado | 660 | 64.5 | 57.2 | 94 | 6.9 | 16.3 | 37 |
| 🟢 | Castaña de Brasil | 659 | 67.1 | 16.1 | 25 | 14.3 | 7.5 | 3 |
| 🟢 | Castaña de cajú tostada | 574 | 46.4 | 9.2 | 21 | 15.3 | 3.0 | 16 |
| 🟢 | Castaña | 245 | 2.2 | 0.4 | 20 | 3.2 | 5.1 | 2 |
| 🟢 | Castaña de cajú | 553 | 43.9 | 7.8 | 20 | 18.2 | 3.3 | 12 |
| 🟢 | Semillas de zapallo | 559 | 49.1 | 8.7 | 19 | 30.2 | 6.0 | 7 |
| 🟢 | Macadamia | 718 | 75.8 | 12.1 | 17 | 7.9 | 8.6 | 5 |
| 🟢 | Semillas de sésamo | 573 | 49.7 | 7.0 | 15 | 17.7 | 11.8 | 11 |
| 🟢 | Tahini | 595 | 53.8 | 7.5 | 15 | 17.0 | 9.3 | 115 |
| 🟢 | Pistacho | 560 | 45.3 | 5.9 | 14 | 20.2 | 10.6 | 1 |
| 🟢 | Semillas de chía | 486 | 30.7 | 3.3 | 11 | 16.5 | 34.4 | 16 |
| 🟢 | Nuez | 654 | 65.2 | 6.1 | 10 | 15.2 | 6.7 | 2 |
| 🟢 | Semillas de girasol | 584 | 51.5 | 4.5 | 10 | 20.8 | 8.6 | 9 |
| 🟢 | Semillas de cáñamo | 553 | 48.8 | 4.6 | 10 | 31.6 | 4.0 | 5 |
| 🟢 | Semillas de lino | 534 | 42.2 | 3.7 | 9 | 18.3 | 27.3 | 30 |
| 🟢 | Nuez pecán | 691 | 72.0 | 6.2 | 9 | 9.2 | 9.6 | 0 |
| 🟢 | Piñón | 673 | 68.4 | 4.9 | 8 | 13.7 | 3.7 | 2 |
| 🟢 | Manteca de almendras | 614 | 55.5 | 4.2 | 8 | 21.0 | 10.3 | 7 |
| 🟢 | Almendra tostada | 598 | 52.5 | 4.1 | 8 | 21.0 | 10.9 | 3 |
| 🟢 | Almendra | 579 | 49.9 | 3.8 | 8 | 21.2 | 12.5 | 1 |
| 🟢 | Harina de almendras | 590 | 52.5 | 4.0 | 7.9 | 21.4 | 9.9 | 19 |
| 🟢 | Avellana | 628 | 60.8 | 4.5 | 8 | 15.0 | 9.7 | 0 |
| 🟢 | Nuez negra | 619 | 59.3 | 3.5 | 6 | 24.1 | 6.8 | 2 |

Los dos rojos son de coco, que es el único fruto seco cuya grasa es mayormente saturada (85 %). El resto son insaturados y quedan verdes pese a ser lo más calórico del catálogo: 100 g de nuez son 654 kcal. El semáforo dice **qué** comer, no **cuánto**, y acá esa distinción importa más que en ninguna otra categoría.

### Condimentos y especias

Ordenados por **sodio**. La categoría entera es un falso positivo esperando: se la juzga por 100 g y se usa por cucharaditas. Una cucharadita de sal son 6 g, o sea el 6 % de la fila.

| | Alimento | kcal | Sodio | Azúcar | Fibra |
|---|---|---|---|---|---|
| 🔴 | Sal | 0 | 38758 | 0.0 | 0.0 |
| 🟡 | Chile en polvo | 282 | 2867 | 7.2 | 34.8 |
| 🟡 | Kétchup | 101 | 907 | 21.3 | 0.3 |
| 🟢 | Clavo de olor | 274 | 277 | 2.4 | 33.9 |
| 🟢 | Comino | 375 | 168 | 2.3 | 10.5 |
| 🟢 | Azafrán | 310 | 148 | — | 3.9 |
| 🟢 | Semilla de hinojo | 345 | 88 | — | 39.8 |
| 🟢 | Pimienta de Jamaica | 263 | 77 | — | 21.6 |
| 🟢 | Albahaca seca | 233 | 76 | 1.7 | 37.7 |
| 🟢 | Cebolla en polvo | 341 | 73 | 6.6 | 15.2 |
| 🟢 | Pimentón | 282 | 68 | 10.3 | 34.9 |
| 🟢 | Estragón seco | 295 | 62 | — | 7.4 |
| 🟢 | Eneldo fresco | 43 | 61 | — | 2.1 |
| 🟢 | Ajo en polvo | 331 | 60 | 2.4 | 9.0 |
| 🟢 | Tomillo seco | 276 | 55 | 1.7 | 37.0 |
| 🟢 | Curry en polvo | 325 | 52 | 2.8 | 53.2 |
| 🟢 | Romero seco | 331 | 50 | — | 42.6 |
| 🟢 | Cilantro fresco | 23 | 46 | 0.9 | 2.8 |
| 🟢 | Semilla de cilantro | 298 | 35 | — | 41.9 |
| 🟢 | Menta piperita fresca | 70 | 31 | — | 8.0 |
| 🟢 | Ají molido | 318 | 30 | 10.3 | 27.2 |
| 🟢 | Menta fresca | 44 | 30 | — | 6.8 |
| 🟢 | Cúrcuma | 312 | 27 | 3.2 | 22.7 |
| 🟢 | Jengibre en polvo | 335 | 27 | 3.4 | 14.1 |
| 🟢 | Romero fresco | 131 | 26 | — | 14.1 |
| 🟢 | Orégano seco | 265 | 25 | 4.1 | 42.5 |
| 🟢 | Laurel | 313 | 23 | — | 26.3 |
| 🟢 | Vinagre balsámico | 88 | 23 | 15.0 | — |
| 🟢 | Pimienta negra | 251 | 20 | 0.6 | 25.3 |
| 🟢 | Cardamomo | 311 | 18 | — | 28.0 |
| 🟢 | Anís en grano | 337 | 16 | — | 14.6 |
| 🟢 | Nuez moscada | 525 | 16 | 3.0 | 20.8 |
| 🟢 | Mostaza en polvo | 508 | 13 | 6.8 | 12.2 |
| 🟢 | Salvia molida | 315 | 11 | 1.7 | 40.3 |
| 🟢 | Canela molida | 247 | 10 | 2.2 | 53.1 |
| 🟢 | Extracto de vainilla | 288 | 9 | 12.7 | 0.0 |
| 🟢 | Tomillo fresco | 101 | 9 | — | 14.0 |
| 🟢 | Vinagre de vino tinto | 19 | 8 | 0.0 | 0.0 |
| 🟢 | Pimienta blanca | 296 | 5 | — | 26.2 |
| 🟢 | Vinagre de manzana | 21 | 5 | 0.4 | 0.0 |
| 🟢 | Albahaca fresca | 23 | 4 | 0.3 | 1.6 |
| 🟢 | Vinagre de alcohol | 18 | 2 | 0.0 | 0.0 |

Sirve para lo comparativo, no para el color: entre dos formas de dar sabor, el ajo en polvo aporta 73 mg de sodio por cucharadita y la salsa de soja 335. Esa es la pregunta útil acá, y por eso vale la pena que la tabla exista aunque el semáforo casi no hable.

### Bebidas

Ordenadas por **azúcar**. El criterio tiene una regla extra: arriba de 35 kcal con menos de 3 g de azúcar es ámbar, que es la forma de que el alcohol no pase por la ventanilla del azúcar — la cerveza tiene poca azúcar y calorías igual.

| | Alimento | kcal | Azúcar | Carb | Na |
|---|---|---|---|---|---|
| 🟡 | Jugo de manzana | 46 | 9.6 | 11.3 | 4 |
| 🟡 | Jugo de pomelo | 39 | 9.1 | 9.2 | 1 |
| 🟡 | Jugo de naranja exprimido | 45 | 8.4 | 10.4 | 1 |
| 🟢 | Jugo de tomate | 17 | 2.6 | 3.5 | 253 |
| 🟡 | Vino blanco | 82 | 1.0 | 2.6 | 5 |
| 🟡 | Vino tinto | 85 | 0.6 | 2.6 | 4 |
| 🟢 | Cerveza light | 29 | 0.1 | 1.6 | 4 |
| 🟢 | Agua | 0 | 0.0 | 0.0 | 4 |
| 🟢 | Café | 1 | 0.0 | 0.0 | 2 |
| 🟢 | Café descafeinado | 0 | 0.0 | 0.0 | 2 |
| 🟢 | Café espresso | 9 | 0.0 | 1.7 | 14 |
| 🟡 | Cerveza | 43 | 0.0 | 3.6 | 4 |
| 🟢 | Té negro | 1 | 0.0 | 0.3 | 3 |
| 🟢 | Té verde | 1 | 0.0 | 0.0 | 1 |
| 🟢 | Agua mineral | 0 | — | 0.0 | 0 |

Los jugos son el caso interesante. El de naranja exprimido es la misma fruta que en la tabla de arriba, pero sin la fibra que la acompañaba, y por eso acá pesa el azúcar solo.

### Dulces y azúcares

Ordenados por **azúcar**. Nueve de trece son rojos, y es la única categoría donde eso es el resultado correcto y no un problema del criterio.

| | Alimento | kcal | Azúcar | Grasa | Sat | Fibra |
|---|---|---|---|---|---|---|
| 🔴 | Azúcar | 387 | 99.8 | 0.0 | 0.0 | 0.0 |
| 🔴 | Azúcar impalpable | 389 | 97.8 | 0.0 | 0.0 | 0.0 |
| 🔴 | Azúcar negra | 380 | 97.0 | 0.0 | 0.0 | 0.0 |
| 🔴 | Miel | 304 | 82.1 | 0.0 | 0.0 | 0.2 |
| 🔴 | Jarabe de arce | 260 | 60.5 | 0.1 | 0.0 | 0.0 |
| 🔴 | Jalea | 266 | 51.2 | 0.0 | 0.0 | 1.0 |
| 🔴 | Mermelada | 278 | 48.5 | 0.1 | 0.0 | 1.1 |
| 🔴 | Chocolate 45-59% | 546 | 47.9 | 31.3 | 18.5 | 7.0 |
| 🔴 | Melaza | 265 | 42.0 | 0.1 | 0.0 | 0.0 |
| 🟡 | Chocolate semiamargo 60-69% | 579 | 36.7 | 38.3 | 22.0 | 8.0 |
| 🟡 | Chocolate amargo 70-85% | 598 | 24.0 | 42.6 | 24.5 | 10.9 |
| 🟢 | Cacao en polvo | 228 | 1.8 | 13.7 | 8.1 | 37.0 |
| 🟢 | Gelatina light de durazno | 8 | 0.0 | 0.0 | 0.0 | 0.0 |

Los dos verdes son el cacao en polvo sin azucarar, que está en esta categoría por parentesco y no por composición, y la gelatina light, que no tiene azúcar porque la reemplaza por aspartamo y acesulfame-k — el criterio mira azúcar y ahí no hay nada que marcar. La escala de los chocolates es la información útil: del 70-85 % al 45-59 % el azúcar se duplica.

## 4. El semáforo nutricional

### Qué es y qué no es

**Es** una ayuda para **sustituir**: responde *"dentro de esta categoría,
¿es mejor o peor que sus vecinos?"*. Esa es la comparación que se traduce en
cambiar lo que comés.

**No es** un veredicto de salud sobre el alimento aislado, ni un estándar
validado. Los umbrales son criterio propio, calibrados contra la dispersión
real de este catálogo.

### Por qué no se usó Nutri-Score ni el sistema FSA

Ambos se evaluaron y se descartaron: están diseñados para **productos
envasados**, donde comparás cereal A contra cereal B. Aplicados a alimentos
enteros castigan por densidad energética — frutos secos y aceite de oliva
quedan mal parados, justo los que conviene comer.

### El intento que falló

La primera versión usaba **una sola fórmula para todas las categorías**:

```
penalización = saturada + 0,5·azúcares + 0,3·sodio − 0,5·fibra
```

Resultados: aceite de oliva **peor** que el de girasol, caballa en **rojo**,
almidón de maíz en **verde** y cebolla en **rojo**.

La causa: **el eje que separa un buen aceite no es el que separa un buen
cereal.** Un aceite se juzga por su composición grasa; un cereal por su fibra;
un pescado por su sal. Una fórmula única no puede capturar eso.

### Criterios por categoría

| Categoría | Eje | Umbrales | Por qué ese eje |
|---|---|---|---|
| **Aceites** | % de saturada sobre grasa total | 🟢 ≤20% · 🟡 ≤45% · 🔴 >45%<br>trans >2 g → 🔴 | Todos son ~100 g de grasa; solo la composición los distingue |
| **Carnes** | Saturada g/100 g **+ sodio** | 🟢 ≤3 · 🟡 ≤7 · 🔴 >7<br>Na >900 → 🔴 · Na >400 → 🟡 | El curado separa un corte fresco de un fiambre: el jamón magro pasa la prueba de grasa (1,8 g) con 1203 mg de sodio |
| **Pescados** | **Sodio** | Na >1500 → 🔴 · Na >600 o sat >4 → 🟡 | Solo la caballa pasa los 4 g: la grasa no los separa, la salazón sí |
| **Lácteos** | Saturada **y** azúcar, la peor de las dos | sat: 🟢 ≤2 · 🟡 ≤10<br>azúcar: 🟢 ≤12 · 🟡 ≤25 | Sin el azúcar, el dulce de leche pasaba por la grasa sola |
| **Cereales** | Fibra / carbohidratos | 🟢 ≥0,04 · 🟡 ≥0,02 · 🔴 <0,02 | Sobrevive a la cocción. Arroz integral 0,047 vs blanco 0,016 |
| **Frutas** | Azúcar | 🟡 si >40 g | Solo las desecadas concentran azúcar; la fruta entera no es el problema |
| **Verduras** | — | Siempre 🟢 | No hay diferencias relevantes para estos objetivos |
| **Hongos** | Sodio | 🟢 ≤200 · 🟡 ≤800 · 🔴 >800 | Entre ellos no hay nada que separar: 22-39 kcal y saturada en centésimas. Solo la salmuera del enlatado los distingue (425 mg vs 5 mg) |
| **Legumbres** | Sodio, y % de saturada si la grasa supera 5 g | Na >600 → 🟡<br>sat 🟢 ≤30% · 🟡 ≤50% | El % solo se aplica donde la grasa es real: un poroto tiene 0,5 g de grasa total y su «54 % saturada» es ruido |
| **Frutos secos** | Sodio, y % de saturada si la grasa supera 5 g | Na >300 → 🟡<br>sat 🟢 ≤30% · 🟡 ≤50% | El coco vive en esta categoría y es 94 % saturado, peor que la manteca; todo fruto seco real ronda 6-25 % |
| **Dulces** | Azúcar | 🟢 ≤10 · 🟡 ≤40 · 🔴 >40 | Es el eje, sin vueltas |
| **Condimentos** | Sodio | 🟢 ≤800 · 🟡 ≤3000 · 🔴 >3000 | Aísla la sal del resto de las especias |
| **Bebidas** | Azúcar + alcohol | 🟢 ≤4 · 🟡 ≤10 · 🔴 >10<br>alcohol → 🟡 | El azúcar no ve las calorías del alcohol |

> **Por qué los pescados no miran el colesterol.** El calamar tiene 233 mg de
> colesterol y 0,4 g de saturada; la manteca tiene 215 mg y **50,5 g**. Mismo
> colesterol dietario, impacto sobre el LDL incomparable. El colesterol de la
> dieta tiene un efecto modesto — el que manda es la grasa saturada — y por eso
> las guías retiraron el límite de 300 mg/día. Marcar camarones o calamar en
> rojo sería empujar a evitar alimentos magros y ricos en proteína por un
> número que no predice lo que importa.

### El ajuste por cocción

Casi todos los cortes y pescados tienen hoy su versión cocida, y cocinar
**concentra**: el agua se va y todo lo demás sube por cada 100 g. El lomo de
ternera pasa de 1,96 a 3,30 g de saturada (×1,69) sin haber dejado de ser el
mismo alimento. Sin corregirlo, la versión cocida de un corte magro quedaba
peor que la cruda por el solo hecho de haberse cocinado.

La corrección usa la proteína como medida de cuánta agua se perdió:

```
k = proteínas / 21,5     acotado entre 1 y 1,6
```

(21,5 g es la proteína típica de la carne vacuna cruda.) En carnes se aplica
al límite del verde, y en pescados al umbral de saturada del amarillo.

**Solo se mueve el límite del verde, nunca el del rojo.** Un corte magro
concentra su poca saturada de forma marcada, y para eso está el factor. Pero
un corte graso *suelta* grasa al cocinarse: su saturada casi no sube —el
matambre va de 7,43 a 7,73, apenas ×1,04— y un límite de rojo escalado lo
dejaría pasar. Al subir los dos, el matambre a la parrilla daba amarillo
donde el crudo da rojo. **Cocinar no puede hacer que un corte sea más sano de
lo que es.**

El vínculo crudo→cocido está declarado en los datos (`cooked_of`), no
adivinado por el nombre: los **92 pares** del catálogo coinciden hoy en color.

### Productos de marca

El catálogo es de ingredientes genéricos, y SR Legacy no tiene marcas
argentinas. Pero un producto que se come seguido merece su número real, no el
del pariente estadounidense más cercano: el **Port Salut San Francisco**
declara **15 g de saturada por 100 g**, contra los ~13 g del port salut
genérico de USDA. Sobre una rebanada de 30 g la diferencia es chica; sobre el
consumo de una semana, no.

Una entrada así lleva `label` en lugar de `src`, y se guarda **tal como está
impresa en el paquete** —por porción— para que el commit se pueda cotejar
contra el envase sin hacer cuentas. El script la lleva a 100 g:

```
por 100 g = por porción × (100 / gramos de la porción)
```

Dos consecuencias que conviene tener presentes:

- **El rótulo argentino informa menos nutrientes que USDA.** Solo son
  obligatorios energía, carbohidratos, azúcares, proteínas, grasas totales,
  saturadas, trans, fibra y sodio. No hay colesterol, ni calcio, ni el
  desglose mono/poli. Esas filas quedan **vacías, no en cero** — la app las
  muestra como sin dato.
- **No lleva `fdc`**, así que su clave interna es `ntBase_<id>` en vez de
  `fdcId_<n>`, igual que las entradas aproximadas.

Se marca con `source: "label"` y con la marca en el campo `brand`, que la app
muestra junto al nombre. Hoy es la única del catálogo.

### Dónde vive y cómo se recalibra

El color se **precomputa** en `scripts/build-base-foods.mjs`
(función `trafficLight`) y se commitea dentro de `src/lib/base-foods.json`.
Es deliberado: los criterios quedan **auditables en el diff**, no escondidos
en código de runtime.

Para ajustar un umbral: editar `trafficLight`, correr
`node scripts/build-base-foods.mjs`, revisar el diff del JSON.

Reparto actual: **444 🟢 · 57 🟡 · 66 🔴** sobre 567 alimentos.

---

## 5. Ejercicio

**Fuerza, 2-3 veces por semana** es lo de mayor impacto para hígado graso.
El motor del hígado graso es la resistencia a la insulina, y el músculo es el
principal consumidor de glucosa del cuerpo.

El dato que más motiva: **el ejercicio reduce la grasa hepática incluso sin
bajar de peso.** No dependés de la balanza para que el hígado mejore.

Y como se dijo arriba: **el HDL responde al ejercicio bastante más que a la
dieta.** Es el único factor que lo mueve de forma consistente.

No hace falta gimnasio: peso corporal, bandas o mancuernas. Lo que importa es
la **progresión** — que cueste más con el tiempo.

**Complemento:** agregarle intensidad a la caminata que ya se hace. Cuestas o
tramos rápidos de 1-2 minutos intercalados; más eficiente en tiempo que
caminar más despacio durante más rato.

---

## 6. Prioridades del día a día

1. **Sacar la margarina.** Único ítem con trans industriales en cantidad
   relevante. Reemplazar por oliva o palta.
2. **Reemplazar, no solo restar.** Manteca → aceite de oliva baja el LDL.
   Manteca → pan blanco, no.
3. **Pescado graso 2 veces por semana.** Salmón, sardina, caballa.
   No se reemplaza con chía ni lino.
4. **Un puñado de frutos secos.** Nuez (omega-6 y ALA) o almendra
   (monoinsaturada).
5. **Fibra soluble.** Avena, cebada y legumbres bajan el LDL y sacian.
   Las tres en verde.
6. **Cuidado con el coco.** 91% saturada, más que la manteca.
   No es lo que dice el marketing.
7. **Jugos y bebidas azucaradas primero.** Para el hígado son la palanca
   más grande. Aparecen en ámbar.

---

## 7. Limitaciones conocidas

- **Los datos son de USDA**, con alimentos y variedades de EE.UU. Un corte
  argentino puede diferir del corte equivalente de la tabla.
- **El aceite virgen extra y el refinado figuran igual.** USDA no mide
  polifenoles, que son parte de por qué el virgen extra se considera mejor.
- **`sugars` es azúcar total**, no libre. Por eso las frutas enteras se
  eximen explícitamente en el criterio, y por eso el techo de azúcar libre
  (sección 1) se calcula afuera, clasificando alimento por alimento.
- **No hay café en grano ni capuchino** en SR Legacy. Para espresso, la
  entrada correcta es *Café espresso*: el grano queda casi todo en la
  pastilla y anotarlo por peso sobreestimaría muchísimo.
- **El semáforo compara dentro de la categoría.** Un 🟢 en dulces no
  equivale a un 🟢 en verduras.

---

*Generado a partir del catálogo de 567 ingredientes base. Última revisión de
datos: `node scripts/build-base-foods.mjs`.*
