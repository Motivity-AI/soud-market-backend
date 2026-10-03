'use client';

const DB_NAME = 'sudan_market_offline';
const DB_VERSION = 1;

export const STORES = {
  QUEUE: 'sync_queue',
  CACHE: 'product_cache'
} as const;

type StoreName = (typeof STORES)[keyof typeof STORES];

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB غير مدعوم'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORES.QUEUE))
        db.createObjectStore(STORES.QUEUE, { keyPath: 'localId' });
      if (!db.objectStoreNames.contains(STORES.CACHE))
        db.createObjectStore(STORES.CACHE, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function put(store: StoreName, value: any): Promise<void> {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put(value);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

export async function getAll<T = any>(store: StoreName): Promise<T[]> {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(store, 'readonly');
    const r = tx.objectStore(store).getAll();
    r.onsuccess = () => res(r.result as T[]);
    r.onerror = () => rej(r.error);
  });
}

export async function remove(store: StoreName, key: string): Promise<void> {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).delete(key);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

export async function clear(store: StoreName): Promise<void> {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).clear();
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}
