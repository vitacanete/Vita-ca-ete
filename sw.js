const CACHE_NAME = "vita-canete-v2";

const ARCHIVOS = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",
    "./iconos/icon-192.png",
    "./iconos/icon-512.png"
];

self.addEventListener("install", function (event) {

    event.waitUntil(

        caches.open(CACHE_NAME)

            .then(function (cache) {

                return cache.addAll(ARCHIVOS);

            })

            .then(function () {

                return self.skipWaiting();

            })

    );

});


self.addEventListener("activate", function (event) {

    event.waitUntil(

        caches.keys().then(function (keys) {

            return Promise.all(

                keys
                    .filter(function (key) {

                        return key !== CACHE_NAME;

                    })
                    .map(function (key) {

                        return caches.delete(key);

                    })

            );

        }).then(function () {

            return self.clients.claim();

        })

    );

});


self.addEventListener("fetch", function (event) {

    if (event.request.method !== "GET") {

        return;

    }


    event.respondWith(

        caches.match(event.request)

            .then(function (respuestaGuardada) {

                if (respuestaGuardada) {

                    return respuestaGuardada;

                }


                return fetch(event.request)

                    .then(function (respuesta) {

                        const copia =
                            respuesta.clone();


                        caches.open(CACHE_NAME)

                            .then(function (cache) {

                                cache.put(
                                    event.request,
                                    copia
                                );

                            });


                        return respuesta;

                    })

                    .catch(function () {

                        return caches.match(
                            "./index.html"
                        );

                    });

            })

    );

});
