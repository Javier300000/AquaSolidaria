/**
 * CONFIGURACIÓN DE FIREBASE
 * Este archivo conecta la aplicación web con el proyecto existente.
 * La API key identifica el proyecto: no sustituye la autenticación ni las reglas.
 * Nunca colocar contraseñas, tokens privados o cuentas de servicio aquí.
 */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js';

const firebaseConfig = {
  apiKey: 'AIzaSyD61brYTXZDLoU0Llvq9B1XxO-5p3LoKys',
  authDomain: 'aquasolidaria.firebaseapp.com',
  databaseURL: 'https://aquasolidaria-default-rtdb.firebaseio.com',
  projectId: 'aquasolidaria',
  storageBucket: 'aquasolidaria.firebasestorage.app',
  messagingSenderId: '1081978235967',
  appId: '1:1081978235967:web:22043f0548582c62359c8a'
};

// Exportamos los objetos para reutilizarlos desde app.js.
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
