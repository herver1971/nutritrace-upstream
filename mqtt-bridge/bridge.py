#!/usr/bin/env python3
"""
Puente MQTT → NutriTrace.

Escucha las lecturas de la balanza en MQTT y las empuja a
POST /api/v1/body-measurements, que escribe tanto en `diary.body_stats`
como en `wellness_data` (source='federation'). Por eso los datos que entran
por acá SÍ aparecen en Bienestar, a diferencia de la carga manual del Diario.

Dos modos:

  MODE=discover   Se suscribe y muestra tópicos y payloads sin enviar nada.
                  Sirve para descubrir qué publica la balanza.
  MODE=run        Mapea cada lectura y la envía a NutriTrace (por defecto).

Configuración por variables de entorno; ver .env.example.
"""
import json, os, re, sys, threading, time, logging
from datetime import datetime, timezone

import paho.mqtt.client as mqtt
import requests

log = logging.getLogger("bridge")

MQTT_HOST  = os.environ.get("MQTT_HOST", "127.0.0.1")
MQTT_PORT  = int(os.environ.get("MQTT_PORT", "1883"))
MQTT_USER  = os.environ.get("MQTT_USER") or None
MQTT_PASS  = os.environ.get("MQTT_PASS") or None
MQTT_TOPIC = os.environ.get("MQTT_TOPIC", "#")

NT_URL   = os.environ.get("NT_URL", "http://127.0.0.1:3001").rstrip("/")
NT_TOKEN = os.environ.get("NT_TOKEN", "")
SOURCE   = os.environ.get("SOURCE", "mqtt-balanza")

# ── Home Assistant (opcional) ──────────────────────────────────────────────
# Segunda pata del puente, independiente de MQTT: consulta sensores de HA cada
# HA_POLL_SEC y empuja los agregados diarios (pasos, calorias activas, sueño)
# a POST /api/v1/wellness. Existe porque la sincronizacion de Health Connect
# vive en la app Android y se corta si la app no se usa, mientras que HA ya
# tiene los mismos numeros por otra via.
#
# HA_METRICS es un JSON {metrica_de_nutritrace: entity_id}. No hay mapa por
# defecto a proposito: los entity_id son de cada casa.
HA_URL    = os.environ.get("HA_URL", "").rstrip("/")
HA_TOKEN  = os.environ.get("HA_TOKEN", "")
HA_SOURCE = os.environ.get("HA_SOURCE", "home-assistant")
HA_POLL_SEC = int(os.environ.get("HA_POLL_SEC", "900"))
try:
    HA_METRICS = json.loads(os.environ.get("HA_METRICS", "{}"))
except json.JSONDecodeError:
    HA_METRICS = {}
MODE     = os.environ.get("MODE", "run").lower()
DRY_RUN  = os.environ.get("DRY_RUN", "").lower() in ("1", "true", "yes")

# Campos que acepta el endpoint. Los seis primeros son los nativos; el resto
# se guardan igual aunque NutriTrace todavía no los dibuje.
CAMPOS = ["weight", "body_fat", "muscle_mass", "bone_mass", "body_water",
          "lean_body_mass", "bmi", "visceral_fat", "protein", "bmr",
          "metabolic_age", "impedance", "body_score"]

# Rangos de cordura del propio servidor (body-measurements.js). Se replican acá
# para descartar una lectura mala antes de gastar una request.
RANGOS = {
    "weight": (10, 500), "body_fat": (1, 80), "muscle_mass": (5, 200),
    "bone_mass": (0.5, 20), "body_water": (1, 90), "lean_body_mass": (10, 300),
    "bmi": (5, 100), "visceral_fat": (0, 100), "protein": (1, 60),
    "bmr": (400, 5000), "metabolic_age": (5, 120), "impedance": (50, 2000),
    "body_score": (0, 100),
}

# Alias habituales de las balanzas BLE (Xiaomi/Mi Body, Renpho, ESPHome,
# Gadgetbridge…) hacia los nombres que espera NutriTrace. Se amplía con
# MAPEO_EXTRA, un JSON {"clave_del_dispositivo": "campo_de_nutritrace"}.
ALIAS = {
    "weight": "weight", "peso": "weight", "weight_kg": "weight",
    "body_fat": "body_fat", "fat_percentage": "body_fat", "fat_pct": "body_fat",
    "bodyfat": "body_fat", "grasa": "body_fat", "body_fat_pct": "body_fat",
    "muscle": "muscle_mass", "muscle_mass": "muscle_mass", "musculo": "muscle_mass",
    "muscle_mass_kg": "muscle_mass",
    "bone": "bone_mass", "bone_mass": "bone_mass", "hueso": "bone_mass",
    "body_water": "body_water", "agua": "body_water", "water": "body_water",
    "water_percentage": "body_water", "body_water_pct": "body_water",
    "lean": "lean_body_mass", "lean_body_mass": "lean_body_mass",
    "lbm": "lean_body_mass", "masa_magra": "lean_body_mass",
    "bmi": "bmi", "imc": "bmi",
    "visceral": "visceral_fat", "visceral_fat": "visceral_fat",
    "protein": "protein", "proteina": "protein", "protein_pct": "protein",
    "bmr": "bmr", "basal_metabolism": "bmr", "metabolic_rate": "bmr",
    "metabolic_age": "metabolic_age", "edad_metabolica": "metabolic_age",
    "impedance": "impedance", "impedancia": "impedance",
    "body_score": "body_score",
}
ALIAS.update({
    "weight_kg": "weight", "fat_percentage": "body_fat", "bone_mass": "bone_mass",
    "muscle_mass": "muscle_mass", "water_percentage": "body_water",
    "visceral_fat": "visceral_fat", "basal_metabolism": "bmr",
})
ALIAS.update({k.lower(): v for k, v in
              json.loads(os.environ.get("MAPEO_EXTRA", "{}")).items()})

TS_KEYS = ("measured_at", "measuredAt", "timestamp", "time", "date", "fecha", "ts")


def _norm(clave):
    """Normaliza el nombre de un campo: camelCase y espacios → snake_case.

    Sin el corte de camelCase, `weightKg` colapsa a `weightkg` y no encuentra
    su alias; las balanzas Xiaomi y Gadgetbridge publican así.
    """
    s = re.sub(r"(?<=[a-z0-9])(?=[A-Z])", "_", str(clave).strip())
    return re.sub(r"[\s\-]+", "_", s.lower())


def _plano(obj, prefijo=""):
    """Aplana un JSON anidado para encontrar campos a cualquier profundidad."""
    salida = {}
    if isinstance(obj, dict):
        for k, v in obj.items():
            salida.update(_plano(v, f"{prefijo}_{k}" if prefijo else str(k)))
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            salida.update(_plano(v, f"{prefijo}_{i}"))
    else:
        salida[prefijo] = obj
    return salida


def _marca_temporal(plano):
    """Saca la hora de la medición del payload; si no viene, usa la de ahora."""
    for k, v in plano.items():
        if _norm(k).split("_")[-1] in ("at", "timestamp", "time", "date", "fecha", "ts") \
           or _norm(k) in TS_KEYS:
            if isinstance(v, (int, float)):
                # epoch en segundos o milisegundos
                seg = v / 1000 if v > 1e11 else v
                try:
                    return datetime.fromtimestamp(seg, timezone.utc).isoformat()
                except (ValueError, OSError):
                    continue
            if isinstance(v, str) and re.search(r"\d{4}-\d{2}-\d{2}", v):
                return v
    return datetime.now(timezone.utc).isoformat()


def _valores_openscale(payload):
    """Rescata las metricas de `values[]`, el formato que publica openScale.

    `values` es una lista de objetos {<nombre>, value, unit, ...}. Aplanarla con
    `_plano()` da `values_8_name = "BONE"` y `values_8_value = 3.1781251`: el
    NOMBRE de la metrica queda del lado del valor, no de la clave, asi que el
    mapeo por nombre no lo encuentra nunca y `values[]` se ignoraba entero.
    Hay que reconstruir {"BONE": 3.1781251} antes de aplanar.

    Importa por dos razones:

    1. BMI, TDEE, grasa visceral, proteina e impedancia SOLO viven ahi.
    2. openScale publica varias metricas dos veces con significados distintos
       -- arriba en porcentaje, en `values[]` en su unidad real:

           nivel superior          values[]
           bone = 3.3648758  (%)   BONE = 3.1781251 kg
           lbm  = 66.88165   (%)   LBM  = 63.16972  kg

       Los dos caen dentro de los rangos de cordura, asi que tomar el de arriba
       no da ningun error: guarda un porcentaje como si fueran kilos y listo.
       Por eso `construir()` procesa esto PRIMERO: el primero que llega gana.
    """
    if not isinstance(payload, dict):
        return {}
    salida = {}
    for v in payload.get("values", []):
        clave = _clave_metrica(v)
        if clave is not None and "value" in v:
            salida[clave] = v["value"]
    return salida


def _clave_metrica(v):
    """El nombre de la metrica dentro de una entrada de `values[]`.

    openScaleSync la publico como `key` hasta 2026-09-06 y como `name` desde
    el 07-09; `identity` ("builtin.bone") viene en las dos. Aceptar los tres
    evita que un renombre del publicador vuelva a vaciar `values[]` en
    silencio: sin esa lista se pierden BMI, TDEE, grasa visceral, proteina e
    impedancia, y muscle/bone/lbm se guardan en PORCENTAJE como si fueran kg
    (ver el docstring de _valores_openscale). Paso en produccion del 07 al
    09-09-2026: la masa muscular salto de 59,6 a 65,9 "kg" sin que nada fallara.
    """
    if not isinstance(v, dict):
        return None
    for campo in ("key", "name"):
        if isinstance(v.get(campo), str) and v[campo].strip():
            return v[campo].strip()
    ident = v.get("identity")
    if isinstance(ident, str) and ident.strip():
        return ident.strip().rsplit(".", 1)[-1].upper()
    return None


def _unidades(payload):
    """{clave normalizada: unidad} a partir de `values[]`, si el payload lo trae."""
    if not isinstance(payload, dict):
        return {}
    salida = {}
    for v in payload.get("values", []):
        clave = _clave_metrica(v)
        if clave is not None:
            salida[_norm(clave)] = v.get("unit")
    return salida


def construir(payload):
    """payload (dict o número) → cuerpo listo para POST, o None si no hay nada útil."""
    if isinstance(payload, (int, float)):
        payload = {"weight": payload}
    if not isinstance(payload, dict):
        return None

    # `values[]` primero: es la fuente con unidades reales. Ver _valores_openscale.
    directos = _valores_openscale(payload)
    resto = {k: v for k, v in payload.items() if k != "values"} if directos else payload
    plano = dict(directos)
    plano.update(_plano(resto))

    cuerpo, descartados = {}, []
    for clave, valor in plano.items():
        # El alias se busca por el segmento final: "scale_body_fat" → "body_fat".
        n = _norm(clave)
        destino = ALIAS.get(n)
        if destino is None:
            for corte in range(1, n.count("_") + 1):
                destino = ALIAS.get(n.split("_", corte)[-1])
                if destino:
                    break
        if not destino or destino in cuerpo:
            continue
        try:
            num = float(valor)
        except (TypeError, ValueError):
            continue
        lo, hi = RANGOS.get(destino, (float("-inf"), float("inf")))
        if not (lo <= num <= hi):
            descartados.append(f"{destino}={num} fuera de rango [{lo}..{hi}]")
            continue
        cuerpo[destino] = num

    # openScale mide musculo, hueso y masa magra en PORCENTAJE arriba (unit "%"
    # en values[]), pero NutriTrace los guarda en kg. Sin convertir, un 63,5 %
    # entra como "63,5 kg" y pasa el rango [5..200] sin que nada avise. Se
    # convierte con el peso de la misma pesada.
    unidades = _unidades(payload)
    for campo, unidad_key in (("muscle_mass", "muscle"),
                              ("bone_mass", "bone"),
                              ("lean_body_mass", "lbm")):
        if unidades.get(unidad_key) != "%" or campo not in cuerpo:
            continue
        if "weight" not in cuerpo:
            # Sin peso no hay forma de pasarlo a kg; mandar el % seria mentir.
            descartados.append(f"{campo} en % y sin peso para convertir")
            del cuerpo[campo]
            continue
        kg = round(cuerpo[campo] * cuerpo["weight"] / 100, 3)
        lo, hi = RANGOS[campo]
        if lo <= kg <= hi:
            log.info("%s %.2f %% x %.2f kg = %.2f kg", campo,
                     cuerpo[campo], cuerpo["weight"], kg)
            cuerpo[campo] = kg
        else:
            descartados.append(f"{campo}={kg} fuera de rango [{lo}..{hi}]")
            del cuerpo[campo]

    if descartados:
        log.warning("valores descartados: %s", "; ".join(descartados))
    if not cuerpo:
        return None
    cuerpo["measured_at"] = _marca_temporal(plano)
    cuerpo["source"] = SOURCE
    return cuerpo


def enviar(cuerpo):
    if DRY_RUN:
        log.info("DRY_RUN, no se envía: %s", json.dumps(cuerpo, ensure_ascii=False))
        return
    r = requests.post(
        f"{NT_URL}/api/v1/body-measurements",
        json=cuerpo,
        headers={"Authorization": f"Bearer {NT_TOKEN}"},
        timeout=15,
    )
    if r.status_code == 201:
        d = r.json()
        log.info("guardado %s: %s", d.get("date"), ", ".join(d.get("stored", [])))
    elif r.status_code == 429:
        log.warning("rate limit; reintento en %ss", r.headers.get("Retry-After", "?"))
    else:
        log.error("NutriTrace respondió %s: %s", r.status_code, r.text[:300])


# ── Home Assistant → /api/v1/wellness ─────────────────────────────────────
def _leer_ha(entity_id):
    """Estado numerico de una entidad, o None si no hay lectura utilizable."""
    r = requests.get(
        f"{HA_URL}/api/states/{entity_id}",
        headers={"Authorization": f"Bearer {HA_TOKEN}"},
        timeout=10,
    )
    if r.status_code != 200:
        log.warning("HA %s respondio %s", entity_id, r.status_code)
        return None
    estado = (r.json() or {}).get("state")
    # HA usa estas tres cadenas cuando la entidad no tiene valor; float() las
    # convertiria en una excepcion o, peor, "unknown" no, pero un sensor que
    # se reinicia deja un 0 que si es un numero valido y no queremos pisar
    # con el la lectura buena del dia.
    if estado in (None, "unknown", "unavailable", "none", ""):
        return None
    try:
        return float(estado)
    except (TypeError, ValueError):
        log.debug("HA %s no es numerico: %r", entity_id, estado)
        return None


def sondear_ha():
    """Una pasada: lee cada entidad configurada y manda lo que haya."""
    metricas = {}
    for metrica, entity_id in HA_METRICS.items():
        try:
            v = _leer_ha(entity_id)
        except requests.RequestException as e:
            log.error("HA %s no responde: %s", entity_id, e)
            continue
        if v is not None:
            metricas[metrica] = round(v, 3)
    if not metricas:
        log.debug("HA: nada que enviar en esta pasada")
        return
    # La fecha es la LOCAL del contenedor: los contadores diarios de pasos y
    # calorias se resetean a medianoche local, y con TZ en UTC las lecturas de
    # despues de las 21:00 se cargarian en el dia siguiente. Fijar TZ en el
    # .env es parte de la instalacion.
    cuerpo = {"date": datetime.now().strftime("%Y-%m-%d"),
              "source": HA_SOURCE, "metrics": metricas}
    if DRY_RUN:
        log.info("DRY_RUN, no se envía: %s", json.dumps(cuerpo, ensure_ascii=False))
        return
    try:
        r = requests.post(
            f"{NT_URL}/api/v1/wellness",
            json=cuerpo,
            headers={"Authorization": f"Bearer {NT_TOKEN}"},
            timeout=15,
        )
    except requests.RequestException as e:
        log.error("no se pudo enviar bienestar: %s", e)
        return
    if r.ok:
        d = r.json()
        log.info("bienestar %s: %s", d.get("date"),
                 ", ".join(f"{k}={v:g}" for k, v in (d.get("written") or {}).items()))
    else:
        log.error("NutriTrace respondió %s a /wellness: %s", r.status_code, r.text[:300])


def bucle_ha():
    """Hilo propio: el sondeo de HA no depende de que llegue nada por MQTT."""
    while True:
        try:
            sondear_ha()
        except Exception as e:                       # noqa: BLE001
            log.error("sondeo de HA falló: %s", e)
        time.sleep(HA_POLL_SEC)


def on_connect(client, _u, _f, rc, *_):
    if rc == 0:
        log.info("conectado a %s:%s, suscribiendo a %r", MQTT_HOST, MQTT_PORT, MQTT_TOPIC)
        client.subscribe(MQTT_TOPIC)
    else:
        log.error("fallo de conexión MQTT rc=%s (5 = credenciales rechazadas)", rc)


def on_message(_c, _u, msg):
    texto = msg.payload.decode("utf-8", "replace").strip()
    if MODE == "discover":
        log.info("[%s] %s", msg.topic, texto[:400])
        return
    try:
        payload = json.loads(texto)
    except json.JSONDecodeError:
        try:
            payload = float(texto)          # tópico con un único número
        except ValueError:
            log.debug("payload ignorado en %s: %s", msg.topic, texto[:80])
            return
    cuerpo = construir(payload)
    if not cuerpo:
        log.debug("sin campos reconocidos en %s", msg.topic)
        return
    try:
        enviar(cuerpo)
    except requests.RequestException as e:
        log.error("no se pudo enviar: %s", e)


def main():
    logging.basicConfig(
        level=logging.DEBUG if os.environ.get("DEBUG") else logging.INFO,
        format="%(asctime)s %(levelname)-7s %(message)s",
        datefmt="%H:%M:%S",
    )
    if MODE == "run" and not NT_TOKEN and not DRY_RUN:
        log.error("falta NT_TOKEN. Creá el token en Ajustes → API tokens "
                  "con el scope write:body-measurements.")
        sys.exit(1)
    if MODE == "discover":
        log.info("modo descubrimiento: se muestra lo que llega, no se envía nada.")

    if HA_URL and HA_TOKEN and HA_METRICS:
        log.info("sondeo de Home Assistant cada %ss: %s",
                 HA_POLL_SEC, ", ".join(sorted(HA_METRICS)))
        threading.Thread(target=bucle_ha, daemon=True).start()
    elif HA_URL or HA_TOKEN or HA_METRICS:
        log.warning("Home Assistant a medio configurar: hacen falta HA_URL, "
                    "HA_TOKEN y HA_METRICS. No se sondea.")

    c = mqtt.Client()
    if MQTT_USER:
        c.username_pw_set(MQTT_USER, MQTT_PASS)
    c.on_connect, c.on_message = on_connect, on_message
    while True:
        try:
            c.connect(MQTT_HOST, MQTT_PORT, 60)
            c.loop_forever()
        except Exception as e:                       # noqa: BLE001
            log.error("MQTT caído (%s); reintento en 10 s", e)
            time.sleep(10)


if __name__ == "__main__":
    main()
