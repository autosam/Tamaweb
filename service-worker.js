self.importScripts(
  "src/Version.js",
  "resources/data/CharacterDefinitions.js",
  "resources/data/SpriteDefinitions.js",
  "resources/data/SoundDefinitions.js"
);

const channel = new BroadcastChannel("sw-messages");

const VER = VERSION;
const CACHE_NAME = `tamaweb-${VER}`;
// channel.postMessage({type: 'version', value: VER});
const ASSETS = [
  // main
  "index.html",
  "styles.css",
  "themes.css",
  // scripts
  "src/Version.js",
  "src/UiHelper.js",
  "src/Main.js",
  "src/Activities.js",
  "src/App.js",
  "src/Drawer.js",
  "src/Object2d.js",
  "src/Pet.js",
  "src/PetDefinition.js",
  "src/Scene.js",
  "src/Definitions.js",
  "src/Utils.js",
  "src/Missions.js",
  "src/Plant.js",
  "src/Animal.js",
  // libs
  "src/libs/moment.js",
  "src/libs/idb-keyval.js",
  // cdn
  "src/libs/profanity-cleaner-0.0.3.js",
  // other
  "resources/font/PixelifySans-VariableFont_wght.ttf",
  "resources/font/PixelColeco.otf",
  // def data
  "resources/data/CharacterDefinitions.js",
  "resources/data/SpriteDefinitions.js",
  "resources/data/GrowthChart.js",
  "resources/data/SoundDefinitions.js",
  ...SPRITES,
  ...PET_ELDER_CHARACTERS,
  ...PET_ADULT_CHARACTERS,
  ...PET_TEEN_CHARACTERS,
  ...PET_CHILD_CHARACTERS,
  ...PET_BABY_CHARACTERS,
  ...NPC_CHARACTERS,
  ...ANIMAL_CHARACTERS,
  ...SOUNDS,
];

self.addEventListener("install", (e) => {
  self.skipWaiting();

  channel.postMessage({ type: "install" });

  // opt-out of ServiceWorkerAutoPreload
  // https://github.com/WICG/service-worker-auto-preload?tab=readme-ov-file#opt-out
  e.addRoutes({
    condition: {
      urlPattern: new URLPattern({})
    },
    source: "fetch-event"
  });

  e.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);

        /* for (const asset of ASSETS) {
          try {
            await cache.add(asset);
          } catch (err) {
            console.warn("[SW] Failed to cache asset:", asset, err);
          }
        } */

        /* await Promise.all(
          ASSETS.map(asset =>
            cache.add(asset).catch(err => {
              console.warn("[SW] Failed to cache asset:", asset, err);
            })
          )
        ); */

        await cacheInBatches(cache, ASSETS);

        // await self.skipWaiting();
      } catch (err) {
        console.error("[SW] Install FAILED, clearing corrupted cache", err);
        await caches.delete(CACHE_NAME);
        throw err;
      }
    })()
  );
});

self.addEventListener("activate", (event) => {
  channel.postMessage({ type: "activate" });
  // remove old cache
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      const deletePromises = keys.map(async (cache) => {
        if (cache !== CACHE_NAME) {
          console.log("[SW] Removing old cache: " + cache);
          return caches.delete(cache);
        }
      });
      await Promise.all(deletePromises);
      self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.headers.get("range")) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (!event.request.url.startsWith(self.location.origin)) return;
  
  handleOnlineFirst(event);
});

const handleOfflineFirst = (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return caches.open(CACHE_NAME).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            if (
              !response ||
              response.status !== 200 ||
              response.type !== "basic"
            ) {
              return response;
            }
            cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => new Response("", { status: 404 }));
      });
    })
  );
};

const handleOnlineFirst = (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
};

async function cacheInBatches(cache, assets, batchSize = 20) {
  for (let i = 0; i < assets.length; i += batchSize) {
    const batch = assets.slice(i, i + batchSize);
    await Promise.all(
      batch.map(asset =>
        cache.add(asset).catch(err => {
          console.warn("[SW] Failed to cache asset:", asset, err);
        })
      )
    );
  }
}