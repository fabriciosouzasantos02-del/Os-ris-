import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, deleteDoc, getDocs, query, where, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Lazy-loaded or optionally fallback firebase configuration
let appInstance: any = null;
let dbInstance: any = null;
let authInstance: any = null;

// Standard firebase configuration or dynamic env fallback
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Check if we can safely initialize firebase Client
const hasConfig = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

export function getFirebaseApp() {
  if (!hasConfig) return null;
  if (!appInstance) {
    if (getApps().length === 0) {
      appInstance = initializeApp(firebaseConfig);
    } else {
      appInstance = getApp();
    }
  }
  return appInstance;
}

export function getFirestoreDB() {
  if (!hasConfig) return null;
  if (!dbInstance) {
    const app = getFirebaseApp();
    if (app) {
      dbInstance = getFirestore(app);
    }
  }
  return dbInstance;
}

export function getFirebaseAuth() {
  if (!hasConfig) return null;
  if (!authInstance) {
    const app = getFirebaseApp();
    if (app) {
      authInstance = getAuth(app);
    }
  }
  return authInstance;
}

// -------------------------------------------------------------------------
// HYBRID SYNCRONIZER LAYER FOR DATA PERSISTENCE
// -------------------------------------------------------------------------
// Seamlessly syncs between dynamic cloud Firestore database (when online and active)
// and robust offline localStorage fallback so that the app is always 100% functional.
// -------------------------------------------------------------------------

export interface UserProfileData {
  email: string;
  name: string;
  birthDate: string;
  birthTime?: string;
  birthCity: string;
  profilePhoto?: string;
  isPremium?: boolean;
  hasCreatedMap?: boolean;
  scorePoints?: number;
}

// 1. Core Profile persistence
export async function saveProfileToDatabase(email: string, profile: UserProfileData) {
  const mailKey = email.toLowerCase().trim();
  if (!mailKey) return;
  
  // Always update localStorage sync
  localStorage.setItem("orbi_user_profile", JSON.stringify(profile));
  
  const db = getFirestoreDB();
  if (db) {
    try {
      const userRef = doc(db, "users", mailKey);
      await setDoc(userRef, {
        ...profile,
        email: mailKey,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      console.log("Profile synchronized with cloud database.");
    } catch (e) {
      console.warn("Database storage deferred. Fallback to localStorage.", e);
    }
  }
}

export async function loadProfileFromDatabase(email: string): Promise<UserProfileData | null> {
  const mailKey = email.toLowerCase().trim();
  if (!mailKey) return null;
  
  const db = getFirestoreDB();
  if (db) {
    try {
      const userRef = doc(db, "users", mailKey);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const raw = snap.data() as UserProfileData;
        localStorage.setItem("orbi_user_profile", JSON.stringify(raw));
        return raw;
      }
    } catch (e) {
      console.warn("Cloud read deferred. Fallback to local cache.", e);
    }
  }
  
  // Fallback to localStorage
  const saved = localStorage.getItem("orbi_user_profile");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.email?.toLowerCase().trim() === mailKey) {
        return parsed;
      }
    } catch {}
  }
  return null;
}

// 2. Extra Maps Sync
export interface ExtraMapItem {
  id: string;
  userId: string;
  label: string;
  birthDate: string;
  birthTime?: string;
  birthCity: string;
  createdAt: string;
}

export async function saveExtraMapToDatabase(email: string, extraMap: ExtraMapItem) {
  const mailKey = email.toLowerCase().trim();
  if (!mailKey) return;

  // Sync to local list first
  const savedList = localStorage.getItem("orbi_extra_maps");
  let currentList: ExtraMapItem[] = [];
  try {
    currentList = savedList ? JSON.parse(savedList) : [];
  } catch {}
  currentList = currentList.filter(m => m.id !== extraMap.id);
  currentList.push(extraMap);
  localStorage.setItem("orbi_extra_maps", JSON.stringify(currentList));

  const db = getFirestoreDB();
  if (db) {
    try {
      const mapRef = doc(db, "users", mailKey, "extraMaps", extraMap.id);
      await setDoc(mapRef, {
        ...extraMap,
        userId: mailKey
      });
    } catch (e) {
      console.warn("Error sync map to cloud:", e);
    }
  }
}

export async function deleteExtraMapFromDatabase(email: string, mapId: string) {
  const mailKey = email.toLowerCase().trim();
  if (!mailKey) return;

  // Sync locally
  const savedList = localStorage.getItem("orbi_extra_maps");
  let currentList: ExtraMapItem[] = [];
  try {
    currentList = savedList ? JSON.parse(savedList) : [];
  } catch {}
  currentList = currentList.filter(m => m.id !== mapId);
  localStorage.setItem("orbi_extra_maps", JSON.stringify(currentList));

  const db = getFirestoreDB();
  if (db) {
    try {
      const mapRef = doc(db, "users", mailKey, "extraMaps", mapId);
      await deleteDoc(mapRef);
    } catch (e) {
      console.warn("Error deleting map from cloud:", e);
    }
  }
}

export async function loadExtraMapsFromDatabase(email: string): Promise<ExtraMapItem[]> {
  const mailKey = email.toLowerCase().trim();
  if (!mailKey) return [];

  const db = getFirestoreDB();
  if (db) {
    try {
      const colRef = collection(db, "users", mailKey, "extraMaps");
      const snap = await getDocs(colRef);
      const results: ExtraMapItem[] = [];
      snap.forEach((docSnap) => {
        results.push(docSnap.data() as ExtraMapItem);
      });
      if (results.length > 0) {
        localStorage.setItem("orbi_extra_maps", JSON.stringify(results));
        return results;
      }
    } catch (e) {
      console.warn("Error loading maps from cloud, reading local:", e);
    }
  }

  const savedList = localStorage.getItem("orbi_extra_maps");
  if (savedList) {
    try {
      return JSON.parse(savedList);
    } catch {}
  }
  return [];
}

// 3. User Dreams Cache
export interface DreamLogItem {
  id: string;
  userId: string;
  title: string;
  text: string;
  interpretation: string;
  sentiment: string;
  date: string;
}

export async function saveDreamToDatabase(email: string, dream: DreamLogItem) {
  const mailKey = email.toLowerCase().trim();
  if (!mailKey) return;

  // Local sync
  const savedList = localStorage.getItem("star_map_dreams_v2");
  let currentList: DreamLogItem[] = [];
  try {
    currentList = savedList ? JSON.parse(savedList) : [];
  } catch {}
  currentList = currentList.filter(d => d.id !== dream.id);
  currentList.push(dream);
  localStorage.setItem("star_map_dreams_v2", JSON.stringify(currentList));

  const db = getFirestoreDB();
  if (db) {
    try {
      const dreamRef = doc(db, "users", mailKey, "dreams", dream.id);
      await setDoc(dreamRef, {
        ...dream,
        userId: mailKey
      });
    } catch (e) {
      console.warn("Error sync dream to cloud:", e);
    }
  }
}

export async function loadDreamsFromDatabase(email: string): Promise<DreamLogItem[]> {
  const mailKey = email.toLowerCase().trim();
  if (!mailKey) return [];

  const db = getFirestoreDB();
  if (db) {
    try {
      const colRef = collection(db, "users", mailKey, "dreams");
      const snap = await getDocs(colRef);
      const results: DreamLogItem[] = [];
      snap.forEach((docSnap) => {
        results.push(docSnap.data() as DreamLogItem);
      });
      if (results.length > 0) {
        localStorage.setItem("star_map_dreams_v2", JSON.stringify(results));
        return results;
      }
    } catch (e) {
      console.warn("Error loading dreams from cloud:", e);
    }
  }

  const savedList = localStorage.getItem("star_map_dreams_v2");
  if (savedList) {
    try {
      return JSON.parse(savedList);
    } catch {}
  }
  return [];
}
