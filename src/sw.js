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
  routes: ['/', '/restaurant.html']
};

const staticCacheName = 'cusina-v6';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(staticCacheName).then(cache => {
      return cache.addAll([
        ...resources.routes,
        ...resources.styles,
        ...resources.scripts
      ]);
    })
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
    })
  );
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname.includes('/restaurant.html')) {
      event.respondWith(caches.match('/restaurant.html'));
      return;
    }
    if (requestUrl.pathname.startsWith('/img/')) {
      event.respondWith(servePhoto(event.request));
      return;
    }
  }

  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});

function servePhoto(request) {
  const storageUrl = request.url.replace(/-\d+px\.webp$/, '');
  return caches.open(staticCacheName).then(cache => {
    return cache.match(storageUrl).then(response => {
      if (response) {
        return response;
      }
      return fetch(request).then(networkResponse => {
        cache.put(storageUrl, networkResponse.clone());
        return networkResponse;
      });
    });
  });
}
