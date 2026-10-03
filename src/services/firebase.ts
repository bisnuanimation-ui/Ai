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
  setLogLevel,
} from 'firebase/firestore';
import { getDatabase, ref as rtdbRef, set as rtdbSet, remove as rtdbRemove, onValue as rtdbOnValue } from 'firebase/database';
import { getStorage, ref as sRef, uploadString, getDownloadURL } from 'firebase/storage';
import { PromptItem } from '../types';

// Web app's Firebase configuration provided by user
export const firebaseConfig = {
  apiKey: "AIzaSyCxCWbClonFQDFJXvm3KGE1u1QvgXCrYX4",
  authDomain: "aill-73ce8.firebaseapp.com",
  databaseURL: "https://aill-73ce8-default-rtdb.firebaseio.com",
  projectId: "aill-73ce8",
  storageBucket: "aill-73ce8.firebasestorage.app",
  messagingSenderId: "67541098808",
  appId: "1:67541098808:web:8334b9b5f40f354a4a21cd",
  firestoreDatabaseId: "",
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Silence all background gRPC connection warning logs (like standard idle stream cancellation reports)
try {
  setLogLevel('error');
} catch (e) {
  // ignore
}

export const rtdb = getDatabase(app, firebaseConfig.databaseURL || 'https://gen-lang-client-0348323359-default-rtdb.firebaseio.com');

// Test connection on boot per Firebase skill guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
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
    let unsubscribeFirestore: (() => void) | null = null;
    let unsubscribeRTDB: (() => void) | null = null;

    const setupRTDBListener = () => {
      try {
        console.log('🔗 Connecting to Realtime Database (RTDB) sync engine...');
        const rtdbPromptsRef = rtdbRef(rtdb, 'prompts');
        unsubscribeRTDB = rtdbOnValue(
          rtdbPromptsRef,
          (snapshot) => {
            if (!unsubscribed) {
              const list: PromptItem[] = [];
              const data = snapshot.val();
              if (data && typeof data === 'object') {
                Object.keys(data).forEach((id) => {
                  list.push({
                    ...data[id],
                    id: id,
                  });
                });
              }
              list.sort((a, b) => {
                // Sort featured/pinned first, then by createdAt descending
                if (a.isFeatured && !b.isFeatured) return -1;
                if (!a.isFeatured && b.isFeatured) return 1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              });
              callback(list);
            }
          },
          (rtdbErr) => {
            console.warn('RTDB listen subscription notice:', rtdbErr);
          }
        );
      } catch (err) {
        console.warn('Failed to bind RTDB fallback listener:', err);
      }
    };

    // Subscribe to Firestore as the single real-time source of truth
    try {
      const promptsCol = collection(db, 'prompts');
      unsubscribeFirestore = onSnapshot(
        promptsCol,
        (snapshot) => {
          if (!unsubscribed) {
            const list: PromptItem[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              list.push({
                ...(data as any),
                id: docSnap.id,
              });
            });
            list.sort((a, b) => {
              if (a.isFeatured && !b.isFeatured) return -1;
              if (!a.isFeatured && b.isFeatured) return 1;
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            callback(list);
          }
        },
        (error) => {
          // If Firestore is exhausted/quota limit hit, immediately switch to RTDB!
          console.warn('Firestore subscription restricted (quota or connection). Switching to Realtime Database engine...', error);
          if (!unsubscribed && !unsubscribeRTDB) {
            setupRTDBListener();
          }
        }
      );
    } catch (e) {
      console.warn('Firestore connection failed on subscribe. Swapping to RTDB...', e);
      if (!unsubscribed && !unsubscribeRTDB) {
        setupRTDBListener();
      }
    }

    return () => {
      unsubscribed = true;
      if (unsubscribeFirestore) unsubscribeFirestore();
      if (unsubscribeRTDB) unsubscribeRTDB();
    };
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

  // Permanent, serverless cloud upload to Firebase Storage with strict 2-second timeout
  uploadImageToStorage: async (imageBase64: string): Promise<string> => {
    if (!imageBase64 || !imageBase64.startsWith('data:image/')) {
      return imageBase64;
    }
    try {
      const storageInstance = getStorage(app);
      const filename = `prompts/img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;
      const fileRef = sRef(storageInstance, filename);
      
      const uploadPromise = (async () => {
        const uploadResult = await uploadString(fileRef, imageBase64, 'data_url');
        const downloadUrl = await getDownloadURL(uploadResult.ref);
        return downloadUrl;
      })();

      const timeoutPromise = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('Firebase Storage upload timeout (2s)')), 2000)
      );

      return await Promise.race([uploadPromise, timeoutPromise]);
    } catch (err) {
      console.warn('Firebase Storage upload timed out, disabled, or failed. Swapping to backup:', err);
      throw err;
    }
  },
};
