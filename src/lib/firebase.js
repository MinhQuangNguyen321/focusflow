import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * FIREBASE CONFIGURATION
 * 
 * IMPORTANT: It is best practice to keep your API keys in an environment file (.env).
 * Create a new file called '.env.local' in the root of your project and add:
 * VITE_FIREBASE_API_KEY=YOUR_KEY
 * VITE_FIREBASE_AUTH_DOMAIN=YOUR_DOMAIN
 * ... and so on.
 */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Defensive Initialization
let app;
let auth;
let db;

if (firebaseConfig.apiKey) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
} else {
  console.warn("Firebase API Key is missing. Cloud sync will be disabled. Create a .env.local file with your credentials.");
}

export { auth, db };
