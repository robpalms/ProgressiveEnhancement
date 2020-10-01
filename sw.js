// service worker version
const version = 1.1;

// static cache - app shell
const appAssets = [
  "index.html",
  "main.js",
  "images/flame.png",
  "images/logo.png",
  "images/sync.png",
  "vendor/bootstrap.min.css",
  "vendor/jquery.min.js",
];

// service worker install event
self.addEventListener("install", (e) => {
  // wait until creating a cache and opening it
  // is done then proceed to 'activate' event
  e.waitUntil(
    // open caches named 'static{:version}',
    // else create one and open it
    caches.open("static-" + version).then((cache) => {
      cache.addAll(appAssets);
    })
  );
});

// service worker activate event
self.addEventListener("activate", (e) => {
  // clean static cache
  let cleaned = caches.keys().then((keys) => {
    // loop through caches stored cache 'keys'
    keys.forEach((key) => {
      // if the key 'cache' is not equal to the
      // current cache name but match the 'static-' meaning it is the old version
      if (key !== "static-" + version && key.match("static-")) {
        return caches.delete(key);
      }
    });
  });

  // wait until old version caches is cleaned
  e.waitUntil(cleaned);
});

// static cache strategy - cache with network fallback
const staticCache = (req, cacheName) => {
  return caches.match(req).then((cachedRes) => {
    // if cached response is found return it.
    if (cachedRes) return cachedRes;

    // fall back to network if no cached response is found
    return fetch(req).then((networkRes) => {
      // update cache with new response
      caches.open(cacheName).then((cache) => cache.put(req, networkRes));

      // return clone of network response
      return networkRes.clone();
    });
  });
};

// network with cache fallback - complete reversal of the above strategy
const fallbackCache = (req) => {
  // try fetch to network
  return fetch(req)
    .then((networkRes) => {
      // check if network response is OK, else go to cache
      if (!networkRes.ok) throw "Fetch Error";

      // update cache
      caches
        .open("static-" + version)
        .then((cache) => cache.put(req, networkRes));

      // return clone of network response
      return networkRes.clone();
    })
    .catch((error) => caches.match(req)); // try cache if in case network fails
};

// service worker fetch event - 'script runs every time an xhr request is fired'
self.addEventListener("fetch", (e) => {
  // app shell
  if (e.request.url.match(location.origin)) {
    e.respondWith(staticCache(e.request));
    // giphy api
  } else if (e.request.url.match("api.giphy.com/v1/gifs/trending")) {
    e.respondWith(fallbackCache(e.request));
    // giphy media
  } else if (e.request.url.match("giphy.com/media")) {
    e.respondWith(staticCache(e.request, "giphy"));
  }
});

// push notification
self.addEventListener("push", (e) => {
  let n = self.registration.showNotification("Something's new check it out", {
    body: "Some notification from push server",
    icon: "/images/icons/notification.png",
  });
  e.waitUntil(n);
});
