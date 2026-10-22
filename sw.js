'use strict';

// Bump this name whenever a cached file changes so returning players receive
// the new version as one complete, consistent set of files.
const CACHE_NAME = 'halloween-hunt-v2';

const APP_FILES = [
  './',
  './index.html',
  './css/style.css',
  './css/house.css',
  './js/app.js',
  './js/config.js',
  './js/challenges.js',
  './challenges/photo-challenge.js',
  './challenges/challenge-01-graveyard.js',
  './challenges/challenge-02-potion.js',
  './challenges/challenge-03-constellation.js',
  './challenges/challenge-04-culture-trivia.js',
  './challenges/challenge-05-familiar.js',
  './challenges/challenge-06-history-trivia.js',
  './challenges/challenge-07-haunted-house.js',
  './challenges/challenge-08-silent-follower.js',
  './challenges/challenge-09-folklore-trivia.js',
  './challenges/challenge-10-joyride.js',
  './challenges/challenge-11-monsters.js',
  './challenges/challenge-12-sequence.js',
];

const appUrls = APP_FILES.map(path => new URL(path, self.registration.scope).href);
const indexUrl = new URL('./index.html', self.registration.scope).href;
const uncachedPhotoFiles = new Set([
  'gallery.html',
  'slideshow.html',
  'css/gallery.css',
  'js/gallery.js',
  'js/slideshow.js',
  'js/slideshow-queue.js',
  'js/zip.js',
]);

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(appUrls)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names
          .filter(name => name.startsWith('halloween-hunt-') && name !== CACHE_NAME)
          .map(name => caches.delete(name)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  const relativePath = url.pathname.slice(new URL(self.registration.scope).pathname.length);
  if (uncachedPhotoFiles.has(relativePath)) {
    event.respondWith(fetch(request, { cache: 'no-store' }));
    return;
  }

  if (request.mode === 'navigate') {
    // Every in-app route is rendered by index.html. Ignoring its query string
    // also makes scanned NFC/QR challenge links work completely offline.
    event.respondWith(
      caches.match(indexUrl).then(cached => cached || fetch(request)),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      });
    }),
  );
});
