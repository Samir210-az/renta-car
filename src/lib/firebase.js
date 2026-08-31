import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCzfe6Zy7VT6iwRsQyUbdFX8ErglE3LeAI",
  authDomain: "renta-car-f00ad.firebaseapp.com",
  databaseURL: "https://renta-car-f00ad-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "renta-car-f00ad",
  storageBucket: "renta-car-f00ad.firebasestorage.app",
  messagingSenderId: "502018341144",
  appId: "1:502018341144:web:890be025e147746021466d",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
