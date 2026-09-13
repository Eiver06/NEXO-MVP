# NEXO 2.1 — Prototipo funcional

NEXO 2.1 mantiene el prototipo PWA de NEXO y añade un **motor de rutas viales por calles reales en modo experimental**, usando OSRM para calcular rutas desde las coordenadas disponibles.

## Incluye
- Buscador origen/destino con destinos de demostración.
- Rutas viales sobre calles reales cuando el servicio de routing responde.
- Hasta varias alternativas de ruta cuando están disponibles.
- Distancia y tiempo calculados por el motor vial.
- Mapa OpenStreetMap + Leaflet.
- Geolocalización del teléfono cuando el navegador lo permite.
- Prioridades de NEXO IA: rápido, económico y menos caminata.
- Fallback automático a datos demo si el motor vial no responde.
- PWA instalable.

## Importante
Esta versión sigue siendo un prototipo. OSRM se usa para pruebas y no debe considerarse todavía infraestructura de producción. Para NEXO real necesitaremos un backend propio, proveedor/instancia de routing, datos GTFS/GTFS-Realtime, base de datos, autenticación, monitoreo, límites de uso y seguridad.

La búsqueda de direcciones todavía no usa un servicio público de geocodificación automática. Esto se deja para una fase posterior con un proveedor adecuado o infraestructura propia.

## Publicar en GitHub Pages
Sube los archivos de esta carpeta a la raíz del repositorio y conserva `index.html` en la raíz.
