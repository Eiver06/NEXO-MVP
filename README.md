# NEXO 2.0 — Prototipo funcional

NEXO 2.0 es una PWA de demostración de movilidad urbana. Esta versión está pensada para subir directamente a GitHub Pages y probarse desde un teléfono.

## Incluye
- Buscador origen/destino.
- Destinos rápidos.
- Cuatro alternativas de viaje.
- Priorización por rapidez, precio o caminata.
- Mapa OpenStreetMap/Leaflet.
- Geolocalización del teléfono cuando el navegador la permite.
- Panel lateral.
- Diseño móvil.
- PWA + caché básica.
- Datos de demostración, sin backend ni claves secretas.

## Publicación en GitHub Pages
1. Sube todos los archivos de esta carpeta al repositorio.
2. GitHub → Settings → Pages.
3. Source: Deploy from a branch.
4. Branch: main / root.
5. Save.
6. Abre la URL que GitHub muestre para Pages.

## Importante
Esta es una versión de prueba. El cálculo de rutas y tarifas es de demostración. Para producción habrá que conectar backend, base de datos, datos reales de transporte, GTFS/GTFS-Realtime, autenticación, GPS de flotas, notificaciones y controles de seguridad.
