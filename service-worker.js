self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open('tamaweb-store').then((cache) => cache.addAll([
            // main
            '/Tamaweb/index.html',
            '/Tamaweb/src/Main.js',
            '/Tamaweb/src/Activities.js',
            '/Tamaweb/src/App.js',
            '/Tamaweb/src/Drawer.js',
            '/Tamaweb/src/Object2d.js',
            '/Tamaweb/src/Pet.js',
            '/Tamaweb/src/PetDefinition.js',
            '/Tamaweb/src/Scene.js',
            '/Tamaweb/src/Utils.js',
            '/Tamaweb/src/ApiHelper.js',
            // def data
            '/Tamaweb/resources/data/CharacterDefinitions.js',
            '/Tamaweb/resources/data/SpriteDefinitions.js',
            '/Tamaweb/resources/data/GrowthChart.js',
            // sounds
            '/Tamaweb/resources/sounds/angry.ogg',
            '/Tamaweb/resources/sounds/birthday_song_01.ogg',
            '/Tamaweb/resources/sounds/cheer.ogg',
            '/Tamaweb/resources/sounds/eat.ogg',
            '/Tamaweb/resources/sounds/refuse.ogg',
            '/Tamaweb/resources/sounds/sad.ogg',
            '/Tamaweb/resources/sounds/ui_click_01.ogg',
            '/Tamaweb/resources/sounds/ui_click_02.ogg',
            '/Tamaweb/resources/sounds/walk_01.ogg',
            '/Tamaweb/resources/sounds/wedding_song_01.ogg',
            '/Tamaweb/resources/font/PixelifySans-VariableFont_wght.ttf',
        ])),
    );
});

self.addEventListener('fetch', (e) => {
    console.log(e.request.url);
    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request)),
    );
});