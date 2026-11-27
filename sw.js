const CACHE_NAME = 'deeni-mehonot-live-v3';
const CORE_ASSETS = [
  './',
  './index.html',
  './data.json',
  './manifest.json',
  './irshadus_saeed.txt'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        CORE_ASSETS.map((url) => cache.add(url))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = event.request.url;
  // অডিও, রিলিজ PDF এবং প্রক্সি রিকোয়েস্ট সরাসরি ইন্টারনেটে যাবে
  if (
    url.includes('archive.org') ||
    url.includes('allorigins') ||
    url.includes('codetabs') ||
    url.includes('corsproxy') ||
    url.includes('script.google.com') ||
    url.includes('github.com/fahimhasan68/my-audio-app/releases') ||
    url.includes('objects.githubusercontent.com')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
