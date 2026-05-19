import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => typeof value !== "string" || value.trim() === "")
  .map(([key]) => key);

if (missingKeys.length > 0) {
  const devHint = import.meta.env.DEV
    ? " Save client/.env if it is open in your editor, then restart the Vite dev server (npm run dev)."
    : "";
  throw new Error(
    `Firebase config missing or empty: ${missingKeys.join(", ")}. ` +
      `Add your Firebase *web app* credentials to client/.env as VITE_FIREBASE_* (see client/.env.sample). ` +
      `Server .env uses FIREBASE_ACCOUNT_* for Admin SDK only — those are not used by the browser.${devHint}`
  );
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
