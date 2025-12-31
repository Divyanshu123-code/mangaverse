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

// 🔑 Firebase config (keep yours here)
const firebaseConfig = {
  apiKey: "AIzaSyDWeimRnF3kOp7aAUdA9ij5KazjL4rRII8",
  authDomain: "mangaverse-b4b47.firebaseapp.com",
  projectId: "mangaverse-b4b47",
  storageBucket: "mangaverse-b4b47.appspot.com",
  messagingSenderId: "281231845221",
  appId: "1:281231845221:web:d8d97a71afa0b13070238c",
  measurementId: "G-YBHVC6SKSN"
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