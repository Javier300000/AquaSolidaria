
// ==========================================
// AQUASOLIDARIA - PROGRAMA WEB
// ==========================================

// 1. FUNCIONES GENERALES

const $ = id => document.getElementById(id);

const number = value =>
    typeof value === "number" &&
    Number.isFinite(value);

const show = (id, visible) => {
    $(id).hidden = !visible;
};

const text = (id, value) => {
    $(id).textContent = value;
};

// Evitar introducir texto no seguro en HTML
function escapeHTML(value) {

    return String(value ?? "").replace(
        /[&<>"']/g,
        char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]
    );

}

// Actualizar HTML solo cuando sea necesario
function html(id, content) {

    const element = $(id);

    if (element.dataset.rendered !== content) {
        element.innerHTML = content;
        element.dataset.rendered = content;
    }

}

// 2. USUARIOS Y PERMISOS

const roles = {

    "3EzO6T9OXhP1vRfdhvpr7EgKCtC3": {

        name: "Administrador",

        pages: [
            "overview",
            "monitor",
            "distribution",
            "history",
            "alerts",
            "settings"
        ]

    },

    "E5MLK89eI8XmitvAkcHzAj4mOg42": {

        name: "Operador",

        pages: [
            "overview",
            "monitor",
            "distribution",
            "history",
            "alerts"
        ]

    },

    "vD4sEWQ9ASOAltrggXYku0bAhBz1": {

        name: "Vivienda 1",
        house: "casa1",
        pages: ["housing"]

    },

    "avzzZFclg8h7XGHzvvahg6Fb5WZ2": {

        name: "Vivienda 2",
        house: "casa2",
        pages: ["housing"]

    }

};

const pages = {

    overview: "⌂ Inicio",
    monitor: "💧 Tinacos y sensores",
    distribution: "↔ Distribución",
    history: "▤ Historial",
    alerts: "⚠ Alertas",
    settings: "⚙ Información",
    housing: "⌂ Mi vivienda"

};

// 3. VARIABLES DE FUNCIONAMIENTO

let firebase = null;

let role = null;
let device = null;
let sensors = null;
let houseData = null;

let connected = false;
let serverOffset = 0;

let history = [];
let lastSample = null;

let unsubscribers = [];
let generation = 0;

let demo = false;
let demoTimer = null;

let signingIn = false;

// 4. MENSAJES

function loginMessage(message, error = false) {

    text("loginMessage", message);

    $("loginMessage").classList.toggle(
        "error", error
    );

}

function errorBanner(message) {

    text("errorBanner", message);

    show("errorBanner", Boolean(message));

}

// 5. NAVEGACION

function go(page) {

    if (!role?.pages.includes(page)) return;

    document.querySelectorAll(".page")
        .forEach(section => {

            section.hidden = section.id !== page;

        });

    document.querySelectorAll(".nav-button")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page === page
            );

        });

    window.scrollTo(0, 0);

}

function openShell(selectedRole) {

    role = selectedRole;

    text("roleLabel", role.name);

    $("navigation").replaceChildren();

    for (const page of role.pages) {

        const button = document.createElement(
            "button"
        );

        button.className = "nav-button";
        button.dataset.page = page;
        button.textContent = pages[page];

        button.addEventListener(
            "click", () => go(page)
        );

        $("navigation").append(button);

    }

    show("welcome", false);
    show("shell", true);
    show("demoBanner", demo);

    if (role.house) {
        text("houseTitle", role.name);
    }

    go(role.pages[0]);

    render();

}

// 6. LIMPIAR SESIONES

function stopSession() {

    generation++;

    for (const unsubscribe of unsubscribers) {
        unsubscribe();
    }

    unsubscribers = [];

    clearInterval(demoTimer);
    demoTimer = null;

    role = null;
    device = null;
    sensors = null;
    houseData = null;

    connected = false;
    serverOffset = 0;

    history = [];
    lastSample = null;

    demo = false;

    errorBanner("");

    // Evitar que los datos de una cuenta
    // permanezcan visibles en otra sesion.

    const ids = [
        "mainTank",
        "homeTank1",
        "homeTank2",
        "sensorCards",
        "distributionCards",
        "personalTank",
        "personalSensors",
        "alertList"
    ];

    for (const id of ids) {
        html(id, "");
    }

    $("historyRows").replaceChildren();
    show("historyEmpty", true);

    show("shell", false);
    show("welcome", true);

}

// 7. VERIFICAR DATOS RECIENTES

function fresh(data) {

    if (!data || !number(data.ultimaActualizacion)) {
        return false;
    }

    if (!demo && !connected) {
        return false;
    }

    const age =
        Date.now() +
        serverOffset -
        data.ultimaActualizacion;

    return age >= -5000 && age <= 20000;

}

function date(value) {

    return number(value)
        ? new Date(value).toLocaleString("es-MX")
        : "Sin lectura";

}

function duration(seconds) {

    if (!number(seconds) || seconds < 0) {
        return "—";
    }

    const total = Math.floor(seconds);

    const h = Math.floor(total / 3600);
    const m = Math.floor(total % 3600 / 60);
    const s = total % 60;

    return `${h} h ${m} min ${s} s`;

}

// 8. INTERPRETACION DE LOS SENSORES

function distance(data = {}) {

    if (
        number(data.distanciaCm) &&
        data.distanciaCm >= 0
    ) {
        return data.distanciaCm.toFixed(1) + " cm";
    }

    switch (data.estadoUltrasonico) {

        case "zona_ciega":
            return "Zona ciega del sensor";

        case "sin_eco":
            return "Sin respuesta ECHO";

        case "fuera_rango":
            return "Fuera de rango";

        default:
            return "Sin lectura válida";

    }

}

function floatState(data = {}) {

    if (data.lleno === true) {
        return "Lleno según flotador";
    }

    if (data.lleno === false) {
        return "Debajo del umbral de llenado";
    }

    if (typeof data.flotador === "boolean") {

        return data.flotador
            ? "Contacto cerrado · Sin calibrar"
            : "Contacto abierto · Sin calibrar";

    }

    return "Sin lectura";

}

function capacity(data = {}) {

    if (!number(data.capacidadLitros)) {
        return "Por calibrar";
    }

    if (data.capacidadLitros < 1) {

        return (
            Math.round(data.capacidadLitros * 1000)
            + " ml"
        );

    }

    return data.capacidadLitros.toFixed(2) + " L";

}

function liters(value) {

    if (!number(value) || value < 0) {
        return "Sin calibrar";
    }

    return value.toFixed(3) + " L";

}

function flow(data = {}) {

    if (number(data.caudal)) {
        return data.caudal.toFixed(3) + " L/min";
    }

    if (number(data.frecuenciaHz)) {

        return data.frecuenciaHz > 0
            ? "Pulsos detectados"
            : "Sin pulsos en el intervalo";

    }

    return "Sin lectura";

}

function percentage(data = {}) {

    return (
        number(data.nivel) &&
        data.nivel >= 0 &&
        data.nivel <= 100
    ) ? data.nivel : null;

}

// 9. DISEÑO DE LOS TINACOS

function tankMarkup(name, data = {}) {

    const level = percentage(data);

    // Un flotador permite detectar el umbral
    // de llenado, pero no un porcentaje exacto.

    const full = data.lleno === true;

    const height = level === null ? 0 : level;

    const label = level !== null
        ? Math.round(level) + "%"
        : full ? "Lleno" : "—";

    let state = "Nivel sin calibrar";

    if (full) {

        state = "Umbral de llenado alcanzado";

    } else if (data.lleno === false) {

        state = "Debajo del umbral";

    } else if (level !== null) {

        state = "Nivel medido";

    } else if (!number(data.distanciaCm)) {

        state = "Sin nivel válido";

    }

    return `
        <div class="tank-unit">

            <div class="tank">

                <div class="tank-water"
                     style="height:${height}%"
                     ${height === 0 ? "hidden" : ""}>
                </div>

                <div class="tank-value">
                    ${escapeHTML(label)}
                </div>

            </div>

            <h3>${escapeHTML(name)}</h3>

            <span class="tank-status
                ${full ? "full-tank" : ""}">

                ${escapeHTML(state)}

            </span>

            <small>
                ${escapeHTML(distance(data))}
            </small>

        </div>
    `;

}

function infoRow(name, value) {

    return `
        <div class="info-row">

            <span>${escapeHTML(name)}</span>

            <strong>
                ${escapeHTML(value)}
            </strong>

        </div>
    `;

}

function sensorCard(name, data = {}, house = false) {

    return `
        <article class="panel sensor-card">

            <h3>${escapeHTML(name)}</h3>

            <div class="sensor-value">
                ${escapeHTML(distance(data))}
            </div>

            ${infoRow("Capacidad", capacity(data))}

            ${infoRow(
                "Nivel",
                percentage(data) === null
                    ? "Por calibrar"
                    : Math.round(data.nivel) + "%"
            )}

            ${infoRow(
                "Volumen almacenado",
                liters(data.volumen)
            )}

            ${
                house
                ? infoRow("Flotador", floatState(data))
                  + infoRow("Caudal", flow(data))
                  + infoRow(
                      "Pulsos desde arranque",
                      number(data.pulsos)
                          ? data.pulsos
                          : "—"
                  )
                  + infoRow(
                      "Agua recibida",
                      liters(data.litros)
                  )
                : ""
            }

        </article>
    `;

}

function branchCard(name, data = {}) {

    return `
        <article class="panel sensor-card">

            <h3>${escapeHTML(name)}</h3>

            ${infoRow("Flujo", flow(data))}

            ${infoRow(
                "Frecuencia",
                number(data.frecuenciaHz)
                    ? data.frecuenciaHz.toFixed(2) + " Hz"
                    : "—"
            )}

            ${infoRow(
                "Pulsos",
                number(data.pulsos)
                    ? data.pulsos
                    : "—"
            )}

            ${infoRow(
                "Litros distribuidos",
                liters(data.litros)
            )}

            ${infoRow(
                "Flotador",
                floatState(data)
            )}

        </article>
    `;

}

// 10. MOSTRAR ESTADO DEL ESP32

function renderDevice() {

    const recent = fresh(device);

    const label = demo
        ? "Demostración"
        : recent
            ? "En línea"
            : device
                ? "Sin datos recientes"
                : "Esperando ESP32";

    text("connection", label);

    $("connection").className =
        "status " +
        (
            demo
            ? ""
            : recent
                ? "online"
                : device ? "offline" : ""
        );

    text("deviceState", label);

    text(
        "rssi",
        recent && number(device?.senal)
            ? device.senal + " dBm"
            : "—"
    );

    text(
        "uptime",
        recent
            ? duration(device.tiempoActivo)
            : "—"
    );

    text(
        "wifiName",
        recent
            ? device.wifi || "—"
            : "Sin lectura reciente"
    );

    text(
        "ipAddress",
        recent ? device.ip || "—" : "—"
    );

    text(
        "lastUpdate",
        date(device?.ultimaActualizacion)
    );

}

// 11. MOSTRAR MEDICIONES REALES

function renderSensors() {

    const recent = fresh(sensors);

    const principal = recent
        ? sensors.principal || {}
        : {};

    const casa1 = recent
        ? sensors.casa1 || {}
        : {};

    const casa2 = recent
        ? sensors.casa2 || {}
        : {};

    html(
        "mainTank",
        tankMarkup("Tinaco principal", principal)
    );

    html(
        "homeTank1",
        tankMarkup("Vivienda 1", casa1)
    );

    html(
        "homeTank2",
        tankMarkup("Vivienda 2", casa2)
    );

    text(
        "availableWater",
        number(principal.volumen)
            ? liters(principal.volumen)
            : "—"
    );

    html(
        "sensorCards",

        sensorCard(
            "Tinaco principal", principal
        ) +

        sensorCard(
            "Vivienda 1", casa1, true
        ) +

        sensorCard(
            "Vivienda 2", casa2, true
        )
    );

    renderDistribution(casa1, casa2);

    renderAlerts(
        principal,
        casa1,
        casa2,
        recent
    );

}

// 12. DISTRIBUCION DE AGUA

function renderDistribution(casa1, casa2) {

    html(
        "distributionCards",

        branchCard("Ramal 1", casa1) +
        branchCard("Ramal 2", casa2)
    );

    const l1 = casa1.litros;
    const l2 = casa2.litros;

    if (
        number(l1) &&
        number(l2) &&
        l1 >= 0 &&
        l2 >= 0 &&
        l1 + l2 > 0
    ) {

        const p1 = l1 / (l1 + l2) * 100;

        const p2 = 100 - p1;

        $("share1").style.width = p1 + "%";
        $("share2").style.width = p2 + "%";

        text(
            "distributionText",
            `Vivienda 1: ${p1.toFixed(1)}% · ` +
            `Vivienda 2: ${p2.toFixed(1)}%`
        );

    } else {

        $("share1").style.width = "0%";
        $("share2").style.width = "0%";

        text(
            "distributionText",
            "Pendiente de calibración o flujo"
        );

    }

}

// 13. SISTEMA DE ALERTAS

function renderAlerts(principal, casa1, casa2, recent) {

    const alerts = [];

    function add(message, danger = false) {

        alerts.push(
            `<div class="notice ${danger ? "danger" : ""}">
                ${escapeHTML(message)}
            </div>`
        );

    }

    if (!fresh(device)) {

        add(
            "No se reciben datos recientes del ESP32. " +
            "Verifica la conexión y la alimentación.",
            true
        );

    }

    if (!recent) {

        add(
            "No hay mediciones recientes de los sensores.",
            true
        );

    } else {

        if (casa1.lleno === true) {

            add(
                "Vivienda 1: umbral de llenado alcanzado. " +
                "Apaga manualmente la bomba.",
                true
            );

        }

        if (casa2.lleno === true) {

            add(
                "Vivienda 2: umbral de llenado alcanzado. " +
                "Apaga manualmente la bomba.",
                true
            );

        }

        const tanks = [
            ["Tinaco principal", principal],
            ["Vivienda 1", casa1],
            ["Vivienda 2", casa2]
        ];

        for (const [name, data] of tanks) {

            if (!number(data.distanciaCm)) {

                add(
                    name + ": " + distance(data) +
                    ". Revisa la posición y conexiones " +
                    "del ultrasónico."
                );

            }

        }

        if (
            percentage(principal) !== null &&
            principal.nivel <= 10
        ) {

            add(
                "Nivel bajo en el tinaco principal. " +
                "Evita operar la bomba sin agua.",
                true
            );

        }

    }

    if (alerts.length === 0) {

        add("Sin alertas activas según los datos recibidos.");

    }

    html("alertList", alerts.join(""));

}

// 14. PANEL INDIVIDUAL DE VIVIENDA

function renderHouse() {

    const recent = fresh(houseData);

    const data = recent ? houseData : {};

    text(
        "connection",

        recent
            ? "Datos recientes"
            : "Sin lectura reciente"
    );

    $("connection").className =
        "status " + (recent ? "online" : "offline");

    html(
        "personalTank",
        tankMarkup(role.name, data)
    );

    html(
        "personalSensors",

        sensorCard(
            "Monitoreo de mi vivienda",
            data,
            true
        ) +

        (
            data.lleno === true
            ? `<article class="panel">
                   <h3>Umbral de llenado alcanzado</h3>
                   <p>El flotador detectó el llenado.
                   Si la bomba está funcionando,
                   solicita su apagado manual.</p>
               </article>`
            : ""
        )
    );

}

// 15. FUNCION GENERAL DE VISUALIZACION

function render() {

    if (!role) return;

    if (role.house) {

        renderHouse();

    } else {

        renderDevice();

        renderSensors();

    }

}

// 16. HISTORIAL DE CONEXION

function receiveDevice(value) {

    device = value;

    if (

        number(value?.ultimaActualizacion) &&
        number(value?.senal) &&
        value.ultimaActualizacion !== lastSample

    ) {

        lastSample = value.ultimaActualizacion;

        history.push({

            time: value.ultimaActualizacion,
            signal: value.senal,
            uptime: value.tiempoActivo

        });

        if (history.length > 200) {

            history.shift();

        }

        renderHistory();

    }

    render();

}

function renderHistory() {

    const rows = $("historyRows");

    rows.replaceChildren();

    for (const item of [...history].reverse()) {

        const tr = document.createElement("tr");

        const values = [
            date(item.time),
            item.signal + " dBm",
            duration(item.uptime)
        ];

        for (const value of values) {

            const td = document.createElement("td");

            td.textContent = value;

            tr.append(td);

        }

        rows.append(tr);

    }

    show("historyEmpty", history.length === 0);

}

function exportHistory() {

    const rows = [

        "fecha_iso,senal_dbm,tiempo_activo_segundos",

        ...history.map(item =>

            new Date(item.time).toISOString() +
            "," + item.signal +
            "," + (number(item.uptime) ? item.uptime : "")

        )

    ];

    const blob = new Blob(
        ["\ufeff" + rows.join("\n")],
        { type: "text/csv;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = demo
        ? "aquasolidaria-demo.csv"
        : "aquasolidaria-historial.csv";

    a.click();

    setTimeout(
        () => URL.revokeObjectURL(url),
        1000
    );

}

// 17. ESCUCHAR FIREBASE

function startListeners() {

    const currentGeneration = generation;

    function listen(path, callback) {

        const unsubscribe = firebase.onValue(

            firebase.ref(firebase.db, path),

            snapshot => {

                if (
                    currentGeneration === generation
                ) {

                    callback(snapshot.val());

                }

            },

            error => {

                if (
                    currentGeneration !== generation
                ) return;

                console.error(error);

                if (path === "dispositivo") {
                    device = null;
                }

                if (path === "sensores") {
                    sensors = null;
                }

                if (path.startsWith("viviendas/")) {
                    houseData = null;
                }

                errorBanner(
                    "No se pudo consultar " + path +
                    ". Revisa las reglas de Firebase."
                );

                render();

            }

        );

        unsubscribers.push(unsubscribe);

    }

    // Estado de conexion del navegador

    listen(".info/connected", value => {

        connected = value === true;

        render();

    });

    // Diferencia horaria con Firebase

    listen(".info/serverTimeOffset", value => {

        serverOffset = number(value) ? value : 0;

        render();

    });

    // Cada vivienda solo puede leer su nodo.

    if (role.house) {

        listen(
            "viviendas/" + role.house,

            value => {

                houseData = value;

                render();

            }
        );

    } else {

        // Administrador y operador

        listen("dispositivo", receiveDevice);

        listen("sensores", value => {

            sensors = value;

            render();

        });

    }

    // NO existen listeners de cambio de WiFi.
    // NO se envian comandos al ESP32.

}

// 18. INICIO DE SESION

async function login(event) {

    event.preventDefault();

    if (!firebase || signingIn) return;

    signingIn = true;

    $("loginButton").disabled = true;
    $("demoButton").disabled = true;

    loginMessage("Verificando credenciales...");

    try {

        await firebase.signInWithEmailAndPassword(

            firebase.auth,

            $("email").value.trim(),

            $("password").value

        );

    } catch (error) {

        const messages = {

            "auth/invalid-credential":
                "Correo o contraseña incorrectos.",

            "auth/network-request-failed":
                "No se pudo conectar con Firebase.",

            "auth/too-many-requests":
                "Demasiados intentos. Intenta más tarde.",

            "auth/user-disabled":
                "La cuenta está deshabilitada."

        };

        loginMessage(

            messages[error.code] ||
            "Error de autenticación: " + error.code,

            true

        );

    } finally {

        signingIn = false;

        $("password").value = "";

        $("loginButton").disabled = false;
        $("demoButton").disabled = false;

    }

}

// 19. INICIALIZAR FIREBASE

async function initFirebase() {

    try {

        const [config, authSDK, dbSDK] =
            await Promise.all([

                import("./firebase-config.js"),

                import(
                    "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js"
                ),

                import(
                    "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js"
                )

            ]);

        firebase = {

            ...config,
            ...authSDK,
            ...dbSDK

        };

        // La sesion se conserva durante
        // la sesion del navegador.

        await firebase.setPersistence(

            firebase.auth,

            firebase.browserSessionPersistence

        );

        firebase.onAuthStateChanged(

            firebase.auth,

            user => {

                if (demo && !user) return;

                stopSession();

                if (!user) {

                    loginMessage(
                        "Ingresa tus credenciales."
                    );

                    return;

                }

                const selectedRole = roles[user.uid];

                if (!selectedRole) {

                    firebase.signOut(firebase.auth)
                        .catch(console.error);

                    loginMessage(
                        "Esta cuenta no tiene acceso al portal.",
                        true
                    );

                    return;

                }

                openShell(selectedRole);

                startListeners();

            }

        );

        $("loginButton").disabled = false;

        loginMessage(
            "Ingresa tus credenciales."
        );

    } catch (error) {

        console.error(error);

        loginMessage(
            "No se pudo iniciar Firebase. " +
            "Comprueba tu conexión a internet.",
            true
        );

    }

}

// 20. MODO DEMOSTRACION

function startDemo() {

    if (signingIn || firebase?.auth?.currentUser) {
        return;
    }

    stopSession();

    demo = true;

    connected = true;

    openShell({

        name: "Demostración",

        pages: [
            "overview",
            "monitor",
            "distribution",
            "history",
            "alerts",
            "settings"
        ]

    });

    let seconds = 0;

    function sample() {

        seconds += 2;

        const now = Date.now();

        // Estos datos son completamente ficticios.
        // No se escriben en Firebase.

        sensors = {

            ultimaActualizacion: now,

            principal: {

                distanciaCm: 33,
                nivel: 73,
                capacidadLitros: 1,
                volumen: 0.73

            },

            casa1: {

                distanciaCm: 35,
                nivel: 52,
                capacidadLitros: 0.2,
                volumen: 0.104,
                lleno: false,
                flotador: false,
                pulsos: 100,
                frecuenciaHz: 3,
                litros: 0.104,
                caudal: 0.3

            },

            casa2: {

                distanciaCm: 36,
                nivel: 48,
                capacidadLitros: 0.2,
                volumen: 0.096,
                lleno: false,
                flotador: false,
                pulsos: 92,
                frecuenciaHz: 3,
                litros: 0.096,
                caudal: 0.28

            }

        };

        receiveDevice({

            wifi: "Red de demostración",

            ip: "—",

            senal:
                -48 + Math.round(Math.sin(seconds) * 4),

            tiempoActivo: seconds,

            ultimaActualizacion: now

        });

    }

    sample();

    demoTimer = setInterval(sample, 2000);

}

// 21. MODO OSCURO

function toggleTheme() {

    const current =
        document.documentElement.dataset.theme;

    const next = current === "dark"
        ? "light"
        : "dark";

    document.documentElement.dataset.theme = next;

    try {

        localStorage.setItem(
            "aquasolidaria-theme", next
        );

    } catch {}

}

try {

    const saved = localStorage.getItem(
        "aquasolidaria-theme"
    );

    if (["dark", "light"].includes(saved)) {

        document.documentElement.dataset.theme =
            saved;

    }

} catch {}

// 22. EVENTOS DE LA PAGINA

document.querySelectorAll(".theme-toggle")
    .forEach(button => {

        button.addEventListener(
            "click", toggleTheme
        );

    });

$("loginForm").addEventListener(
    "submit", login
);

$("demoButton").addEventListener(
    "click", startDemo
);

$("exportHistory").addEventListener(
    "click", exportHistory
);

$("showPassword").addEventListener(

    "click",

    () => {

        const visible =
            $("password").type === "password";

        $("password").type =
            visible ? "text" : "password";

        text(
            "showPassword",
            visible ? "Ocultar" : "Ver"
        );

    }

);

$("logout").addEventListener(

    "click",

    async () => {

        if (demo) {

            stopSession();

            return;

        }

        if (firebase) {

            try {

                await firebase.signOut(firebase.auth);

            } catch {

                errorBanner(
                    "No se pudo cerrar sesión."
                );

            }

        }

    }

);

// Verificar constantemente que los datos
// recibidos no se encuentren desactualizados.

setInterval(render, 1000);

// Iniciar la aplicacion

initFirebase();
