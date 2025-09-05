import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

function requireEnv(name: string): string {
  const value = (import.meta as any).env?.[name];
  if (typeof value !== "string" || value.trim() === "" || value === "undefined") {
    throw new Error(`Missing required env var ${name}. Set it in your environment (Vite exposes VITE_* vars).`);
  }
  return value;
}

const projectId = requireEnv("VITE_FIREBASE_PROJECT_ID");
const firebaseConfig = {
  apiKey: requireEnv("VITE_FIREBASE_API_KEY"),
  authDomain: `${projectId}.firebaseapp.com`,
  projectId,
  // Using appspot.com is broadly compatible; firebasestorage.app also works for newer projects
  storageBucket: `${projectId}.appspot.com`,
  appId: requireEnv("VITE_FIREBASE_APP_ID"),
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
