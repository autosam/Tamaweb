self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open('tamaweb-store').then((cache) => cache.addAll([
            // main
            '../index.html',
            '../src/Main.js',
            '../src/Activities.js',
            '../src/App.js',
            '../src/Drawer.js',
            '../src/Object2d.js',
            '../src/Pet.js',
            '../src/PetDefinition.js',
            '../src/Scene.js',
            '../src/Utils.js',
            '../src/ApiHelper.js',
            // def data
            '../resources/data/CharacterDefinitions.js',
            '../resources/data/SpriteDefinitions.js',
            '../resources/data/GrowthChart.js',
            // sounds
            '../resources/sounds/angry.ogg',
            '../resources/sounds/birthday_song_01.ogg',
            '../resources/sounds/cheer.ogg',
            '../resources/sounds/eat.ogg',
            '../resources/sounds/refuse.ogg',
            '../resources/sounds/sad.ogg',
            '../resources/sounds/ui_click_01.ogg',
            '../resources/sounds/ui_click_02.ogg',
            '../resources/sounds/walk_01.ogg',
            '../resources/sounds/wedding_song_01.ogg',
            '../resources/font/PixelifySans-VariableFont_wght.ttf',
        ])),
    );
});

self.addEventListener('fetch', (e) => {
    console.log(e.request.url);
    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request)),
    );
});