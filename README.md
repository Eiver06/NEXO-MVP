# NEXO 2.5

NEXO 2.5 avanza de la maqueta de transporte público hacia una arquitectura preparada para GTFS.

## Incluye
- Rutas por calles reales con OSRM.
- Selección de ruta sincronizada con el mapa.
- Transporte público separado en `gtfs-demo.json`.
- Estructura GTFS de agencias, paradas y rutas.
- Alternativas multimodales: caminar + transporte público + carretera.
- Tramos de caminata y transporte diferenciados en el mapa.
- Marcadores de origen y destino.
- PWA instalable.

## Importante
`gtfs-demo.json` contiene datos de demostración con estructura compatible conceptualmente con GTFS; todavía no representa una red operativa real. El siguiente paso es conectar un feed GTFS real de la ciudad objetivo y posteriormente GTFS-Realtime.

## Próximo bloque
NEXO 2.6: ingestión de GTFS real, normalización de paradas/rutas y selección multimodal basada en datos reales. Después: NEXO 3.0 con backend, base de datos, usuarios y viajes.

## GitHub Pages
Sube todos los archivos a la raíz del repositorio y publica GitHub Pages desde la rama principal y la carpeta raíz.
