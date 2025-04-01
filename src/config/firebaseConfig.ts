import { initializeApp, FirebaseApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore"; // Import Firestore

const firebaseConfig = {
  apiKey: "AIzaSyAsGrtbRSjz77iShv4tB0vQ33A23ie9JM8",
  authDomain: "tiger3homs-f3a5f-d60da.firebaseapp.com",
  projectId: "tiger3homs-f3a5f-d60da",
  storageBucket: "tiger3homs-f3a5f-d60da.firebasestorage.app",
  messagingSenderId: "509990310606",
  appId: "1:509990310606:web:e36d91ea748c4cd64d369f",
  measurementId: "G-DDZTZ6MR6S"
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null; // Add Firestore instance variable

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app); // Initialize Firestore
} catch (error) {
  console.error("Firebase initialization error:", error);
  // Throw an error to make initialization failures more explicit
  throw new Error(`Firebase initialization failed: ${error instanceof Error ? error.message : String(error)}`);
}

// Ensure db is initialized before exporting, otherwise throw
if (!db) {
  throw new Error("Firestore failed to initialize and is null.");
}

export { auth, db }; // Export db
export default app;
