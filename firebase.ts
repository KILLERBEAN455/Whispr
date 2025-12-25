import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import {
  getFirestore,
  serverTimestamp,
  collection,
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { getDatabase, ref, set, onDisconnect } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

/**
 * Ensure anonymous sign-in and create a minimal user doc in Firestore
 */
async function ensureAnonymousSignIn() {
  return new Promise<User | null>((resolve, reject) => {
    const unsub = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          // ensure user doc exists
          const userRef = doc(db, 'users', user.uid);
          const snapshot = await getDoc(userRef);
          if (!snapshot.exists()) {
            await setDoc(userRef, {
              uid: user.uid,
              createdAt: serverTimestamp(),
              displayName: null,
              lastSeen: serverTimestamp()
            });
          }
          unsub();
          resolve(user);
        } else {
          try {
            const cred = await signInAnonymously(auth);
            // onAuthStateChanged will resolve
          } catch (err) {
            unsub();
            reject(err);
          }
        }
      },
      (err) => {
        unsub();
        reject(err);
      }
    );
  });
}

export { app, auth, db, rtdb, ensureAnonymousSignIn, serverTimestamp, collection, doc, setDoc };