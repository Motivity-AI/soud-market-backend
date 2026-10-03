'use client';
import { useEffect, useState, useCallback } from 'react';
import { WifiOff, RefreshCw, CloudOff } from 'lucide-react';
import { getPendingCount, syncPending } from '@/lib/offline/sync';
import toast from 'react-hot-toast';

export default function NetworkStatus() {
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  const refreshCount = useCallback(async () => {
    setPending(await getPendingCount());
  }, []);

  useEffect(() => {
    refreshCount();
    const t = setInterval(refreshCount, 5000);
    return () => clearInterval(t);
  }, [refreshCount]);

  const runSync = useCallback(async () => {
    setSyncing(true);
    try {
      const result = await syncPending();
      if (result.synced > 0) toast.success(`✅ تم نشر ${result.synced} منتج`);
      if (result.failed > 0) toast.error(`⚠️ فشل نشر ${result.failed}`);
      await refreshCount();
    } finally {
      setSyncing(false);
    }
  }, [refreshCount]);

  useEffect(() => {
    if (!online) return;
    getPendingCount().then((c) => { if (c > 0) runSync(); });
  }, [online, runSync]);

  if (online && pending === 0 && !syncing) return null;

  return (
    <div
      className={`text-sm px-4 py-2.5 flex items-center justify-between gap-3 ${
        !online
          ? 'bg-amber-50 border-b border-amber-200 text-amber-900'
          : 'bg-blue-50 border-b border-blue-200 text-blue-900'
      }`}
    >
      <div className="flex items-center gap-2">
        {!online ? (
          <><WifiOff className="w-4 h-4" />
            <span>أنت غير متصل — تُعرض لك آخر نسخة محفوظة</span></>
        ) : syncing ? (
          <><RefreshCw className="w-4 h-4 animate-spin" />
            <span>جارٍ نشر {pending} منتج...</span></>
        ) : pending > 0 ? (
          <><CloudOff className="w-4 h-4" />
            <span>{pending} منتج بانتظار النشر</span></>
        ) : null}
      </div>
      {online && pending > 0 && !syncing && (
        <button
          onClick={runSync}
          className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg"
        >
          نشر الآن
        </button>
      )}
    </div>
  );
}
