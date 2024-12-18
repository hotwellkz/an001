import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB6MtwSlxKRdUF6J0olLNSCiI83KZ8MlWM",
  authDomain: "analitic-36ac4.firebaseapp.com",
  projectId: "analitic-36ac4",
  storageBucket: "analitic-36ac4.firebasestorage.app",
  messagingSenderId: "548691406660",
  appId: "1:548691406660:web:bbe98ad075e0f6b22e7111"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);