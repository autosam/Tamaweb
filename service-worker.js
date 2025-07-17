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
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/fontawesome.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/solid.min.css",
  "https://cdn.jsdelivr.net/npm/profanity-cleaner@latest",
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
  channel.postMessage({ type: "install" });
  e.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(self.skipWaiting())
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
          console.log("Service Worker: Removing old cache: " + cache);
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
    return fetch(event.request);
  }

  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(CACHE_NAME).then((cache) => {
          return fetch(event.request).then((response) => {
            if (!response || response.status !== 200 || response.type !== "basic") {
              return response;
            }
            return cache.put(event.request, response.clone()).then(() => response);
          });
        });
      })
    );
  }
});
