import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAIsiuekEV6TD4yGouv-ziDN8eW759GvSI",
  authDomain: "nexora-d8275.firebaseapp.com",
  projectId: "nexora-d8275",
  storageBucket: "nexora-d8275.firebasestorage.app",
  messagingSenderId: "513512786231",
  appId: "1:513512786231:web:525941089acfbecfd6f2b2",
  measurementId: "G-7CWNN060R7"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
