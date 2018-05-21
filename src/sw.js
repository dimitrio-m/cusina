const resources = {
   images: [
    '/img/1.jpg',
    '/img/2.jpg',
    '/img/3.jpg',
    '/img/4.jpg',
    '/img/5.jpg',
    '/img/6.jpg',
    '/img/7.jpg',
    '/img/8.jpg',
    '/img/9.jpg',
    '/img/10.jpg'
  ],
  scripts: [
    '/js/main.js',
    '/js/dbhelper.js',
    '/js/restaurant_info.js'
  ],
  styles: [
    '/css/styles.css',
    'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700'
  ],
  data: [
    '/data/restaurants.json'
  ],
  routes: [
    '/',
    '/restaurant.html'
  ],
};

const staticCacheName = 'cusina-v2';

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      return cache.addAll([...resources.routes, ...resources.styles, ...resources.scripts, ...resources.images]);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('cusina-') &&
                 cacheName != staticCacheName;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener("fetch", event => {
  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname.includes('/restaurant.html')) {
      event.respondWith(caches.match('/restaurant.html'));
      return;
    }
  }

  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});


