# Nutrición y semáforo nutricional

Documento de referencia del catálogo de ingredientes base de esta instancia de
NutriTrace. Reúne el razonamiento nutricional detrás del semáforo, los datos
que lo sustentan y los criterios exactos con que se calcula.

Los valores salen de **USDA FoodData Central (SR Legacy)** y son **por 100 g**.
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

Ordenadas por grasa saturada. El sodio explica por qué las curadas
(jamón, panceta) quedan en rojo aunque su grasa sea baja.

| | Alimento | kcal | Grasa | Sat | Insat | Prot | Na (mg) |
|---|---|---|---|---|---|---|---|
| 🟢 | Pechuga de pavo cruda | 114 | 1.5 | 0.3 | 0.5 | 23.7 | 113 |
| 🟢 | Pechuga de pollo cruda (sin piel) | 120 | 2.6 | 0.6 | 1.1 | 22.5 | 45 |
| 🟢 | Solomillo de cerdo crudo (magro) | 109 | 2.2 | 0.7 | 1.2 | 20.9 | 53 |
| 🟢 | Pechuga de pollo al horno (sin piel) | 165 | 3.6 | 1.0 | 2.0 | 31.0 | 74 |
| 🟢 | Pata de pollo cruda (sin piel) | 120 | 4.2 | 1.1 | 2.4 | 19.2 | 96 |
| 🟢 | Nalga cruda (magra) | 121 | 2.9 | 1.1 | 1.5 | 23.6 | 54 |
| 🟢 | Hígado de ternera crudo | 135 | 3.6 | 1.2 | 0.9 | 20.4 | 69 |
| 🟢 | Nalga al horno (magra) | 162 | 3.8 | 1.4 | 1.9 | 30.1 | 67 |
| 🟢 | Hígado de pollo crudo | 119 | 4.8 | 1.6 | 2.6 | 16.9 | 71 |
| 🟢 | Conejo crudo | 136 | 5.5 | 1.7 | 2.6 | 20.1 | 41 |
| 🔴 | Jamón cocido magro | 145 | 5.5 | 1.8 | 3.2 | 20.9 | 1203 |
| 🟢 | Lomo de ternera crudo (magro) | 139 | 5.7 | 2.0 | 2.5 | 21.9 | 44 |
| 🟢 | Pavo picado | 148 | 7.7 | 2.0 | 4.8 | 19.7 | 58 |
| 🟢 | Vacío crudo (magro) | 141 | 5.5 | 2.1 | 2.1 | 21.6 | 55 |
| 🟢 | Carne picada magra (95/5) | 137 | 5.0 | 2.2 | 2.3 | 21.4 | 66 |
| 🟢 | Pechuga de pollo al horno (con piel) | 197 | 7.8 | 2.2 | 4.7 | 29.8 | 71 |
| 🟢 | Pollo picado | 143 | 8.1 | 2.3 | 5.1 | 17.4 | 60 |
| 🟢 | Muslo de pollo al horno (sin piel) | 179 | 8.2 | 2.3 | 5.1 | 24.8 | 106 |
| 🟢 | Pato sin piel crudo | 135 | 6.0 | 2.3 | 2.3 | 18.3 | 74 |
| 🟢 | Bife angosto crudo (magro) | 143 | 5.7 | 2.3 | 3.1 | 23.1 | 46 |
| 🟢 | Pecho de ternera crudo (magro) | 157 | 7.4 | 2.6 | 3.7 | 20.7 | 79 |
| 🟢 | Pechuga de pollo con piel | 172 | 9.3 | 2.7 | 5.8 | 20.9 | 63 |
| 🟡 | Peceto crudo (con grasa) | 166 | 8.2 | 3.2 | 3.9 | 21.5 | 58 |
| 🟡 | Lomo de ternera a la parrilla (magro) | 198 | 8.3 | 3.3 | 4.3 | 30.7 | 59 |
| 🟡 | Carne picada (90/10) | 176 | 10.0 | 3.9 | 4.5 | 20.0 | 66 |
| 🟡 | Muslo de pollo al horno (con piel) | 232 | 14.7 | 4.1 | 9.3 | 23.3 | 102 |
| 🟡 | Chuleta de cerdo cruda (con grasa) | 198 | 12.6 | 4.4 | 7.0 | 19.7 | 50 |
| 🟡 | Muslo de pollo con piel crudo | 221 | 16.6 | 4.5 | 10.4 | 16.5 | 81 |
| 🟡 | Ternera picada | 197 | 13.1 | 5.1 | 6.9 | 18.6 | 103 |
| 🔴 | Entraña cruda (con grasa) | 238 | 18.4 | 7.4 | 9.0 | 17.7 | 65 |
| 🔴 | Carne picada común (80/20) | 254 | 20.0 | 7.6 | 9.4 | 17.2 | 66 |
| 🔴 | Carne de cerdo picada | 263 | 21.2 | 7.9 | 11.3 | 16.9 | 56 |
| 🔴 | Ojo de bife crudo (con grasa) | 241 | 18.4 | 8.1 | 9.5 | 18.7 | 51 |
| 🔴 | Cordero picado | 282 | 23.4 | 10.2 | 11.4 | 16.6 | 59 |
| 🔴 | Panceta cocida | 548 | 43.3 | 14.2 | 23.9 | 35.7 | 2193 |

### Pescados y mariscos

**Ninguno supera los 3,5 g de saturada.** La grasa no los diferencia:
la salazón y el ahumado, sí.

| | Alimento | kcal | Grasa | Sat | Insat | Prot | Na (mg) |
|---|---|---|---|---|---|---|---|
| 🟢 | Camarón cocido | 99 | 0.3 | 0.1 | 0.1 | 24.0 | 111 |
| 🟢 | Camarón crudo | 85 | 0.5 | 0.1 | 0.2 | 20.1 | 119 |
| 🟢 | Vieira cruda | 69 | 0.5 | 0.1 | 0.2 | 12.1 | 392 |
| 🟢 | Bacalao crudo | 82 | 0.7 | 0.1 | 0.3 | 17.8 | 54 |
| 🟢 | Abadejo crudo | 76 | 0.8 | 0.1 | 0.4 | 17.2 | 159 |
| 🟢 | Atún crudo | 109 | 0.5 | 0.2 | 0.3 | 24.4 | 45 |
| 🟢 | Langosta cruda | 77 | 0.8 | 0.2 | 0.5 | 16.5 | 423 |
| 🟡 | Almeja cruda | 86 | 1.0 | 0.2 | 0.3 | 14.7 | 601 |
| 🟢 | Surimi | 99 | 0.9 | 0.2 | 0.6 | 15.2 | 143 |
| 🟢 | Cangrejo crudo | 87 | 1.1 | 0.2 | 0.6 | 18.1 | 293 |
| 🟢 | Pulpo crudo | 82 | 1.0 | 0.2 | 0.4 | 14.9 | 230 |
| 🟢 | Mero crudo | 92 | 1.0 | 0.2 | 0.5 | 19.4 | 53 |
| 🟢 | Merluza cruda | 90 | 1.3 | 0.2 | 0.7 | 18.3 | 72 |
| 🟢 | Pargo crudo | 100 | 1.3 | 0.3 | 0.7 | 20.5 | 64 |
| 🟢 | Halibut crudo | 91 | 1.3 | 0.3 | 0.8 | 18.6 | 68 |
| 🟢 | Calamar crudo | 92 | 1.4 | 0.4 | 0.6 | 15.6 | 44 |
| 🟢 | Mejillón crudo | 86 | 2.2 | 0.4 | 1.1 | 11.9 | 286 |
| 🟢 | Lenguado crudo | 70 | 1.9 | 0.4 | 0.9 | 12.4 | 296 |
| 🔴 | Bacalao salado | 290 | 2.4 | 0.5 | 1.1 | 62.8 | 7027 |
| 🟢 | Ostra cruda | 81 | 2.3 | 0.5 | 1.3 | 9.4 | 106 |
| 🟢 | Lubina cruda | 97 | 2.0 | 0.5 | 1.2 | 18.4 | 68 |
| 🟢 | Tilapia cruda | 96 | 1.7 | 0.6 | 0.9 | 20.1 | 52 |
| 🟡 | Salmón ahumado | 117 | 4.3 | 0.9 | 3.0 | 18.3 | 672 |
| 🟢 | Corvina cruda | 104 | 3.2 | 1.1 | 1.6 | 17.8 | 56 |
| 🟢 | Trucha cruda | 148 | 6.6 | 1.1 | 4.8 | 20.8 | 52 |
| 🟢 | Anchoa cruda | 131 | 4.8 | 1.3 | 2.8 | 20.4 | 104 |
| 🟢 | Sardina en aceite | 208 | 11.4 | 1.5 | 9.0 | 24.6 | 307 |
| 🟢 | Pez espada crudo | 144 | 6.7 | 1.6 | 4.2 | 19.7 | 81 |
| 🟢 | Arenque crudo | 158 | 9.0 | 2.0 | 5.9 | 18.0 | 90 |
| 🟢 | Salmón cocido | 206 | 12.3 | 2.4 | 8.7 | 22.1 | 61 |
| 🟢 | Salmón crudo | 208 | 13.4 | 3.0 | 7.7 | 20.4 | 59 |
| 🟢 | Caballa cruda | 205 | 13.9 | 3.3 | 8.8 | 18.6 | 90 |

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
| 🟢 | Pan de centeno | 259 | 48.3 | 5.8 | 0.120 |
| 🟢 | Amaranto cocido | 102 | 18.7 | 2.1 | 0.112 |
| 🟢 | Quinoa cruda | 368 | 64.2 | 7.0 | 0.109 |
| 🟢 | Amaranto crudo | 371 | 65.3 | 6.7 | 0.103 |
| 🟢 | Harina de maíz blanca | 361 | 76.8 | 7.3 | 0.095 |
| 🟢 | Harina de maíz | 362 | 76.9 | 7.3 | 0.095 |
| 🟢 | Sorgo | 329 | 72.1 | 6.7 | 0.093 |
| 🟢 | Arroz salvaje cocido | 101 | 21.3 | 1.8 | 0.084 |
| 🟢 | Arroz integral cocido | 123 | 25.6 | 1.6 | 0.063 |
| 🟢 | Cuscús cocido | 112 | 23.2 | 1.4 | 0.060 |
| 🟢 | Harina de arroz integral | 363 | 76.5 | 4.6 | 0.060 |
| 🟢 | Mijo cocido | 119 | 23.7 | 1.3 | 0.055 |
| 🟢 | Pan blanco de molde | 266 | 49.4 | 2.7 | 0.055 |
| 🟢 | Arroz glutinoso | 97 | 21.1 | 1.0 | 0.047 |
| 🟢 | Arroz integral crudo | 367 | 76.3 | 3.6 | 0.047 |
| 🟢 | Pan italiano | 259 | 48.1 | 2.1 | 0.044 |
| 🟢 | Gluten de trigo | 370 | 13.8 | 0.6 | 0.044 |
| 🟢 | Pan francés (de panadería) | 272 | 51.9 | 2.2 | 0.042 |
| 🟢 | Fideos de arroz cocidos | 108 | 24.0 | 1.0 | 0.042 |
| 🟡 | Pan pita | 275 | 55.7 | 2.2 | 0.039 |
| 🔴 | Arroz blanco crudo | 365 | 80.0 | 1.3 | 0.016 |
| 🔴 | Arroz blanco cocido | 130 | 28.2 | 0.4 | 0.014 |
| 🔴 | Tapioca | 358 | 88.7 | 0.9 | 0.010 |
| 🔴 | Almidón de maíz | 381 | 91.3 | 0.9 | 0.010 |
| 🔴 | Fideos soba cocidos | 99 | 21.4 | 0.0 | 0.000 |
| 🔴 | Pasta casera al huevo | 130 | 23.5 | 0.0 | 0.000 |
| 🔴 | Pasta fresca cocida | 131 | 24.9 | 0.0 | 0.000 |

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
| **Pescados** | **Sodio** | Na >1500 → 🔴 · Na >600 o sat >4 → 🟡 | Ninguno pasa 3,5 g de saturada: la grasa no los separa, la salazón sí |
| **Lácteos** | Saturada **y** azúcar, la peor de las dos | sat: 🟢 ≤2 · 🟡 ≤10<br>azúcar: 🟢 ≤12 · 🟡 ≤25 | Sin el azúcar, el dulce de leche pasaba por la grasa sola |
| **Cereales** | Fibra / carbohidratos | 🟢 ≥0,04 · 🟡 ≥0,02 · 🔴 <0,02 | Sobrevive a la cocción. Arroz integral 0,047 vs blanco 0,016 |
| **Frutas** | Azúcar | 🟡 si >40 g | Solo las desecadas concentran azúcar; la fruta entera no es el problema |
| **Verduras** | — | Siempre 🟢 | No hay diferencias relevantes para estos objetivos |
| **Legumbres** | Sodio | 🟡 si >600 | Distingue el grano del miso y la salsa de soja |
| **Frutos secos** | Sodio | 🟡 si >300 | Distingue el natural del salado |
| **Dulces** | Azúcar | 🟢 ≤10 · 🟡 ≤40 · 🔴 >40 | Es el eje, sin vueltas |
| **Condimentos** | Sodio | 🟢 ≤800 · 🟡 ≤3000 · 🔴 >3000 | Aísla la sal del resto de las especias |
| **Bebidas** | Azúcar + alcohol | 🟢 ≤4 · 🟡 ≤10 · 🔴 >10<br>alcohol → 🟡 | El azúcar no ve las calorías del alcohol |

### Dónde vive y cómo se recalibra

El color se **precomputa** en `scripts/build-base-foods.mjs`
(función `trafficLight`) y se commitea dentro de `src/lib/base-foods.json`.
Es deliberado: los criterios quedan **auditables en el diff**, no escondidos
en código de runtime.

Para ajustar un umbral: editar `trafficLight`, correr
`node scripts/build-base-foods.mjs`, revisar el diff del JSON.

Reparto actual: **359 🟢 · 42 🟡 · 54 🔴** sobre 455 alimentos.

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
  eximen explícitamente en el criterio.
- **No hay café en grano ni capuchino** en SR Legacy. Para espresso, la
  entrada correcta es *Café espresso*: el grano queda casi todo en la
  pastilla y anotarlo por peso sobreestimaría muchísimo.
- **El semáforo compara dentro de la categoría.** Un 🟢 en dulces no
  equivale a un 🟢 en verduras.

---

*Generado a partir del catálogo de 455 ingredientes base. Última revisión de
datos: `node scripts/build-base-foods.mjs`.*
