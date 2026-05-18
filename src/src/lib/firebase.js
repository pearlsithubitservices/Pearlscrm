import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBuh-0ZNvqbMG8XfXpWpGHkWPHS_LjzEZM",
  authDomain: "pearlscrm-fbf72.firebaseapp.com",
  projectId: "pearlscrm-fbf72",
  storageBucket: "pearlscrm-fbf72.firebasestorage.app",
  messagingSenderId: "324927871298",
  appId: "1:324927871298:web:335c2c53375f94a1c350db",
  measurementId: "G-MFV1THQHWL"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;