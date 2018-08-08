const resources = {
  scripts: [
    '/js/main.js',
    '/js/dbhelper.js',
    '/js/restaurant_info.js',
    'https://unpkg.com/idb-keyval@3.0.4/dist/idb-keyval-iife.min.js'
  ],
  styles: [
    '/css/styles.css',
    'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700'
  ],
  routes: ['/', '/restaurant.html'],
  imgs: [
    '/img/1.webp',
    '/img/2.webp',
    '/img/3.webp',
    '/img/4.webp',
    '/img/5.webp',
    '/img/6.webp',
    '/img/7.webp',
    '/img/8.webp',
    '/img/9.webp',
    '/img/undefined.webp',
    '/food.svg',
    '/img/bg1.webp',
    '/img/bg1-mobile.webp'
  ],
};

const staticCacheName = 'cusina-v7';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(staticCacheName).then(cache => {
      return cache.addAll([
        ...resources.routes,
        ...resources.styles,
        ...resources.scripts,
        ...resources.imgs
      ]);
    }).catch(error => console.error(error))
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function(cacheName) {
            return (
              cacheName.startsWith('cusina-') && cacheName != staticCacheName
            );
          })
          .map(function(cacheName) {
            return caches.delete(cacheName);
          })
      );
    }).catch(err => console.error(err))
  );
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  if (event.request.method === 'POST') {
    // Store here or In Fetch
    event.respondWith(fetch(event.request).catch(error => console.error(error)));
    return;
  }
  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname.includes('/restaurant.html')) {
      event.respondWith(caches.match('/restaurant.html'));
      return;
    } 
  }
  else if (requestUrl.origin.includes('maps')) {
    return;
  }
  event.respondWith(serve(event.request));
  
});

function serve(request) {
  const storageUrl = request.url;
  return caches.open(staticCacheName).then(cache => {
    return cache.match(storageUrl).then(response => {
      if (response) {
        return response;
      }
      return fetch(request).then(networkResponse => {
        cache.put(storageUrl, networkResponse.clone());
        return networkResponse;
      }).catch(err => console.error(err));
    }).catch(err => console.error(err));
  }).catch(err => console.error(err));
}
