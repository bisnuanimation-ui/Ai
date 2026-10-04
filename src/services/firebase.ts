import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  getDocFromServer,
} from 'firebase/firestore';
import { getDatabase, ref as rtdbRef, set as rtdbSet, remove as rtdbRemove, onValue as rtdbOnValue } from 'firebase/database';
import { PromptItem } from '../types';

// Web app's Firebase configuration provided by user
export const firebaseConfig = {
  apiKey: "AIzaSyBsQgRKdlPbhbd-xz4zndbMEaGKGZMnJ6k",
  authDomain: "gen-lang-client-0348323359.firebaseapp.com",
  databaseURL: "https://gen-lang-client-0348323359-default-rtdb.firebaseio.com",
  projectId: "gen-lang-client-0348323359",
  storageBucket: "gen-lang-client-0348323359.firebasestorage.app",
  messagingSenderId: "808013921358",
  appId: "1:808013921358:web:d3a4aa1bb85a808097d71f",
  firestoreDatabaseId: "ai-studio-adsenseaiphotopo-8ece1d3b-b554-4a8e-b22e-7c07f033f158",
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const rtdb = getDatabase(app, firebaseConfig.databaseURL || 'https://gen-lang-client-0348323359-default-rtdb.firebaseio.com');

// Test connection on boot gracefully
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    // Graceful silent fallback if offline or initial load
  }
}
testConnection();

// Helper to sanitize object recursively so no field is undefined (preventing Firebase undefined errors)
export function cleanForFirebase<T extends Record<string, any>>(obj: T): T {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        cleaned[key] = value.filter((v) => v !== undefined);
      } else if (value !== null && typeof value === 'object') {
        cleaned[key] = cleanForFirebase(value);
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned as T;
}

// Dual-Engine Firebase Service (Firestore + Realtime Database)
export const firestoreService = {
  // Real-time listener for live sync across all devices
  subscribeToPrompts: (callback: (prompts: PromptItem[]) => void) => {
    let unsubscribed = false;

    // 1. Subscribe to Firestore
    try {
      const promptsCol = collection(db, 'prompts');
      const unsubscribeFirestore = onSnapshot(
        promptsCol,
        (snapshot) => {
          if (!snapshot.empty && !unsubscribed) {
            const list: PromptItem[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              list.push({
                ...(data as any),
                id: docSnap.id,
              });
            });
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            callback(list);
          }
        },
        (error) => {
          console.warn('Firestore subscription notice:', error);
        }
      );

      // 2. Also listen to Realtime Database at https://gen-lang-client-0348323359-default-rtdb.firebaseio.com/
      try {
        const promptsRtdbRef = rtdbRef(rtdb, 'prompts');
        const unsubscribeRtdb = rtdbOnValue(
          promptsRtdbRef,
          (snapshot) => {
            if (snapshot.exists() && !unsubscribed) {
              const val = snapshot.val();
              const list: PromptItem[] = Object.keys(val).map((k) => ({
                ...val[k],
                id: val[k].id || k,
              }));
              list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              callback(list);
            }
          },
          (err) => {
            console.warn('RTDB subscription notice:', err);
          }
        );

        return () => {
          unsubscribed = true;
          unsubscribeFirestore();
          unsubscribeRtdb();
        };
      } catch (e) {
        return () => {
          unsubscribed = true;
          unsubscribeFirestore();
        };
      }
    } catch (e) {
      console.warn('Failed to subscribe to firestore:', e);
      return () => {
        unsubscribed = true;
      };
    }
  },

  // Save prompt to BOTH Firestore & Realtime Database
  savePrompt: async (prompt: PromptItem): Promise<boolean> => {
    try {
      const sanitized = cleanForFirebase(prompt);

      // 1. Save to Firestore
      const docRef = doc(db, 'prompts', sanitized.id);
      await setDoc(docRef, sanitized, { merge: true });

      // 2. Save to Realtime Database
      try {
        const itemRef = rtdbRef(rtdb, `prompts/${sanitized.id}`);
        await rtdbSet(itemRef, sanitized);
      } catch (rtdbErr) {
        console.warn('Realtime database sync note:', rtdbErr);
      }

      return true;
    } catch (err) {
      console.error('Error saving prompt to Firebase:', err);
      return false;
    }
  },

  // Delete prompt from BOTH Firestore & Realtime Database
  deletePrompt: async (promptId: string): Promise<boolean> => {
    try {
      const docRef = doc(db, 'prompts', promptId);
      await deleteDoc(docRef);

      try {
        const itemRef = rtdbRef(rtdb, `prompts/${promptId}`);
        await rtdbRemove(itemRef);
      } catch (rtdbErr) {
        console.warn('Realtime database remove note:', rtdbErr);
      }

      return true;
    } catch (err) {
      console.error('Error deleting prompt from Firebase:', err);
      return false;
    }
  },

  // Update prompt engagement counter (likes / copies / views)
  incrementEngagement: async (
    promptId: string,
    field: 'likes' | 'copyCount' | 'views',
    newValue: number
  ) => {
    try {
      const docRef = doc(db, 'prompts', promptId);
      await updateDoc(docRef, { [field]: newValue });

      try {
        const fieldRef = rtdbRef(rtdb, `prompts/${promptId}/${field}`);
        await rtdbSet(fieldRef, newValue);
      } catch (e) {
        // ignore
      }
    } catch (err) {
      console.warn('Failed to update engagement on Firebase:', err);
    }
  },

  // Sync any missing prompts into Firestore so all devices have all posts
  seedInitialPrompts: async (initialPrompts: PromptItem[]) => {
    try {
      const snapshot = await getDocs(collection(db, 'prompts'));
      const existingIds = new Set(snapshot.docs.map((d) => d.id));

      for (const p of initialPrompts) {
        if (!existingIds.has(p.id)) {
          const sanitized = cleanForFirebase(p);
          await setDoc(doc(db, 'prompts', p.id), sanitized);
          try {
            await rtdbSet(rtdbRef(rtdb, `prompts/${p.id}`), sanitized);
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn('Syncing prompts to Firebase note:', err);
    }
  },
};
