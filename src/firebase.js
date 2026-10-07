import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const cfg = {
  apiKey: "AIzaSyBO15B6b0MEaBE4Mz6qDsp92GH2YS_1Nv4",
  authDomain: "portfolio-engine-1a2ad.firebaseapp.com",
  projectId: "portfolio-engine-1a2ad",
  storageBucket: "portfolio-engine-1a2ad.firebasestorage.app",
  messagingSenderId: "663330739855",
  appId: "1:663330739855:web:7ed7cd6877897ae38242fa"
};

export const ADMIN_EMAIL = 'admin.smart@gmail.com';

const app = initializeApp(cfg);

export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);
