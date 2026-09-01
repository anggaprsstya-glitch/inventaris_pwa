```javascript
/* ==========================================
   SERVICE WORKER
   SISTEM INVENTARIS RUANGAN
========================================== */

const CACHE_NAME = "inventaris-pwa-v1";


const FILES_TO_CACHE = [

    "./",

    "./index.html",

    "./style.css",

    "./script.js",

    "./manifest.json",

    "./icons/icon-192.png",

    "./icons/icon-512.png"

];


/* ==========================================
   INSTALL
========================================== */

self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then(
                    cache => {

                        return cache.addAll(
                            FILES_TO_CACHE
                        );

                    }
                )

        );


        self.skipWaiting();

    }
);


/* ==========================================
   ACTIVATE
========================================== */

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches
                .keys()
                .then(
                    cacheNames => {

                        return Promise.all(

                            cacheNames
                                .filter(
                                    cacheName =>
                                        cacheName !==
                                        CACHE_NAME
                                )
                                .map(
                                    cacheName =>
                                        caches.delete(
                                            cacheName
                                        )
                                )

                        );

                    }
                )

        );


        self.clients.claim();

    }
);


/* ==========================================
   FETCH
========================================== */

self.addEventListener(
    "fetch",
    event => {

        event.respondWith(

            caches
                .match(event.request)
                .then(
                    cachedResponse => {

                        if (
                            cachedResponse
                        ) {

                            return cachedResponse;

                        }


                        return fetch(
                            event.request
                        )
                        .then(
                            networkResponse => {

                                return networkResponse;

                            }
                        )
                        .catch(
                            () => {

                                return caches.match(
                                    "./index.html"
                                );

                            }
                        );

                    }
                )

        );

    }
);
```
