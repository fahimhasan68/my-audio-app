const CACHE_NAME = 'deeni-mehonot-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './data.json',
    './durood40.txt' // আপনার রিপোজিটরিতে থাকা টেক্সট ফাইলের নামগুলো এখানে কমা দিয়ে যুক্ত করবেন
];

// ইনস্টল হওয়ার সময় ফাইলগুলো ফোনে সেভ করা
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// অফলাইনে ক্যাশ থেকে ফাইল পাঠানো
self.addEventListener('fetch', (e) => {
    // ইন্টারনেট আর্কাইভের অডিও রিকোয়েস্ট ক্যাশে আটকাবে না (অনলাইন রাখবে)
    if (e.request.url.includes('archive.org') || e.request.url.includes('allorigins')) {
        return;
    }

    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            if (cachedResponse) {
                // ক্যাশে পাওয়া গেলে অফলাইনে সরাসরি ক্যাশ থেকেই দেখাবে
                return cachedResponse;
            }
            // ক্যাশে না থাকলে নেট থেকে এনে ক্যাশে যোগ করবে
            return fetch(e.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(e.request, responseClone);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // ইন্টারনেট না থাকলেও ক্র্যাশ করবে না
            });
        })
    );
});
