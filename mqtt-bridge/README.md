# Puente MQTT → NutriTrace

Empuja las lecturas de la balanza publicadas en MQTT hacia
`POST /api/v1/body-measurements` de NutriTrace.

**Por qué este camino y no la carga manual:** el endpoint escribe en las *dos*
tablas — `diary.body_stats` y `wellness_data` con `source='federation'`. La
pantalla de Bienestar lee `wellness_data`, así que lo que entra por acá se ve
tanto en el Diario como en Bienestar. Lo cargado a mano en el Diario sólo llega
a Estadísticas.

Además admite **masa muscular y masa ósea**, que la carga manual no tiene.

## Puesta en marcha

1. `cp .env.example .env` y completar broker + credenciales.
2. **Descubrir** qué publica la balanza:

   ```bash
   docker compose --profile bridge run --rm mqtt-bridge
   ```

   Con `MODE=discover` imprime tópico y payload de todo lo que pasa, sin
   enviar nada. Subite a la balanza y mirá qué aparece.

3. Acotar `MQTT_TOPIC` al tópico de la balanza y, si los nombres de campo no
   se reconocen solos, agregarlos en `MAPEO_EXTRA`.
4. Crear el token en **Ajustes → API tokens** con el scope
   `write:body-measurements`, y ponerlo en `NT_TOKEN`.
5. Probar el mapeo sin escribir: `MODE=run` + `DRY_RUN=1`.
6. Quitar `DRY_RUN` y levantar: `docker compose up -d mqtt-bridge`.

## Campos

Nativos (NutriTrace los dibuja): `weight`, `body_fat`, `muscle_mass`,
`bone_mass`, `body_water`, `lean_body_mass`.

Se guardan pero todavía no se dibujan: `bmi`, `visceral_fat`, `protein`,
`bmr`, `metabolic_age`, `impedance`, `body_score`.

El puente reconoce solo los alias habituales (inglés y español) y busca los
campos a cualquier profundidad del JSON. Valores fuera de los rangos de
cordura del servidor se descartan con un aviso, para que una lectura mala
(peso en gramos, por ejemplo) no ensucie el diario.

## Semántica de escritura

Sobrescribe **solo los campos que manda**. Repetir la misma medición es
idempotente. Varias pesadas el mismo día: gana la última.
