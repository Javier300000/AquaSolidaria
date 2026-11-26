
/* ==========================================
   AQUASOLIDARIA - DISEÑO GENERAL
   ========================================== */

:root {
    --background: #edf6fa;
    --panel: #ffffff;
    --text: #143849;
    --muted: #68818e;
    --primary: #0789ad;
    --secondary: #12c5cc;
    --border: #d8e7ef;
    --soft: #e7f8fb;
    --success: #14966e;
    --danger: #d94c54;
    --shadow: 0 12px 35px #164d6810;
}

[data-theme="dark"] {
    --background: #071922;
    --panel: #102a36;
    --text: #e5f6fc;
    --muted: #9ab9c8;
    --primary: #2dc5e5;
    --secondary: #37dbce;
    --border: #264552;
    --soft: #153c49;
    --success: #4adea2;
    --danger: #ff8189;
    --shadow: 0 12px 35px #00000020;
}

* {
    box-sizing: border-box;
}

[hidden] {
    display: none !important;
}

body {
    margin: 0;
    font-family: "Segoe UI", Arial, sans-serif;
    background: var(--background);
    color: var(--text);
    min-height: 100vh;
    transition: background .25s, color .25s;
}

button, input {
    font: inherit;
}

button {
    cursor: pointer;
    transition: .2s ease;
}

button:disabled {
    cursor: not-allowed;
    opacity: .55;
}

button:focus-visible,
input:focus-visible {
    outline: 3px solid var(--secondary);
    outline-offset: 3px;
}

button:not(:disabled):hover {
    transform: translateY(-2px);
}

a {
    color: inherit;
    text-decoration: none;
}

h1, h2, h3, p {
    margin-top: 0;
}

p {
    line-height: 1.65;
}

h2 {
    font-size: 21px;
}

.muted {
    color: var(--muted);
}

.small {
    font-size: 13px;
}

.accent {
    color: var(--primary);
}

.eyebrow {
    font-size: 11px;
    letter-spacing: 2px;
    font-weight: 800;
    color: var(--primary);
    display: block;
    margin-bottom: 12px;
}

.panel {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 26px;
    box-shadow: var(--shadow);
}

.primary,
.secondary {
    border-radius: 12px;
    padding: 12px 20px;
    font-weight: 700;
    border: 1px solid transparent;
}

.primary {
    background: linear-gradient(
        135deg, #087fa6, #0a9eac
    );
    color: white;
    box-shadow: 0 6px 15px #079db52b;
}

.secondary {
    color: var(--text);
    border-color: var(--border);
    background: var(--panel);
}

.full {
    width: 100%;
}

/* ==========================================
   LOGOTIPO Y PANTALLA DE INICIO
   ========================================== */

.brand {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 23px;
    font-weight: 800;
    letter-spacing: -1px;
}

.brand small {
    display: block;
    font-size: 9px;
    letter-spacing: 1.6px;
    margin-top: 4px;
    color: var(--muted);
}

.logo {
    display: grid;
    place-items: center;
    width: 49px;
    height: 49px;
    border-radius: 16px;
    background: linear-gradient(
        135deg, #d5f9ff, #73dae5
    );
    font-size: 28px;
}

.public-header {
    max-width: 1300px;
    margin: auto;
    padding: 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
}

.welcome-grid {
    display: grid;
    grid-template-columns: 1.25fr 1fr;
    align-items: center;
    gap: 65px;
    max-width: 1150px;
    margin: 45px auto;
    padding: 25px;
}

.hero h1 {
    font-size: clamp(38px, 5vw, 68px);
    line-height: 1.05;
    letter-spacing: -3px;
    margin: 18px 0;
}

.hero > p {
    color: var(--muted);
    font-size: 17px;
}

.hero-water {
    height: 250px;
    position: relative;
    overflow: hidden;
    border-radius: 28px;
    background: linear-gradient(
        145deg, #063a59, #079bb5
    );
    display: grid;
    place-items: center;
    margin: 28px 0;
}

.hero-drop {
    font-size: 110px;
    z-index: 2;
    animation: floating 4s ease-in-out infinite;
    filter: drop-shadow(0 15px 25px #0004);
}

@keyframes floating {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-15px);
    }
}

.hero-wave {
    position: absolute;
    width: 160%;
    height: 180px;
    left: -30%;
    bottom: -90px;
    background: #71e9ed45;
    border-radius: 45%;
    animation: wave 8s linear infinite;
}

@keyframes wave {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.bubble {
    position: absolute;
    border: 1px solid #ffffff70;
    background: #ffffff18;
    border-radius: 50%;
    animation: floating 5s infinite;
}

.bubble-one {
    width: 65px;
    height: 65px;
    left: 14%;
    top: 20%;
}

.bubble-two {
    width: 30px;
    height: 30px;
    right: 16%;
    top: 15%;
}

.bubble-three {
    width: 45px;
    height: 45px;
    right: 12%;
    bottom: 20%;
}

.features {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
}

.features div {
    background: var(--panel);
    border: 1px solid var(--border);
    padding: 18px;
    border-radius: 16px;
    text-align: center;
}

.features strong {
    display: block;
    color: var(--primary);
    font-size: 28px;
}

.features small {
    color: var(--muted);
}

/* ==========================================
   INICIO DE SESIÓN
   ========================================== */

.login {
    padding: 36px;
}

.login h2 {
    font-size: 32px;
    margin-bottom: 8px;
}

label {
    display: block;
    margin: 20px 0 8px;
    font-weight: 600;
    font-size: 14px;
}

input {
    width: 100%;
    min-width: 0;
    padding: 14px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--background);
    color: var(--text);
}

.password-wrap {
    display: flex;
    gap: 8px;
}

.password-wrap input {
    flex: 1;
}

#loginButton {
    margin-top: 24px;
}

#loginMessage {
    font-size: 13px;
    color: var(--muted);
    min-height: 25px;
    margin: 12px 0;
}

#loginMessage.error {
    color: var(--danger);
}

.login > p:last-child {
    margin-top: 15px;
    margin-bottom: 0;
}

/* ==========================================
   BARRA DE NAVEGACIÓN
   ========================================== */

.topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    background: var(--panel);
    padding: 18px 4%;
    border-bottom: 1px solid var(--border);
}

.header-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
}

.role-label {
    font-size: 13px;
    font-weight: 700;
}

.status {
    font-size: 12px;
    background: var(--soft);
    color: var(--primary);
    padding: 9px 13px;
    border-radius: 30px;
    font-weight: 700;
}

.status.online {
    color: var(--success);
}

.status.offline {
    color: var(--danger);
}

.navigation {
    display: flex;
    gap: 8px;
    padding: 12px 4%;
    background: var(--panel);
    border-bottom: 1px solid var(--border);
    overflow-x: auto;
}

.nav-button {
    color: var(--muted);
    background: transparent;
    border: none;
    padding: 12px 16px;
    font-weight: 650;
    white-space: nowrap;
    border-radius: 10px;
}

.nav-button.active {
    color: var(--primary);
    background: var(--soft);
}

.dashboard {
    max-width: 1400px;
    min-height: 75vh;
    margin: auto;
    padding: 35px 4%;
}

.page {
    animation: appear .25s ease;
}

@keyframes appear {
    from {
        opacity: 0;
        transform: translateY(5px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.page-heading {
    margin-bottom: 26px;
}

.page-heading h1 {
    font-size: clamp(27px, 4vw, 39px);
    letter-spacing: -1px;
    margin-bottom: 8px;
}

.page > .panel {
    margin-bottom: 22px;
}

/* ==========================================
   TARJETAS DE MONITOREO
   ========================================== */

.metrics {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
    margin-bottom: 22px;
}

.metric {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.metric-icon {
    background: var(--soft);
    border-radius: 14px;
    width: 45px;
    height: 45px;
    display: grid;
    place-items: center;
    font-size: 23px;
}

.metric small {
    color: var(--muted);
}

.metric strong {
    font-size: 23px;
    overflow-wrap: anywhere;
}

.sensor-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 22px;
}

.sensor-grid.two {
    grid-template-columns: repeat(2, 1fr);
}

.sensor-card h3 {
    font-size: 19px;
    margin: 0 0 16px;
}

.sensor-card .sensor-value {
    font-size: 22px;
    color: var(--primary);
    font-weight: 750;
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
    padding: 16px 0;
    border-bottom: 1px solid var(--border);
    font-size: 14px;
}

.info-row:last-child {
    border: none;
}

.info-row span {
    color: var(--muted);
}

.info-row strong {
    text-align: right;
    overflow-wrap: anywhere;
}

/* ==========================================
   TINACOS Y ANIMACIÓN DEL AGUA
   ========================================== */

.water-network {
    display: flex;
    align-items: center;
    flex-direction: column;
    padding: 28px 0;
}

.tank-unit {
    max-width: 260px;
    margin: auto;
    text-align: center;
}

.tank {
    width: 125px;
    height: 165px;
    border: 3px solid #82aebd;
    background: var(--soft);
    border-radius: 22px 22px 16px 16px;
    position: relative;
    overflow: hidden;
    margin: 0 auto 12px;
}

.tank-water {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 0%;
    background: linear-gradient(
        180deg, #21c6e4, #087cab
    );
    transition: height .7s ease;
}

.tank-water::before {
    content: "";
    position: absolute;
    width: 170%;
    height: 24px;
    left: -35%;
    top: -10px;
    border-radius: 45%;
    background: #6bdeed;
    animation: tankWave 3s ease-in-out infinite;
}

@keyframes tankWave {
    0%, 100% {
        transform: translateX(-10%);
    }
    50% {
        transform: translateX(10%);
    }
}

.tank-value {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    z-index: 2;
    font-size: 25px;
    font-weight: 800;
    color: var(--text);
    text-shadow: 0 0 7px var(--panel);
}

.tank-unit h3 {
    margin-bottom: 6px;
    font-size: 16px;
}

.tank-unit small {
    display: block;
    color: var(--muted);
    line-height: 1.5;
}

.tank-status {
    display: inline-block;
    margin: 8px 0;
    padding: 6px 12px;
    border-radius: 25px;
    font-size: 12px;
    font-weight: bold;
    background: var(--soft);
    color: var(--primary);
}

.tank-status.full-tank {
    color: var(--success);
}

.pipe {
    width: 12px;
    height: 38px;
    background: #91b8c7;
    border-radius: 3px;
}

.branch-pipes {
    height: 36px;
    width: 50%;
    border: 10px solid #91b8c7;
    border-bottom: none;
    border-radius: 12px 12px 0 0;
}

.house-tanks {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
}

/* ==========================================
   DISTRIBUCIÓN DEL AGUA
   ========================================== */

.distribution-bar {
    display: flex;
    height: 36px;
    overflow: hidden;
    border-radius: 12px;
    background: var(--soft);
    margin: 20px 0;
}

#share1 {
    width: 0;
    background: #089ec5;
    transition: width .5s;
}

#share2 {
    width: 0;
    background: #16b9a4;
    transition: width .5s;
}

.distribution-text {
    text-align: center;
    color: var(--primary);
    font-size: 18px;
    font-weight: 700;
    padding: 12px;
}

/* ==========================================
   ALERTAS E HISTORIAL
   ========================================== */

.notice {
    background: var(--soft);
    color: var(--text);
    border-left: 4px solid var(--primary);
    border-radius: 12px;
    padding: 16px;
    line-height: 1.55;
    margin: 16px 0;
    font-size: 14px;
}

.notice.danger {
    border-color: var(--danger);
    color: var(--danger);
}

.alert-list {
    display: grid;
    gap: 15px;
}

.alert-list .notice {
    margin: 0;
}

.table-wrap {
    overflow-x: auto;
    margin-top: 20px;
}

table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    white-space: nowrap;
}

th, td {
    text-align: left;
    padding: 14px;
    border-bottom: 1px solid var(--border);
}

th {
    background: var(--soft);
    color: var(--primary);
}

#historyEmpty {
    margin-top: 20px;
}

footer {
    text-align: center;
    color: var(--muted);
    padding: 25px;
    font-size: 12px;
}

/* ==========================================
   ADAPTACIÓN A TELÉFONOS Y TABLETAS
   ========================================== */

@media (max-width: 1000px) {

    .welcome-grid {
        gap: 30px;
    }

    .metrics {
        grid-template-columns: repeat(2, 1fr);
    }

    .sensor-grid {
        grid-template-columns: repeat(2, 1fr);
    }

}

@media (max-width: 700px) {

    .welcome-grid {
        grid-template-columns: 1fr;
        margin: 0 auto;
        padding: 18px;
    }

    .hero h1 {
        letter-spacing: -2px;
    }

    .hero-water {
        height: 190px;
    }

    .login {
        padding: 24px;
    }

    .topbar {
        align-items: flex-start;
        flex-direction: column;
    }

    .header-actions {
        width: 100%;
    }

    .brand {
        font-size: 21px;
    }

    .dashboard {
        padding: 22px 15px;
    }

    .panel {
        padding: 20px;
        border-radius: 20px;
    }

    .sensor-grid,
    .sensor-grid.two {
        grid-template-columns: 1fr;
    }

    .metrics {
        gap: 10px;
    }

    .metric {
        padding: 15px;
    }

    .metric strong {
        font-size: 18px;
    }

    .tank {
        width: 100px;
        height: 135px;
    }

    .tank-value {
        font-size: 19px;
    }

    .public-header {
        padding: 18px;
    }

    .brand small {
        display: none;
    }

    .hero-drop {
        font-size: 85px;
    }

}

@media (prefers-reduced-motion: reduce) {

    *,
    *::before,
    *::after {
        animation: none !important;
        transition: none !important;
    }

}
