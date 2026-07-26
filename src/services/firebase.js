import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  enableIndexedDbPersistence
} from 'firebase/firestore';

// Universal Cloud Firebase Backend Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB-DemoKeyLeadSenseAI2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "leadsense-ai-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "leadsense-ai-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "leadsense-ai-app.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "987654321098",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:987654321098:web:abcdef1234567890"
};

// Initialize Firebase App instance
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence
try {
  enableIndexedDbPersistence(db).catch(() => {});
} catch (e) {}

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  deleteDoc,
  updateDoc,
  serverTimestamp
};
