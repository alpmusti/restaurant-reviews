var cacheName = 'restaurant-reviews-v1';

self.addEventListener('install', function(event) {
  // e.waitUntil Delays the event until the Promise is resolved
  event.waitUntil(
    // Open the cache
    caches.open(cacheName).then(function(cache) {
//
    // Add all the default files to the cache
    return cache.addAll([
        '/',
        '/img/*.jpg',
        'restaurant.html',
        'index.html',
        'js/app.js',
        'js/main.js',
        'js/dbhelper.js',
        'data/restaurants.json',
        'js/restaurant_info.js',
        'css/styles.css',
        'https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.0/normalize.min.css',
        'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700'
      ]).catch((error) => console.log("caches open : " ,error));
    })
  ); // end event.waitUntil
});


self.addEventListener('activate', function(event) {

  event.waitUntil(
    // Get all the cache keys (cacheName)
    caches.keys().then(function(cacheNames) {
      return Promise.all(cacheNames.map(function(thisCacheName) {

        // If a cached item is saved under a previous cacheName
        if (thisCacheName !== cacheName) {

          // Delete that cached file
          return caches.delete(thisCacheName);
        }
      }));
    })
  ); // end event.waitUntil
});

self.addEventListener('fetch', function(event){  
  var url = event.request.url;
  // 404 Handling
  if(url.startsWith('chrome-extension://') 
    || url.startsWith('https://csi.gstatic.com')
    || url.startsWith('https://maps.googleapis.com')
  ){
    return fetch(event.request);
  }

  event.respondWith(
    caches.open(cacheName).then(function(cache) {
      return cache.match(event.request).then(function (response) {
        return response || fetch(event.request).then(function(response) {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});