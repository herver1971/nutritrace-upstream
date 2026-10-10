# CLAUDE.md

Guía para Claude Code al trabajar en este directorio.

## Qué es

NutriTrace — registro personal de nutrición, self-hosted, sin cuentas ni
telemetría. Es un proyecto **público** de la organización `traceapps`
(AGPL-3.0), publicado en `ghcr.io/traceapps/nutritrace` y Docker Hub, con
documentación en `traceapps.github.io/docs/nutritrace/`.

A diferencia de `lifttrace` y `cooktrace`, acá el directorio es **el repo de
desarrollo** (tiene `.git`, `src/`, `server/`, `package.json`), no solo el
despliegue.

## Stack

Svelte + Vite en el front, servidor Node en `server/`, Capacitor para la app
Android (`android/`, `capacitor.config.ts`), `mqtt-bridge/` para la
integración con Home Assistant. Nginx al frente (`nginx.conf`).

## Documentación propia — leerla antes de explorar

`ARCHITECTURE.md`, `DEPLOY.md`, `SETUP-LOCAL.md`, `CHANGELOG.md`, `ROADMAP.md`,
`CONTRIBUTING.md`, `PRIVACY.md`. Es un proyecto público y están mantenidos.

## Despliegue local

Corre en **`127.0.0.1:3001`** (nunca `0.0.0.0`; el acceso es por Tailscale).
`docker-compose.override.yml` es el que fija eso sobre el compose publicado.

**`docker compose pull` NO actualiza esta instancia**: corre una imagen
compilada de este árbol (`nutritrace:local-es`), porque el catálogo "Básicos" y
el semáforo (`src/lib/base-foods.*`) son una feature local que upstream no
tiene. Subir de versión es un **merge**, no un pull:

```bash
sqlite3 "file:data/db/nutritrace.db?mode=ro" ".backup 'data/db/antes-AAAA-MM-DD-vXYZ.db'"
docker tag nutritrace:local-es nutritrace:local-es-vVIEJA-vuelta-atras
git fetch upstream --tags      # el rechazo del tag dev-latest es inofensivo
git merge-tree --write-tree --name-only HEAD vX.Y.Z   # ver conflictos sin tocar nada
git checkout -b merge-vX.Y.Z && git merge vX.Y.Z
docker build -t nutritrace:local-es-vXYZ . && docker tag nutritrace:local-es-vXYZ nutritrace:local-es
docker compose up -d nutritrace
```

**El español es el de upstream desde la v1.4.0 (10/10/2026).** La traducción
quedó completa en Weblate el 29/09 y viene en la app (1.849 de 1.869 claves; lo
que falta sale en inglés hasta que se traduzca **en Weblate**, no acá). El
`es.json` del fork ya no se mantiene. Al fusionar, `en.json` y `es.json` no se
fusionan por líneas: se toma el archivo de upstream tal cual y se le agregan
las **21 claves locales** (`foods.sources.base`, `foods.tier.base_categories`,
`foods.tier.only`, `foods.detail.refresh_*` ×8, `foods.stale.*` ×7,
`foods.mealie.mass_note`, `settings_foods_picker.base_foods` y `_desc`) y el
texto cambiado de `settings_foods_picker.default_source_desc` (menciona
Básicos). Con `json.dumps(indent=2, ensure_ascii=False)` más un salto de línea
final el archivo de upstream sale idéntico byte a byte, así que el diff queda
en esas 22 líneas. `src/i18n/index.js` es el de upstream, sin cambios.

**Qué es local y qué no (10/10/2026).** Local: Básicos y el semáforo, la ruta
`/api/v1/wellness` con el scope `write:wellness`, el `mqtt-bridge/`, la
referencia en masa de las recetas de Mealie y el plegado de tildes de
`_fuzzyMatch` en `Foods.svelte` (upstream pliega tildes en el resto, ahí no).
Ya **no** son locales, porque upstream los arregló en la 1.4.0 y se tomó su
versión: `altUnitGrams()` (#237), la clave del borrador del editor (#260), la
adopción de uuid de `ensureUuids()` (la reemplaza el emparejamiento por
"gemelo" de `mergeEntries`, #239) y la búsqueda sin tildes de `MealEditor`.

**Los tests del servidor no corren en el host** (`server/node_modules` no
existe y `better-sqlite3` no está compilado para el Node del sistema): `npm
test` en el host da 6 fallas por dependencias y saltea ~70. La corrida completa
es en un contenedor `node:20-slim` sobre una copia del árbol (`git
checkout-index -a --prefix=...`), con `npm install` en la raíz y en `server/`.
Antes de levantar, conviene ensayar el arranque de la imagen nueva sobre una
copia de la base (`docker run --network none`, sin puerto) y comparar el diario.

**Trampa al fusionar** (19/09/2026, v1.3.0): upstream pasó algunos archivos de
CRLF a LF, y eso hace que el merge marque el archivo entero en conflicto aunque
los cambios reales sean pocos. Se detecta con `git diff -w` (Foods.svelte daba
3.846 líneas normal y 324 ignorando espacios). La salida es normalizar los
finales de línea de las tres versiones y fusionar con `git merge-file`: bajó de
un conflicto de archivo entero a 7 bloques reales. Los `.json` de traducción
conviene fusionarlos **por clave**, no por texto.

**Trampa al fusionar (20/09/2026, v1.3.1): upstream commiteó un symlink
`node_modules`** apuntando a `/home/papa/Documents/claude_code/nutritrace/`
(su máquina). Su `.gitignore` usa `node_modules/` con barra, que tapa el
directorio pero no un enlace con ese nombre. Al fusionar, el enlace roto
reemplaza el `node_modules` real y deja el árbol sin dependencias. **Nuestro
`.gitignore` ya lo tapa** (sin barra), pero si upstream lo vuelve a mover,
revisar `git ls-files -s node_modules` antes de construir.

**Trampa al fusionar (10/10/2026, v1.4.0): finales de línea mixtos.**
`FoodEditor.svelte` y `MealEditor.svelte` son CRLF con algunas líneas LF
sueltas; después de fusionar en LF hay que devolverle a cada línea el final que
tiene en upstream (no un `sed` parejo), o `git diff` contra el tag muestra
cambios que no son nuestros. `api.js`, `settings.js` y `main.js` ya son LF en
upstream. Control: `git diff --numstat vX.Y.Z -- archivo` tiene que dar lo mismo
con y sin `-w`.

Antes de dar por buena una actualización, verificar: los scripts de
`Hernan/Salud/` que leen la base (`nutritrace_mqtt.py`, `nutricion_dia.py`,
`garmin_calories_out.py`, `cuerpo_estadisticas.py`, `azucar_libre.py`) y
`Hernan/Home-Assistant/comida_estadisticas.py`, todos sin `--publicar`,
`--enviar` ni `--importar`; `python3 ~/Proyectos/cobertura/motor.py`; el
`mqtt-bridge` y el timer `salud-garmin-gasto` (escriben por
`/api/v1/wellness`, que es una ruta **nuestra**); `despensa-sync.service`; el
conector de CookTrace; que el chunk `base-foods-*.js` esté en `dist/assets` y
el `es-*.js` traiga "Básicos"; y que el diario tenga las mismas filas e ítems
que el backup.

**LiftTrace se federa con esta app** entrando a la red Docker `nutritrace_default`
y hablándole a `http://nutritrace:3001` por nombre de servicio. Si cambia el
nombre de la red, del servicio o el puerto interno, **se rompe LiftTrace** —
revisar `../lifttrace/docker-compose.override.yml` antes de tocarlos.

## Contexto de salud

NutriTrace es el centro del ecosistema de salud (balanza BLE, Mi Band, Health
Connect, Home Assistant). El mapa completo está en
`~/Documentos/Hernan/Salud/ARQUITECTURA-SALUD.md`. Leerlo antes de cambiar
integraciones.

## Cómo lo usa Hernán

- **El diario** está en `data/db/nutritrace.db`, tabla `diary`: Hernán es
  `user_id=1`, un registro por día con los `items` en JSON. Es la forma rápida de ver
  qué comió.
- **Consultas de comida del día a día** ("¿qué almuerzo?", "¿cierra?", "cargalo"):
  el perfil, las metas, sus costumbres y cómo se carga están en `CLAUDE.local.md`
  (personal, fuera de git), y los datos se leen con
  `~/Documentos/Hernan/Salud/nutricion_dia.py`.
- **Para el menú semanal automático de Mealie, leer `../meali/CLAUDE.md`.** Esas
  reglas de franjas (`plan-*`) siguen tal cual para `sortear.py`.
- **Para recomendaciones puntuales en el chat (qué comer, qué compensar), esas
  reglas de franjas ya no aplican** (decidido 14/09/2026): se fijaron para casi
  nada de ejercicio, y ahora hay fuerza con LiftTrace (programa asignado el
  27/08/2026; sesiones hechas el 09/09, 12/09 y 14/09) más caminatas largas.
  Usar en cambio calorías/macros reales contra las metas de `user_settings.goals` (proteína, fibra, grasa, carbohidratos) y el gasto por
  actividad — ver [[compensar-comidas-por-macros]] en memoria.
- **Datos que entran solos**, sin que Hernán cargue nada: la balanza por el
  `mqtt-bridge`; pasos, calorías activas, sueño y pulso en reposo desde HA a
  `/api/v1/wellness`; y los entrenamientos de LiftTrace por federación.
  `/api/v1/workouts` **no aparece en el diario** (se ve en Ajustes → Bienestar →
  Historial de entrenamientos, y solo con `workoutsEnabled`); `/api/v1/activity` sí.
- **La app Android quedó pausada** el 24/08/2026: una versión anterior a la 1.2.0
  duplicaba el diario en cada sincronización. Hernán carga desde la web. Confirmar
  con él si ya se actualizó antes de recomendar la app.
- En HA, los gráficos de comida leen `comida:*` (`Home-Assistant/comida_estadisticas.py`)
  y no los sensores `sensor.nutritrace_*`: Hernán corrige el diario al día siguiente, y
  el historial del sensor no se entera.
