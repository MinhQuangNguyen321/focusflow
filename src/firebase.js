// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCLMBLYIrWr-eP8AQJFZLDqfjtLY8jKugs",
  authDomain: "my-todo-app-c11be.firebaseapp.com",
  projectId: "my-todo-app-c11be",
  storageBucket: "my-todo-app-c11be.firebasestorage.app",
  messagingSenderId: "911857805197",
  appId: "1:911857805197:web:e7780519fa52a178cbbfc4",
  measurementId: "G-FBVRMQX4G1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize & Export Services
export const auth = getAuth(app);
export const db = getFirestore(app);