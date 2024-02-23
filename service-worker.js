self.importScripts(
    'resources/data/CharacterDefinitions.js',
    'resources/data/SpriteDefinitions.js',
)

const CACHE_NAME = 'tamaweb-v8.3';
const ASSETS = [
    // main
    'index.html',
    'styles.css',
    // scripts
    'src/Main.js',
    'src/Activities.js',
    'src/App.js',
    'src/Drawer.js',
    'src/Object2d.js',
    'src/Pet.js',
    'src/PetDefinition.js',
    'src/Scene.js',
    'src/Utils.js',
    'src/ApiHelper.js',
    // sounds
    'resources/sounds/angry.ogg',
    'resources/sounds/birthday_song_01.ogg',
    'resources/sounds/cheer.ogg',
    'resources/sounds/eat.ogg',
    'resources/sounds/refuse.ogg',
    'resources/sounds/sad.ogg',
    'resources/sounds/ui_click_01.ogg',
    'resources/sounds/ui_click_02.ogg',
    'resources/sounds/walk_01.ogg',
    'resources/sounds/wedding_song_01.ogg',
    // other
    'resources/font/PixelifySans-VariableFont_wght.ttf',
    'resources/img/ui/logo_full.png',
    // def data
    'resources/data/CharacterDefinitions.js',
    'resources/data/SpriteDefinitions.js',
    'resources/data/GrowthChart.js',
    ...SPRITES,
    ...PET_ADULT_CHARACTERS,
    ...PET_TEEN_CHARACTERS,
    ...PET_BABY_CHARACTERS,
    ...NPC_CHARACTERS,
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)),
    );
});

self.addEventListener('fetch', (e) => {
    // console.log(e.request.url);
    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request)),
    );
});

self.addEventListener('activate', event => {
    // Remove old caches
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            return keys.map(async (cache) => {
                if (cache !== CACHE_NAME) {
                    console.log('Service Worker: Removing old cache: ' + cache);
                    return await caches.delete(cache);
                }
            })
        })()
    )
})