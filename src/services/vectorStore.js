// In-memory vector store with AsyncStorage persistence.
//
// A "real" vector DB (Pinecone, pgvector, Weaviate) doesn't fit a
// client-only app, and our working set is tens-to-hundreds of cards.
// A flat cosine-similarity scan over a Map is both fast enough and
// keeps the user's profile data on-device.

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@cfh_vector_store';

// id -> { vector: number[], hash: string, updatedAt: number }
let store = new Map();
let loaded = false;
let loadPromise = null;

const cosine = (a, b) => {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
};

// djb2 — used to detect when a card's profile text has changed so we
// can skip re-embedding identical inputs.
export const textHash = (s) => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return String(h);
};

const persist = async () => {
  const obj = {};
  store.forEach((v, k) => { obj[k] = v; });
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
};

export const loadVectorStore = async () => {
  if (loaded) return;
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const obj = JSON.parse(raw);
        store = new Map(Object.entries(obj));
      } catch {
        store = new Map();
      }
    }
    loaded = true;
  })();
  return loadPromise;
};

export const upsert = async (id, vector, hash) => {
  await loadVectorStore();
  store.set(id, { vector, hash, updatedAt: Date.now() });
  await persist();
};

export const remove = async (id) => {
  await loadVectorStore();
  if (store.delete(id)) await persist();
};

export const getEntry = async (id) => {
  await loadVectorStore();
  return store.get(id) || null;
};

// Return { id, score } pairs sorted highest-first. `excludeId` skips the
// querying user's own card. `ids` optionally restricts to a subset.
export const search = async (queryVector, { k = 10, excludeId, ids } = {}) => {
  await loadVectorStore();
  const results = [];
  const keys = ids ? ids.filter((id) => store.has(id)) : Array.from(store.keys());
  for (const id of keys) {
    if (id === excludeId) continue;
    const entry = store.get(id);
    if (!entry) continue;
    results.push({ id, score: cosine(queryVector, entry.vector) });
  }
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, k);
};

export const clearVectorStore = async () => {
  store = new Map();
  await AsyncStorage.removeItem(STORAGE_KEY);
};
