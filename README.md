# NEXO 2.2

NEXO 2.2 es el prototipo móvil de NEXO para pruebas en GitHub Pages.

## Cambio principal de esta versión

La versión anterior podía caer a una línea recta cuando el motor OSRM no respondía. NEXO 2.2 elimina ese comportamiento engañoso.

Ahora:
1. Intenta calcular la ruta con **Valhalla**, usando la red de calles de OpenStreetMap.
2. Si Valhalla no responde, intenta **OSRM**.
3. Si ninguno responde, muestra un aviso y **no dibuja una línea recta como si fuera una ruta real**.

Valhalla documenta su servidor público de demostración y su API de rutas; el uso público está sujeto a límites de uso razonable. Para producción NEXO deberá usar un backend/motor de rutas propio o un proveedor con contrato y límites definidos.

## Cómo actualizar GitHub

Sube y reemplaza en la raíz del repositorio:
- index.html
- app.js
- styles.css
- manifest.webmanifest
- sw.js
- icon.svg
- README.md

Después espera a que GitHub Pages publique el cambio.

## Importante

Esta versión todavía es un prototipo de **rutas viales**, no un sistema de transporte público en tiempo real. La siguiente etapa debe integrar GTFS/GTFS-Realtime, backend, usuarios, GPS de flota y rutas multimodales.

Fuentes técnicas:
- Valhalla: https://valhalla.github.io/valhalla/
- API de rutas Valhalla: https://valhalla.github.io/valhalla/api/turn-by-turn/overview/
- OSRM: https://project-osrm.org/docs/
