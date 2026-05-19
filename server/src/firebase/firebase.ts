import "../loadEnv";
import admin from "firebase-admin";

const projectId = process.env.FIREBASE_ACCOUNT_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ACCOUNT_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ACCOUNT_PRIVATE_KEY?.replace(
  /\\n/g,
  "\n"
);

export const isFirebaseAdminConfigured = Boolean(
  projectId && clientEmail && privateKey
);

if (isFirebaseAdminConfigured) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: projectId!,
      clientEmail: clientEmail!,
      privateKey: privateKey!,
    }),
  });
}

export default admin;
