'use client';
import { useEffect } from 'react';

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return;

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // تحديث تلقائي كل ساعة
        setInterval(() => reg.update(), 60 * 60 * 1000);
      })
      .catch(() => {});
  }, []);
  return null;
}
