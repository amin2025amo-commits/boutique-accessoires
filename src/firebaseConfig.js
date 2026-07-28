// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAnCcwhfhd99mGzPT9RiwBGPleRG2o-I4w",
  authDomain: "ma-boutique-dcc21.firebaseapp.com",
  projectId: "ma-boutique-dcc21",
  storageBucket: "ma-boutique-dcc21.firebasestorage.app",
  messagingSenderId: "590983738496",
  appId: "1:590983738496:web:fe1ae65fb63f2203086265",
  measurementId: "G-1PM11TG6ZQ"
};

const app = initializeApp(firebaseConfig);

// Export db, auth and provider
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// Optional Analytics export
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;