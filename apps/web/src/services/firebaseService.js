import { initializeApp, getApps } from 'firebase/app';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

function isFirebaseConfigured() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
}

function getDb() {
  if (!isFirebaseConfigured()) {
    return null;
  }

  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  return getFirestore(app);
}

function sanitizeImages(images = []) {
  if (!Array.isArray(images)) {
    return [];
  }

  return images.filter((value) => typeof value === 'string' && value.trim().length > 0).map((item) => item.trim());
}

function sanitizeTypes(types = []) {
  if (!Array.isArray(types) || types.length === 0) {
    return ['solo'];
  }

  return Array.from(new Set(types));
}

function buildDocPayload(payload) {
  return {
    name: payload.name,
    description: payload.description ?? '',
    category: payload.category,
    subcategory: payload.subcategory ?? 'atraccion',
    types: sanitizeTypes(payload.types),
    type: payload.type ?? sanitizeTypes(payload.types)[0],
    price: Number(payload.price ?? 0),
    source: 'custom',
    featured: true,
    images: sanitizeImages(payload.images),
    location: {
      address: payload.location?.address ?? '',
      commune: payload.location?.commune ?? 'Santiago',
      region: payload.location?.region ?? 'RM',
      lat: Number(payload.location?.lat),
      lng: Number(payload.location?.lng)
    },
    updatedAt: serverTimestamp()
  };
}

export async function listCustomPanoramas() {
  const db = getDb();

  if (!db) {
    return [];
  }

  const snapshot = await getDocs(query(collection(db, 'panoramas'), orderBy('updatedAt', 'desc')));

  return snapshot.docs.map((docItem) => ({
    firestoreId: docItem.id,
    ...docItem.data()
  }));
}

export async function createCustomPanorama(payload) {
  const db = getDb();

  if (!db) {
    throw new Error('Firebase is not configured. Set VITE_FIREBASE_* variables.');
  }

  const docRef = await addDoc(collection(db, 'panoramas'), {
    ...buildDocPayload(payload),
    createdAt: serverTimestamp()
  });

  return docRef.id;
}

export async function updateCustomPanorama(firestoreId, payload) {
  const db = getDb();

  if (!db) {
    throw new Error('Firebase is not configured. Set VITE_FIREBASE_* variables.');
  }

  await updateDoc(doc(db, 'panoramas', firestoreId), buildDocPayload(payload));
}

export async function removeCustomPanorama(firestoreId) {
  const db = getDb();

  if (!db) {
    throw new Error('Firebase is not configured. Set VITE_FIREBASE_* variables.');
  }

  await deleteDoc(doc(db, 'panoramas', firestoreId));
}
