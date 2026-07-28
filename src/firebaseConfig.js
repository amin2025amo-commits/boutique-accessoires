// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD_jR3u0hwc_H_yPaW1uv4eQGD9Lka_BYE",
  authDomain: "boutique-accessoires.firebaseapp.com",
  projectId: "boutique-accessoires",
  storageBucket: "boutique-accessoires.firebasestorage.app",
  messagingSenderId: "79316843883",
  appId: "1:79316843883:web:8fdc6c4d2500539f84e02e",
  measurementId: "G-6L5LLKZLMR"
};

const app = initializeApp(firebaseConfig);

// Export db, auth and provider
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// Optional Analytics export
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;