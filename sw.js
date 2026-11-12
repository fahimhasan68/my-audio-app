const CACHE_NAME = 'deeni-mehonot-live-v2';
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
      // কোনো একটি ফাইল সাময়িকভাবে না পাওয়া গেলেও যেন ইনস্টলেশন আটকে না যায়
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
  // শুধু GET রিকোয়েস্ট হ্যান্ডেল করা হবে
  if (event.request.method !== 'GET') {
    return;
  }

  // অডিও এবং গুগল শিটসের রিকোয়েস্ট সরাসরি ইন্টারনেটে যাবে
  if (
    event.request.url.includes('archive.org') ||
    event.request.url.includes('allorigins') ||
    event.request.url.includes('script.google.com')
  ) {
    return;
  }

  // Network-First: নেট থাকলে নতুন ভার্সন আনবে ও ক্যাশ আপডেট করবে; অফলাইনে ক্যাশ থেকে দেখাবে
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
