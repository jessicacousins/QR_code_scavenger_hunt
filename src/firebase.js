import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
};

const hasFirebase =
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId;

export const fbEnabled = !!hasFirebase;

let app = null;
let auth = null;
let db = null;

export function getFirebase() {
  if (!fbEnabled) return { app: null, auth: null, db: null };
  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
  return { app, auth, db };
}

export async function ensureAnonAuth() {
  if (!fbEnabled) return { uid: null };
  const { auth } = getFirebase();
  const cur = auth.currentUser;
  if (cur) return { uid: cur.uid };

  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          unsub();
          resolve({ uid: user.uid });
          return;
        }
        // sign in if still not signed in
        const cred = await signInAnonymously(auth);
        unsub();
        resolve({ uid: cred.user.uid });
      } catch (e) {
        try { unsub(); } catch {}
        reject(e);
      }
    });
  });
}

export { serverTimestamp };
