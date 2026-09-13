# NEXO MVP

MVP web estático para probar NEXO desde un teléfono.

## Principios del modelo
- Las comisiones se generan únicamente a partir de ventas registradas.
- No se pagan comisiones por crear cuentas, registrarse o reclutar personas.
- El MVP usa una estructura de referidos de hasta 3 niveles: 5%, 2% y 1% sobre ventas.
- Esta implementación es una DEMO: los datos viven en `localStorage`.

## Archivos
- `index.html` — interfaz.
- `styles.css` — diseño responsive.
- `app.js` — lógica y datos demo.
- `README.md` — instrucciones.

## GitHub desde el teléfono
1. Crea un repositorio nuevo en GitHub, por ejemplo `nexo-mvp`.
2. Sube los cuatro archivos de este ZIP a la raíz del repositorio.
3. En GitHub abre **Settings → Pages**.
4. Selecciona despliegue desde la rama principal (`main`) y carpeta `/root`.
5. Guarda y espera a que GitHub Pages publique el sitio.

## Usuarios demo
- admin@nexo.test / admin123
- carlos@nexo.test / 123456
- ana@nexo.test / 123456
- pedro@nexo.test / 123456

## Importante antes de usar dinero real
Este MVP NO debe utilizarse para procesar dinero real ni datos sensibles. Para producción se necesita:
- backend y base de datos;
- contraseñas con hash seguro, nunca en JavaScript/localStorage;
- autenticación y autorización del lado servidor;
- proveedor de pagos;
- registro verificable de órdenes y estados de pago;
- reversión de comisiones por reembolsos/contracargos;
- controles antifraude y auditoría;
- protección de datos;
- términos, política de privacidad y revisión legal del plan de compensación.

## Prueba rápida
1. Entra con `carlos@nexo.test / 123456`.
2. Revisa su código de referido.
3. Registra una venta.
4. Cierra sesión y entra como `Administrador`.
5. Comprueba usuarios y comisiones.

Licencia: uso de prototipo/demo.
