// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// ... các import khác nếu cần

const firebaseConfig = {
    apiKey: "AIzaSyDsZi_QheKeYDR0WSqm6qF5QLbQUtJTXkc",
    authDomain: "java-6-299a4.firebaseapp.com",
    databaseURL: "https://java-6-299a4-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "java-6-299a4",
    storageBucket: "java-6-299a4.firebasestorage.app",
    messagingSenderId: "629274696356",
    appId: "1:629274696356:web:cc902f183e718e54766431",
    measurementId: "G-8XXEWYWH30"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app); // **Phải có dòng export này**

// Export các service khác nếu cần (auth, storage,...)
// export const auth = getAuth(app);