
/*
 AQUASOLIDARIA - EDICION MAREA
 Programa principal de la interfaz web.
 Monitoreo de agua mediante ESP32 y Firebase.
*/

// ==========================================
// 01. UTILIDADES Y USUARIOS
// ==========================================

const $ = id => document.getElementById(id);
const text = (id, value) => {
  $(id).textContent = value;
};
const show = (id, visible) => {
  $(id).toggleAttribute('hidden', !visible);
};
const number = v =>
  typeof v === 'number' && Number.isFinite(v);

const display = v =>
  v == null || v === '' ? '—' : String(v);

const roles = {
  '3EzO6T9OXhP1vRfdhvpr7EgKCtC3': {
    name: 'Administrador',
    pages: [
      'overview', 'monitor', 'distribution',
      'history', 'alerts', 'settings'
    ]
  },

  'E5MLK89eI8XmitvAkcHzAj4mOg42': {
    name: 'Operador',
    pages: [
      'overview', 'monitor', 'distribution',
      'history', 'alerts'
    ]
  },

  'vD4sEWQ9ASOAltrggXYku0bAhBz1': {
    name: 'Vivienda 1',
    house: 'casa1',
    pages: ['housing']
  },

  'avzzZFclg8h7XGHzvvahg6Fb5WZ2': {
    name: 'Vivienda 2',
    house: 'casa2',
    pages: ['housing']
  }
};

// ==========================================
// 02. ICONOS SVG
// ==========================================

const icons = {
  drop: '<path d="M12 2C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-13Z"/><path d="M8 15c1-2 3 2 5 0s3-2 4-1"/>',

  waves: '<path d="M2 6c3 0 3-3 6-3s3 3 6 3 3-3 6-3h2M2 12c3 0 3-3 6-3s3 3 6 3 3-3 6-3h2M2 18c3 0 3-3 6-3s3 3 6 3 3-3 6-3h2"/>',

  overview: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><path d="M17.5 12c-1.4 2-3.5 4-3.5 6a3.5 3.5 0 0 0 7 0c0-2-2.1-4-3.5-6Z"/>',

  radar: '<path d="M4 8a11 11 0 0 1 16 0M7 11a7 7 0 0 1 10 0M10 14a3 3 0 0 1 4 0"/><rect x="5" y="16" width="14" height="5" rx="2"/><path d="M8 19h8"/>',

  flow: '<path d="M12 3v6H5v10m7-10h7v10M2 16l3 3 3-3m8 0 3 3 3-3"/><circle cx="12" cy="3" r="1"/>',

  history: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 7h8M8 12h2m-2 5h2m3-5h3m-3 5h3"/>',

  bell: '<path d="M18 8a6 6 0 1 0-12 0c0 6-3 7-3 9h18c0-2-3-3-3-9M10 21h4"/>',

  settings: '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="var(--panel)"/><circle cx="15" cy="12" r="2" fill="var(--panel)"/><circle cx="8" cy="18" r="2" fill="var(--panel)"/>',

  home: '<path d="M3 11 12 3l9 8M5 10v11h14V10"/><path d="M12 12c-2 3-3 4-3 5a3 3 0 0 0 6 0c0-1-1-2-3-5Z"/>',

  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',

  theme: '<path d="M12 3a9 9 0 1 0 9 9A7 7 0 0 1 12 3Z"/><path d="M18 3v4m-2-2h4"/>',

  logout: '<path d="M10 4H4v16h6m4-13 5 5-5 5M9 12h10"/>',

  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',

  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',

  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',

  chip: '<rect x="5" y="5" width="14" height="14" rx="3"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 2v3m6-3v3M9 19v3m6-3v3M2 9h3m-3 6h3m14-6h3m-3 6h3"/>',

  wifi: '<path d="M2 8a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0m-11 4a5 5 0 0 1 8 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/>',

  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',

  pump: '<circle cx="12" cy="12" r="9"/><path d="M12 12c-7 0-5-8 0-5 2 1 0 5 0 5Zm0 0c4-6 10-1 5 2-2 1-5-2-5-2Zm0 0c4 6-3 10-5 5-1-2 5-5 5-5Z"/>',

  float: '<path d="M12 2v20M6 5h12M4 18c3-3 5 3 8 0s5 3 8 0"/><rect x="7" y="9" width="10" height="6" rx="3" fill="var(--panel)"/>',

  shield: '<path d="M12 3 4 6v6c0 4 4 7 8 9 4-2 8-5 8-9V6Z"/><path d="m8 12 3 3 5-6"/>'
};

function iconSVG(name) {
  return `
    <svg viewBox="0 0 24 24"
         fill="none"
         stroke="currentColor"
         stroke-width="1.7"
         stroke-linecap="round"
         stroke-linejoin="round"
         aria-hidden="true"
         focusable="false">
      ${icons[name] || icons.drop}
    </svg>
  `;
}

document.querySelectorAll('[data-icon]')
  .forEach(el => {
    el.innerHTML = iconSVG(el.dataset.icon);
  });

// ==========================================
// 03. NAVEGACION
// ==========================================

const pages = {
  overview: ['overview', 'Inicio'],
  monitor: ['radar', 'Tinacos y sensores'],
  distribution: ['flow', 'Distribución'],
  history: ['history', 'Historial'],
  alerts: ['bell', 'Alertas'],
  settings: ['settings', 'Configuración'],
  housing: ['home', 'Mi vivienda']
};

let firebase = null;
let role = null;
let demo = false;
let device = null;
let connected = false;

let offset = 0;
let history = [];
let unsubscribers = [];
let generation = 0;

let lastSample = null;
let demoTimer = null;
let houseData = null;
let sensorData = null;

function closeMenu() {
  $('topNavigation').classList.remove('open');
  show('overlay', false);
  $('menuToggle').setAttribute(
    'aria-expanded', 'false'
  );
}

function go(page) {
  if (!role?.pages.includes(page)) return;

  document.querySelectorAll('.page')
    .forEach(el => {
      el.hidden = el.id !== page;
    });

  document.querySelectorAll('.nav-link')
    .forEach(el => {
      const active = el.dataset.page === page;

      el.classList.toggle('active', active);

      if (active) {
        el.setAttribute('aria-current', 'page');
      } else {
        el.removeAttribute('aria-current');
      }
    });

  text('crumb', pages[page][1]);
  closeMenu();
  window.scrollTo(0, 0);
}

function openShell(selectedRole) {
  role = selectedRole;

  text('roleLabel', role.name);

  $('navigation').replaceChildren();

  for (const id of role.pages) {
    const btn = document.createElement('button');
    btn.className = 'nav-link';
    btn.dataset.page = id;

    const symbol = document.createElement('span');
    symbol.className = 'nav-icon';
    symbol.innerHTML = iconSVG(pages[id][0]);

    symbol.setAttribute('aria-hidden', 'true');

    btn.append(
      symbol,
      document.createTextNode(pages[id][1])
    );

    btn.addEventListener('click', () => go(id));

    $('navigation').append(btn);
  }

  show('welcome', false);
  show('shell', true);
  show('demoBanner', demo);

  text(
    'dateLabel',
    new Intl.DateTimeFormat(
      'es-MX', { dateStyle: 'long' }
    ).format(new Date())
  );

  if (role.house) {
    text('houseTitle', role.name);
  }

  go(role.pages[0]);

  if (!demo && !role.house) {
    renderRealSensors();
  }
}

// ==========================================
// 04. CONTROL DE SESIONES
// ==========================================

function loginMessage(message, failed = false) {
  text('loginMessage', message);
  $('loginMessage').classList.toggle(
    'fail', failed
  );
}

function errorBanner(message) {
  text('errorBanner', message);
  show('errorBanner', Boolean(message));
}

function stopSession() {
  generation++;

  for (const unsubscribe of unsubscribers) {
    unsubscribe();
  }

  unsubscribers = [];

  clearInterval(demoTimer);
  demoTimer = null;

  role = null;
  demo = false;
  device = null;
  connected = false;
  offset = 0;
  history = [];
  lastSample = null;
  houseData = null;
  sensorData = null;

  errorBanner('');

  renderDevice();
  renderHistory();
  renderHouse(null);
  renderDemoTanks(false);

  text(
    'realDistribution',
    'Distribución pendiente de calibración o flujo'
  );

  closeMenu();
  show('shell', false);
  show('welcome', true);
}

// ==========================================
// 05. ESTADO DEL ESP32
// ==========================================

function freshness() {
  if (!device ||
      !number(device.ultimaActualizacion)) {
    return 'unknown';
  }

  if (!connected && !demo) {
    return 'offline';
  }

  const age =
    Date.now() + offset -
    device.ultimaActualizacion;

  return age >= -5000 && age <= 20000
    ? 'online'
    : 'offline';
}

function duration(seconds) {
  if (!number(seconds) || seconds < 0) {
    return '—';
  }

  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor(s % 3600 / 60);

  return `${h ? h + ' h ' : ''}${m ? m + ' min ' : ''}${s % 60} s`;
}

function renderDevice() {
  const state = freshness();

  const label = state === 'online'
    ? 'En línea'
    : state === 'offline'
      ? 'Sin conexión reciente'
      : 'Sin lectura';

  text(
    'connection',
    demo
      ? 'Demostración'
      : role?.house
        ? connected
          ? 'Portal conectado'
          : 'Portal sin conexión'
        : label
  );

  $('connection').className =
    'pill ' +
    (
      demo
        ? 'neutral'
        : role?.house
          ? connected ? 'online' : 'offline'
          : state === 'unknown'
            ? 'neutral'
            : state
    );

  const strip =
    document.querySelector('.system-strip');

  strip.dataset.state =
    demo ? 'unknown' : state;

  text(
    'systemHeadline',
    demo
      ? 'Laboratorio visual · datos ficticios'
      : state === 'online'
        ? 'Tu ESP32 está en línea'
        : state === 'offline'
          ? 'El ESP32 no tiene lecturas recientes'
          : 'Esperando telemetría'
  );

  text(
    'systemDetail',
    demo
      ? 'Explora el agua animada sin accionar equipos.'
      : state === 'online'
        ? 'Recibiendo información desde Firebase.'
        : 'Revisa la conexión del dispositivo si el estado persiste.'
  );

  const signal = number(device?.senal)
    ? device.senal
    : null;

  text(
    'signalBig',
    signal === null ? '—' : `${signal} dBm`
  );

  const bars =
    signal === null || state !== 'online'
      ? 0
      : signal >= -50 ? 5
      : signal >= -60 ? 4
      : signal >= -70 ? 3
      : signal >= -80 ? 2
      : 1;

  document.querySelectorAll('#signalBars i')
    .forEach((el, i) => {
      el.classList.toggle('on', i < bars);
    });

  text('deviceState', demo ? 'Simulado' : label);

  text(
    'lastUpdate',
    number(device?.ultimaActualizacion)
      ? 'Última lectura: ' +
        new Date(
          device.ultimaActualizacion
        ).toLocaleTimeString('es-MX')
      : 'Sin datos'
  );

  text(
    'rssi',
    number(device?.senal)
      ? `${device.senal} dBm`
      : '—'
  );

  text('uptime', duration(device?.tiempoActivo));
  text('wifiName', display(device?.wifi));
  text('ipAddress', display(device?.ip));
  text('deviceName', display(device?.nombre));

  text(
    'alertText',
    state === 'online'
      ? 'Se reciben actualizaciones recientes del ESP32.'
      : state === 'offline'
        ? 'No hay datos recientes. Revisa la alimentación, internet o Firebase.'
        : 'Aún no hay lecturas del dispositivo.'
  );
}

function receiveDevice(value) {
  device = value;
  renderDevice();

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
}

// ==========================================
// 06. PORTAL DE CADA VIVIENDA
// ==========================================

function renderHouse(data) {
  const recent =
    data &&
    connected &&
    number(data.ultimaActualizacion) &&
    Math.abs(
      Date.now() + offset -
      data.ultimaActualizacion
    ) <= 20000;

  text(
    'houseSupply',
    recent && number(data.frecuenciaHz)
      ? data.frecuenciaHz > 0
        ? 'Flujo detectado'
        : 'Sin pulsos en el intervalo'
      : 'Sin lectura reciente'
  );

  text(
    'houseFloat',
    recent
      ? estadoFlotador(data)
      : 'Sin lectura reciente'
  );

  text(
    'houseLiters',
    recent && number(data.litros)
      ? `${data.litros} L`
      : '—'
  );

  text(
    'houseNotice',
    recent
      ? 'Distancia: ' + estadoDistancia(data) +
        ' · ' + estadoFlotador(data) +
        (
          number(data.capacidadLitros)
            ? ' · Capacidad: ' +
              data.capacidadLitros + ' L'
            : ''
        ) +
        ' · Pulsos desde arranque: ' +
        display(data.pulsos) +
        ' · Bomba manual.'
      : 'Sin información reciente.'
  );
}

// ==========================================
// 07. HISTORIAL Y GRAFICA WIFI
// ==========================================

function renderHistory() {
  const rows = $('historyRows');
  rows.replaceChildren();

  for (const entry of [...history].reverse()) {
    const tr = document.createElement('tr');

    for (const value of [
      new Date(entry.time).toLocaleString('es-MX'),
      `${entry.signal} dBm`,
      duration(entry.uptime)
    ]) {
      const td = document.createElement('td');
      td.textContent = value;
      tr.append(td);
    }

    rows.append(tr);
  }

  show('historyEmpty', history.length === 0);
  show('signalChart', history.length > 0);
  show('chartEmpty', history.length === 0);

  const recent = history.slice(-30);

  const points = recent.map((r, i) => {
    const x =
      10 + 320 * i / Math.max(1, recent.length - 1);

    const y =
      120 - 110 *
      Math.max(0, Math.min(1, (r.signal + 100) / 70));

    return `${x},${y}`;
  });

  if (points.length === 1) {
    points.push(
      points[0].replace(/^10,/, '12,')
    );
  }

  $('signalLine').setAttribute(
    'points', points.join(' ')
  );

  $('signalArea').setAttribute(
    'd',
    points.length
      ? `M${points[0].split(',')[0]},120 L${points.join(' L')} L${points[points.length - 1].split(',')[0]},120 Z`
      : ''
  );
}

function exportHistory() {
  const rows = [
    'fecha_iso,senal_dbm,tiempo_activo_segundos',

    ...history.map(r =>
      `${new Date(r.time).toISOString()},${r.signal},${number(r.uptime) ? r.uptime : ''}`
    )
  ];

  const blob = new Blob(
    ['\ufeff' + rows.join('\n')],
    { type: 'text/csv;charset=utf-8' }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;

  a.download = demo
    ? 'aquasolidaria-demo.csv'
    : 'aquasolidaria-conexion.csv';

  a.click();

  setTimeout(
    () => URL.revokeObjectURL(url), 1000
  );
}

// ==========================================
// 08. FIREBASE Y AUTENTICACION
// ==========================================

async function initFirebase() {
  try {
    const [config, authSDK, dbSDK] =
      await Promise.all([
        import('./firebase-config.js'),

        import(
          'https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js'
        ),

        import(
          'https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js'
        )
      ]);

    firebase = {
      ...config,
      ...authSDK,
      ...dbSDK
    };

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
          loginMessage('Ingresa tus credenciales.');
          return;
        }

        const selectedRole = roles[user.uid];

        if (!selectedRole) {
          firebase.signOut(firebase.auth)
            .catch(() => {});

          loginMessage(
            'Esta cuenta no tiene acceso al portal.',
            true
          );

          return;
        }

        openShell(selectedRole);
        startListeners();
      }
    );

    $('loginButton').disabled = false;

    loginMessage('Ingresa tus credenciales.');

  } catch (error) {
    console.error(
      'No se pudo inicializar Firebase', error
    );

    loginMessage(
      'No se pudo iniciar Firebase. Comprueba internet y abre la página con un servidor local.',
      true
    );
  }
}

function startListeners() {
  const token = generation;

  const listen = (path, fn) => {
    const unsubscribe = firebase.onValue(

      firebase.ref(firebase.db, path),

      snapshot => {
        if (token === generation) {
          fn(snapshot.val());
        }
      },

      error => {
        if (token !== generation) return;

        errorBanner(
          'No se pudo leer ' + path +
          '. Revisa los permisos de Firebase.'
        );

        if (path === 'dispositivo') {
          device = null;
          renderDevice();
        }

        if (path.startsWith('viviendas/')) {
          houseData = null;
          renderHouse(null);
        }

        if (path === 'sensores') {
          sensorData = null;
          renderRealSensors();
        }

        console.error(error.code);
      }
    );

    unsubscribers.push(unsubscribe);
  };

  listen('.info/connected', value => {
    connected = value === true;

    renderDevice();

    if (role?.house && !connected) {
      renderHouse(null);
    }
  });

  listen('.info/serverTimeOffset', value => {
    offset = number(value) ? value : 0;
    renderDevice();
  });

  if (role.house) {
    listen(
      'viviendas/' + role.house,
      value => {
        houseData = value;
        renderHouse(value);
      }
    );

  } else {
    listen('dispositivo', receiveDevice);

    listen('sensores', value => {
      sensorData = value;
      renderRealSensors();
    });
  }

  // No se consultan ni se envian comandos
  // de cambio remoto de red WiFi.
}

async function login(event) {
  event.preventDefault();

  if (!firebase) return;

  $('loginButton').disabled = true;

  loginMessage('Verificando credenciales…');

  try {
    await firebase.signInWithEmailAndPassword(
      firebase.auth,
      $('email').value.trim(),
      $('password').value
    );

  } catch (error) {
    const messages = {
      'auth/network-request-failed':
        'No se pudo conectar a Firebase.',

      'auth/too-many-requests':
        'Demasiados intentos. Intenta más tarde.',

      'auth/user-disabled':
        'La cuenta está deshabilitada.',

      'auth/invalid-credential':
        'Correo o contraseña incorrectos.'
    };

    loginMessage(
      messages[error.code] ||
      'No se pudo iniciar sesión. Código: ' +
      (error.code || 'desconocido'),
      true
    );

  } finally {
    $('password').value = '';
    $('loginButton').disabled = false;
  }
}

// ==========================================
// 09. ANIMACION DE LOS TINACOS
// ==========================================

function tank(waterId, levelId, value) {
  const valid =
    number(value) &&
    value >= 0 &&
    value <= 100;

  $(waterId).classList.toggle(
    'measured', valid && value > 0
  );

  $(waterId).style.height =
    valid ? `${value}%` : '0%';

  text(
    levelId,
    valid ? `${value}%` : '—'
  );
}

// ==========================================
// 10. MODO DEMOSTRACION
// ==========================================

let demoLevel = 73;
let demoPumps = [true, true];

function renderDemoTanks(active) {
  const level = active ? demoLevel : null;

  tank('mainWater', 'mainLevel', level);
  tank('water1', 'level1', active ? 52 : null);
  tank('water2', 'level2', active ? 48 : null);

  text(
    'mainLevelNote',
    active ? 'Nivel simulado' : 'Sin medición'
  );

  text(
    'note1',
    active ? 'Nivel simulado' : 'Sin lectura'
  );

  text(
    'note2',
    active ? 'Nivel simulado' : 'Sin lectura'
  );

  text(
    'availableWater',
    active
      ? `${(demoLevel * 40).toLocaleString('es-MX')} L`
      : '—'
  );

  text(
    'waterMetricNote',
    active
      ? 'Volumen ilustrativo'
      : 'Pendiente de medición'
  );

  text(
    'networkMode',
    active ? 'Simulación' : 'Sin sensores'
  );

  show('demoControls', active);

  $('demoLevel').value = demoLevel;

  text('demoLevelValue', `${demoLevel}%`);

  for (let i = 0; i < 2; i++) {
    const n = i + 1;

    const running =
      active &&
      demoLevel > 0 &&
      demoPumps[i];

    $('flow' + n).classList.toggle(
      'active', running
    );

    $('pumpMark' + n).classList.toggle(
      'running', running
    );

    $('demoPump' + n).setAttribute(
      'aria-pressed',
      String(demoPumps[i])
    );

    text(
      'demoPump' + n,
      `Ramal ${n} · ${demoPumps[i] ? 'ON' : 'OFF'}`
    );

    text(
      'pump' + n + 'State',
      !active
        ? 'Sin configurar'
        : running
          ? 'Flujo simulado'
          : demoPumps[i]
            ? 'Sin agua (simulado)'
            : 'Inactivo (simulado)'
    );
  }

  for (const id of [
    'sensorUltra',
    'sensorFloat1',
    'sensorFloat2',
    'sensorFlow'
  ]) {
    text(
      id,
      active ? 'Simulación' : 'Pendiente'
    );
  }
}

function startDemo() {
  stopSession();

  demo = true;
  connected = true;
  demoLevel = 73;
  demoPumps = [true, true];

  openShell({
    name: 'Demostración',
    pages: [
      'overview', 'monitor', 'distribution',
      'history', 'alerts', 'settings'
    ]
  });

  renderDemoTanks(true);

  let seconds = 0;

  const sample = () => {
    seconds += 5;

    receiveDevice({
      nombre: 'ESP32 de ejemplo',
      wifi: 'Red simulada',
      ip: '—',
      senal:
        -60 + Math.round(Math.sin(seconds / 12) * 6),
      tiempoActivo: seconds,
      ultimaActualizacion: Date.now()
    });
  };

  sample();

  demoTimer = setInterval(sample, 5000);
}

// ==========================================
// 11. INTERPRETACION DE MEDICIONES REALES
// ==========================================

function cm(v) {
  return number(v)
    ? v.toFixed(1) + ' cm'
    : 'Sin lectura válida';
}

function estadoDistancia(x) {
  if (
    number(x.distanciaCm) &&
    x.distanciaCm >= 0
  ) {
    return cm(x.distanciaCm);
  }

  if (x.estadoUltrasonico === 'zona_ciega') {
    return 'Zona ciega (eco no fiable)';
  }

  if (x.estadoUltrasonico === 'sin_eco') {
    return 'Sin respuesta ECHO';
  }

  if (x.estadoUltrasonico === 'fuera_rango') {
    return 'Eco fuera de rango';
  }

  return 'Sin lectura válida';
}

function estadoFlotador(x) {
  if (x.lleno === true) {
    return 'LLENO según flotador';
  }

  if (x.lleno === false) {
    return 'Debajo del umbral';
  }

  if (typeof x.flotador === 'boolean') {
    return (
      x.flotador
        ? 'Contacto cerrado'
        : 'Contacto abierto'
    ) + ' · sin calibrar';
  }

  return 'Sin lectura';
}

function notaTanque(x, vivienda = false) {
  return estadoDistancia(x) +

    (
      vivienda
        ? ' · ' + estadoFlotador(x)
        : ''
    ) +

    (
      number(x.capacidadLitros)
        ? ' · Capacidad: ' +
          (
            x.capacidadLitros < 1
              ? Math.round(x.capacidadLitros * 1000) +
                ' ml'
              : x.capacidadLitros + ' L'
          )
        : ''
    );
}

function renderRealSensors() {
  if (demo || !role || role.house) return;

  const d = sensorData;

  const fresh =
    connected &&
    number(d?.ultimaActualizacion) &&
    Math.abs(
      Date.now() + offset - d.ultimaActualizacion
    ) <= 20000;

  const p = fresh ? d.principal || {} : {};
  const a = fresh ? d.casa1 || {} : {};
  const b = fresh ? d.casa2 || {} : {};

  tank('mainWater', 'mainLevel', p.nivel);
  tank('water1', 'level1', a.nivel);
  tank('water2', 'level2', b.nivel);

  // El flotador detecta el umbral de llenado
  // sin inventar un porcentaje exacto.

  for (const [i, x] of [[1, a], [2, b]]) {
    if (!number(x.nivel) && x.lleno === true) {
      text('level' + i, 'Lleno');
    }
  }

  text('mainLevelNote', notaTanque(p));
  text('note1', notaTanque(a, true));
  text('note2', notaTanque(b, true));

  text(
    'availableWater',
    number(p.volumen)
      ? p.volumen.toFixed(2) + ' L'
      : '—'
  );

  text(
    'waterMetricNote',
    'Volumen sujeto a calibración'
  );

  text(
    'networkMode',
    fresh ? 'Monitoreo manual' : 'Sin lectura reciente'
  );

  text(
    'sensorUltra',
    [p, a, b].map(estadoDistancia).join(' / ')
  );

  text('sensorFloat1', estadoFlotador(a));
  text('sensorFloat2', estadoFlotador(b));

  // Alertas de llenado.

  if (fresh && (a.lleno === true || b.lleno === true)) {
    text(
      'alertText',

      'Umbral de llenado alcanzado: ' +

      [
        a.lleno === true ? 'Vivienda 1' : '',
        b.lleno === true ? 'Vivienda 2' : ''
      ].filter(Boolean).join(' y ') +

      '. Apaga manualmente la bomba.'
    );
  }

  const flow = x =>
    number(x.caudal)
      ? x.caudal.toFixed(2) + ' L/min'
      : number(x.pulsos)
        ? x.pulsos + ' pulsos (sin calibrar)'
        : '—';

  text(
    'sensorFlow',
    'V1: ' + flow(a) + ' · V2: ' + flow(b)
  );

  // Animar ramales solamente si se detecta flujo.

  for (const [i, x] of [[1, a], [2, b]]) {
    text(
      'pump' + i + 'State',
      number(x.frecuenciaHz)
        ? x.frecuenciaHz > 0
          ? 'Flujo detectado'
          : 'Sin pulsos'
        : 'Sin lectura'
    );

    $('flow' + i).classList.toggle(
      'active',
      number(x.frecuenciaHz) &&
      x.frecuenciaHz > 0
    );

    $('pumpMark' + i).classList.remove('running');
  }

  // Calcular el reparto con litros reales.

  text(
    'realDistribution',

    number(a.litros) &&
    number(b.litros) &&
    a.litros + b.litros > 0

      ? 'V1: ' +
        (
          100 * a.litros / (a.litros + b.litros)
        ).toFixed(1) +

        '% · V2: ' +

        (
          100 * b.litros / (a.litros + b.litros)
        ).toFixed(1) +

        '% (desde arranque)'

      : 'Distribución pendiente de calibración o flujo'
  );
}

// ==========================================
// 12. MODO CLARO Y OSCURO
// ==========================================

function toggleTheme() {
  const next =
    document.documentElement.dataset.theme === 'dark'
      ? 'light'
      : 'dark';

  document.documentElement.dataset.theme = next;

  try {
    localStorage.setItem('aqua-theme', next);
  } catch {}
}

try {
  const saved = localStorage.getItem('aqua-theme');

  if (['light', 'dark'].includes(saved)) {
    document.documentElement.dataset.theme = saved;
  }
} catch {}

// ==========================================
// 13. EVENTOS DE LA INTERFAZ
// ==========================================

$('themeButton').addEventListener(
  'click', toggleTheme
);

$('themePublic').addEventListener(
  'click', toggleTheme
);

$('loginForm').addEventListener(
  'submit', login
);

$('demoButton').addEventListener(
  'click', startDemo
);

$('showPassword').addEventListener(
  'click',

  () => {
    const visible = $('password').type === 'password';

    $('password').type =
      visible ? 'text' : 'password';

    text(
      'showPassword',
      visible ? 'Ocultar' : 'Ver'
    );

    $('showPassword').setAttribute(
      'aria-pressed', String(visible)
    );
  }
);

$('logout').addEventListener(
  'click',

  async () => {
    if (demo) {
      stopSession();
      return;
    }

    try {
      await firebase.signOut(firebase.auth);
    } catch {
      errorBanner(
        'No se pudo cerrar sesión. Intenta nuevamente.'
      );
    }
  }
);

$('menuToggle').addEventListener(
  'click',

  () => {
    const open =
      $('topNavigation').classList.toggle('open');

    show('overlay', open);

    $('menuToggle').setAttribute(
      'aria-expanded', String(open)
    );
  }
);

window.matchMedia('(min-width: 901px)')
  .addEventListener('change', e => {
    if (e.matches) {
      closeMenu();
    }
  });

$('overlay').addEventListener(
  'click', closeMenu
);

document.addEventListener(
  'keydown',

  e => {
    if (e.key === 'Escape') {
      closeMenu();
    }
  }
);

$('export').addEventListener(
  'click', exportHistory
);

// Controles de la demostracion.

$('demoLevel').addEventListener(
  'input',

  e => {
    if (demo) {
      demoLevel = Number(e.target.value);
      renderDemoTanks(true);
    }
  }
);

for (let i = 0; i < 2; i++) {
  $('demoPump' + (i + 1)).addEventListener(
    'click',

    () => {
      if (demo) {
        demoPumps[i] = !demoPumps[i];
        renderDemoTanks(true);
      }
    }
  );
}

$('demoReset').addEventListener(
  'click',

  () => {
    if (demo) {
      demoLevel = 73;
      demoPumps = [true, true];

      renderDemoTanks(true);
    }
  }
);

// Actualizar la interfaz y verificar la
// antiguedad de las mediciones cada segundo.

setInterval(() => {
  if (role) {
    renderDevice();

    if (role.house) {
      renderHouse(houseData);
    } else if (!demo) {
      renderRealSensors();
    }
  }
}, 1000);

// Iniciar AquaSolidaria.

initFirebase();
