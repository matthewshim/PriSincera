import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Using the same API key that was used for REST API
// If you have a full firebaseConfig object, you can add projectId, etc.
// But for Auth, apiKey is often enough, though projectId and appId are recommended.
// I'll provide a minimal config using the Vite env var.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // Make sure this matches your project ID if needed.
  authDomain: "prisincera.firebaseapp.com",
  projectId: "prisincera",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
