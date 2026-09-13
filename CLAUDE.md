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
