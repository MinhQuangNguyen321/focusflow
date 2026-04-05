import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCLMBLYIrWr-eP8AQJFZLDqfjtLY8jKugs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "my-todo-app-c11be.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "my-todo-app-c11be",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "my-todo-app-c11be.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "911857805197",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:911857805197:web:e7780519fa52a178cbbfc4"
};

let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  
  if (!firebaseConfig.apiKey) {
    console.warn("Firebase API key is missing. Cloud sync is disabled. Auth and Firestore will be in offline mode.");
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
  console.log("Firebase objects may be undefined if config is incomplete.");
}

export { auth, db, app };