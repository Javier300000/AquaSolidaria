# AquaSolidaria Web · versión 1.0

## 1. Instalación (Windows / Visual Studio Code)
1. Descomprime el ZIP y abre la carpeta AquaSolidaria-Web con File > Open Folder.
2. Instala la extensión Live Server (Ritwick Dey) si no la tienes.
3. Clic derecho en index.html > Open with Live Server. También puedes ejecutar `python -m http.server 8000` en la terminal si tienes Python y abrir http://localhost:8000.
4. Mantén el ESP32 encendido con el programa que ya envía datos a Firebase.
5. Inicia sesión con el correo de administrador y la contraseña que asignaste en Firebase. No hay contraseñas dentro de la web.
6. Comprueba que el tiempo activo cambia. Desconecta el ESP32: tras unos 20 s sin actualización, el estado cambia a sin conexión reciente.

No se necesita npm, XAMPP ni alojar HTML dentro del ESP32. El SDK Firebase se importa desde su CDN oficial, por lo que el modo real necesita internet. La demostración no necesita acceso a Firebase (sirve la carpeta con un servidor HTTP).

## 2. Archivos y orden de estudio
- `index.html`: estructura, formularios, menú, tarjetas y secciones.
- `styles.css`: variables, tema, diseño adaptable, agua y tuberías animadas. Las reglas se agrupan por secciones.
- `firebase-config.js`: configuración pública, inicialización y exportación de Firebase Auth y Realtime Database.
- `app.js`: funciones de sesión, navegación, permisos de interfaz, lectura de datos, caducidad, gráfico, CSV y demostración.

## 3. Flujo de datos
ESP32 → WiFi → Firebase `/dispositivo` → listener `onValue` → estado de JavaScript → interfaz HTML. `ultimaActualizacion` es la marca de tiempo del servidor en milisegundos. `tiempoActivo` está expresado en segundos. `senal` está en dBm. El gráfico guarda hasta 200 muestras en memoria y dibuja las 30 más recientes. El CSV exporta las muestras de la sesión; no es un historial permanente.

## 4. Roles
Administrador y operador leen `/dispositivo`. Las cuentas de vivienda leen exclusivamente su ruta `/viviendas/casa1` o `/viviendas/casa2` (todavía vacías). La cuenta ESP32 no accede al portal. Los UID asignados en `app.js` deben coincidir con los de Authentication. El control de acceso verdadero está en las reglas de Firebase, no en el menú. Los controles de bombas están deshabilitados y esta web no escribe en Firebase.

## 5. Qué falta
- Integrar y calibrar sensores. La capacidad conceptual de 4,000 L y el reparto 50/50 no son mediciones del prototipo.
- Añadir el contrato de datos de sensores y viviendas, persistencia del historial, gestión de cuentas, alertas de hardware y control de bombas. Los campos previstos de viviendas son `suministro`, `flotador`, `litros`, `ultimaActualizacion`.
- Verificar las reglas con cada rol. Cambiar las contraseñas provisionales por otras fuertes y únicas (incluida la del ESP32), actualizar el firmware con las nuevas credenciales y validar certificados TLS; el firmware de prueba anterior omitía esa verificación. No publicar credenciales ni firmware con secretos.
- Publicar la web en GitHub Pages después de verificar seguridad. Para una prueba en el teléfono, se puede usar Live Server por red local si Windows permite el puerto o publicar la web cuando esté preparada.

## 6. Referencias de aprendizaje
- https://firebase.google.com/docs/web/setup
- https://firebase.google.com/docs/auth/web/password-auth
- https://firebase.google.com/docs/database/web/read-and-write
