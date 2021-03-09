// service worker file

const staticCacheName = "s-app-v1";
const dynamicCacheName = "d-app-v1";

const assetUrls = [
  "index.html",
  "/js/app.js",
  "/css/styles.css",
  "offline.html",
];

// event one
self.addEventListener("install", async (event) => {
  console.log("install");
  // put assetUrl into cache!!
  // event.waitUntil(
  //   cashes.open(staticCacheName).then((cache) => cache.addAll([assetUrls]))
  // );

  // old tricks
  const cache = await caches.open(staticCacheName);
  await cache.addAll(assetUrls);
});

// event two
self.addEventListener("activate", async (event) => {
  console.log("activate");
  const cacheNames = await caches.keys();
  console.log("key from caches 0", cacheNames[0]);
  console.log("key from caches 1", cacheNames[1]);
  await Promise.all(
    cacheNames
      .filter((name) => name !== staticCacheName)
      .filter((name) => name !== dynamicCacheName)
      .map((name) => caches.delete(name))
  );
});

// for requests to the files
self.addEventListener("fetch", (event) => {
  // console.log(event.request.url, "event.request");
  // cache first
  // network first
  // cache only and newtork only
  const { request } = event;

  const url = new URL(request.url);

  // if I don't have data on my PC
  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});

// stategy cache first
async function cacheFirst(request) {
  console.log("take from storage");
  const cached = await caches.match(request);
  return cached ?? (await fetch(request));
}

// for dynamic data
async function networkFirst(request) {
  // take from my storage my keys
  const cache = await caches.open(dynamicCacheName);
  console.log("take from wetwork");
  try {
    const response = await fetch(request);
    await cache.put(request, response.clone());
    return response;
  } catch (e) {
    // network does not work
    const cached = await cache.match(request);

    // add mock data to cache
    return cached ?? (await caches.match("/offline.html"));
  }
}
