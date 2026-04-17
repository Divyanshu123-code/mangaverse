// src/firebase.js
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  updateProfile as firebaseUpdateProfile 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from "firebase/firestore";
import { 
  getStorage, 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";

// 🔑 Firebase config — values loaded from .env (VITE_FIREBASE_*)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// 🚀 Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔐 Authentication
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// 📦 Firestore
const db = getFirestore(app);

// ☁️ Storage
const storage = getStorage(app);

export {
  auth,
  googleProvider,
  db,
  storage,
  firebaseUpdateProfile,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  storageRef,
  uploadBytes,
  getDownloadURL
};