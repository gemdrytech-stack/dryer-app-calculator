import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDp1aHLEdcAkN9USc7q0_apG46-MQM4WKs",
  authDomain: "gemdrytechcalculator.firebaseapp.com",
  projectId: "gemdrytechcalculator",
  storageBucket: "gemdrytechcalculator.firebasestorage.app",
  messagingSenderId: "733396094653",
  appId: "1:733396094653:web:f51ee51c095278b564f1d4",
  measurementId: "G-JKFL91NS9B"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
