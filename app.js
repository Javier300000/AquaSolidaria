/** AQUASOLIDARIA · LÓGICA DE LA INTERFAZ
 * 01. Roles y estado; 02. Navegación; 03. Telemetría; 04. Historial;
 * 05. Sesiones y Firebase; 06. Demostración; 07. Eventos del navegador.
 * No se escriben comandos físicos en esta versión. Las reglas del servidor
 * son la seguridad real; ocultar botones en JavaScript no concede permisos.
 */

// 01. Utilidades y estado de la aplicación.
const $ = id => document.getElementById(id);
const text = (id, value) => { $(id).textContent = value; };
// toggleAttribute funciona tanto en HTML como en SVG (por ejemplo la gráfica).
const show = (id, visible) => { $(id).toggleAttribute('hidden', !visible); };
const number = v => typeof v === 'number' && Number.isFinite(v);
const display = v => v == null || v === '' ? '—' : String(v);
const roles = {
  '3EzO6T9OXhP1vRfdhvpr7EgKCtC3': { name: 'Administrador', pages: ['overview','monitor','distribution','history','alerts','settings'] },
  'E5MLK89eI8XmitvAkcHzAj4mOg42': { name: 'Operador', pages: ['overview','monitor','distribution','history','alerts'] },
  'vD4sEWQ9ASOAltrggXYku0bAhBz1': { name: 'Vivienda 1', house: 'casa1', pages: ['housing'] },
  'avzzZFclg8h7XGHzvvahg6Fb5WZ2': { name: 'Vivienda 2', house: 'casa2', pages: ['housing'] }
};
// La cuenta del ESP32 se excluye del portal: solo es para el firmware.
// 01A. Iconos SVG originales: se reutiliza el mismo estilo en todas las pantallas.
// Los trazados son constantes locales, no datos recibidos de Firebase.
const icons = {
  "drop": "<path d=\"M12 2C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-13Z\"/><path d=\"M8 15c1-2 3 2 5 0s3-2 4-1\"/>",
  "waves": "<path d=\"M2 6c3 0 3-3 6-3s3 3 6 3 3-3 6-3h2M2 12c3 0 3-3 6-3s3 3 6 3 3-3 6-3h2M2 18c3 0 3-3 6-3s3 3 6 3 3-3 6-3h2\"/>",
  "overview": "<rect x=\"3\" y=\"3\" width=\"7\" height=\"7\" rx=\"2\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\" rx=\"2\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"2\"/><path d=\"M17.5 12c-1.4 2-3.5 4-3.5 6a3.5 3.5 0 0 0 7 0c0-2-2.1-4-3.5-6Z\"/>",
  "radar": "<path d=\"M4 8a11 11 0 0 1 16 0M7 11a7 7 0 0 1 10 0M10 14a3 3 0 0 1 4 0\"/><rect x=\"5\" y=\"16\" width=\"14\" height=\"5\" rx=\"2\"/><path d=\"M8 19h8\"/>",
  "flow": "<path d=\"M12 3v6H5v10m7-10h7v10M2 16l3 3 3-3m8 0 3 3 3-3\"/><circle cx=\"12\" cy=\"3\" r=\"1\"/>",
  "history": "<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"3\"/><path d=\"M8 7h8M8 12h2m-2 5h2m3-5h3m-3 5h3\"/>",
  "bell": "<path d=\"M18 8a6 6 0 1 0-12 0c0 6-3 7-3 9h18c0-2-3-3-3-9M10 21h4\"/>",
  "settings": "<path d=\"M4 6h16M4 12h16M4 18h16\"/><circle cx=\"9\" cy=\"6\" r=\"2\" fill=\"var(--panel)\"/><circle cx=\"15\" cy=\"12\" r=\"2\" fill=\"var(--panel)\"/><circle cx=\"8\" cy=\"18\" r=\"2\" fill=\"var(--panel)\"/>",
  "home": "<path d=\"M3 11 12 3l9 8M5 10v11h14V10\"/><path d=\"M12 12c-2 3-3 4-3 5a3 3 0 0 0 6 0c0-1-1-2-3-5Z\"/>",
  "user": "<circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21v-2a8 8 0 0 1 16 0v2\"/>",
  "theme": "<path d=\"M12 3a9 9 0 1 0 9 9A7 7 0 0 1 12 3Z\"/><path d=\"M18 3v4m-2-2h4\"/>",
  "logout": "<path d=\"M10 4H4v16h6m4-13 5 5-5 5M9 12h10\"/>",
  "menu": "<path d=\"M3 6h18M3 12h18M3 18h18\"/>",
  "arrow": "<path d=\"M4 12h15m-6-6 6 6-6 6\"/>",
  "download": "<path d=\"M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4\"/>",
  "chip": "<rect x=\"5\" y=\"5\" width=\"14\" height=\"14\" rx=\"3\"/><rect x=\"9\" y=\"9\" width=\"6\" height=\"6\" rx=\"1\"/><path d=\"M9 2v3m6-3v3M9 19v3m6-3v3M2 9h3m-3 6h3m14-6h3m-3 6h3\"/>",
  "wifi": "<path d=\"M2 8a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0m-11 4a5 5 0 0 1 8 0\"/><circle cx=\"12\" cy=\"20\" r=\"1\" fill=\"currentColor\"/>",
  "clock": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 6v6l4 2\"/>",
  "pump": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 12c-7 0-5-8 0-5 2 1 0 5 0 5Zm0 0c4-6 10-1 5 2-2 1-5-2-5-2Zm0 0c4 6-3 10-5 5-1-2 5-5 5-5Z\"/>",
  "float": "<path d=\"M12 2v20M6 5h12M4 18c3-3 5 3 8 0s5 3 8 0\"/><rect x=\"7\" y=\"9\" width=\"10\" height=\"6\" rx=\"3\" fill=\"var(--panel)\"/>",
  "shield": "<path d=\"M12 3 4 6v6c0 4 4 7 8 9 4-2 8-5 8-9V6Z\"/><path d=\"m8 12 3 3 5-6\"/>"
};
function iconSVG(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${icons[name] || icons.drop}</svg>`;
}
document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = iconSVG(el.dataset.icon); });

const pages = {
  overview: ['overview','Inicio'], monitor: ['radar','Tinacos y sensores'], distribution: ['flow','Distribución'],
  history: ['history','Historial'], alerts: ['bell','Alertas'], settings: ['settings','Configuración'], housing: ['home','Mi vivienda']
};
let firebase = null, role = null, demo = false, device = null, connected = false;
let offset = 0, history = [], unsubscribers = [], generation = 0;
let lastSample = null, demoTimer = null;
let wifiState=null, wifiPending=null, wifiNotice="", wifiSending=false;

// 02. Navegación: un solo HTML contiene todas las pantallas; se muestra una a la vez.
function closeMenu() {
  $('topNavigation').classList.remove('open'); show('overlay', false);
  $('menuToggle').setAttribute('aria-expanded', 'false');
}
function go(page) {
  if (!role?.pages.includes(page)) return;
  document.querySelectorAll('.page').forEach(el => { el.hidden = el.id !== page; });
  document.querySelectorAll('.nav-link').forEach(el => {
    const active = el.dataset.page === page;
    el.classList.toggle('active', active);
    if (active) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current');
  });
  text('crumb', pages[page][1]); closeMenu(); window.scrollTo(0,0);
}
function openShell(selectedRole) {
  role = selectedRole;
  text('roleLabel', role.name);
  $('navigation').replaceChildren();
  for (const id of role.pages) {
    const btn = document.createElement('button'); btn.className = 'nav-link'; btn.dataset.page = id;
    const symbol = document.createElement('span'); symbol.className = 'nav-icon'; symbol.innerHTML = iconSVG(pages[id][0]); symbol.setAttribute('aria-hidden','true');
    btn.append(symbol, document.createTextNode(pages[id][1])); btn.addEventListener('click', () => go(id));
    $('navigation').append(btn);
  }
  show('welcome',false); show('shell',true); show('demoBanner',demo);
  text('dateLabel', new Intl.DateTimeFormat('es-MX',{dateStyle:'long'}).format(new Date()));
  if (role.house) text('houseTitle', role.name);
  go(role.pages[0]);
}
function loginMessage(message, failed = false) {
  text('loginMessage',message); $('loginMessage').classList.toggle('fail',failed);
}
function errorBanner(message) { text('errorBanner',message); show('errorBanner',Boolean(message)); }
function stopSession() {
  // Cancelamos listeners para no recibir datos de una cuenta anterior.
  generation++;
  for (const unsubscribe of unsubscribers) unsubscribe();
  unsubscribers = []; clearInterval(demoTimer); demoTimer = null;
  role = null; demo = false; device = null; connected = false; offset = 0; history = []; lastSample = null; houseData = null;
  wifiState=null; wifiPending=null; wifiNotice=""; wifiSending=false;
  errorBanner(''); renderDevice(); renderHistory(); renderHouse(null); renderDemoTanks(false);
  closeMenu(); show('shell',false); show('welcome',true);
}

// 03. Telemetría: el texto guardado "Conectado" no prueba que siga en línea.
// Combinamos la conexión del navegador a Firebase con la fecha del último envío.
// El ESP32 escribe cada 5 segundos; usamos un margen de 20 segundos.
function freshness() {
  if (!device || !number(device.ultimaActualizacion)) return 'unknown';
  if (!connected && !demo) return 'offline';
  const age = Date.now() + offset - device.ultimaActualizacion;
  return age >= -5000 && age <= 20000 ? 'online' : 'offline';
}
function duration(seconds) {
  if (!number(seconds) || seconds < 0) return '—';
  const s = Math.floor(seconds), h = Math.floor(s/3600), m = Math.floor(s%3600/60);
  return `${h ? h+' h ' : ''}${m ? m+' min ' : ''}${s%60} s`;
}
function renderDevice() {
  const state = freshness();
  const label = state === 'online' ? 'En línea' : state === 'offline' ? 'Sin conexión reciente' : 'Sin lectura';
  text('connection', demo ? 'Demostración' : role?.house ? (connected ? 'Portal conectado' : 'Portal sin conexión') : label);
  $('connection').className = 'pill '+(demo ? 'neutral' : role?.house ? (connected?'online':'offline') : state==='unknown'?'neutral':state);
  // La banda y el medidor de señal reflejan la frescura de la telemetría.
  const strip = document.querySelector('.system-strip');
  strip.dataset.state = demo ? 'unknown' : state;
  text('systemHeadline', demo ? 'Laboratorio visual · datos ficticios' : state === 'online' ? 'Tu ESP32 está en línea' : state === 'offline' ? 'El ESP32 no tiene lecturas recientes' : 'Esperando telemetría');
  text('systemDetail', demo ? 'Explora el agua animada sin accionar equipos.' : state === 'online' ? 'Recibiendo información desde Firebase.' : 'Revisa la conexión del dispositivo si el estado persiste.');
  const signal = number(device?.senal) ? device.senal : null;
  text('signalBig', signal === null ? '—' : `${signal} dBm`);
  const bars = signal === null || state !== 'online' ? 0 : signal >= -50 ? 5 : signal >= -60 ? 4 : signal >= -70 ? 3 : signal >= -80 ? 2 : 1;
  document.querySelectorAll('#signalBars i').forEach((el,i)=>el.classList.toggle('on',i<bars));
  text('deviceState', demo ? 'Simulado' : label);
  text('lastUpdate', number(device?.ultimaActualizacion) ? 'Última lectura: '+new Date(device.ultimaActualizacion).toLocaleTimeString('es-MX') : 'Sin datos');
  // Si los datos son viejos, se identifican explícitamente como última lectura.
  text('rssi', number(device?.senal) ? `${device.senal} dBm` : '—');
  text('uptime', duration(device?.tiempoActivo));
  text('wifiName',display(device?.wifi)); text('ipAddress',display(device?.ip)); text('deviceName',display(device?.nombre));
  text('alertText', state==='online' ? 'Se reciben actualizaciones recientes del ESP32.' : state==='offline' ? 'No hay datos recientes. Revisa la alimentación, internet o Firebase.' : 'Aún no hay lecturas del dispositivo.');
}
function receiveDevice(value) {
  device = value; renderDevice();
  // Evitamos duplicar muestras cuando Firebase vuelve a emitir la misma lectura.
  if (number(value?.ultimaActualizacion) && number(value?.senal) && value.ultimaActualizacion !== lastSample) {
    lastSample = value.ultimaActualizacion;
    history.push({ time: value.ultimaActualizacion, signal: value.senal, uptime: value.tiempoActivo });
    if (history.length > 200) history.shift();
    renderHistory();
  }
}
function renderHouse(data) {
  // Solo se consulta /viviendas/casa1 o /viviendas/casa2 según el UID.
  // Los nombres de los campos son un contrato previsto para el futuro firmware.
  const recent = data && connected && number(data.ultimaActualizacion) && Math.abs(Date.now()+offset-data.ultimaActualizacion)<=20000;
  text('houseSupply',recent && typeof data.suministro==='boolean' ? (data.suministro?'Activo':'Inactivo') : 'Sin lectura reciente');
  text('houseFloat',recent && typeof data.flotador==='boolean' ? (data.flotador?'Contacto cerrado':'Contacto abierto') : 'Sin lectura reciente');
  text('houseLiters',recent && number(data.litros) ? `${data.litros} L` : '—');
  text('houseNotice',recent?'Datos recientes de tu vivienda.':'Sin información reciente. Los sensores todavía están pendientes de integración.');
}

// 04. Historial: guarda muestras solo en memoria del navegador, no modifica Firebase.
function renderHistory() {
  const rows = $('historyRows'); rows.replaceChildren();
  for (const entry of [...history].reverse()) {
    const tr = document.createElement('tr');
    for (const value of [new Date(entry.time).toLocaleString('es-MX'), `${entry.signal} dBm`, duration(entry.uptime)]) {
      const td = document.createElement('td'); td.textContent = value; tr.append(td);
    }
    rows.append(tr);
  }
  show('historyEmpty',history.length===0); show('signalChart',history.length>0); show('chartEmpty',history.length===0);
  const recent = history.slice(-30);
  // Convertimos dBm a coordenadas SVG; la gráfica no requiere Chart.js.
  const points = recent.map((r,i)=>`${10+320*i/Math.max(1,recent.length-1)},${120-110*Math.max(0,Math.min(1,(r.signal+100)/70))}`);
  if(points.length===1) points.push(points[0].replace(/^10,/, '12,'));
  $('signalLine').setAttribute('points',points.join(' '));
  // Cerramos el trazado hacia el eje inferior para colorear el área del gráfico.
  $('signalArea').setAttribute('d', points.length ? `M${points[0].split(',')[0]},120 L${points.join(' L')} L${points[points.length-1].split(',')[0]},120 Z` : '');
}
function exportHistory() {
  const rows = ['fecha_iso,senal_dbm,tiempo_activo_segundos', ...history.map(r=>`${new Date(r.time).toISOString()},${r.signal},${number(r.uptime)?r.uptime:''}`)];
  const url = URL.createObjectURL(new Blob(['\ufeff'+rows.join('\n')],{type:'text/csv;charset=utf-8'}));
  const a = document.createElement('a'); a.href=url; a.download=demo?'aquasolidaria-demo.csv':'aquasolidaria-conexion.csv'; a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

// 05. Firebase. Importación dinámica: la demostración sigue disponible si falla internet.
// onAuthStateChanged restaura o elimina la sesión según el estado real de Authentication.
async function initFirebase() {
  try {
    const [config, authSDK, dbSDK] = await Promise.all([
      import('./firebase-config.js'),
      import('https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js')
    ]);
    firebase = {...config,...authSDK,...dbSDK};
    await firebase.setPersistence(firebase.auth,firebase.browserSessionPersistence);
    firebase.onAuthStateChanged(firebase.auth, user => {
      // La demostración es independiente y nunca inicia listeners de Firebase.
      if (demo && !user) return;
      stopSession();
      if (!user) { loginMessage('Ingresa tus credenciales.'); return; }
      const selectedRole = roles[user.uid];
      if (!selectedRole) {
        firebase.signOut(firebase.auth).catch(()=>{});
        loginMessage('Esta cuenta no tiene acceso al portal.',true); return;
      }
      openShell(selectedRole); startListeners();
    });
    $('loginButton').disabled=false; loginMessage('Ingresa tus credenciales.');
  } catch (error) {
    console.error('No se pudo inicializar Firebase',error);
    loginMessage('No se pudo iniciar Firebase. Comprueba internet y abre la página con un servidor local.',true);
  }
}
function startListeners() {
  const token = generation;
  const listen = (path, fn) => {
    const unsubscribe = firebase.onValue(firebase.ref(firebase.db,path), snapshot=>{
      if(token===generation) fn(snapshot.val());
    }, error=>{
      if(token===generation) {
        errorBanner('No se pudo leer '+path+'. Revisa los permisos de Firebase.');
        if(path==='dispositivo') { device=null; renderDevice(); }
        if(path.startsWith('viviendas/')) renderHouse(null);
        console.error(error.code);
      }
    });
    unsubscribers.push(unsubscribe);
  };
  listen('.info/connected', value=>{connected=value===true; renderDevice(); if(role?.house&&!connected) renderHouse(null);});
  listen('.info/serverTimeOffset', value=>{offset=number(value)?value:0; renderDevice();});
  if(role.house) listen('viviendas/'+role.house, value=>{houseData=value; renderHouse(value);});
  else listen('dispositivo', receiveDevice);
  if(role.name==='Administrador') listen('wifiControl/estado', value=>{wifiState=value;renderWifi();});
}
let houseData = null;
async function login(event) {
  event.preventDefault(); if(!firebase) return;
  $('loginButton').disabled=true; loginMessage('Verificando credenciales…');
  try {
    await firebase.signInWithEmailAndPassword(firebase.auth,$('email').value.trim(),$('password').value);
  } catch(error) {
    // Mostramos una causa útil sin exponer contraseñas ni tokens.
    const messages = {'auth/network-request-failed':'No se pudo conectar a Firebase.', 'auth/too-many-requests':'Demasiados intentos. Intenta más tarde.', 'auth/user-disabled':'La cuenta está deshabilitada.', 'auth/invalid-credential':'Correo o contraseña incorrectos.'};
    loginMessage(messages[error.code] || 'No se pudo iniciar sesión. Código: '+(error.code || 'desconocido'),true);
  } finally { $('password').value=''; $('loginButton').disabled=false; }
}

// 06. DEMOSTRACIÓN: valores ficticios, aislados del modo real.
function tank(waterId, levelId, value) {
  const valid=number(value)&&value>=0&&value<=100;
  $(waterId).classList.toggle('measured',valid && value>0); $(waterId).style.height=valid?`${value}%`:'0%';
  text(levelId,valid?`${value}%`:'—');
}
// Estado exclusivamente local del laboratorio visual. No se escriben comandos.
let demoLevel = 73, demoPumps = [true,true];
function renderDemoTanks(active) {
  const level = active ? demoLevel : null;
  tank('mainWater','mainLevel',level); tank('water1','level1',active?52:null); tank('water2','level2',active?48:null);
  text('mainLevelNote',active?'Nivel simulado':'Sin medición'); text('note1',active?'Nivel simulado':'Sin lectura'); text('note2',active?'Nivel simulado':'Sin lectura');
  text('availableWater',active?`${(demoLevel*40).toLocaleString('es-MX')} L`:'—'); text('waterMetricNote',active?'Volumen ilustrativo':'Pendiente de medición'); text('networkMode',active?'Simulación':'Sin sensores');
  show('demoControls',active); $('demoLevel').value=demoLevel; text('demoLevelValue',`${demoLevel}%`);
  for(let i=0;i<2;i++) {
    const n=i+1;
    // En la demostración se detiene la animación si no hay agua en el depósito.
    const running=active && demoLevel>0 && demoPumps[i];
    $('flow'+n).classList.toggle('active',running);
    $('pumpMark'+n).classList.toggle('running',running);
    $('demoPump'+n).setAttribute('aria-pressed',String(demoPumps[i]));
    text('demoPump'+n,`Bomba ${n} · ${demoPumps[i]?'ON':'OFF'}`);
    text('pump'+n+'State',!active?'Sin configurar':running?'Activa (simulada)':demoPumps[i]?'Sin agua (simulado)':'Apagada (simulada)');
  }
  for(const id of ['sensorUltra','sensorFloat1','sensorFloat2','sensorFlow']) text(id,active?'Simulación':'Pendiente');
}
function startDemo() {
  stopSession(); demo=true; connected=true; demoLevel=73; demoPumps=[true,true];
  openShell({name:'Demostración',pages:['overview','monitor','distribution','history','alerts','settings']});
  renderDemoTanks(true); let seconds=0;
  const sample=()=>{seconds+=5; receiveDevice({nombre:'ESP32 de ejemplo',wifi:'Red simulada',ip:'—',senal:-60+Math.round(Math.sin(seconds/12)*6),tiempoActivo:seconds,ultimaActualizacion:Date.now()});};
  sample(); demoTimer=setInterval(sample,5000);
}

// 07. Eventos de interfaz y temporizadores.
function toggleTheme() {
  const next=document.documentElement.dataset.theme==='dark'?'light':'dark';
  document.documentElement.dataset.theme=next;
  try{localStorage.setItem('aqua-theme',next);}catch{}
}
try {const saved=localStorage.getItem('aqua-theme'); if(['light','dark'].includes(saved)) document.documentElement.dataset.theme=saved;}catch{}
$('themeButton').addEventListener('click',toggleTheme); $('themePublic').addEventListener('click',toggleTheme);
$('loginForm').addEventListener('submit',login); $('demoButton').addEventListener('click',startDemo);
$('showPassword').addEventListener('click',()=>{const visible=$('password').type==='password'; $('password').type=visible?'text':'password'; text('showPassword',visible?'Ocultar':'Ver'); $('showPassword').setAttribute('aria-pressed',String(visible));});
$('logout').addEventListener('click',async()=>{if(demo){stopSession();return;}try{await firebase.signOut(firebase.auth);}catch{errorBanner('No se pudo cerrar sesión. Intenta nuevamente.');}});
$('menuToggle').addEventListener('click',()=>{const open=$('topNavigation').classList.toggle('open');show('overlay',open);$('menuToggle').setAttribute('aria-expanded',String(open));});
// Al cambiar a escritorio, evitamos que quede una capa móvil bloqueando la pantalla.
window.matchMedia('(min-width: 901px)').addEventListener('change', e=>{if(e.matches) closeMenu();});
$('overlay').addEventListener('click',closeMenu); document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
$('export').addEventListener('click',exportHistory);
// Los eventos verifican el modo antes de modificar la visualización.
$('demoLevel').addEventListener('input',e=>{if(demo){demoLevel=Number(e.target.value);renderDemoTanks(true);}});
for(let i=0;i<2;i++) $('demoPump'+(i+1)).addEventListener('click',()=>{if(demo){demoPumps[i]=!demoPumps[i];renderDemoTanks(true);}});
$('demoReset').addEventListener('click',()=>{if(demo){demoLevel=73;demoPumps=[true,true];renderDemoTanks(true);}});
// 08. Conectividad: la orden contiene únicamente fecha y número de perfil.
// Los permisos reales se aplican en Firebase; la demo nunca escribe.
function renderWifi(){
  const actual=role?.name==='Administrador'&&!demo;
  const fresh=actual&&freshness()==='online'&&number(wifiState?.fecha)&&Math.abs(Date.now()+offset-wifiState.fecha)<25000;
  text('wifiCurrent',demo?'Red de ejemplo':display(device?.wifi));
  text('wifiFresh',demo?'Demostración · sin conexión física':fresh?'Conectado · datos recientes':'Sin confirmación reciente del firmware nuevo');
  if(wifiPending&&wifiState?.ultimaOrden===wifiPending.id&&wifiState.resultado!=='probando'){
    wifiNotice=({confirmada:'Red nueva confirmada por el ESP32.',revertida:'La prueba falló. Se conservó la configuración anterior.',interrumpida:'Prueba interrumpida; se conservó la red anterior.',ya_activa:'Ese perfil ya está activo.',perfil_vacio:'El perfil no está registrado.',error_memoria:'No se pudo guardar la configuración.'})[wifiState.resultado]||'El ESP32 respondió: '+display(wifiState.resultado);
    wifiPending=null;
  }
  if(wifiPending&&Date.now()-wifiPending.start>150000){wifiNotice='Sin confirmación. Revisa el ESP32 o utiliza el portal local.';wifiPending=null;}
  for(let i=1;i<=2;i++){
    const name=wifiState?.['red'+i];
    text('wifiProfile'+i,demo?(i===1?'Casa · ejemplo':'Escuela · ejemplo'):(name||'No registrado')+(wifiState?.perfilActivo===i?' · activo':''));
    $('wifiSwitch'+i).disabled=!actual||!fresh||!name||wifiState?.perfilActivo===i||Boolean(wifiPending)||wifiSending;
  }
  text('wifiStatus',demo?'Modo demostración: no envía órdenes.':wifiPending?'Solicitud enviada. Esperando confirmación del ESP32…':wifiNotice||(!fresh?'Instala el firmware 4.1 y comprueba que esté en línea.':({confirmada:'Última prueba: red confirmada por el ESP32.',revertida:'Última prueba fallida: se conservó la configuración anterior.',interrumpida:'Última prueba interrumpida.',alternativa:'Conectado a la red alternativa.',probando:'Cambio en comprobación.'})[wifiState?.resultado]||'Selecciona un perfil registrado.'));
}
async function cambiarWifi(slot){
  if(demo||role?.name!=='Administrador'||!connected||freshness()!=='online'||$('wifiSwitch'+slot).disabled)return;
  if(!window.confirm('¿Cambiar al perfil '+slot+'? El ESP32 se reiniciará para comprobar la conexión.'))return;
  const token=generation;
  const id=Math.floor(Date.now()+offset)*10+slot;
  wifiSending=true;wifiNotice='';wifiPending={id,start:Date.now()};renderWifi();
  try{await firebase.set(firebase.ref(firebase.db,'wifiControl/solicitud'),id);}
  catch(error){if(token===generation){wifiPending=null;wifiNotice='No se pudo enviar la orden: '+(error.code||'revisa las reglas');}}
  finally{if(token===generation){wifiSending=false;renderWifi();}}
}
$('wifiSwitch1').addEventListener('click',()=>cambiarWifi(1));
$('wifiSwitch2').addEventListener('click',()=>cambiarWifi(2));
setInterval(()=>{if(role){renderDevice();renderWifi();if(role.house)renderHouse(houseData);}},1000);
initFirebase();
