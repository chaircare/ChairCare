// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDQAFVXY2ykm0ls4XiXNYfP9rDrqUptsCY",
  authDomain: "chairecaredemo.firebaseapp.com",
  projectId: "chairecaredemo",
  storageBucket: "chairecaredemo.firebasestorage.app",
  messagingSenderId: "971132137020",
  appId: "1:971132137020:web:a6c14401ae462e1e3c1d39",
  measurementId: "G-BFZCDX3034"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Connect to emulators in development (optional)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Uncomment these lines if you want to use Firebase emulators in development
  // connectAuthEmulator(auth, "http://localhost:9099");
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectStorageEmulator(storage, "localhost", 9199);
  // connectFunctionsEmulator(functions, "localhost", 5001);
}

export default app;