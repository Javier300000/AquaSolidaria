/** AQUASOLIDARIA · LÓGICA DE LA INTERFAZ
 * 01. Roles y estado; 02. Navegación; 03. Telemetría; 04. Historial;
 * 05. Sesiones y Firebase; 06. Demostración; 07. Eventos del navegador.
 * No se escriben comandos físicos en esta versión. Las reglas del servidor
 * son la seguridad real; ocultar botones en JavaScript no concede permisos.
 */

// 01. Utilidades y estado de la aplicación.
const $ = id => document.getElementById(id);
const text = (id, value) => { $(id).textContent = value; };
const show = (id, visible) => { $(id).hidden = !visible; };
const number = v => typeof v === 'number' && Number.isFinite(v);
const display = v => v == null || v === '' ? '—' : String(v);
const roles = {
  '3EzO6T9OXhP1vRfdhvpr7EgKCtC3': { name: 'Administrador', pages: ['overview','monitor','distribution','history','alerts','settings'] },
  'E5MLK89eI8XmitvAkcHzAj4mOg42': { name: 'Operador', pages: ['overview','monitor','distribution','history','alerts'] },
  'vD4sEWQ9ASOAltrggXYku0bAhBz1': { name: 'Vivienda 1', house: 'casa1', pages: ['housing'] },
  'avzzZFclg8h7XGHzvvahg6Fb5WZ2': { name: 'Vivienda 2', house: 'casa2', pages: ['housing'] }
};
// La cuenta del ESP32 se excluye del portal: solo es para el firmware.
const pages = {
  overview: ['◉','Resumen general'], monitor: ['≋','Monitoreo'], distribution: ['↗','Distribución'],
  history: ['▤','Historial'], alerts: ['!','Alertas'], settings: ['⚙','Configuración'], housing: ['⌂','Mi vivienda']
};
let firebase = null, role = null, demo = false, device = null, connected = false;
let offset = 0, history = [], unsubscribers = [], generation = 0;
let lastSample = null, demoTimer = null;

// 02. Navegación: un solo HTML contiene todas las pantallas; se muestra una a la vez.
function closeMenu() {
  $('sidebar').classList.remove('open'); show('overlay', false);
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
    const symbol = document.createElement('span'); symbol.textContent = pages[id][0]; symbol.setAttribute('aria-hidden','true');
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
  text('deviceState', label);
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
}
let houseData = null;
async function login(event) {
  event.preventDefault(); if(!firebase) return;
  $('loginButton').disabled=true; loginMessage('Verificando credenciales…');
  try {
    await firebase.signInWithEmailAndPassword(firebase.auth,$('email').value.trim(),$('password').value);
  } catch(error) {
    loginMessage(error.code==='auth/network-request-failed'?'No se pudo conectar a Firebase.':'No se pudo iniciar sesión. Revisa correo y contraseña.',true);
  } finally { $('password').value=''; $('loginButton').disabled=false; }
}

// 06. DEMOSTRACIÓN: valores ficticios, aislados del modo real.
function tank(waterId, levelId, value) {
  const valid=number(value)&&value>=0&&value<=100;
  $(waterId).classList.toggle('measured',valid); $(waterId).style.height=valid?`${value}%`:'0%';
  text(levelId,valid?`${value}%`:'—');
}
function renderDemoTanks(active) {
  tank('mainWater','mainLevel',active?73:null); tank('water1','level1',active?52:null); tank('water2','level2',active?48:null);
  text('mainLevelNote',active?'Nivel simulado':'Sin medición'); text('note1',active?'Nivel simulado':'Sin lectura'); text('note2',active?'Nivel simulado':'Sin lectura');
  text('availableWater',active?'2,920 L':'—'); text('networkMode',active?'Simulación':'Sin sensores');
  $('flow1').classList.toggle('active',active); $('flow2').classList.toggle('active',active);
  for(const id of ['sensorUltra','sensorFloat1','sensorFloat2','sensorFlow']) text(id,active?'Simulación':'Pendiente');
  text('pump1State',active?'Activa (simulada)':'Sin configurar'); text('pump2State',active?'Activa (simulada)':'Sin configurar');
}
function startDemo() {
  stopSession(); demo=true; connected=true;
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
$('menuToggle').addEventListener('click',()=>{const open=$('sidebar').classList.toggle('open');show('overlay',open);$('menuToggle').setAttribute('aria-expanded',String(open));});
$('overlay').addEventListener('click',closeMenu); document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
$('export').addEventListener('click',exportHistory);
setInterval(()=>{if(role){renderDevice();if(role.house)renderHouse(houseData);}},1000);
initFirebase();
