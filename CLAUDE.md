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
- **Antes de proponer un menú, leer `../meali/CLAUDE.md`.** Las reglas de la dieta
  de la nutricionista viven en Mealie, no acá. En corto: el almuerzo lleva almidón con
  vegetales crudos y cocidos, o un plato compuesto de verdura; la comida con carne va
  solo con vegetales y una taza de sopa, **nunca con almidón**; pizza o empanadas una
  vez por semana, compartiendo el cupo.
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
