import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

function getEnv(name: string): string | undefined {
  const value = (import.meta as any).env?.[name];
  if (typeof value !== "string" || value.trim() === "" || value === "undefined") {
    return undefined;
  }
  return value;
}

const projectId = getEnv("VITE_FIREBASE_PROJECT_ID");
const apiKey = getEnv("VITE_FIREBASE_API_KEY");
const appId = getEnv("VITE_FIREBASE_APP_ID");

const isFirebaseConfigured = Boolean(projectId && apiKey && appId);

let app = null as any;
let auth = null as any;
let db = null as any;
let storage = null as any;

if (isFirebaseConfigured) {
  const firebaseConfig = {
    apiKey,
    authDomain: `${projectId}.firebaseapp.com`,
    projectId,
    // Using appspot.com is broadly compatible; firebasestorage.app also works for newer projects
    storageBucket: `${projectId}.appspot.com`,
    appId,
  } as any;

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} else {
  // When Firebase is not configured, avoid throwing during module import so the app can render.
  // Consumers should check `isFirebaseConfigured` before using auth/db/storage.
  console.warn(
    "Firebase is not configured. Set VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_API_KEY and VITE_FIREBASE_APP_ID to enable Firebase features."
  );
}

export { auth, db, storage, isFirebaseConfigured };
export default app;
