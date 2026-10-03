'use client';
import { createClient } from '@/lib/supabase/client';
import { put, getAll, remove, STORES } from './db';
import type { Product } from '@/lib/types';

export type QueuedAction =
  | { localId: string; type: 'insert'; payload: any; createdAt: string }
  | { localId: string; type: 'update'; id: string; payload: any; createdAt: string }
  | { localId: string; type: 'delete'; id: string; createdAt: string };

/** إضافة عملية للطابور المحلي */
export async function enqueue(
  action: Omit<QueuedAction, 'localId' | 'createdAt'>
): Promise<string> {
  const item: QueuedAction = {
    ...action,
    localId: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString()
  } as QueuedAction;
  await put(STORES.QUEUE, item);
  return item.localId;
}

export async function getPendingCount(): Promise<number> {
  try {
    const items = await getAll(STORES.QUEUE);
    return items.length;
  } catch {
    return 0;
  }
}

export async function getPendingItems(): Promise<QueuedAction[]> {
  return getAll<QueuedAction>(STORES.QUEUE);
}

/** مزامنة كل ما هو معلّق */
export async function syncPending(): Promise<{ synced: number; failed: number }> {
  const supabase = createClient();
  const items = await getAll<QueuedAction>(STORES.QUEUE);
  let synced = 0;
  let failed = 0;

  for (const item of items) {
    try {
      if (item.type === 'insert') {
        const { error } = await supabase.from('products').insert(item.payload);
        if (error) throw error;
      } else if (item.type === 'update') {
        const { error } = await supabase
          .from('products').update(item.payload).eq('id', item.id);
        if (error) throw error;
      } else if (item.type === 'delete') {
        const { error } = await supabase
          .from('products').delete().eq('id', item.id);
        if (error) throw error;
      }
      await remove(STORES.QUEUE, item.localId);
      synced++;
    } catch {
      failed++;
    }
  }
  return { synced, failed };
}

/** تخزين آخر نسخة من القائمة للقراءة أوفلاين */
export async function cacheProducts(products: Product[]): Promise<void> {
  try {
    for (const p of products) await put(STORES.CACHE, p);
  } catch {}
}

export async function getCachedProducts(): Promise<Product[]> {
  try {
    return await getAll<Product>(STORES.CACHE);
  } catch {
    return [];
  }
}

export async function clearCache(): Promise<void> {
  try { await clear(STORES.CACHE); } catch {}
}
