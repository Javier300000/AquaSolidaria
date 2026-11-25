# AquaSolidaria 4.0 — Edición Marea

## Cambios de esta versión

- Navegación superior fija, con menú desplegable debajo de la cabecera en teléfonos.
- Iconos SVG locales, reutilizados por la función `iconSVG` de `app.js`.
- Identidad acuática en todas las vistas, temas claro y oscuro, olas, burbujas y reflejos.
- Se conserva Firebase y la asignación de roles por UID. Los errores de inicio de sesión incluyen causas más específicas; no se restablecen contraseñas.
- No hay control físico de bombas desde la web. El modo demostración está aislado.

### Cómo estudiar el rediseño

`index.html`: busca `app-header`, `topNavigation` y `data-icon`. `app.js`: sección 01A contiene los SVG, sección 02 genera las opciones de cada rol. `styles.css`: sección 12 documenta la navegación, la identidad visual y las reglas para teléfonos; sustituye las reglas visuales anteriores mediante la cascada CSS.

### Publicación

Sube los cinco archivos a la raíz del repositorio existente, no el ZIP. No publiques el firmware con credenciales. El HTML utiliza `?v=4` para renovar la caché.

# AquaSolidaria 4.0 — Rediseño visual

Se conserva la lógica de la versión 2.0. Los estilos nuevos están documentados en la sección 11 de styles.css. Publica los cinco archivos en la raíz del repositorio. No se agregan permisos ni controles físicos.

# AquaSolidaria Web · versión 2.0

## 1. Publicación en GitHub Pages (Sublime Text)
1. Abre esta carpeta en Sublime Text: File > Open Folder.
2. En el repositorio existente Javier300000/AquaSolidaria, rama main, elige Add file > Upload files. Sube los cinco archivos de esta carpeta, no la carpeta ni el ZIP. Confirma Commit changes para reemplazar los archivos anteriores.
3. Espera a que el despliegue de Pages en Actions finalice. Abre https://javier300000.github.io/AquaSolidaria/ y usa Ctrl+F5 si aparece la versión anterior.
4. Accede con tu usuario habitual. No modifiques el ESP32 ni las reglas de Firebase para este cambio visual.

### Prueba de animaciones
En la portada elige Explorar demostración visual. Mueve el control de nivel y activa/desactiva las bombas simuladas. Al llegar a 0%, se detiene la animación de circulación. Las dos viviendas muestran valores ilustrativos fijos, no el resultado de un cálculo hidráulico. El modo real no muestra agua sin una medición. Las animaciones respetan la preferencia de movimiento reducido del dispositivo.

### Alternativa: instalación local (Windows / Visual Studio Code)
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

## 7. Cómo estudiar las animaciones de la versión 2.0
- En `index.html`, la ilustración SVG contiene capas de lluvia, olas, tuberías y reflejos. Las clases `sea-front` y `sea-back` se mueven de forma independiente. Los tinacos usan el elemento `.water` con olas y burbujas interiores.
- En `styles.css`, las secciones 07 a 10 documentan el rediseño. `@keyframes` define los movimientos, `transition: height` suaviza los cambios de nivel, y `prefers-reduced-motion` desactiva las animaciones si el usuario lo solicita.
- En `app.js`, `renderDemoTanks` modifica los niveles y los estados visuales. `renderDevice` actualiza la banda de estado y la señal WiFi. `renderHistory` genera el trazado SVG. La simulación no escribe datos ni envía comandos a Firebase.
- La configuración pública de Firebase y los UID son los mismos de la versión 1.0. No se incluyen contraseñas.

## Actualización 4.1
Configuración de conectividad: permite cambiar entre dos perfiles registrados localmente en el ESP32. Requiere firmware y reglas de la versión 4.1. El portal local registra redes nuevas; Firebase no almacena las claves WiFi. No publicar archivos Arduino ni Secretos.h. Los controles de bombas continúan deshabilitados.
