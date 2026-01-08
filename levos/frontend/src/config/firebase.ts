import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAsx9QPTbMbTUUXiM2MQxNrUZUxbE13uW4",
  authDomain: "levos2.firebaseapp.com",
  databaseURL: "https://levos2-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "levos2",
  storageBucket: "levos2.firebasestorage.app",
  messagingSenderId: "1045375644720",
  appId: "1:1045375644720:web:fd0ad80d9336dfe444e9f5"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();
