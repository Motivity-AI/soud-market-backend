const CACHE = 'sudan-market-v1';
const OFFLINE_URLS = ['/', '/login', '/register'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(OFFLINE_URLS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // لا تتدخل في Supabase أو API
  if (url.hostname.includes('supabase') || url.pathname.startsWith('/api/')) return;

  // لا تخزن طلبات غير GET
  if (request.method !== 'GET') return;

  // Network-First للصفحات
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() =>
          caches.match(request).then((r) => r || caches.match('/'))
        )
    );
    return;
  }

  // Cache-First للموارد الثابتة
  e.respondWith(
    caches.match(request).then((cached) =>
      cached ||
      fetch(request).then((res) => {
        // لا تخزن استجابات فاشلة
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy));
        return res;
      })
    )
  );
});

// استقبال رسائل من الصفحة
self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
