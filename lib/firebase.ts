import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBDxVZye32PhvMw2K9m9IBjTUHM8Nk4GEM',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'gastos-mt.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'gastos-mt',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'gastos-mt.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '423123141288',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:423123141288:web:799ce4a341d71a6ed1789d',
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.projectId &&
    firebaseConfig.apiKey &&
    firebaseConfig.projectId !== 'tu_proyecto_id' &&
    firebaseConfig.apiKey !== 'tu_api_key_aqui'
  );
}

/**
 * Limpia campos 'undefined' para que Firestore no rechace la operación de escritura
 */
export function sanitizeData<T extends Record<string, any>>(obj: T): Partial<T> {
  const clean: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined) {
      if (
        obj[key] !== null &&
        typeof obj[key] === 'object' &&
        !Array.isArray(obj[key]) &&
        !(obj[key] instanceof Date)
      ) {
        clean[key] = sanitizeData(obj[key]);
      } else {
        clean[key] = obj[key];
      }
    }
  }
  return clean as Partial<T>;
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

try {
  if (isFirebaseConfigured()) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    try {
      db = initializeFirestore(app, {
        ignoreUndefinedProperties: true,
      });
    } catch {
      db = getFirestore(app);
    }
    if (typeof window !== 'undefined') {
      console.log('🔥 Firebase inicializado con éxito con proyecto:', firebaseConfig.projectId);
    }
  }
} catch (error) {
  console.error('❌ Error al inicializar Firebase:', error);
}

export { app, db, firebaseConfig };
