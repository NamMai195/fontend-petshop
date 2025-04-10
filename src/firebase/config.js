// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";
// ... các import khác nếu cần

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Debug Firebase configuration
console.log('Firebase Config:', {
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey ? '**exists**' : '**missing**',
  messagingSenderId: firebaseConfig.messagingSenderId ? '**exists**' : '**missing**',
  appId: firebaseConfig.appId ? '**exists**' : '**missing**'
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log('Firebase app initialized:', app.name);

// Initialize services
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
console.log('Firestore initialized');

export const storage = getStorage(app);
console.log('Storage initialized');

export const rtdb = getDatabase(app);
console.log('Realtime Database initialized');

// Export the app instance as well
export default app;

// Export các service khác nếu cần (auth, storage,...)
// export const auth = getAuth(app);