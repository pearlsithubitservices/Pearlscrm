import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCrGp36_f16N_18MUxAoxhoxr3p-ZzmgfI",
  authDomain: "pearlscrm-4f491.firebaseapp.com",
  projectId: "pearlscrm-4f491",
  storageBucket: "pearlscrm-4f491.firebasestorage.app",
  messagingSenderId: "179186324936",
  appId: "1:179186324936:web:403c437872b0580493dcfd",
  measurementId: "G-W27EX80M80"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;