const App = {
    PI2: Math.PI * 2, INF: 999999999,
    deltaTime: 0, lastTime: 0, playTime: 0, hour: 12,
    mouse: { x: 0, y: 0 },
    userId: '_', userName: null, sessionId: Math.round(Math.random() * 9999999999),
    ENV: location.port == 5500 ? 'dev' : 'prod', isOnItch: false, isOnElectronClient: false,
    shellBackground: '', deferredInstallPrompt: null,

    gameEventsHistory: {}, 
    misc: {}, 
    mods: [], 
    records: {}, 
    temp: {}, 
    ownedFurniture: [], 
    plants: [],
    animals: { treat: null, list: [], nextAttractMs: 0, treatBiteCount: 0 },

    settings: {
        screenSize: 1,
        playSound: true,
        vibrate: true,
        displayShell: true,
        displayShellButtons: true,
        displayShellLogo: true,
        shellShape: 6,
        backgroundColor: '#FFDEAD',
        notifications: false,
        automaticAging: true,
        sleepingHoursOffset: 0,
        classicMainMenuUI: false,
        isTester: false,
        theme: false,
        shellAdditionalSize: 0,
        showWantName: true,
        genderedPets: false,
        playMusic: true,
        skillsAffectingEvolution: true,
    },
    constants: {
        ONE_HOUR: 1000 * 60 * 60,
        ONE_MINUTE: 1000 * 60,
        ONE_SECOND: 1000,
        AUTO_SAVE_INTERVAL_SECS: 6,
        FOOD_SPRITESHEET: 'resources/img/item/foods_on.png',
        FOOD_SPRITESHEET_DIMENSIONS: {
            cellNumber: 1,
            cellSize: 24,
            rows: 33,
            columns: 33,
        },
        ITEM_SPRITESHEET: 'resources/img/item/items.png',
        ITEM_SPRITESHEET_DIMENSIONS: {
            cellNumber: 1,
            cellSize: 22,
            rows: 10,
            columns: 10,
        },
        PLANT_SPRITESHEET: 'resources/img/item/plants.png',
        PLANT_SPRITESHEET_DIMENSIONS: {
            cellNumber: 1,
            cellSize: 24,
            rows: 28,
            columns: 28,
        },
        MISC_SPRITESHEET: 'resources/img/item/misc.png',
        MISC_SPRITESHEET_DIMENSIONS: {
            cellNumber: 1,
            cellSize: 24,
            rows: 33,
            columns: 33,
        },
        MAX_ANIMALS: 16,
        MAX_PLANTS: 8,
        MIN_REVIVE_GOLDS: 250,
        MAX_REVIVE_GOLDS: 1000,
        SKILL_EVOLUTION_EFFECTIVENESS: {
            bounds: 30,
            ratings: {
                endurance: 1,
                logic: 2,
                expression: 3
            }
        },
        SLEEP_START: 21,
        SLEEP_END: 8,
        PARENT_DAYCARE_START: 8,
        PARENT_DAYCARE_END: 18,
        MAX_SHELL_SHAPES: 6,
        AFTERNOON_TIME: [12, 17],
        EVENING_TIME: [17, 20],
        NIGHT_TIME: [20, 6],
        CHRISTMAS_TIME: {
            start: '12-14',
            end: '12-31',
            absDay: '12-25',
        },
        MANUAL_AGE_HOURS_BABY: 1,
        MANUAL_AGE_HOURS_CHILD: 9,
        MANUAL_AGE_HOURS_TEEN: 12,
        MANUAL_AGE_HOURS_ADULT: 72,
        AUTO_AGE_HOURS_BABY: 24,
        AUTO_AGE_HOURS_CHILD: 36,
        AUTO_AGE_HOURS_TEEN: 48,
        AUTO_AGE_HOURS_ADULT: 336, // 14 days
        WANT_TYPES: {
            food: 'food',
            playdate: 'playdate',
            item: 'item',
            minigame: 'minigame',
            fulfilled: 'fulfilled',
        },
        CHAR_UNLOCK_PREFIX: 'ch_unl',
        FEEDING_PICKINESS: {
            refeedingTolerance: 10,
            bufferSize: 16,
        },
        ONLINE_FOOD_ORDER_MARKUP: 2,
        // z-index
        ACTIVE_PET_Z: 5,
        NPC_PET_Z: 4.6,
        MAX_PLACED_FURNITURE: 6,
        POOP_POSITIONS: [
            {x: '75%', y: '78%', z: 4.59},
            {x: '85%', y: '84%', z: 4.592},
            {x: '25%', y: '80%', z: 4.593},
            {x: '15%', y: '82%', z: 4.594},
        ],
        ACTIVE_ITEM_Z: 4.595,
        CHRISTMAS_TREE_Z: 4.58,
        BACKGROUND_Z: -10,
        INPUT_BASE_64: '0xffbx64',
        SCHOOL: {
            maxClassesPerDay: 10,
            resetTime: { hour: 7, minute: 0, second: 0 }
        },
        MAX_OFFLINE_PROGRESSION_SECS: 604800, // 3600(secs in 1 hour) * 24(1 day) * 7(7 days) = 604800
        GENDERS: [
            'mars',
            'venus',
            'transgender',
            'genderless',
            'mercury',
            'neuter',
            'venus-mars',
        ],
        UNDERWORLD_TREAT_CURRENCY: 'spookandy',
        SPANS: {
            monster: `<div> <img class="icon" src="resources/img/misc/devil_icon.png"></img> <b style="color: red;">monster</b> </div>`,
            angel: `<div> <img class="icon" src="resources/img/misc/angel_icon.png"></img> <b style="color: forestgreen;">angel</b> </div>`
        }
    },
    routes: {
        BLOG: 'https://tamawebgame.github.io/blog/',
        ITCH_REVIEW: 'https://samandev.itch.io/tamaweb/rate?source=game',
        DISCORD: 'https://tamawebgame.github.io/discord',
    },
    async init () {
        // window load events
        this.registerLoadEvents();

        // check for platforms
        if(location.host.indexOf('itch') !== -1) App.isOnItch = true;
        if(navigator?.userAgent == 'electron-client') App.isOnElectronClient = true;

        // init
        this.initSound();
        App.drawer = new Drawer(document.querySelector('.graphics-canvas'));
        Object2d.setDrawer(App.drawer);

        // moment settings
        moment.relativeTimeThreshold('m', 59);

        // load data
        const loadedData = await this.handleSequentiallyLoad([
            App.load,
        ]);
        console.log({loadedData});

        if(!loadedData) return;

        // events history
        if(loadedData?.eventsHistory){
            App.gameEventsHistory = loadedData.eventsHistory;
        }

        // records
        App.records = loadedData.records;

        // shell background
        this.setShellBackground(loadedData?.shellBackground);

        // mods
        this.loadMods(loadedData.mods);

        // handle settings
        if(loadedData.settings){
            Object.assign(this.settings, loadedData.settings);
        }
        this.applySettings();

        // furniture
        if(loadedData.furniture)
            this.ownedFurniture = loadedData.furniture;

        // plants
        if(loadedData.plants)
            this.plants = loadedData.plants.map(p => new Plant(p));

        // animals
        if(loadedData.animals){
            this.animals = {
                ...loadedData.animals,
                list: loadedData.animals.list.map(a => new AnimalDefinition(a))
            };
        }

        // handle preloading
        const forPreload = [
            ...SPRITES,
            ...PET_ELDER_CHARACTERS,
            ...PET_ADULT_CHARACTERS,
            ...PET_TEEN_CHARACTERS,
            ...PET_CHILD_CHARACTERS,
            ...PET_BABY_CHARACTERS,
            ...NPC_CHARACTERS,
            ...ANIMAL_CHARACTERS,
        ];
        this.preloadedResources = {};
        const preloadedResources = await this.preloadImages(forPreload);
        preloadedResources.forEach((resource, i) => {
            // let name = forPreload[i].slice(forPreload[i].lastIndexOf('/') + 1);
            const name = forPreload[i];
            this.preloadedResources[name] = resource;
        });

        // creating game objects
        App.background = new Object2d({
            image: null,
            x: 0, y: 0, 
            width: 96, height: 96, 
            z: App.constants.BACKGROUND_Z,
            noPreload: Boolean(App.mods.length),
            static: true,
        })
        // App.foodsSpritesheet = new Object2d({
        //     image: App.preloadedResources["resources/img/item/foods.png"],
        //     x: 10, y: 10,
        //     spritesheet: {
        //         cellNumber: 11,
        //         cellSize: 16,
        //         rows: 4,
        //         columns: 4,
        //     },
        //     hidden: true,
        // })
        App.foods = new Object2d({
            image: App.preloadedResources[App.constants.FOOD_SPRITESHEET],
            x: 10, y: 10,
            width: 12, height: 12,
            scale: 24,
            spritesheet: {
                cellNumber: 2,
                cellSize: 24,
                rows: 33,
                columns: 33,
            },
            hidden: true,
        })
        App.uiFood = document.createElement('c-sprite');
        App.uiFood.setAttribute('width', 24);
        App.uiFood.setAttribute('height', 24);
        App.uiFood.setAttribute('index', 0);
        App.uiFood.setAttribute('src', App.constants.FOOD_SPRITESHEET);
        App.uiFood.setAttribute('class', 'ui-food');
        App.uiFood.style.visibility = 'hidden';
        document.querySelector('.graphics-wrapper').appendChild(App.uiFood);

        App.darkOverlay = new Object2d({
            img: "resources/img/background/house/dark_overlay.png",
            x: 0, y: 0,
            z: 11, opacity: 0.85,
            composite: "source-atop",
            static: true,
            opacity: 0,
            isVisible: false,
            onDraw: (me) => {
                const targetOpacity =  App.pet.stats.is_sleeping && App.pet.state === 'sleeping' ? 1 : 0;
                const currentOpacity = lerp(me.opacity, targetOpacity, 0.015 * App.deltaTime);
                me.opacity = clamp(currentOpacity, 0, 1);
                me.isVisible = me.opacity > 0.2;
            }
        })
        App.sky = new Object2d({
            image: App.preloadedResources["resources/img/background/sky/night.png"],
            x: 0, y: 0, z: 99999,
            composite: "destination-over",
            static: true,
        })
        App.skyOverlay = new Object2d({
            image: App.preloadedResources["resources/img/background/sky/night_overlay.png"],
            x: 0, y: 0, z: 999,
            composite: "source-atop",
            opacity: 1,
            static: true,
        })
        App.skyWeather = new Object2d({
            image: App.preloadedResources["resources/img/background/sky/rain_01.png"],
            x: 0, y: 0, z: 999.1,
            composite: "xor",
            static: true,
            // hidden: true,
            onDraw: (me) => {
                Object2d.animations.flip(me, 200);
            }
        })
        App.petDefinition = new PetDefinition({
            name: getRandomName(),
            sprite: randomFromArray(PET_BABY_CHARACTERS),
        })
            .setStats({is_egg: true})
            .loadStats(loadedData.pet)
            .loadAccessories(loadedData.accessories);

        // check automatic age up
        if(App.settings.automaticAging){
            while(moment().isAfter( App.petDefinition.getNextAutomaticBirthdayDate() )){
                App.petDefinition.ageUp()
                App.sendAnalytics('auto_age_up', App.petDefinition.lifeStage);
            }
        }

        // put pet to sleep on start if is sleeping hour
        if(!App.petDefinition.stats.is_sleeping && !App.isTester()){
            App.petDefinition.stats.is_sleeping = App.isSleepHour() && !loadedData.pet?.stats?.is_egg;
        }

        App.pet = App.createActivePet(App.petDefinition, {
            state: '',
        });

        if(!loadedData.pet || !Object.keys(loadedData.pet).length) { // first time
            setTimeout(() => {
                Activities.playEggUfoAnimation(() => App.handlers.show_set_pet_name_dialog());
            }, 100);
        }
        App.setScene(App.scene.home);
        this.applySky()

        // check if in rabbit hole
        if(App.pet.stats.current_rabbit_hole.name){
            Activities.goToCurrentRabbitHole(false);
        }

        // simulating offline progression
        if(loadedData.lastTime){
            let elapsedTime = Date.now() - loadedData.lastTime;
            
            if(App.ENV !== 'dev') App.pet.simulateOfflineProgression(elapsedTime);
            
            let awaySeconds = Math.round(elapsedTime / 1000);
            let awayMinutes = Math.round(awaySeconds / 60);
            let awayHours = Math.round(awayMinutes / 60);
            // console.log({awayHours, awayMinutes, awaySeconds})
            
            let message;
            if(awaySeconds < 60) message = `${awaySeconds} seconds`;
            else if(awayMinutes < 60) message = `${awayMinutes} minutes`;
            else message = `${awayHours} hours`;

            App.awayTime = message;

            if(awaySeconds > 30 && App.ENV !== 'dev'){
                App.displayConfirm(`Welcome back!\n<b>${App.petDefinition.name}</b> missed you in those <b>${message}</b> you were away`, [
                    {
                        name: 'ok',
                        onclick: () => {}
                    }
                ])
            }
        }

        // missions
        Missions.init(loadedData.missions);

        // load room customizations
        this.applyRoomCustomizations(loadedData.roomCustomizations);

        // check if at daycare
        if(App.pet.stats.is_at_parents){
            Activities.stayAtParents();
        }

        // check if at vacation
        if(App.pet.stats.is_at_vacation){
            Activities.seaVacation();
        }

        /* // routing
        const historyIndex = window.history.length;
        window.history.pushState(null, null, window.top.location.pathname + window.top.location.search);
        window.addEventListener('popstate', (e) => {
            const activeDisplay = [...document.querySelectorAll('.root .display')].at(-1);
            const backAction = activeDisplay?.querySelector('.back-btn, .cancel-btn, .back-sound');
            console.log(e);
            if(backAction){
                backAction.click();
                window.history.pushState(null, null, window.top.location.pathname + window.top.location.search);
                e.preventDefault();
            }
        }); */

        // in-game events
        this.handleInGameEvents();
        
        // random encounters
        App.runRandomEncounters();

        // touch / mouse pos on canvas
        App.registerInputUpdates();

        // hide loading
        setTimeout(() => {
            UI.fadeOut(document.querySelector('.loading-text'));
            App.loadingEnded = true;
        })

        // rudder stack
        this.initRudderStack();

        // session start event
        App.sendSessionEvent(true);

        // saver
        setInterval(() => {
            App.save(true);
        }, App.constants.AUTO_SAVE_INTERVAL_SECS * 1000);
    },
    initRudderStack: function(){
        rudderanalytics.identify(App.userId, {
            username: App.userName,
            petName: App.petDefinition?.name,
            playTime: App.playTime,
            isOnItch: App.isOnItch,
        })
    },
    registerInputUpdates: function(){
        const moveEventHandler = (evt) => {
            const rect = App.drawer.canvas.getBoundingClientRect();
    
            let x, y;
            const target = evt.type.startsWith("touch") ? evt.targetTouches[0] : evt;
                x = target.clientX - rect.left;
                y = target.clientY - rect.top;
        
            x = Math.max(0, Math.min(x, rect.width));
            y = Math.max(0, Math.min(y, rect.height));
        
            App.mouse.x = x / 2;
            App.mouse.y = y / 2;
        }
        document.addEventListener('mousemove', moveEventHandler);
        document.addEventListener('touchmove', moveEventHandler);

        document.addEventListener('mousedown', () => App.mouse.isDown = true)
        document.addEventListener('mouseup', () => App.mouse.isDown = false)
        document.addEventListener('touchstart', () => App.mouse.isDown = true)
        document.addEventListener('touchend', () => App.mouse.isDown = false)
    },
    registerLoadEvents: function(){
        const initializeRenderer = () => {
            App.targetFps = 60;
            App.fpsInterval = 1000 / App.targetFps;
            App.fpsLastTime = Date.now();
            App.fpsStartTime = App.fpsLastTime;
            App.onFrameUpdate(0);
        }
        // window.onload = function () {
        //     initializeRenderer();
        // }
        document.addEventListener('DOMContentLoaded', function(event) {
            initializeRenderer();
        });
        window.onbeforeunload = function(){
            App.sendSessionEvent(false);
            // App.save();
        }

        if (navigator.storage && "persist" in navigator.storage) {
            navigator.storage.persist().then((persistent) => {
                App.isStoragePersistent = persistent;
            });
        }
    },
    sendSessionEvent: function(login){
        if(login){
            const analyticsData = {
                session_id: App.sessionId,
                play_time_mins: (Math.round(App.playTime) / 1000 / 60).toFixed(2),
                away: (App.awayTime || -1),
                sprite: App.petDefinition?.sprite,
                is_egg: App.pet?.stats.is_egg,
                gold: App.pet?.stats.gold,
                ver: VERSION
            }
            App.sendAnalytics('login', JSON.stringify(analyticsData));
        } else {
            const analyticsData = {
                session_id: App.sessionId,
                hunger: Math.round(App.pet?.stats.current_hunger),
                fun: Math.round(App.pet?.stats.current_fun),
                health: Math.round(App.pet?.stats.current_health),
                sleep: Math.round(App.pet?.stats.current_sleep),
                bladder: Math.round(App.pet?.stats.current_bladder),
                is_egg: App.pet?.stats.is_egg,
                has_poop_out: App.pet?.stats.has_poop_out,
                is_sleeping: App.pet?.stats.is_sleeping,
            }
            App.sendAnalytics('logout', JSON.stringify(analyticsData));
        }
    },
    applySettings: function(){
        const graphicsWrapper = document.querySelector('.graphics-wrapper');

        // fullscreen param
        const isFullscreen = new URLSearchParams(location.search).has('fullscreen');
        if(isFullscreen) graphicsWrapper.classList.add('fullscreen');

        // theme
        if(this.settings.theme){
            document.body.className = `theme-${this.settings.theme}`;
        }

        // background
        document.body.style.backgroundColor = this.settings.backgroundColor;
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        metaThemeColor?.setAttribute('content', this.settings.backgroundColor);
        document.querySelector('.loading-text').style.background = this.settings.backgroundColor;

        // screen / shell size
        this.settings.shellAdditionalSize = clamp(this.settings.shellAdditionalSize, -0.5, 5);
        this.settings.screenSize = clamp(this.settings.screenSize, 0.6, 5);
        graphicsWrapper.style.transform = `scale(${this.settings.screenSize})`;
        document.querySelector('.dom-shell').style.transform = `scale(${this.settings.screenSize + this.settings.shellAdditionalSize})`;

        // shell
        const domShell = document.querySelector('.dom-shell');
        domShell.style.display = App.settings.displayShell ? '' : 'none';
        domShell.className = `dom-shell shell-shape-${this.settings.shellShape}`
        document.querySelector('.shell-btn.main').style.display = App.settings.displayShellButtons ? '' : 'none';
        document.querySelector('.shell-btn.right').style.display = App.settings.displayShellButtons ? '' : 'none';
        document.querySelector('.shell-btn.left').style.display = App.settings.displayShellButtons ? '' : 'none';
        document.querySelector('.dom-shell .logo').style.display = App.settings.displayShellLogo ? '' : 'none';

        // classic main menu layout
        let classicMainMenuContainer = document.querySelector('.classic-main-menu__container');
        classicMainMenuContainer?.remove();
        graphicsWrapper.classList.remove('classic-main-menu');
        if(App.settings.classicMainMenuUI){
            graphicsWrapper.classList.add('classic-main-menu');
            classicMainMenuContainer = UI.create({
                componentType: 'div',
                className: 'classic-main-menu__container',
                parent: graphicsWrapper,
                parentInsertBefore: true,
                children: App.definitions.main_menu.map(def => {
                    return {
                        className: 'classic-main-menu__item click-sound',
                        innerHTML: def.name,
                        onclick: def.onclick
                    }
                })
            })

            if(!App.temp.defaultHomeSceneConfig){
                App.temp.defaultHomeSceneConfig = {
                    petY: App.scene.home.petY,
                    shadowOffset: App.scene.home.shadowOffset
                }
            }

            App.scene.home.petY = '90%';
            App.scene.home.shadowOffset = -10;
        } else {
            if(App.temp.defaultHomeSceneConfig){
                App.scene.home.petY = App.temp.defaultHomeSceneConfig.petY;
                App.scene.home.shadowOffset = App.temp.defaultHomeSceneConfig.shadowOffset;
            }
        }
        if(App.currentScene){
            App.reloadScene();
        }

        // screenshot
        document.querySelector('.logo').ondblclick = () => {
            if(App.haveAnyDisplays()) return;
            const overlay = document.querySelector('.screenshot-overlay');
            UI.show(overlay);
            setTimeout(() => UI.hide(overlay), 250);
            App.playSound('resources/sounds/camera_shutter_01.ogg');
            const name = 'Tamaweb_' + moment().format('D-M-YY_h-m-s');
            downloadUpscaledCanvasAsImage(App.drawer.canvas, name, 5)
        }
    },
    loadMods: function(mods){
        if(typeof mods !== 'object' || !mods || !mods.length) return;
        App.mods = mods;
        App.mods.forEach(mod => {
            if(mod.replaced_resources){
                mod.replaced_resources.forEach(([source, target]) => {
                    App.resourceOverrides[source] = target;
                })
            }
        })
    },
    handleFileLoad: function(inputElement, readType = 'readAsDataURL', onLoad){
        inputElement.onchange = () => {
            const file = inputElement.files[0];
            const reader = new FileReader();
            reader.addEventListener(
                "load",
                () => { return onLoad(reader.result); },
                false,
            );
            if (file) {
                reader[readType](file);
            }
        }
    },
    registeredDrawEvents: [],
    registerOnDrawEvent: function(fn){
        return this.registeredDrawEvents.push(fn) - 1;
    },
    unregisterOnDrawEvent: function(inp){
        const index = typeof inp === "function" ? this.registeredDrawEvents.indexOf(inp) : inp;
        if(index !== -1) this.registeredDrawEvents[index] = null;
    },
    onFrameUpdate: function(time){
        App.date = new Date();
        App.hour = App.date.getHours();
        App.fullTime = App.date.getTime();

        requestAnimationFrame(App.onFrameUpdate);
        
        const fpsElapsedTime = App.fullTime - App.fpsLastTime;

        if(fpsElapsedTime > App.fpsInterval){ // everything here capped to targetFps
            // time and playtime
            App.time = time;
            const accurateDeltaTime = time - App.lastTime;
            App.playTime += accurateDeltaTime;
            App.lastTime = time;
            App.fpsLastTime = App.fullTime - (fpsElapsedTime % App.fpsInterval);

            // simulating offline progression
            if(accurateDeltaTime > 5000){
                App.pet?.simulateAwayProgression?.(accurateDeltaTime);
            }

            // deltaTime
            App.deltaTime = clamp(accurateDeltaTime, 0, 100);

            // drawing
            App.drawer?.draw();
            App.onDraw?.();
            App.registeredDrawEvents.forEach(fn => fn?.());
        }

        // App.drawer.pixelate();
        // App.drawUI();
        // document.querySelector('.background-canvas').getContext('2d').drawImage(App.drawer.canvas, 0, 0);
    },
    onDraw: () => {},
    preloadImages: function(urls) {
        const promises = urls.map((url) => {
            return new Promise((resolve, reject) => {
                const image = new Image();
    
                image.src = App.checkResourceOverride(url);
    
                image.onload = () => resolve(image);
                image.onerror = () => reject(`Image failed to load: ${url}`);
            });
        });
    
        return Promise.all(promises);
    },
    getPreloadedResource: (url) => {
        const preloadedResource = App.preloadedResources[url];
        if(!preloadedResource){
            const image = new Image();
            image.src = App.checkResourceOverride(url);
            return image;
        }
        return preloadedResource;
    },
    resourceOverrides: {},
    checkResourceOverride: function(res){
        if(!res) return res;
        return this.resourceOverrides[res.replace(location.href, '')] || res;
    },
    isTester: function(){
        if(App.settings.isTester) return true;
        return false;
        const testers = [
            'Saman', 'samandev',
        ]
        return testers.includes(App.userName) || App.ENV == 'dev';
    },
    addEvent: function(name, payload, force){
        if(!App.gameEventsHistory[name] || force){
            App.gameEventsHistory[name] = true;
            payload?.();
            return true;
        }
        return false;
    },
    getEvent: function(name){
        return App.gameEventsHistory[name];
    },
    addRecord: function(name, value = 1, shouldReplaceValue){
        const currentValue = this.getRecord(name) || 0;
        this.records[name] = shouldReplaceValue ? value : currentValue + value;
        return this.records[name];
    },
    getRecord: function(name){
        return this.records[name];
    },
    handleInputCode: function(rawCode){
        const {addEvent} = App;

        function showAlreadyUsed(){
            App.displayPopup(`You can only use this code once`);
            return false;
        }

        if(rawCode.indexOf(App.constants.INPUT_BASE_64) === 0){
            rawCode = atob(rawCode.replace(App.constants.INPUT_BASE_64, ''));
        }
        
        let code = rawCode.toString().toUpperCase();

        let codeEventId = `input_code_event_${code}`;

        switch(code){
            case "ERROR":
                App.displayPopup(`Exec undefinedFunction`);
                undefinedFunction();
                break;
            case "XUZFWQ":
                if(!addEvent(codeEventId, () => {
                    App.pet.stats.gold += 250;
                })) return showAlreadyUsed();
                App.displayPopup(`Congratulations! ${App.petDefinition.name} got $250!`, 5000);
                break;
            case "PRNCSS":
                if(!addEvent(codeEventId, () => {
                    App.displayPopup(`Success!`, 5000, () => {
                        App.closeAllDisplays();
                        Activities.redecorRoom();
                        App.scene.home.image = App.definitions.room_background.princess.image;
                    });
                })) return showAlreadyUsed();
                break;
            case "HESOYAM":
                App.displayPopup(`All you had to do ...`, 5000, () => {
                    App.pet.stats.gold += 2500;
                    App.pet.stats.current_care = App.pet.stats.max_care;
                    App.pet.stats.current_health = App.pet.stats.max_health;
                });
                break;
            case "TNMRLUI7":
                if(!addEvent(codeEventId, () => {
                    App.displayPopup(`Sorry for the inconvenience, here's 250 mission pts and $400!`, 5000, () => {
                        App.pet.stats.gold += 400;
                        Missions.currentPts += 250;
                    });
                })) return showAlreadyUsed();
                break;
            case "TAMAWEBGIFT":
                if(!addEvent(codeEventId, () => {
                    App.sendAnalytics('input_code', code);
                    App.displayPopup(`You've redeemed <b>$1000</b>!<br><br> Thanks for playing!`, 5000, () => {
                        App.pet.stats.gold += 1000;
                    });
                })) return showAlreadyUsed();
                break;
            case "HPPYHLWN":
                if(!addEvent(codeEventId, () => {
                    App.sendAnalytics('input_code', code);
                    App.displayPopup(`You've redeemed <b>$2000</b>, <b>500 Mission pts</b> and <b>x100 ${App.constants.UNDERWORLD_TREAT_CURRENCY}</b>!<br><br> Thanks for playing!`, 5000, () => {
                        App.pet.stats.gold += 2000;
                        Missions.currentPts += 500;
                        App.addNumToObject(App.pet.inventory.food, App.constants.UNDERWORLD_TREAT_CURRENCY, 100)
                    });
                })) return showAlreadyUsed();
                break;
            default:
                const showInvalidError = () => {
                    App.displayPopup(`Invalid code`);
                }

                const command = /(\S+?) *: *(.+)/g.exec(rawCode);
                if(!command){
                    showInvalidError();
                    break;
                }
                [, commandType, commandPayload] = command;
                switch(commandType){
                    case 'save':
                        try {
                            const b64 = decodeURIComponent(atob(commandPayload.replace(':endsave', '')));
                            console.log(b64)
                            let json = JSON.parse(b64);
                            if(!json.pet || typeof json.pet !== 'object'){
                                throw 'error';
                            }
                            console.log(json)
                            let petDef = json.pet;
    
                            let def = new PetDefinition().loadStats(petDef);
                            
                            App.displayConfirm(`Are you trying to load <div style="font-weight: bold">${def.getCSprite()} ${def.name}?</div>`, [
                                {
                                    name: 'yes',
                                    onclick: () => {
                                        App.displayConfirm(`What do you want to do with ${def.name}?`, [
                                            {
                                                name: 'as active pet',
                                                onclick: () => {
                                                    App.displayConfirm(`Are you sure? This will <b>remove</b> your current pet`, [
                                                        {
                                                            name: 'yes',
                                                            onclick: () => {
                                                                App.displayPopup('Loading...', App.INF);

                                                                App.loadFromJson(json, () => {
                                                                    App.displayPopup(`${def.name} is now your pet!`, App.INF);
                                                                    setTimeout(() => {
                                                                        location.reload();  
                                                                    }, 3000);
                                                                });
                                                            }
                                                        },
                                                        {
                                                            name: 'no',
                                                            onclick: () => {}
                                                        },
    
                                                    ]);
                                                    return true;
                                                }
                                            },
                                            {
                                                _ignore: json.user_id === App.userId,
                                                name: 'add friend',
                                                onclick: () => {
                                                    App.petDefinition.addFriend(def);
                                                    App.closeAllDisplays();
                                                    return App.displayPopup(`${def.name} was added to the friends list!`, 3000);
                                                }
                                            },
                                            {
                                                name: 'cancel',
                                                class: 'back-btn',
                                                onclick: () => {}
                                            }
                                        ])
                                    }
                                },
                                {
                                    name: 'no',
                                    class: 'back-btn',
                                    onclick: () => {}
                                },
                            ])
                        } catch(e) {    
                            console.error(e);
                            return App.displayPopup('Character code is corrupted');
                        }
                        break;
                    
                    case 'setchar':
                        const sprite = PetDefinition.generateFullCSprite(commandPayload);
                        App.displayConfirm(`Are you sure you want to change your pet's sprite to ${sprite}?`, [
                            {
                                name: 'yes',
                                onclick: () => {
                                    App.petDefinition.sprite = commandPayload;
                                    window.location.reload();
                                }
                            },
                            {
                                name: 'no',
                                onclick: () => {}
                            }
                        ])
                        break;
                    case 'settester':
                        App.settings.isTester = commandPayload === '1';
                        App.displayPopup(`Set tester: ${App.settings.isTester}`, 1000, () => window.location.reload());
                        break;
                    case 'activity:reckoning':
                        Activities.reckoning(true);
                        break;
                    default: showInvalidError();
                }
        }
    },
    handleInGameEvents: function(){
        // add active pet to collection
        App.handlers.add_active_pet_to_collection();

        if(!App.awayTime || App.awayTime === -1) {
            App.handlers.show_onboarding();
            return;
        }

        const { addEvent } = App;

        if(!App.userName){
            App.handlers.show_set_username_dialog();
            return;
        }

        // if(addEvent(`bugfix_notice_02`, () => {
        //     App.displayConfirm('<b>Important Update</b><br>The Issue regarding not being able to age up your pet is', [
        //         {
        //             name: 'ok',
        //             class: 'solid primary',
        //             onclick: () => {}
        //         },
        //     ])
        // })) return;

        if(addEvent(`update_21_notice`, () => {
            App.displayList([
                {
                    name: 'New update is available!',
                    type: 'text',
                    solid: true,
                    bold: true,
                },
                {
                    name: `<img src="resources/img/ui/update_banner.png"></img> <br> Check out the new Immortal Monsters and Angels, The Underworld, mini games, accessories and a lot more!`,
                    type: 'text',
                },
                {
                    link: App.routes.BLOG,
                    name: 'see whats new',
                    class: 'solid primary',
                    onclick: () => {
                        App.sendAnalytics('go_to_blog_whats_new');
                    }
                },
            ])
        }, false)) return;

        if(addEvent('itch_rating_dialog', () => {
            App.handlers.show_rating_dialog();
            App.sendAnalytics('rating_auto_shown');
        })) return;

        // if(addEvent(`smallchange_01_notice`, () => {
        //     App.displayConfirm('The <b>Stay with parents</b> option is now moved to the <i class="fa-solid fa-house-chimney-user"></i> care menu', [
        //         {
        //             name: 'ok',
        //             class: 'solid primary',
        //             onclick: () => {}
        //         },
        //     ])
        // })) return;

        /* if(addEvent(`game_suggestions_poll_01`, () => {
            App.displayPrompt(`<b><small>Poll</small></b>what would you like to to be added in the next update?`, [
                {
                    name: 'send',
                    onclick: (data) => {
                        if(!data) return true;
                        App.displayPopup(`<b>Suggestion sent! thanks!</b><br> here's $200 for participating!`, 4000, () => {
                            App.pet.x = '50%';
                            App.pet.playCheeringAnimation();
                        });
                        App.pet.stats.gold += 200;
                        App.sendAnalytics('game_suggestions_poll_01', data);
                    },
                },
                {
                    name: 'cancel',
                    onclick: () => {
                        App.sendAnalytics('game_suggestions_poll_01', 'action_user_cancel');
                    },
                }
            ]);
        })) return;  */


        if(addEvent(`discord_server_02_notice`, () => {
            App.displayConfirm(`<b>We have a Discord server!</b><br>Join us for early sneak peeks at upcoming features, interact with our community, and more!`, [
                {
                    link: App.routes.DISCORD,
                    name: 'join (+$200)',
                    onclick: () => {
                        App.pet.stats.gold += 200;
                        App.sendAnalytics('discord_02_notice_accept');
                        return false;
                    },
                }, 
                {
                    name: 'cancel',
                    class: 'back-btn',
                    onclick: () => {
                        App.displayPopup('You can join the server through <b>Settings > Join Discord</b> if you ever change your mind', 5000)
                    }
                }
            ]);
            App.sendAnalytics('discord_02_notice_shown');
        })) return;

        /* if(App.isSalesDay()){
            if(addEvent(`sales_day_${dayId}_notice`, () => {
                App.displayConfirm(`<b>discount day!</b><br>Shops are selling their products at a discounted rate! Check them out and pile up on them!`, [
                    {
                        name: 'ok',
                        class: 'solid primary',
                        onclick: () => {},
                    }
                ]);
            })) return;
        } */
    },
    scene: {
        home: new Scene({
            image: 'resources/img/background/house/02.png',
            petX: '50%', petY: '100%',
            onLoad: () => {
                App.drawer.selectObjects('poop').forEach(p => p.absHidden = false);
                App.pet.staticShadow = false;
                if(App.pet.sicknessOverlay){
                    App.pet.sicknessOverlay.absHidden = false;
                }

                if(random(0, 10) == 0){
                    App.pet.showCurrentWant();
                }

                if(App.isDuringChristmas()){
                    this.christmasTree = new Object2d({
                        img: 'resources/img/misc/xmas_tree_01.png',
                        x: 60, y: 12, z: App.constants.CHRISTMAS_TREE_Z,
                    });
                }

                App.handleFurnitureSpawn();
                App.handleAnimalsSpawn(true);
            },
            onUnload: () => {
                App.drawer.selectObjects('poop').forEach(p => p.absHidden = true);
                App.pet.staticShadow = true;
                if(App.pet.sicknessOverlay){
                    App.pet.sicknessOverlay.absHidden = true;
                }
                this.christmasTree?.removeObject();
                App.handleFurnitureSpawn(null, true);
                App.handleAnimalsSpawn(false);
            }
        }),
        kitchen: new Scene({
            image: 'resources/img/background/house/kitchen_03.png',
            foodsX: '50%', foodsY: 44,
            petX: '75%', petY: '81%',
            noShadows: true,
            onLoad: () => {
                App.pet.staticShadow = false;
            },
            onUnload: () => {
                App.pet.staticShadow = true;
            }
        }),
        park: new Scene({
            image: 'resources/img/background/outside/park_02.png',
        }),
        mallWalkway: new Scene({
            image: 'resources/img/background/outside/mall_walkway.png'
        }),
        walkway: new Scene({
            image: 'resources/img/background/outside/walkway_01.png',
        }),
        office: new Scene({
            image: 'resources/img/background/house/office_01.png',
        }),
        wedding: new Scene({
            petX: '50%', petY: '100%',
            image: 'resources/img/background/house/wedding_01.png',
            noShadows: true,
        }),
        arcade: new Scene({
            image: 'resources/img/background/house/arcade_01.png',
        }),
        arcade_game01: new Scene({
            image: 'resources/img/background/house/arcade_02.png',
        }),
        market: new Scene({
            image: 'resources/img/background/outside/market_01.png',
        }),
        bathroom: new Scene({
            image: 'resources/img/background/house/bathroom_01.png',
        }),
        hospitalExterior: new Scene({
            image: 'resources/img/background/outside/hospital_01.png',
        }),
        hospitalInterior: new Scene({
            image: 'resources/img/background/house/clinic_01.png',
            onLoad: () => {
                this.drSprite = new Object2d({
                    image: App.preloadedResources['resources/img/misc/dr_sprite.png'],
                    x: '80%',
                    y: '77%',
                    inverted: true,
                })
            },
            onUnload: () => {
                this.drSprite?.removeObject();
            }
        }),
        parentsHome: new Scene({
            image: 'resources/img/background/house/parents_house_01.png',
            onLoad: () => {
                let parentDefs = App.petDefinition.getParents();
                // this.parents = parentDefs.map(parent => {
                //     let p = new Pet(parent);
                //         p.y = 65;
                //     return p;
                // });

                this.parent = new Pet(randomFromArray(parentDefs), {
                    y: 65,
                    z: 4
                });
            },
            onUnload: () => {
                // this.parents.forEach(parent => parent.removeObject());
                this.parent?.removeObject();
            }
        }),
        seaVacation: new Scene({
            image: 'resources/img/background/outside/vacation_sea_l_01.png',
            onLoad: () => {
                this.seaCreatureObject = new Object2d({
                    img: 'resources/img/background/outside/vacation_sea_l_02.png',
                    x: 0, y: 15, z: 7, bobFloat: 0,
                    onDraw: (me) => {
                        Object2d.animations.bob(me, 0.001, 0.04);
                    }
                })
        
                this.boatObject = new Object2d({
                    img: 'resources/img/background/outside/vacation_sea_l_03.png',
                    x: 0, y: 0, z: 6, bobFloat: 1
                })
        
                this.overlay = new Object2d({
                    img: 'resources/img/misc/picture_overlay_01.png',
                    x: 0, y: 0, z: 1000
                })
            },
            onUnload: () => {
                this.seaCreatureObject.removeObject();
                this.boatObject.removeObject();
                this.overlay.removeObject();
            }
        }),
        graveyard: new Scene({
            image: 'resources/img/background/outside/graveyard_01.png',
            noShadows: true,
        }),
        battle: new Scene({
            image: 'resources/img/background/house/battle_01.png',
            noShadows: true,
        }),
        stand: new Scene({
            image: 'resources/img/background/outside/stand_01.png',
        }),
        online_hub: new Scene({
            noShadows: true,
            image: 'resources/img/background/house/online_hub_01.png',
            onLoad: () => {
                this.lightRays = new Object2d({
                    img: 'resources/img/misc/light_rays_02.png',
                    opacity: 0.6, x: '50%', y: '50%', composite: 'overlay',
                    onDraw: (me) => {
                        me.rotation -= 0.005 * App.deltaTime;
                    }
                })
                this.platform = new Object2d({
                    img: 'resources/img/misc/online_hub_01_front.png',
                    x: 0, y: 0,
                })
            },
            onUnload: () => {
                this.platform.removeObject();
                this.lightRays.removeObject();
            }
        }),
        garden: new Scene({
            image: 'resources/img/background/outside/garden_01.png',
            petY: '95%',
            shadowOffset: -5,
            onLoad: (args) => {
                App.pet.staticShadow = false;
                
                if(!args?.noPetBowl){
                    App.temp.petBowlObject = new Object2d({
                        img: 'resources/img/misc/pet_bowl_01.png',
                        x: '20%',
                        y: '67%',
                        width: 22, height: 22,
                        onLateDraw: (me) => {
                            App.pet.setLocalZBasedOnSelf(me);
                        }
                    })
            
                    if(App.animals.treat){
                        App.temp.animalTreatObject = new Object2d({
                            img: App.constants.FOOD_SPRITESHEET,
                            spritesheet: {
                                ...App.constants.FOOD_SPRITESHEET_DIMENSIONS,
                                cellNumber: App.animals.treat + App.animals.treatBiteCount,
                            },
                            x: App.temp.petBowlObject.x,
                            y: '63%',
                            onLateDraw: (me) => {
                                me.z = App.temp.petBowlObject.z;
                                me.localZ = App.temp.petBowlObject.localZ + 0.001;
                            }
                        })
                    }
                }

                App.handleAnimalsSpawn(true);
            },
            onUnload: () => {
                App.pet.staticShadow = true;

                App.temp.petBowlObject?.removeObject?.();
                App.temp.animalTreatObject?.removeObject?.();

                App.handleAnimalsSpawn(false);
            }
        }),
        beach: new Scene({
            image: 'resources/img/background/house/beach_01.png',
        }),
        skate_park: new Scene({
            image: 'resources/img/background/outside/skatepark_01.png',
        }),
        fortune_teller: new Scene({
            image: 'resources/img/background/house/fortune_teller_01.png',
            onLoad: () => {
                const npcDef = new PetDefinition({
                    sprite: 'resources/img/character/chara_362b.png',
                    accessories: ['witch hat'],
                })
                this.fortuneTellerNpc = new Pet(npcDef);
                this.fortuneTellerNpc.stopMove();
                this.fortuneTellerNpc.x = '80%';
                this.fortuneTellerNpc.triggerScriptedState('idle', App.INF, false, true);

                this.underlay = new Object2d({
                    img: 'resources/img/background/house/fortune_teller_01_underlay.png',
                    z: App.constants.BACKGROUND_Z - 1, x: 0, y: 0,
                })
            },
            onUnload: () => {
                this.fortuneTellerNpc?.removeObject();
                this.underlay?.removeObject();
            }
        }),
        garden_inner: new Scene({
            image: 'resources/img/background/outside/garden_inner_01.png',
            petY: '55%',
            animalMinY: 55,
            shadowOffset: -5,
            onLoad: () => {
                App.handleGardenPlantsSpawn(true);
                App.handleAnimalsSpawn(true);
                App.pet.staticShadow = true;
            },
            onUnload: () => {
                App.handleGardenPlantsSpawn(false);
                App.handleAnimalsSpawn(false);
                App.pet.staticShadow = false;
            }
        }),
        forest: new Scene({
            image: 'resources/img/background/outside/transparent.png',
            petY: '94%',
            onLoad: () => {
            },
            onUnload: () => {
            }
        }),
        reviverDen: new Scene({
            image: 'resources/img/background/house/reviver_01.png',
            noShadows: true,
        }),
        emptyOutside: new Scene({
            image: 'resources/img/background/outside/transparent.png',
        }),
        genericOutside: new Scene({
            image: 'resources/img/background/outside/activities_base_01.png'
        }),
        mallInterior: new Scene({
            image: 'resources/img/background/house/mall_interior_01.png'
        }),
        animalBathroom: new Scene({
            image: 'resources/img/background/house/animal_bathroom_01.png'
        }),
        classroom: new Scene({
            image: 'resources/img/background/house/classroom_01.png',
            onLoad: () => {
                App.pet.staticShadow = false;
            },
            onUnload: () => {
                App.pet.staticShadow = true;
            }
        }),
        music_classroom: new Scene({
            image: 'resources/img/background/house/music_classroom_01.png',
        }),
        homeworld_getaways: new Scene({
            image: 'resources/img/background/house/homeworld_getaways_01.png',
            noShadows: true,
        }),
        devil_town_exterior: new Scene({
            image: 'resources/img/background/house/devil_town_01.png',
            noShadows: true,
            onLoad: () => {
                App.pet.showOutline();
            },
            onUnload: () => {
                App.pet.hideOutline();
            }
        }),
        devil_town_gathering: new Scene({
            image: 'resources/img/background/house/devil_town_02.png',
            noShadows: true,
            onLoad: () => {
                App.pet.showOutline();
            },
            onUnload: () => {
                App.pet.hideOutline();
            }
        }),
        angel_town_room: new Scene({
            image: 'resources/img/background/house/angel_town_01.png',
            noShadows: true,
        }),
        restaurant: new Scene({
            image: 'resources/img/background/house/restaurant_01.png',
            noShadows: true,
        })
    },
    setScene(scene, noPositionChange, onLoadArg){
        App.currentScene?.onUnload?.(scene);

        App.currentScene = scene;
        if(!noPositionChange){
            App.pet.x = scene.petX || '50%';
            App.pet.y = scene.petY || '100%';
        }
        if(scene.foodsX) App.foods.x = scene.foodsX;
        if(scene.foodsY) App.foods.y = scene.foodsY;
        App.background.setImg(scene.image);

        if(scene.onLoad){
            scene.onLoad(onLoadArg);
        }

        this.applySky();
    },
    reloadScene(noPositionChange){
        App.setScene(App.currentScene, noPositionChange);
    },
    isRoomFurnishable(){
        return App.scene.home.image?.includes('furnishable/');
    },
    getFurnishableBackground(backgroundSrc){
        return backgroundSrc
            .replace('house/', 'house/furnishable/')
            .replace('outside/', 'outside/furnishable/')
    },
    getFurnitureDefFromId(id){
        return App.definitions.furniture.find(current => current.id === id);
    },
    handleFurnitureSpawn(furnitureData = App.ownedFurniture, removeOnly){
        if(App.activeFurnitureObjects?.length){
            App.activeFurnitureObjects.forEach(o => o.removeObject());
        }

        App.activeFurnitureObjects = [];

        if(removeOnly || !App.isRoomFurnishable()) return;

        furnitureData.forEach?.(furniture => {
            if(!furniture.isActive) return;
            const furnitureDef = App.getFurnitureDefFromId(furniture.id);
            if(!furnitureDef) 
                return console.log('furniture was not found', furniture);
            let lastY = 0;
            const furnitureObject = new Object2d({
                // image: App.preloadedResources[furnitureDef.image],
                img: furnitureDef.image,
                x: furniture.x || 0,
                y: furniture.y || 0,
                z: furniture.z || App.constants.BACKGROUND_Z + 0.1,
                def: furniture,
                onDraw: (me) => {
                    furnitureDef.onDraw?.(me);

                    if(lastY === me.y) return;
                    lastY = me.y;
                    me.z = App.constants.BACKGROUND_Z + 
                            0.3 + 
                            ((me.y + (me.image.height)) * 0.01);
                }
            })
            App.activeFurnitureObjects.push(furnitureObject);
        })

        return App.activeFurnitureObjects;
    },
    editFurniture(gameObject, callbackFn){
        if(!gameObject) return false;

        App.toggleGameplayControls(false);
        const editDisplay = document.createElement('div');
        editDisplay.className = 'absolute-fullscreen'
        document.querySelector('.screen-wrapper').appendChild(editDisplay)
        editDisplay.close = () => editDisplay.remove();
        editDisplay.innerHTML = `
            <div class="directional-control__container">
                <div class="controls-y">
                    <div class="control" id="up"><i class="fa fa-angle-up"></i></div>
                    <div class="controls-x">
                        <div class="control" id="left"><i class="fa fa-angle-left"></i></div>
                        <div class="control" id="right"><i class="fa fa-angle-right"></i></div>
                    </div>
                    <div class="bottom-container">
                        <div class="control" id="cancel"><i class="fa fa-times"></i></div>
                        <div class="control" id="down"><i class="fa fa-angle-down"></i></div>
                        <div class="control" id="apply"><i class="fa fa-check"></i></div>
                    </div>
                </div>
            </div>
        `;

        let blinkerFloat = 0;
        const onEditDrawEvent = () => {
            blinkerFloat += 0.0085 * App.deltaTime;
            blinkerFloat = blinkerFloat % App.PI2;
            gameObject.opacity =  Math.max(0.65, 0.65 + Math.sin(blinkerFloat) * 0.2);
        }
        App.registerOnDrawEvent(onEditDrawEvent);

        const objectInitialPosition = {x: gameObject.x, y: gameObject.y, z: gameObject.z};

        const leftButton = editDisplay.querySelector('.control#left');
        const rightButton = editDisplay.querySelector('.control#right');
        const upButton = editDisplay.querySelector('.control#up');
        const downButton = editDisplay.querySelector('.control#down');
        [leftButton, rightButton, upButton, downButton].forEach(button => {
            button.onclick = () => {
                moveObject(button);
            }
        })

        const moveObject = (button) => {
            const unit = 2.4;
            switch(button){
                case leftButton: gameObject.x -= unit; break;
                case rightButton: gameObject.x += unit; break;
                case upButton: gameObject.y -= unit; break;
                case downButton: gameObject.y += unit; break;
            }
            App.playSound('resources/sounds/ui_click_04.ogg');
            App.vibrate();
        }

        const onEndFn = (state) => {
            App.toggleGameplayControls(true);
            editDisplay.close();
            App.unregisterOnDrawEvent(onEditDrawEvent);
            gameObject.opacity = 1;
            callbackFn?.(state);
        }

        editDisplay.querySelector('#apply').onclick = () => {
            App.playSound('resources/sounds/ui_click_03.ogg');
            App.vibrate();
            App.displayConfirm(`Do you want to save the current placement?`, [
                {
                    name: 'yes',
                    onclick: () => {
                        gameObject.def.x = gameObject.x;
                        gameObject.def.y = gameObject.y;
                        gameObject.def.z = gameObject.z;
                        onEndFn(true);
                    }
                },
                {
                    name: 'no',
                    class: 'back-btn',
                    onclick: () => {}
                }
            ])
        };
        editDisplay.querySelector('#cancel').onclick = () => {
            App.playSound('resources/sounds/ui_click_02.ogg');
            App.vibrate();
            App.displayConfirm(`Are you sure you want to cancel the current placement?`, [
                {
                    name: 'yes',
                    onclick: () => {
                        gameObject.x = objectInitialPosition.x;
                        gameObject.y = objectInitialPosition.y;
                        gameObject.z = objectInitialPosition.z;
                        onEndFn(false);
                    }
                },
                {
                    name: 'no',
                    class: 'back-btn',
                    onclick: () => {}
                }
            ])
        };

        App.sendAnalytics('edit_furniture');
        return true;
    },
    handleGardenPlantsSpawn(shouldSpawn){
        this.spawnedPlants?.forEach(o => o.removeObject());

        if(!shouldSpawn){
            return false;
        }

        const getPlantPosition = (i) => {
            const xOffset = 2, yOffset = 40;
            const maxCols = 4;
            return {
                x: (i % maxCols === 0) ? xOffset : xOffset + (23 * (i % maxCols)),
                y: yOffset + (Math.floor(i / maxCols) * 20),
            }                
        }

        this.spawnedPlants = [];
        for(let i = 0; i < App.constants.MAX_PLANTS; i++){
            let currentPlant = App.plants?.at(i);

            const position = getPlantPosition(i);
            const patch = new Object2d({
                img: `resources/img/misc/garden_patch_01.png`,
                x: position.x,
                y: position.y + 12,
                // prevent patches from sharing 1 image element
                noPreload: true,
            })
            currentPlant?.createObject2d(patch);
            this.spawnedPlants.push(patch);
        }
    },
    handleAnimalsSpawn(shouldSpawn){
        this.spawnedAnimals?.forEach?.(o => o?.removeObject?.());

        if(!shouldSpawn) {
            return false;
        }

        const getSpawnableAnimals = () => {
            switch(App.currentScene){
                case App.scene.home:
                    return App.animals.list?.filter(animalDef => animalDef.spawnIndoors);
            }

            return App.animals.list;
        }


        this.spawnedAnimals = getSpawnableAnimals()?.map(animalDef => {
            const animal = new Animal(animalDef, {
                x: random(0, App.drawer.bounds.width),
            })
            animal.y = animal.getValidRandomYPosition();
            return animal;
        })
    },
    applySky() {
        const { AFTERNOON_TIME, EVENING_TIME, NIGHT_TIME } = App.constants;
        const date = new Date();
        const h = App.clampWithin24HourFormat(new Date().getHours() + App.settings.sleepingHoursOffset);
        // const h = 20;

        const isOutside = App.background.imageSrc?.indexOf('outside/') != -1;

        // weather
        App.skyWeather.z = isOutside ? 999.1 : -998;
        let weatherEffectChance = random(3, 10, date.getDate())
        // if(App.isDuringChristmas()) weatherEffectChance += 500;
        // if(App.isChristmasDay()) weatherEffectChance += 100;
        // App.setWeather('snow');
        const seed = h + date.getDate() + App.userId;
        pRandom.save();
        pRandom.seed = seed;
        App.skyWeather.hidden = !pRandom.getPercent(weatherEffectChance);
        pRandom.load();
        
        // sky
        let sky;
        if(h >= AFTERNOON_TIME[0] && h < AFTERNOON_TIME[1] && App.skyWeather.hidden) sky = 'afternoon';
        else if(h >= EVENING_TIME[0] && h < EVENING_TIME[1]) sky = 'evening';
        else if(h >= NIGHT_TIME[0] || h < NIGHT_TIME[1]) sky = 'night';
        else sky = 'morning';
        App.sky.name = sky;
        App.sky.setImage(App.preloadedResources[`resources/img/background/sky/${sky}.png`]);
        App.skyOverlay.setImage(App.preloadedResources[`resources/img/background/sky/${sky}_overlay.png`]);
        setTimeout(() => App.skyOverlay.hidden = !isOutside)
        if(sky == 'afternoon' || sky == 'morning') App.skyOverlay.hidden = true;
    },
    setWeather(type){
        switch(type){
            case 'rain':
                App.skyWeather.image = App.preloadedResources["resources/img/background/sky/rain_01.png"];
                App.skyWeather.composite = "xor";
                break;
            case 'snow':
                App.skyWeather.image = App.preloadedResources["resources/img/background/sky/snow_01.png"];
                App.skyWeather.composite = "normal";
                break;
        }
    },
    isWeatherEffectActive(){
        return !App.skyWeather.hidden;
    },
    applyRoomCustomizations(data){
        if(typeof data !== 'object' || !data) return;
        Object.keys(data).forEach(key => {
            const scene = App.scene[key];
            if(!scene) return console.error('Invalid scene:', key);
            scene.image = data[key].image;
        })
        App.reloadScene();
    },
    getRandomAnimalDef: function(type){
        const animalGroups = {};
        animalGroups.cat = ANIMAL_CHARACTERS.filter(char => char.includes('cat'));
        animalGroups.dog = ANIMAL_CHARACTERS.filter(char => char.includes('dog'));
        animalGroups.other = ANIMAL_CHARACTERS.filter(char => !animalGroups.cat.includes(char) && !animalGroups.dog.includes(char));

        if(type && !(type in animalGroups)) {
            console.error('Invalid Animal Group type: ', type);
            type = null;
        }

        const typesArray = type ? 
            [animalGroups[type]] : 
            [
                // increases the chance of dogs and cats
                animalGroups.cat, animalGroups.dog,
                animalGroups.cat, animalGroups.dog,
                animalGroups.cat, animalGroups.dog,
                animalGroups.other  
            ];

        const sprite = randomFromArray(
            randomFromArray(typesArray)
        );

        const animal = new AnimalDefinition({
            name: getRandomName(false, true),
            sprite
        });

        return animal;
    },
    getRandomPetDef: function(age = PetDefinition.LIFE_STAGE.adult, seed){
        pRandom.save();
        let rndArrayFn = randomFromArray;

        if(seed !== undefined) {
            pRandom.seed = seed;
            rndArrayFn = pRandomFromArray;
        }

        let sprite;
        switch(age){
            case PetDefinition.LIFE_STAGE.baby:
                sprite = rndArrayFn(PET_BABY_CHARACTERS);
                break;
            case PetDefinition.LIFE_STAGE.child:
                sprite = rndArrayFn(PET_CHILD_CHARACTERS);
                break;
            case PetDefinition.LIFE_STAGE.teen:
                sprite = rndArrayFn(PET_TEEN_CHARACTERS);
                break;
            case PetDefinition.LIFE_STAGE.elder:
                sprite = rndArrayFn(PET_ELDER_CHARACTERS);
                break;
            default:
                sprite = rndArrayFn(PET_ADULT_CHARACTERS);
                break;
        }

        let pet = new PetDefinition({
            sprite,
            name: getRandomName(seed ? seed : false),
        });
        pet.setStats({
            current_hunger: 100,
            current_sleep: 100,
            current_fun: 100
        });
        pRandom.load();
        return pet;
    },
    getPetDefFromParents: function(parentA, parentB){
        // parents are petDefinition
        // parentA is the main parent
        
        parentA.stats.player_friendship = 100;
        parentA.stats.is_player_family = true;
        parentB.stats.player_friendship = 80;
        parentB.stats.is_player_family = true;

        // new pet
        const sprite = PetDefinition.getOffspringSprite(parentA, parentB);
        newPetDefinition = new PetDefinition({
            name: getRandomName(),
            sprite,
        }).setStats({is_egg: true, is_ghost: parentB.stats.is_ghost});

        newPetDefinition.friends = [
            parentA,
            parentB
        ];
        newPetDefinition.family = [
            ...parentA.family,
            [parentA, parentB].map(parent => App.minimalizePetDef(parent))
        ]

        newPetDefinition.inventory = parentA.inventory;
        newPetDefinition.stats.gold = parentA.stats.gold + random(50, 150);
        newPetDefinition.stats.current_health = 100;

        return newPetDefinition;
    },
    minimalizePetDef: function(petDef){
        return {
            sprite: petDef.sprite,
            name: petDef.name,
            birthday: petDef.birthday,
            accessories: petDef.accessories || [],
            lastBirthday: petDef.lastBirthday,
            stats: {
                is_ghost: petDef.stats.is_ghost,
            }
        }
    },
    createActivePet: function(petDef, props = {}){
        if(petDef.sprite) App.handlers.add_active_pet_to_collection(petDef.sprite);

        return new Pet(petDef, {
            z: App.constants.ACTIVE_PET_Z, 
            scale: 1, 
            castShadow: true,
            ...props
        });
    },
    _queueEventKeys: {},
    queueEvent: function(payloadFn, eventKey = App.time + Math.random()){
        if(this._queueEventKeys[eventKey]){
            // event already queued
            return false;
        }
        this._queueEventKeys[eventKey] = true;

        const checkForDecentTime = () => {
            if(
                App.pet.isDuringScriptedState() || 
                App.haveAnyDisplays() || 
                App.pet.stats.is_egg || 
                App.pet.stats.is_dead || 
                App.pet.stats.is_at_parents ||
                App.currentScene !== App.scene.home
            )
                return;

            App.unregisterOnDrawEvent(checkForDecentTime);
            payloadFn?.();
            delete this._queueEventKeys[eventKey];
        }
        App.registerOnDrawEvent(checkForDecentTime);
    },
    runRandomEncounters: function(){
        if(
            App.pet.stats.is_egg ||
            App.pet.stats.is_at_parents ||
            App.pet.stats.is_at_vacation ||
            App.pet.stats.is_dead
        ) return;

        // school invite
        if(
            App.petDefinition.lifeStage >= PetDefinition.LIFE_STAGE.child && 
            App.petDefinition.lifeStage <= PetDefinition.LIFE_STAGE.teen &&
            !App.pet.stats.has_received_school_invite
        ){
            App.pet.stats.has_received_school_invite = true;
            setTimeout(() => {
                App.queueEvent(() => {
                    Activities.getMail({
                        onEndFn: () => {
                            App.handlers.show_letter({
                                headline: 'Official School Invitation', 
                                text: `Dear ${App.userName},<br>${App.petDefinition.name} is now old enough to start school.<br><br>Please make sure they show up to their classes every day, no skipping!`, 
                                sender: 'School Administration'
                            })
                        },
                        noSceneSwitch: true
                    });
                })
            }, random(1000, 2000))
            return;
        }

        // newspaper delivery
        const newspaperDeliveryMs = App.getRecord('newspaper_delivery_ms') || 0;
        const shouldDeliver = moment().startOf('day').diff(moment(newspaperDeliveryMs), 'days') > 0;
        if(shouldDeliver && !App.pet.stats.is_sleeping){
            setTimeout(() => {
                App.queueEvent(() => {
                    Activities.getMail();
                    const nextMs = Date.now();
                    App.addRecord('newspaper_delivery_ms', nextMs, true);
                })
            }, random(1000, 2000))
            return;
        }

        // revived encounter
        if(App.pet.stats.is_revived_once && random(0, 1300) === 13){
            return Activities.reckoning();
        }

        // entity encounter
        const encounterChance = App.pet.stats.is_revived_once 
            ? random(0, 128) 
            : random(0, 256);
        if(encounterChance === 1){
            return Activities.encounter();
        }

        // getting robbed
        if(random(0, 100) <= 10 && App.pet.stats.is_sleeping && App.sky.name === 'night'){
            return Activities.getRobbed();
        }
    },
    handlers: {
        go_to_home: function(){
            App.temp[App.handlers.getOutsideActivityId()] = 1;
            App.pet.x = '0%';
            App.pet.targetX = 50;
        },
        go_to_park: function(){
            Activities.goToPark(false, () => App.handlers.open_activity_list(true))
        },
        go_to_clinic: function(){
            Activities.goToClinic(() => App.handlers.open_activity_list(true))
        },
        show_attended_school_limit_message: function(){
            const formattedResetTime = moment(App.constants.SCHOOL.resetTime).format('h:mmA');
            return App.displayPopup(`<b>${App.petDefinition.name}</b> has attended all of their classes today!<br><br>Come back tomorrow after <b>${formattedResetTime}</b>`, 4000);
        },
        go_to_school: function(){
            Activities.goToSchool(() => App.handlers.open_activity_list(true))
        },
        open_works_list: function(){
            const backFn = () => {
                App.handlers.open_activity_list(true);
            }
            return App.displayList([
                {
                    name: `stand work`,
                    onclick: () => {
                        Activities.standWork();
                    }
                },
                {
                    name: 'office work',
                    onclick: () => {
                        Activities.officeWork();
                    }
                },
            ], backFn)
        },
        open_fortune_teller: function(){
            const backFn = () => {
                App.handlers.open_activity_list(true);
            }
            return App.displayList([
                {
                    _disable: App.petDefinition.lifeStage === PetDefinition.LIFE_STAGE.elder,
                    name: 'Next Evolution',
                    onclick: () => {
                        return App.displayConfirm(`Do you want to see ${App.petDefinition.name}'s <b>next possible evolution(s)</b> based on different <b>care ratings</b>?`, [
                            {
                                name: 'yes ($100)',
                                onclick: () => {
                                    if(!App.pay(100)) return;
                                    App.closeAllDisplays();
                                    Activities.goToFortuneTeller();
                                }
                            },
                            {
                                name: 'no',
                                class: 'back-btn',
                                onclick: () => {}
                            }
                        ])
                    }
                },
                {
                    _disable: App.petDefinition.lifeStage < PetDefinition.LIFE_STAGE.adult,
                    name: 'Offspring with ...',
                    onclick: () => {
                        const filter = (petDefinition) => (
                            !petDefinition.stats.is_player_family
                            && petDefinition.lifeStage >= PetDefinition.LIFE_STAGE.adult
                            && App.petDefinition.lifeStage >= PetDefinition.LIFE_STAGE.adult
                        )
                        App.handlers.open_friends_list((friendDef) => {
                            return App.displayConfirm(`Do you want to see ${friendDef.name} and ${App.petDefinition.name}'s baby <b>offspring</b>?`, [
                                {
                                    name: 'yes ($100)',
                                    onclick: () => {
                                        if(!App.pay(100)) return;
                                        App.closeAllDisplays();
                                        Activities.goToFortuneTeller(friendDef);
                                    }
                                },
                                {
                                    name: 'no',
                                    class: 'back-btn',
                                    onclick: () => {}
                                }
                            ])
                        }, filter);
                        return true;
                    }
                }
            ], backFn)
        },
        open_hubchi_search: function(onAddCallback){
            const prompt = App.displayPrompt(
                `
                Enter your friend's username (or UID): <small>(Case sensitive)</small>
                <button id="help" style="position: absolute; bottom: 0; right: 0" class="generic-btn stylized"><b>?</b></button>
                `, 
                [
                {
                    name: '<i class="fa-solid fa-search icon"></i> search',
                    onclick: (query) => {
                        if(!query.trim()) return App.displayPopup('Please enter a valid username.');
                        const searchingPopup = App.displayPopup(`Searching for "${query}"...`, App.INF);
                        App.apiService.getPetDef(query)
                            .then(data => {
                                App.sendAnalytics('username_search', JSON.stringify({
                                    status: data.status,
                                    username: query
                                }));
                                
                                if(!data.status) return App.displayPopup(`Username not found <br> <small>(Make sure you are searching for user id, not pet name)</small>`);

                                // if(data.data === hasUploadedPetDef.data) {
                                if(App.userName.indexOf(query) === 0){
                                    return App.displayPopup(`Something went wrong!`);
                                }
                                
                                prompt.close();
                                try {
                                    const parsedJson = JSON.parse(data.data);
                                    const def = new PetDefinition(parsedJson).setStats({
                                        is_ghost: parsedJson.is_ghost || 0,
                                    })
                                    App.displayConfirm(`Do you want to add ${def.getCSprite()} ${def.name} to your friends list?`, [
                                        {
                                            name: 'yes',
                                            onclick: () => {
                                                App.closeAllDisplays();
                                                const addedFriend = App.petDefinition.addFriend(def, 1);
                                                if (addedFriend) {
                                                    App.displayPopup(`${def.getCSprite()} ${def.name} has been added to the friends list!`, 3000);
                                                    App.apiService.addInteraction(def.ownerId);
                                                    onAddCallback?.(def);
                                                } else {
                                                    App.displayPopup(`You are already friends with ${def.name}`, 3000);
                                                }
                                                return false;
                                            }
                                        },
                                        {
                                            name: 'no',
                                            class: 'back-btn',
                                            onclick: () => { }
                                        },
                                    ])  
                                } catch(e) {
                                    App.displayPopup('Something went wrong!');
                                }
                            })
                            .finally(() => searchingPopup.close())
                        return true;
                    }
                },
                {
                    name: 'cancel',
                    class: 'back-btn',
                    onclick: () => {}
                }
            ])
            prompt.querySelector('#help').onclick = () => {
                App.displayConfirm(`
                        <div> Your friend must have uploaded their character to <b style="color: #ff00c6">Hubchi</b> </div>
                        <br>
                        <div> Ensure you search for their <b>UID</b> <small>(located in the profile section)</small> and <b>not their pet name</b> </div>
                        <br>
                        <div> UID is <b>case sensitive</b> </div>
                        <br>
                        <div> ${App.getUidUI()} </div>
                    `, 
                    [
                        {
                            name: 'ok',
                            onclick: () => {}
                        }
                    ]
                );
            }
            return prompt;
        },
        show_rating_dialog: function(){
            return App.displayConfirm(`If you're enjoying the game, please consider <b>rating it</b> on Itch. Your feedback makes a huge difference and helps us a lot!`,
                [
                    {
                        link: App.routes.ITCH_REVIEW,
                        name: `rate!`,
                        onclick: () => {
                            App.sendAnalytics('rate_accept');
                        }
                    },
                    {
                        name: `cancel`,
                        class: 'back-btn',
                        onclick: () => {
                            App.sendAnalytics('rate_decline');
                        }
                    }
                ]
            )
        },
        show_onboarding: function(){
            const screenWrapper = document.querySelector('.screen-wrapper');
            const interval = setInterval(() => {
                if(!App.pet.stats.is_egg){
                    UI.show(document.querySelector('.tap-reminder'));
                    const tapReminderRemoveHandler = () => {
                        UI.hide(document.querySelector('.tap-reminder'));
                        screenWrapper.removeEventListener('click', tapReminderRemoveHandler);
                    }
                    screenWrapper.addEventListener('click', tapReminderRemoveHandler);
                    clearInterval(interval);
                }
            }, 1000);
        },
        show_set_pet_name_dialog: function(text = 'Name your new egg:'){
            const { GENDERS } = App.constants;
            const cycleBetweenGenders = (evt) => {
                const currentIndex = GENDERS.indexOf(App.pet.stats.gender);
                const nextIndex = (currentIndex + 1) % GENDERS.length;
                App.pet.stats.gender = GENDERS.at(nextIndex);
                evt.target.innerHTML = App.getIcon(App.pet.stats.gender, true);
            }
            const prompt = `
                <span>${App.petDefinition.getFullCSprite()}<br>${text}</span>
                ${
                    App.settings.genderedPets ?
                    `<button 
                        style="position: absolute; bottom: 0; right: 0" 
                        class="generic-btn stylized" 
                        id='gender'
                    >
                        ${App.getIcon(App.pet.stats.gender, true)}
                    </button>` :
                    ''
                }
            `;
            const element = App.displayPrompt(prompt, [
                {
                    name: 'set',
                    onclick: (value) => {
                        if(!value) return false;

                        App.pet.petDefinition.name = value;
                        App.save();
                        App.displayPopup(`Name set to "${App.pet.petDefinition.name}"`)
                    }
                },
            ], App.pet.petDefinition.name || '');
            const genderButton = element.querySelector('#gender');
            if(genderButton){
                genderButton.onclick = cycleBetweenGenders;
            }
        },
        show_set_username_dialog: function(){
            const validate = (username) => {
                if(!username) return false;
                const regex = /^[a-zA-Z0-9]+$/;
                return username.match(regex) !== null;
            }

            App.displayPrompt(`Set your username`, [
                {
                    name: 'set',
                    onclick: (username) => {
                        username = (username || '').toString().toLowerCase();
                        if(!validate(username)) return App.displayPopup('Username is not valid. Please use A-Z letters and numbers.');
                        if(username.length < 5) return App.displayPopup('Your username cannot have less than 5 characters.');
                        if(username.length > 18) return App.displayPopup('Your username cannot have more than 18 characters.');
                        App.userName = username;
                        App.save();
                        App.sendAnalytics('new_user', username);
                    }
                }
            ])
        },
        show_letter: function({headline, text, sender}){
            const container = App.displayEmpty('letter');
            container.innerHTML = `
            <div class="flex flex-dir-col">
                <h1>${App.getIcon('envelope')}</h1>
                <h1>${headline}</h1>
                <span>${text}</span>
                <footer>${sender}</footer>
                <hr>
                <button style="margin: 10px; margin-top: 10px; flex: 1" class="generic-btn stylized back-btn">Ok</button>
            </div>
            `
            container.querySelector('.back-btn').onclick = container.close;
        },
        show_newspaper: function(headline, text){
            if(!headline && !text){
                [headline, text] = randomFromArray(App.definitions.mail.affirmations);
            }

            const salesDaySection = !App.isSalesDay() ? '' : `
                <div>
                    <b style="color: orangered;">Discount Day!</b>
                    <br>
                    Local shops are slashing prices for today only. Don't miss out on huge savings! Check them out and save big!
                    <br><br><br>
                </div>
            `;

            const christmasSection = !App.isDuringChristmas() ? '' : `
                <div>
                    <b style="color: darkgreen;">Happy Xmas!</b>
                    <br>
                    DayMail sends you warm holiday wishes and a joyous New Year!
                    <br><br>
                    <small>
                        During xmas, you'll receive 2x rewards from opening mission chests, so don't forget to check them out!
                    </small>
                    <br><br><br>
                </div>
            `;

            const container = App.displayEmpty('bg-white flex flex-dir-col');
                container.style = `background: repeating-linear-gradient(0deg, white 0px, white 11px, rgb(201, 201, 201) 10px, white 12px) local; backdrop-filter: blur(100px)`
            container.innerHTML = `
            <img class="width-full" src="resources/img/misc/newspaper_header_01.png"></img>
            <div style="text-align: left;" class="inner-padding">
                ${christmasSection}
                ${salesDaySection}
                <b>${headline}</b>
                <hr style="background: #0000003d; display: none">
                <br><br>
                <span>${text}</span>
                <br>
                </div>
            <button style="margin: 10px; margin-top: 10px; flex: 1" class="generic-btn stylized back-btn news-close">Ok</button>
            <i style="position: absolute;top: 0;right: 0;padding: 10px;border-radius: 100%;width: 10px;height: 10px;display: inline-flex;align-items: center;justify-content: center;color: #000000;cursor: pointer;" class="fa-solid fa-times news-close"></i>
            `;

            [...container.querySelectorAll('.news-close')].forEach(btn => btn.onclick = container.close);
        },
        open_main_menu: function(){
            const runControlOverwrite = () => {
                if(!App.gameplayControlsOverwrite) return;
                App.playSound(`resources/sounds/ui_click_01.ogg`, true);
                App.gameplayControlsOverwrite();
                App.vibrate();
            }
            if(App.disableGameplayControls || App.settings.classicMainMenuUI) {
                runControlOverwrite();
                return;
            }
            UI.lastClickedButton = null;
            App.playSound(`resources/sounds/ui_click_01.ogg`, true);
            App.vibrate();
            
            if(typeof App.temp.showStoragePersistentBadge === 'undefined'){
                App.temp.showStoragePersistentBadge = !App.isStoragePersistent;
            }
            const settingsBadge = App.temp.showStoragePersistentBadge ? App.getBadge('', 'red circle') : '';
            const renderingMainMenu = App.definitions.main_menu.map(item => {
                if(item.id === 'settings'){
                    return {
                        ...item,
                        name: `${item.name} ${settingsBadge}`,
                        onclick: () => {
                            item.onclick();
                            App.temp.showStoragePersistentBadge = false;
                        }
                    }
                }
                return item;
            })
            App.displayGrid([
                ...renderingMainMenu,
                {
                    name: App.getIcon('arrow-left', true),
                    class: 'back-sound',
                    onclick: () => { }
                }
            ])
        },
        open_care_menu: function(){
            const getUnclaimedRewardsBadge = () => {
                return Missions.hasUnclaimedRewards() 
                    ? App.getBadge('!')
                    : '';
            }
            const disciplineEntry = {
                type: 'element',
                class: ' flex flex-dir-col in-list-container flex-gap-05 inner-padding-sm',
                innerHTML: UI.create({
                    children: [
                        {
                            domType: 'span',
                            innerHTML: `${App.getGenericCSprite(1, 'resources/img/misc/misbehaving_01.png', {cellSize: 9, rows: 1}, 'x2 opacity-half ml-2 ')} Discipline`,
                        },
                        {
                            domType: 'div',
                            className: 'flex-between flex-gap-05',
                            children: [
                                {
                                    componentType: 'button',
                                    style: `color: #229d3c;`,
                                    className: 'generic-btn stylized m-0 flex-1 flex-center flex-dir-row',
                                    innerHTML: App.getIcon('face-laugh-beam')  + App.getIcon('thumbs-up', true),
                                    onclick: () => {
                                        App.closeAllDisplays();
                                        App.pet.praise();
                                    }
                                },
                                {
                                    componentType: 'button',
                                    className: `generic-btn stylized m-0 flex-1 flex-center flex-dir-row ${App.pet.stats.is_misbehaving ? 'attention' : ''}`,
                                    style: `color: #e74040;`,
                                    innerHTML: App.getIcon('face-angry') + App.getIcon('thumbs-down', true),
                                    onclick: () => {
                                        App.closeAllDisplays();
                                        App.pet.scold();
                                        if(App.pet.stats.is_misbehaving){
                                            // still misbehaving
                                            App.toggleGameplayControls(false);
                                            setTimeout(() => {
                                                App.toggleGameplayControls(true);
                                                App.handlers.open_care_menu();
                                            }, 2000)
                                        }
                                    }
                                },
                            ]
                        }
                    ]
                })
            };

            App.displayList([
                {...disciplineEntry},
                {
                    _mount: (me) => {
                        me.innerHTML = `Missions ${getUnclaimedRewardsBadge()}`
                    },
                    name: '',
                    onclick: () => {
                        Missions.openMenu();
                        return true;
                    }
                },
                {
                    name: `sleep ${App.isSleepHour() ? App.getBadge('<div style="margin-left: auto; padding: 2px"> <i class="fa-solid fa-moon"></i> <small>bedtime!</small> </div>', 'night') : ''}`,
                    onclick: () => {
                        App.handlers.sleep();
                    }
                },
                {
                    name: `Backyard`,
                    onclick: () => {
                        Activities.goToGarden();
                    }
                },
                {
                    name: `Garden`,
                    onclick: () => {
                        Activities.goToInnerGarden();
                    }
                },
                {
                    name: `pet`,
                    onclick: () => {
                        App.displayPopup(`Tap the screen to pet <b>${App.petDefinition.name}</b><br><br>Don't tap for a few seconds to stop petting`, 2800, () => {
                            Activities.pet();
                        });
                    }
                },
                {
                    _ignore: !App.petDefinition.getParents(),
                    name: `stay with parents`,
                    onclick: () => {
                        if((App.hour < App.constants.PARENT_DAYCARE_START || App.hour >= App.constants.PARENT_DAYCARE_END)){
                            return App.displayPopup(`You can only leave ${App.petDefinition.name} at their parents house between <b>${App.formatTo12Hours(App.constants.PARENT_DAYCARE_START)}</b> and <b>${App.formatTo12Hours(App.constants.PARENT_DAYCARE_END)}</b>`, 4000)
                        }

                        App.displayConfirm(`${App.petDefinition.name} will be with their parents, who will look after them from <b>${App.formatTo12Hours(App.constants.PARENT_DAYCARE_START)}</b> to <b>${App.formatTo12Hours(App.constants.PARENT_DAYCARE_END)}</b>, is that ok?`, [
                            {
                                name: 'yes',
                                onclick: () => {
                                    App.closeAllDisplays();
                                    Activities.stayAtParents();
                                    App.save();
                                }
                            },
                            {
                                name: 'no',
                                class: 'back-btn',
                                onclick: () => { }
                            }
                        ])
                        
                        return true;
                    }
                },
                {
                    _disable: !App.pet.stats.current_want.type,
                    name: `current want`,
                    onclick: () => {
                        App.closeAllDisplays();
                        App.pet.showCurrentWant(App.settings.showWantName);
                    }
                },
            ], null, 'Care')
        },
        open_stuff_menu: function(){
            App.displayList([
                {
                    name: `items`,
                    onclick: () => {
                        App.handlers.open_item_list();
                        return true;
                    }
                },
                {
                    name: `accessories`,
                    onclick: () => {
                        App.handlers.open_accessory_list();
                        return true;
                    }
                },
                {
                    name: `furniture`,
                    onclick: () => {
                        if(!App.isRoomFurnishable()){
                            return App.displayConfirm(`Your room came fully furnished.<br><br>Would you like to remove the default furniture set and customize it?`, [
                                {
                                    name: 'yes',
                                    onclick: () => {
                                        App.closeAllDisplays();
                                        Activities.redecorRoom(() => {
                                            App.handlers.open_active_furniture_list();
                                        })
                                        App.scene.home.image = 
                                            App.getFurnishableBackground(App.scene.home.image);
                                    }
                                },
                                {
                                    name: 'no',
                                    onclick: () => {},
                                    class: 'back-btn',
                                }
                            ])
                        }
                        App.closeAllDisplays();
                        App.handlers.open_active_furniture_list();
                    }
                },
                {
                    name: `craft`,
                    onclick: () => {
                        App.handlers.open_craftables_list();
                        return true;
                    }
                }
            ], null, 'Stuff')
        },
        open_bathroom_menu: function(){
            App.displayList([
                {
                    name: 'bathe',
                    onclick: () => { 
                        Activities.bathe();
                    }
                },
                {
                    name: 'use toilet',
                    onclick: () => { 
                        Activities.poop();
                    }
                },
                {
                    name: 'clean room',
                    onclick: () => {
                        App.handlers.clean();
                    }
                }
            ], null, 'Cleaning')
        },
        open_credits: function(){
            return App.displayList([
                {
                    type: 'text',
                    name: `<small>developed by</small>
                    <br>
                    SamanDev
                    <small>
                        <a href="${App.routes.DISCORD}" target="_blank">discord</a>
                        <a href="https://samandev.itch.io" target="_blank">itch</a>
                    </small>
                    `
                },
                {
                    type: 'text',
                    name: `<small>art by</small>
                        <br>
                        <div class="credit-author">
                            <a href="https://samandev.itch.io" target="_blank">
                                SamanDev
                            </a>
                        </div>
                        <div class="credit-author">
                            <a href="https://sa311.tumblr.com/post/163140958242/about-me" target="_blank">
                                Curlour
                            </a>
                            <small>(eternitchi)</small>
                        </div>
                        <div class="credit-author">
                            <a href="https://www.tiktok.com/@prion_sigma" target="_blank">
                                Prion Sigma
                            </a>
                        </div>
                        <div class="credit-author">
                            <a href="https://vairasmythe.carrd.co/" target="_blank">
                                Vaira Smythe
                            </a>
                        </div>
                        <div class="credit-author">
                            <a href="https://www.artstation.com/pistispixel" target="_blank">
                                Piixel_Nun
                            </a>
                        </div>
                        <div class="credit-author">
                            <a href="https://www.instagram.com/abysmdelirium" target="_blank">
                                abysmDelirium
                            </a>
                        </div>
                        <div class="credit-author">
                            <a href="https://bsky.app/profile/teddieursa.bsky.social" target="_blank">
                                Teddie
                            </a>
                        </div>
                        <div class="credit-author">
                            Thunderputz
                        </div>
                    `
                },
                {
                    type: 'text',
                    name: `<small>music/sfx by</small>
                        <br>
                        <div class="credit-author">
                            <a href="https://samandev.itch.io" target="_blank">
                                SamanDev
                            </a>
                        </div>
                        <div class="credit-author">
                            <a href="https://x.com/Eth_DNautiluss" target="_blank">
                                Eth-D'Nautiluss
                            </a>
                        </div>
                    `
                },
            ])
        },
        open_settings: function(){
            const ignoreFirstDivider = !(App.deferredInstallPrompt || !App.isOnItch);

            const settings = App.displayList([
                {
                    _ignore: App.isStoragePersistent,
                    name: `
                        <span>
                            <b class="blink" style="color: red;">Your save data is at risk.</b><br> Your browser may <b>delete</b> it unexpectedly.
                        </span>
                        <div class="flex flex-dir-col mt-2">
                            <button id="emergency-backup" class="generic-btn stylized primary solid"> ${App.getIcon('download')} Backup </button>
                        </div>
                    `,
                    type: 'info',
                    _mount: (e) => {
                        e.querySelector('#emergency-backup').onclick = (evt) => {
                            App.exportSaveCode();
                            App.isStoragePersistent = true;
                            evt.target.innerHTML = `${App.getIcon('check')} Exported!`
                        }
                    }
                },
                {
                    _ignore: !App.isTester(),
                    name: `<span style="color:red;">devtools</span> ${App.getBadge('debug', 'neutral')}`,
                    onclick: () => {
                        return App.displayList([
                            {
                                name: 'eventshistory',
                                onclick: () => {
                                    const ui = UI.genericListContainer();
                                    const content = UI.empty()
                                    ui.appendChild(content);
                                    content.innerHTML = JSON.stringify(App.gameEventsHistory, null, 2);
                                    App.displayPopup('array? ' + Array.isArray(App.gameEventsHistory))
                                    return true;
                                }
                            },
                            {
                                name: 'user',
                                onclick: () => {
                                    const ui = UI.genericListContainer();
                                    const content = UI.empty()
                                    ui.appendChild(content);
                                    content.innerHTML = `${navigator.userAgent}`;
                                    return true;
                                }
                            },
                        ])
                    }
                },
                {
                    name: `
                        ${App.getIcon('floppy-disk')} 
                        <span class="flex flex-dir-col">
                            <span>Manual Save</span>
                            <small style="font-size: x-small">auto-saves every ${App.constants.AUTO_SAVE_INTERVAL_SECS} secs</small> 
                        </span>
                        `,
                    onclick: (me) => {
                        App.save();
                        me.disabled = true;
                        me.querySelector('span').textContent = 'Saved!';
                        return true;
                    }
                },
                {
                    _ignore: !App.deferredInstallPrompt,
                    name: 'install app',
                    onclick: () => {
                        App.installAsPWA();
                        return true;
                    },
                },
                {
                    _ignore: true || !window?.Notification || !App.isTester(), // unused
                    _mount: (e) => e.innerHTML = `notifications: <i>${App.settings.notifications ? 'on' : 'off'}</i>`,
                    name: `notifications`,
                    onclick: (btn) => {
                        if(App.settings.notifications) {
                            App.settings.notifications = false;
                            btn._mount();
                        } else {
                            Notification.requestPermission().then((result) => {
                                if (result === "granted") {
                                  App.settings.notifications = true;
                                }
                                btn._mount();
                            });
                        }

                        return true;
                    },
                },
                {
                    name: `save management`,
                    onclick: () => {
                        return App.displayList([
                            {
                                name: `<i class="fa-solid fa-download icon"></i> <label class="custom-file-upload"><input id="save-file" type="file"></input>Import</label>`,
                                _mount: (element) => {
                                    const input = element.querySelector('#save-file');
                                    App.handleFileLoad(input, 'readAsText', (data) => {
                                        App.handleInputCode(data);
                                        input.files = new DataTransfer().files;
                                        return true;
                                    })
                                },
                                onclick: () => {
                                    return true;
                                }
                            },
                            {
                                name: `<i class="fa-solid fa-upload icon"></i> Export`,
                                onclick: () => App.exportSaveCode()
                            },
                            {
                                name: `<i class="fa-solid fa-copy icon"></i> copy`,
                                onclick: async () => {
                                    const loadingPopup = App.displayPopup('loading...');
                                    const charCode = await App.getSaveCode();
                                    loadingPopup.close();
                                    App.displayConfirm(`Here you'll be able to copy your unique save code and continue your playthrough on another device`, [
                                        {
                                            name: 'ok',
                                            onclick: () => {
                                                App.displayConfirm(`After copying the code, open Tamaweb on another device and paste the code in <b>settings > input code</b>`, [
                                                    {
                                                        name: 'ok',
                                                        onclick: () => {
                                                            try {
                                                                if(App.isOnItch) throw 'itch_clipboard';
                                                                navigator.clipboard.writeText(charCode);
                                                                console.log('save code copied', charCode);
                                                                App.displayPopup('Save code copied!', 1000);
                                                            } catch(e) {
                                                                const prompt = App.displayPrompt(`Copy your save code from the box below:<br><small><i class="fa-solid fa-info-circle"></i> starts with <b>save:</b> and ends with <b>:endsave</b></small>`, [
                                                                    {
                                                                        name: 'Ok, I copied',
                                                                        class: 'back-btn',
                                                                        onclick: () => {}
                                                                    }
                                                                ], charCode);
                                                                const input = prompt.querySelector('input');
                                                                input.focus();
                                                                input.select();
                                                            }
                                                        }
                                                    },
                                                ]);
                                            }
                                        },
                                    ]);
                                    return true;
                                }
                            },
                        ])
                    }
                },
                {
                    // _ignore: !App.isTester(),
                    _ignore: App.isOnItch,
                    name: `mods`,
                    onclick: () => {
                        const display = App.displayList([
                            {
                                name: `
                                    <span>
                                        Please backup your save before installing mods.
                                    </span>
                                    <div class="flex flex-dir-col mt-2">
                                        <button id="emergency-backup" class="generic-btn stylized primary solid"> ${App.getIcon('download')} Backup </button>
                                    </div>
                                `,
                                type: 'info',
                                _mount: (e) => {
                                    e.querySelector('#emergency-backup').onclick = (evt) => {
                                        App.exportSaveCode();
                                        evt.target.innerHTML = `${App.getIcon('check')} Exported!`
                                    }
                                }
                            },
                            {
                                name: '<label class="custom-file-upload"><input id="mod-file" type="file"></input>+ Add mod</label>',
                                onclick: (btn) => {
                                    return true;
                                }
                            },
                            {
                                name: `active mods (${App.mods.length})`,
                                onclick: () => {
                                    // App.displayPopup(JSON.stringify(App.mods, null, 2), 5000);
                                    if(!App.mods.length) return App.displayPopup('No mods installed');

                                    const activeModsList = App.displayList(
                                        App.mods.map(
                                            (modInfo) => {
                                                return {
                                                    name: modInfo.name,
                                                    onclick: () => {
                                                        const modInfoScreen = App.displayList([
                                                            {
                                                                name: `${modInfo.name} <br> <small style="font-size: small">by ${modInfo.author}</small>`,
                                                                type: 'text', solid: true, bold: true,
                                                            },
                                                            {
                                                                _ignore: !modInfo.description,
                                                                name: modInfo.description,
                                                                type: 'text',
                                                            },
                                                            {
                                                                name: 'uninstall',
                                                                onclick: () => {
                                                                    App.displayConfirm(`Are you sure you want to uninstall <b>${modInfo.name}</b>?`, [
                                                                        {
                                                                            name: 'yes',
                                                                            onclick: () => {
                                                                                App.mods.splice(App.mods.indexOf(modInfo), 1);
                                                                                App.save();
                                                                                App.sendAnalytics('mod_uninstall', modInfo.name);
                                                                                App.displayPopup(`<b>${modInfo.name}</b> uninstalled successfully, refreshing...`, null, () => location.reload());
                                                                            }
                                                                        },
                                                                        {
                                                                            name: 'no',
                                                                            class: 'back-btn',
                                                                            onclick: () => {}
                                                                        }
                                                                    ])
                                                                    return true;
                                                                }
                                                            }
                                                        ])
                                                        return true;
                                                    }
                                                }
                                            }
                                        )
                                    )

                                    return true;
                                }
                            },
                            {
                                name: 'installing / uninstalling mods will refresh the game.',
                                type: 'info'
                            },
                        ])

                        App.handleFileLoad(display.querySelector('#mod-file'), 'readAsText', (data) => {
                            try {
                                const json = JSON.parse(data);

                                if(!json.name){
                                    throw "Invalid";
                                }

                                const duplicateIndex = App.mods.findIndex(({ id }) => id == json.id);
                                if(duplicateIndex != -1){
                                    App.mods[duplicateIndex] = json;
                                    App.sendAnalytics('mod_update', json.name);
                                    App.displayPopup(`<b>${json.name}</b> updated! <br><br> refreshing...`, 2000, () => {
                                        location.reload();
                                    })
                                } else {
                                    App.mods.push(json);
                                    App.sendAnalytics('mod_install', json.name);
                                    App.displayPopup(`<b>${json.name}</b> installed! <br><br> refreshing...`, 2000, () => {
                                        location.reload();
                                    })
                                }
                                App.save();
                            } catch(e) {
                                console.log(e);
                                App.displayPopup(`Something went wrong, Invalid package: ${e}`);
                            }
                        })
                        

                        return true;
                    },
                },
                { type: 'separator', _ignore: ignoreFirstDivider },
                {
                    name: `gameplay settings ${App.getBadge()}`,
                    onclick: () => {
                        const getStateIcon = (state) => {
                            const className = state ? 'option on' : 'option off';
                            return `<div class="${className}"></div>`
                        }

                        return App.displayList([
                            {
                                name: `Sleeping Hours`,
                                onclick: (e) => {
                                    const list = UI.genericListContainer();
                                    const content = UI.empty();

                                    content.innerHTML = `
                                        <div class="inner-padding b-radius-10 surface-stylized">
                                            <div class="inline-flex-between width-full items-center">
                                                <button id="subtract" class="generic-btn stylized primary solid"> <i class="fa-solid fa-minus"></i> </button>
                                                <div style="font-size: medium">
                                                    <b id="amount">${App.settings.sleepingHoursOffset}</b>
                                                </div>
                                                <button id="add" class="generic-btn stylized"> <i class="fa-solid fa-plus"></i> </button>
                                            </div>
                                        </div>

                                        <div id="info" class="inner-padding b-radius-10 solid-surface-stylized">
                                        </div>
                                    `

                                    const amount = content.querySelector('#amount');
                                    const info = content.querySelector('#info');
                                    const updateUI = () => {
                                        amount.textContent = App.settings.sleepingHoursOffset;
                                        const startTime = App.constants.SLEEP_START + App.settings.sleepingHoursOffset,
                                            endTime = App.constants.SLEEP_END + App.settings.sleepingHoursOffset;
                                        const rangeStyle = `display: flex;justify-content: space-between;`
                                        info.innerHTML = `
                                            sleeping
                                            <br>
                                            <b> 
                                                <div style="${rangeStyle}">
                                                    from <div>${App.clampWithin24HourFormat(startTime)}:00</div>
                                                </div>
                                                <div style="${rangeStyle}">
                                                    to <div>${App.clampWithin24HourFormat(endTime)}:00</div>
                                                </div>
                                            </b>
                                        `
                                    }
                                    const updateOffset = (amount) => {
                                        App.settings.sleepingHoursOffset = clamp(
                                            App.settings.sleepingHoursOffset + amount,
                                            -24, 
                                            24
                                        );
                                        updateUI();
                                        App.applySky();
                                    }
                                    content.querySelector('#add').onclick = () => updateOffset(1);
                                    content.querySelector('#subtract').onclick = () => updateOffset(-1);
                                    updateUI();

                                    list.appendChild(content);
                                    return true;
                                }
                            },
                            {
                                _mount: (e) => e.innerHTML = `${getStateIcon(App.settings.automaticAging)} Auto aging: <i>${App.settings.automaticAging ? 'On' : 'Off'}</i>`,
                                onclick: (e) => {
                                    if(!App.settings.automaticAging){
                                        App.displayConfirm(`Are you sure? This will make your pets automatically age up after a certain amount of time`, [
                                            {
                                                name: 'yes',
                                                onclick: () => {
                                                    App.settings.automaticAging = true;
                                                    App.displayPopup(`Automatic aging turned on`);
                                                    e._mount();
                                                    App.save();
                                                }
                                            },
                                            {
                                                name: 'no',
                                                class: 'back-btn',
                                                onclick: () => {}
                                            }
                                        ])
                                    } else {
                                        App.settings.automaticAging = false;
                                        App.displayPopup(`Automatic aging turned off`);
                                        App.save();
                                    }
                                    e._mount();
                                    return true;
                                }
                            },
                            {
                                _mount: (e) => e.innerHTML = `${getStateIcon(App.settings.showWantName)} show want name: <i>${App.settings.showWantName ? 'On' : 'Off'}</i>`,
                                onclick: (item) => {
                                    App.settings.showWantName = !App.settings.showWantName;
                                    App.applySettings();
                                    item._mount(); 
                                    return true;
                                }
                            },
                            {
                                _mount: (e) => e.innerHTML = `${getStateIcon(App.settings.genderedPets)} gendered pets: <i>${App.settings.genderedPets ? 'On' : 'Off'}</i>`,
                                onclick: (item) => {
                                    App.settings.genderedPets = !App.settings.genderedPets;
                                    item._mount(); 
                                    return true;
                                }
                            },
                            {
                                _mount: (e) => e.innerHTML = `
                                ${getStateIcon(App.settings.skillsAffectingEvolution)} 
                                <div class="overflow-hidden flex">
                                    <div class="marquee">
                                        skills affecting evolution: <i>${App.settings.skillsAffectingEvolution ? 'On' : 'Off'}</i>
                                    </div>
                                </div>
                                ${App.getBadge()}
                                `,
                                onclick: (item) => {
                                    App.settings.skillsAffectingEvolution = !App.settings.skillsAffectingEvolution;
                                    item._mount(); 
                                    return true;
                                }
                            },
                        ])
                    }
                },
                {
                    name: `system settings`,
                    onclick: () => {
                        App.displayList([
                            {
                                name: `sound fx: <i>${App.settings.playSound ? 'on' : 'off'}</i>`,
                                onclick: (item) => {
                                    App.settings.playSound = !App.settings.playSound;
                                    item.innerHTML = `sound fx: <i>${App.settings.playSound ? 'on' : 'off'}</i>`;  
                                    return true;
                                }
                            },
                            {
                                _mount: (e) => e.innerHTML = `bg music: <i>${App.settings.playMusic ? 'on' : 'off'}</i>`,
                                onclick: (item) => {
                                    App.settings.playMusic = !App.settings.playMusic;
                                    item._mount();
                                    return true;
                                }
                            },
                            {
                                name: `vibration: <i>${App.settings.vibrate ? 'on' : 'off'}</i>`,
                                onclick: (item) => {
                                    App.settings.vibrate = !App.settings.vibrate;
                                    item.innerHTML = `vibration: <i>${App.settings.vibrate ? 'on' : 'off'}</i>`;  
                                    return true;
                                }
                            },
                            {
                                _mount: (e) => e.innerHTML = `classic menu: <i>${App.settings.classicMainMenuUI ? 'on' : 'off'}</i>`,
                                onclick: (item) => {
                                    App.settings.classicMainMenuUI = !App.settings.classicMainMenuUI;
                                    item._mount();
                                    App.applySettings();
                                    return true;
                                }
                            },
                            {
                                name: `background color`,
                                onclick: () => {
                                    App.displayList([
                                        {
                                            name: `<input type="color" value="${App.settings.backgroundColor}" id="background-color-picker"></input>`,
                                            onclick: () => { return true; },
                                        },
                                        {
                                            name: 'apply',
                                            onclick: () => {
                                                let colorPicker = document.querySelector('#background-color-picker');
                                                App.settings.backgroundColor = colorPicker.value;
                                                App.applySettings();
                                                return true;
                                            }
                                        },
                                        {
                                            name: 'reset',
                                            onclick: () => {
                                                let colorPicker = document.querySelector('#background-color-picker');
                                                colorPicker.value = '#FFDEAD';
                                                App.settings.backgroundColor = colorPicker.value;
                                                App.applySettings();
                                                return true;
                                            }
                                        }
                                    ])
                                    return true;
                                }
                            },
                            {
                                name: '+ view size',
                                onclick: () => {
                                    App.settings.screenSize += 0.1;
                                    App.applySettings();
                                    return true;
                                }
                            },
                            {
                                name: '- view size',
                                onclick: () => {
                                    App.settings.screenSize -= 0.1;
                                    App.applySettings();
                                    return true;
                                }
                            },
                            {
                                name: 'reset view size',
                                onclick: () => {
                                    App.settings.screenSize = 1;
                                    App.applySettings();
                                    return true;
                                }
                            },
                        ]);
                        return true;
                    }
                },
                {
                    name: `Change Theme ${App.getBadge()}`,
                    onclick: () => {
                        const newThemes = ['color lavender', 'color slateblue'];
                        return App.displayList(
                            [...App.definitions.themes].sort((a, b) => newThemes.includes(b) - newThemes.includes(a)).map(themeName => ({
                                name: `${themeName.replace('color ', '')} ${newThemes.includes(themeName) ? App.getBadge('new!') : ''}`,
                                // class: `theme-${themeName}`,
                                onclick: () => {
                                    App.settings.theme = themeName;
                                    App.applySettings();
                                    return true;
                                }
                            }))
                        )
                    }
                },
                {
                    name: `Shell Settings`,
                    onclick: () => {
                        // App.handlers.open_shell_background_list();
                        // return true;

                        App.displayList([
                            {
                                _mount: (e) => e.innerHTML = `display shell: <i>${App.settings.displayShell ? App.getIcon('eye') : App.getIcon('eye-slash')}</i>`,
                                onclick: (item) => {
                                    App.settings.displayShell = !App.settings.displayShell;
                                    App.applySettings();
                                    item._mount(); 
                                    return true;
                                }
                            },
                            {
                                _mount: (e) => e.innerHTML =  `shell button: <i>${App.settings.displayShellButtons ? App.getIcon('eye') : App.getIcon('eye-slash')}</i>`,
                                onclick: (item) => {
                                    App.settings.displayShellButtons = !App.settings.displayShellButtons;
                                    App.applySettings();
                                    item._mount(); 
                                    return true;
                                }
                            },
                            {
                                _mount: (e) => e.innerHTML =  `shell logo: <i>${App.settings.displayShellLogo ? App.getIcon('eye') : App.getIcon('eye-slash')}</i>`,
                                onclick: (item) => {
                                    App.settings.displayShellLogo = !App.settings.displayShellLogo;
                                    App.applySettings();
                                    item._mount(); 
                                    return true;
                                }
                            },
                            {
                                name: `+ shell size`,
                                onclick: () => {
                                    App.settings.shellAdditionalSize += 0.1;
                                    App.applySettings();
                                    return true;
                                }
                            },
                            {
                                name: `- shell size`,
                                onclick: () => {
                                    App.settings.shellAdditionalSize -= 0.1;
                                    App.applySettings();
                                    return true;
                                }
                            },
                            {
                                name: `reset shell size`,
                                onclick: () => {
                                    App.settings.shellAdditionalSize = 0;
                                    App.applySettings();
                                    return true;
                                }
                            },
                            {
                                _mount: (e) => e.innerHTML = `shell shape: <i>${App.settings.shellShape}</i>`,
                                onclick: (item) => {
                                    App.settings.shellShape++;
                                    if(App.settings.shellShape > App.constants.MAX_SHELL_SHAPES){
                                        App.settings.shellShape = 1;
                                    }
                                    App.applySettings();
                                    item._mount()
                                    return true;
                                }
                            },
                            {
                                _mount: (e) => {
                                    const hasNew = App.definitions.shell_background.some((entry) => {
                                        const isUnlocked = entry.unlockKey ? App.getRecord(entry.unlockKey) : true;
                                        return entry.isNew && isUnlocked;
                                    });
                                    console.log({hasNew})
                                    e.innerHTML = `change shell ${hasNew ? App.getBadge('new!') : ''}`
                                },
                                onclick: () => {
                                    App.handlers.open_shell_background_list();
                                    return true;
                                }
                            },
                            {
                                name: 'custom shell',
                                onclick: () => {
                                    let display = App.displayList([
                                        {
                                            name: `<label class="custom-file-upload"><input id="shell-image-file" type="file"></input>Browse</label>`,
                                            onclick: (btn) => {
                                                // btn.querySelector('label').click();
                                                return true;
                                            }
                                        },
                                        {
                                            name: 'enter url',
                                            onclick: () => {
                                                App.displayPrompt(`Enter URL:`, [
                                                    {
                                                        name: 'set',
                                                        onclick: (url) => {
                                                            let res = App.setShellBackground(url);
                                                            if(res) App.displayPopup('Shell background set');
                                                            return true;
                                                        }
                                                    },
                                                    {name: 'cancel', class: 'back-btn', onclick: () => {}},
                                                ]);
                                                return true;
                                            }
                                        }
                                    ]);

                                    App.handleFileLoad(display.querySelector('#shell-image-file'), 'readAsDataURL', async (data) => {
                                        const downscaledData = await downscaleImage(data, 768, 768, 0.5);
                                        let res = App.setShellBackground(downscaledData);
                                        if(res) App.displayPopup('Shell background set');
                                        return true;
                                    })

                                    return true;
                                }
                            },
                        ])

                        return true;
                    },
                },
                {
                    name: 'input code',
                    onclick: () => {
                        App.displayPrompt(`Enter code:`, [
                            {
                                name: 'set',
                                onclick: (value) => {
                                    App.handleInputCode(value);
                                    return false;
                                }
                            },
                            {name: 'cancel', class: 'back-btn', onclick: () => {}},
                        ]);
                        return true;
                    }
                },
                { type: 'separator' },
                {
                    name: 'reset pet data',
                    onclick: () => {
                        App.displayConfirm('Are you sure you want to delete your saved pet?', [
                            {
                                name: 'yes (delete)',
                                onclick: async () => {
                                    App.save();
                                    App.save = () => {};

                                    App.displayPopup('resetting...', App.INF);

                                    window.localStorage?.removeItem('pet');
                                    window.localStorage?.removeItem('last_time');
                                    await window.idbKeyval.delMany(['last_time', 'pet']);

                                    setTimeout(() => {
                                        location.reload();
                                    }, 1000)

                                    return false;
                                }
                            },
                            {
                                name: 'no',
                                class: 'back-btn',
                                onclick: () => { }
                            }
                        ])
                        return true;
                    }
                },
                {
                    name: 'factory reset',
                    onclick: () => {
                        App.displayConfirm('Are you sure you want to completely delete your data? this will reset your pets, achievements, online id and everything else!', [
                            {
                                name: 'yes',
                                onclick: () => {
                                    App.displayConfirm('Are you sure? There is no way to revert this.', [
                                        {
                                            name: 'yes (delete)',
                                            onclick: async () => {
                                                App.save = () => {};
                                                App.displayPopup('resetting...', App.INF);

                                                window.localStorage?.clear()
                                                await window.idbKeyval.clear();

                                                setTimeout(() => {
                                                    location.reload();
                                                }, 1000)

                                                return false;
                                            }
                                        },
                                        {
                                            name: 'no',
                                            class: 'back-btn',
                                            onclick: () => { }
                                        }
                                    ])

                                }
                            },
                            {
                                name: 'no',
                                class: 'back-btn',
                                onclick: () => { }
                            }
                        ])
                        return true;
                    }
                },
                { type: 'separator' },
                {
                    name: 'credits',
                    onclick: () => App.handlers.open_credits(),
                },
                {
                    name: `send feedback`,
                    onclick: () => {
                        return App.displayPrompt(`what would you like to to be added in the next update?`, [
                            {
                                name: 'send',
                                onclick: (data) => {
                                    if(!data) return true;
                                    App.displayPopup(`<b>Suggestion sent!</b><br> thanks for participating!`, 4000);
                                    App.sendFeedback(data);
                                },
                            },
                            {
                                name: 'cancel',
                                class: 'back-btn',
                                onclick: () => {},
                            }
                        ]);
                    }
                },
                {
                    name: `<b>rate us!</b>`,
                    onclick: () => App.handlers.show_rating_dialog()
                },
                {
                    // _ignore: true,
                    link: App.routes.BLOG,
                    name: `<b>see changelog</b>`,
                    onclick: () => {
                        App.sendAnalytics('go_to_blog');
                        return true;
                    },
                },
                {
                    // _ignore: true,
                    link: App.routes.DISCORD,
                    name: '<b>join <span style="color:#7289da;text-shadow:none;">discord</span></b>',
                    onclick: () => true,
                },
                { type: 'separator' },
                {
                    _disable: true,
                    name: `Version ${VERSION || '???'}`,
                    onclick: () => {
                        return true;
                    },
                },
            ], null, 'Settings')
        },
        open_stats: function(){
            const getCareRatingIcons = (current = App.pet.stats.current_care, max = App.pet.stats.max_care, sizePx) => {
                return new Array(max).fill('').map((_, i) => {
                    const style = i >= current ? 'opacity: 0.5; filter:grayscale();' : 'filter:hue-rotate(310deg);';
                    const finalStyle = `${style} ${sizePx ? `width: ${sizePx}px;` : ''}`;
                    return `<img style="margin-top: 2px; ${finalStyle}" src="resources/img/misc/star_01.png"></img>`
                }).join(' ')
            }

            const list = UI.genericListContainer();
            const content = UI.empty();
            content.innerHTML = `
            <div class="tabs">
                <div class="tab-titles">
                    <div for="tab-1" class="tab-title">${App.getIcon('bar-chart', true)}</div>
                    <div for="tab-2" class="tab-title">${App.getIcon('star', true)}</div>
                </div>
                <div class="tab-contents">
                    <div id="tab-1" class="tab">
                        <div class="tab-content">
                            <div class="inner-padding b-radius-10 flex-gap-2 flex flex-dir-col m mt-6">
                                <div class="relative flex flex-dir-row align-center flex-gap-1">
                                    <div class="stats-label">Money</div>
                                    <b class="outlined-icon flex flex-center" style="width: 18px;">${App.getIcon('special:gold', true)}</b> 
                                    <b>$${App.pet.stats.gold}</b>
                                </div>
                                <div class="relative flex flex-dir-row align-center flex-gap-1">
                                    <div class="stats-label">Hunger</div>
                                    <b class="outlined-icon flex flex-center" style="width: 18px;">${App.getIcon('special:food', true)}</b> 
                                    ${App.createProgressbar( App.pet.stats.current_hunger / App.pet.stats.max_hunger * 100 ).node.outerHTML}
                                </div>
                                <div class="relative flex flex-dir-row align-center flex-gap-1">
                                    <div class="stats-label">Fun</div>
                                    <b class="outlined-icon flex flex-center" style="width: 18px;">${App.getIcon('special:fun', true)}</b> 
                                    ${App.createProgressbar( App.pet.stats.current_fun / App.pet.stats.max_fun * 100 ).node.outerHTML}
                                </div>
                                <div class="relative flex flex-dir-row align-center flex-gap-1">
                                    <div class="stats-label">Sleep</div>
                                    <b class="outlined-icon flex flex-center" style="width: 18px;">${App.getIcon('special:sleep', true)}</b> 
                                    ${App.createProgressbar( App.pet.stats.current_sleep / App.pet.stats.max_sleep * 100 ).node.outerHTML}
                                </div>
                                <div class="relative flex flex-dir-row align-center flex-gap-1">
                                    <div class="stats-label">Discipline</div>
                                    <b class="outlined-icon flex flex-center" style="width: 18px;">${App.getIcon('special:discipline', true)}</b> 
                                    ${App.createProgressbar( App.pet.stats.current_discipline / App.pet.stats.max_discipline * 100 ).node.outerHTML}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="tab-2" class="tab">
                        <div class="tab-content">
                            <div class="inner-padding b-radius-10 flex-gap-2 flex flex-dir-col m mt-6">
                                <div class="relative flex flex-dir-row align-center flex-gap-1">
                                    <div class="stats-label">Expression</div>
                                    <b class="outlined-icon flex flex-center" style="width: 18px;">${App.getIcon('special:expression', true)}</b> 
                                    ${App.createProgressbar( App.pet.stats.current_expression / 100 * 100 ).node.outerHTML}
                                </div>
                                <div class="relative flex flex-dir-row align-center flex-gap-1">
                                    <div class="stats-label">Logic</div>
                                    <b class="outlined-icon flex flex-center" style="width: 18px;">${App.getIcon('special:logic', true)}</b> 
                                    ${App.createProgressbar( App.pet.stats.current_logic / 100 * 100 ).node.outerHTML}
                                </div>
                                <div class="relative flex flex-dir-row align-center flex-gap-1">
                                    <div class="stats-label">Endurance</div>
                                    <b class="outlined-icon flex flex-center" style="width: 18px;">${App.getIcon('special:endurance', true)}</b> 
                                    ${App.createProgressbar( App.pet.stats.current_endurance / 100 * 100 ).node.outerHTML}
                                </div>
                                <div class="flex-between align-center">
                                    <b>CARE:</b> <div style="display: inline-flex; gap: 1px">${getCareRatingIcons()}</div>
                                </div>
                            </div>
                            <div class="inner-padding b-radius-10 uppercase list-text surface-stylized ${!App.settings.skillsAffectingEvolution ? 'hidden' : ''}">
                                <small>
                                    <i class="fa-solid fa-info-circle"></i>
                                    High enough skills will override care ratings above 1 when evolving.
                                    <hr>
                                    <div>
                                        <span class="flex-between items-center no-width-children"> ${App.getIcon('special:endurance')}➜ ${getCareRatingIcons(1, undefined, 16)} </span>
                                        <span class="flex-between items-center no-width-children"> ${App.getIcon('special:logic')}➜ ${getCareRatingIcons(2, undefined, 16)} </span>
                                        <span class="flex-between items-center no-width-children"> ${App.getIcon('special:expression')}➜ ${getCareRatingIcons(3, undefined, 16)} </span>
                                    </div>
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `;
            App.initTab(content);
            list.appendChild(content);
        },
        open_food_stats: function(foodName){
            const food = App.definitions.food[foodName];

            if(!food) return false;

            /* bugs out with negative values */

            const list = UI.genericListContainer(null, foodName);
            const content = UI.empty();
            content.innerHTML = `
            <div class="inner-padding b-radius-10 m surface-stylized">
                <div style="margin-bottom: 16px">
                    <small>Replenish rates for different stats:</small>    
                </div>
                <div>
                    <b>HUNGER:</b> ${App.createProgressbar( food.hunger_replenish || 0 / App.pet.stats.max_hunger * 100 ).node.outerHTML}
                </div>
                <div>
                    <b>SLEEP:</b> ${App.createProgressbar( food.sleep_replenish || 0 / App.pet.stats.max_sleep * 100 ).node.outerHTML}
                </div>
                <div>
                    <b>FUN:</b> ${App.createProgressbar( food.fun_replenish || 0 / App.pet.stats.max_fun * 100 ).node.outerHTML}
                </div>
                <div>
                    <b>HEALTH:</b> ${App.createProgressbar( food.health_replenish || 0 / App.pet.stats.max_health * 100 ).node.outerHTML}
                </div>
            </div>
            `;
            list.appendChild(content);
            list.style.zIndex = 5;
        },
        add_active_pet_to_collection: function(char = App.petDefinition.sprite){
            const eventId = `${App.constants.CHAR_UNLOCK_PREFIX}_${PetDefinition.getCharCode(char)}`
            App.addEvent(eventId)
        },
        open_character_collection: function(){
            App.handlers.add_active_pet_to_collection();

            let unlockedCount = 0;
            const allCharacters = [
                ...PET_BABY_CHARACTERS,
                ...PET_CHILD_CHARACTERS,
                ...PET_TEEN_CHARACTERS,
                ...PET_ADULT_CHARACTERS,
                ...PET_ELDER_CHARACTERS,
            ];
            const charactersDef = allCharacters.map(char => {
                const charCode = PetDefinition.getCharCode(char);
                const isUnlocked = App.getEvent(`${App.constants.CHAR_UNLOCK_PREFIX}_${charCode}`)
                if(isUnlocked) unlockedCount++;
                return {
                    componentType: 'div',
                    className: `collection__char ${!isUnlocked ? 'locked' : ''}`,
                    innerHTML: PetDefinition.generateFullCSprite(char),
                    onclick: ({target}) => {
                        if(!App.isTester()) return;
                        target.classList.remove('locked');
                    },
                    ondblclick: () => {
                        if(!App.isTester()) return;

                        if(confirm('Set this as main character?')){
                            App.petDefinition.sprite = char;
                            App.save();
                            setTimeout(() => window.location.reload(), 1000);
                        }
                    }
                }
            })

            const list = UI.genericListContainer(null, `(${unlockedCount}/${allCharacters.length})`);
            const content = UI.empty();
            content.classList.add('collection__container');
            list.appendChild(content)
            charactersDef.forEach(def => UI.create({...def, parent: content}))

            App.sendAnalytics('opened_character_collection');
        },
        open_family_tree: function(petDefinition, usePastTense){
            if(!petDefinition) petDefinition = App.petDefinition;

            // populating family tree for the first time
            // for backwards compatibility
            if(!petDefinition.family.length){
                const parents = petDefinition.getParents();
                if(parents?.length == 2){
                    petDefinition.family = [parents.map(parent => App.minimalizePetDef(parent))]
                }
            }

            if(!petDefinition.family.length && !usePastTense){
                return App.displayPopup(`${petDefinition.name} is the pioneer of the family!<br> come back when your family has grown!`)
            }

            const list = UI.genericListContainer();
            const content = UI.empty();

            const oldestAncestor = petDefinition.family.length ? petDefinition.family[0][0] : petDefinition;

            const infoPanelContent = 
                usePastTense
                ?   `
                        This family began on
                        <br>
                        <b>${moment(oldestAncestor.birthday).format('MMMM DD YYYY')}</b>
                        <br>
                        and ran for
                        <br>
                        <b>${petDefinition.family.length + 1} generations</b>
                    `
                :   `
                        This family has been running for
                        <br>
                        <b>${petDefinition.family.length + 1} generations</b>
                        <br>
                        since
                        <br>
                        <b>${moment(oldestAncestor.birthday).fromNow()}</b>
                    `;

            content.innerHTML = `
                <div class="b-radius-10 m surface-stylized flex-center height-auto inner-padding">
                    ${
                        petDefinition.family.map((partners, i) => {
                            const [a, b] = partners;

                            return `
                                <div class="family-tree__partners-container">
                                    <div class="family-tree__gen-badge">${i + 1}</div>

                                    <div class="family-tree__member-container">
                                        ${PetDefinition.generateFullCSprite(b.sprite, null, PetDefinition.getSpriteClassName(b))}
                                        <small>${b.name}</small>
                                    </div>

                                    <div class="family-tree__vertical-line"></div>  

                                    <div class="family-tree__member-container">
                                        ${PetDefinition.generateFullCSprite(a.sprite, null, PetDefinition.getSpriteClassName(a))}
                                        <small>${a.name}</small>
                                    </div>
                                </div>
                                <div class="family-tree__horizontal-line"></div>
                            `;
                        }).join('')
                    }
                    <div style="margin-left: 76px" class="family-tree__member-container">
                        ${petDefinition.getFullCSprite()}
                        <small>${petDefinition.name}</small>
                    </div>
                </div>

                <div class="b-radius-10 m surface-stylized height-auto inner-padding">
                    ${infoPanelContent}
                </div>
            `;

            list.appendChild(content);
            App.sendAnalytics('opened_family_tree');
        },
        open_food_list: function(props = {}){
            const {
                buyMode, 
                activeIndex, 
                filterType, 
                sellMode, 
                useMode,
                useModeLabel = 'Use',
                useAmount = 1,
                age = App.petDefinition.lifeStage,
                getListOnly,
                allowCookableOnly,
                limitFilter,
                outOfStockPercent = 20,
                priceMult = 1,
            } = props;

            let list = [];
            let sliderInstance;
            const salesDay = App.isSalesDay();
            let index = -1;
            const getIsOutOfStock = App.getOutOfStockCounter(App.getDayId(true) + 25);
            for(let food of Object.keys(App.definitions.food)){
                let isDisabled = false;

                let current = App.definitions.food[food];
                const currentType = current.type || 'food';
                const ownedAmount = App.pet.inventory.food[food];

                // lifestage check
                if('age' in current && !current.age.includes(age)) continue;

                // buy mode and should skip
                if(buyMode && (current.price === 0 || (!allowCookableOnly && current.cookableOnly) || current.unbuyable)) continue;

                // filter type check
                if(filterType && currentType !== filterType) continue;

                if(limitFilter?.({...current, ownedAmount})) isDisabled = true;

                // check if current pet has this food on its inventory
                if(current.price && !ownedAmount && !buyMode){
                    continue;
                }

                // auto disable if more less than useAmount
                if(ownedAmount < useAmount) isDisabled = true;

                // some entries become randomly unavailable to buy for the day
                const isOutOfStock = ++index && buyMode && getIsOutOfStock(outOfStockPercent) && currentType !== 'med';

                // 50% off on sales day
                let price = current.price * priceMult;
                if(sellMode) {
                    if(current.price === 0) continue;
                    price = current.cookableOnly 
                    ? Math.floor(price * 1.5) 
                    : Math.floor(price * 0.75);
                }
                if(salesDay) price = Math.round(price / 2);

                list.push({
                    disabled: Boolean(isOutOfStock || isDisabled),
                    current,
                    foodName: food,
                    price,
                    name: `
                        ${App.getFoodCSprite(current.sprite)} 
                        ${current.cookableOnly ? '★ ' : ''}
                        ${food.toUpperCase()} 
                        (x${ownedAmount > 0 ? ownedAmount : (!current.price ? '∞' : 0)})
                        ${
                            isOutOfStock 
                            ? `<b class="red-label">OUT OF STOCK</b>`
                            : `<b>
                                ${(buyMode || sellMode) ? `
                                    ${sellMode ? `<span class="opacity-half">$${current.price} <i class="fa-solid fa-angle-right"></i> </span>` : ''}
                                    <span class="${sellMode ? `seller-analysis ${current.cookableOnly ? 'positive' : 'negative'}` : ''}">
                                        $${price}
                                    </span>
                                ` : ''}
                            </b>`
                        }
                        ${current.isNew ? App.getBadge('new!') : ''}
                    `,
                    onclick: (btn, list) => {
                        // buy mode
                        if(buyMode || sellMode){                            
                            if(sellMode){ // sell mode
                                App.pet.stats.gold += price;
                                App.addNumToObject(App.pet.inventory.food, food, -1);
                            } else { // buying
                                if(App.pet.stats.gold < price){
                                    App.displayPopup(`Don't have enough gold!`);
                                    return true;
                                }
                                App.pet.stats.gold -= price;
                                App.addNumToObject(App.pet.inventory.food, food, 1);
                                Missions.done(Missions.TYPES.buy_food);
                            }

                            App.handlers.open_food_list({...props, activeIndex: sliderInstance?.getCurrentIndex()});
                            return false;
                        }

                        const removeFoodFromInventory = (amount = useAmount) => {
                            const ownedAmount = App.pet.inventory.food[food];

                            if(ownedAmount >= amount) {
                                App.pet.inventory.food[food] -= amount;
                                return true;
                            }

                            return false;
                        }

                        if(useMode){
                            const useResult = useMode(current);
                            if(useResult) removeFoodFromInventory();
                            return;
                        }

                        // eat mode
                        const reopenFn = (noLongerHungry) => {
                            if(noLongerHungry && currentType == 'food') return;
                            App.handlers.open_feeding_menu();
                            App.handlers.open_food_list({...props, activeIndex: sliderInstance?.getCurrentIndex()});
                        }

                        App.closeAllDisplays();
                        let ateFood = App.pet.feed(current.sprite, current.hunger_replenish ?? 0, currentType, null, reopenFn);
                        if(ateFood) {
                            removeFoodFromInventory();

                            App.pet.stats.current_fun += current.fun_replenish ?? 0;
                            App.pet.stats.current_sleep += current.sleep_replenish ?? 0;

                            App.pet.stats.current_expression += current.expression_increase ?? 0;
                            App.pet.stats.current_logic += current.logic_increase ?? 0;
                            App.pet.stats.current_endurance += current.endurance_increase ?? 0;
                            App.pet.stats.current_discipline += current.discipline_increase ?? 0;

                            if(App.pet.hasMoodlet('healthy') && food === 'medicine')
                                App.pet.stats.current_health = App.pet.stats.current_health * 0.6;
                            else
                                App.pet.stats.current_health += current.health_replenish ?? 0;

                            // custom callback after eating item
                            if(current.payload){
                                App.queueEvent(current.payload);
                            }
                        }
                    }
                })
            }

            if(getListOnly){
                return list;
            }

            if(!list.length){
                App.displayPopup(`You don't have any consumables, purchase some from the market`, 2000);
                return;
            }

            if(buyMode) list.push(list.shift());

            let acceptLabel = 'Eat';
            if(buyMode) acceptLabel = 'Purchase';
            else if(sellMode) acceptLabel = 'Sell';
            else if(useMode) acceptLabel = useModeLabel;
            sliderInstance = App.displaySlider(
                list.sort((a, b) => (b?.current?.isNew || 0) - (a?.current?.isNew || 0)), 
                activeIndex, 
                {accept: acceptLabel}, 
                (buyMode || sellMode) ? `$${App.pet.stats.gold + (salesDay ? ` <span class="sales-notice">DISCOUNT DAY!</span>` : '')}` : null);
            return sliderInstance;
        },
        open_seed_list: function(buyMode, activeIndex, payloadFn){
            let list = [];
            let sliderInstance;
            const salesDay = App.isSalesDay();
            let index = -1;
            const getIsOutOfStock = App.getOutOfStockCounter(App.getDayId(true) + 50);
            for(let plant of Object.keys(App.definitions.plant)){
                let current = App.definitions.plant[plant];

                // buy mode and is free
                if(buyMode && current.price == 0) continue;

                // check if current pet has this seed on its inventory
                if(current.price && !App.pet.inventory.seeds[plant] && !buyMode){
                    continue;
                }

                // some entries become randomly unavailable to buy for the day
                const isOutOfStock = ++index && buyMode && getIsOutOfStock(0);

                // 50% off on sales day
                let price = current.price;
                if(salesDay) price = Math.round(price / 2);

                list.push({
                    disabled: isOutOfStock,
                    name: `
                        ${Plant.getCSprite(plant, Plant.AGE.grown, 'seed-pack')} 
                        ${plant.toUpperCase()} seeds 
                        (x${App.pet.inventory.seeds[plant] > 0 ? App.pet.inventory.seeds[plant] : (!current.price ? '∞' : 0)}) 
                        ${
                            isOutOfStock 
                            ? `<b class="red-label">OUT OF STOCK</b>`
                            : `<b>${buyMode ? `$${price}` : ''}</b>`
                        }
                    `,
                    onclick: (btn, list) => {
                        // buy mode
                        if(buyMode){
                            if(App.pet.stats.gold < price){
                                App.displayPopup(`Don't have enough gold!`);
                                return true;
                            }
                            App.pet.stats.gold -= price;
                            App.addNumToObject(App.pet.inventory.seeds, plant, 1);
                            let nList = App.handlers.open_seed_list(true, sliderInstance?.getCurrentIndex());
                            // Missions.done(Missions.TYPES.buy_food);
                            return false;
                        }

                        const shouldRemove = payloadFn?.(plant, current); // passing name / object
                        if(shouldRemove){
                            if(App.pet.inventory.seeds[plant] > 0)
                                App.pet.inventory.seeds[plant] -= 1;
                        }
                    }
                })
            }

            if(!list.length){
                App.displayPopup(`You don't have any seeds, purchase some from the market`, 2000);
                return;
            }

            if(buyMode) list.push(list.shift());

            sliderInstance = App.displaySlider(list, activeIndex, {accept: buyMode ? 'Purchase' : 'Plant'}, buyMode ? `$${App.pet.stats.gold + (salesDay ? ` <span class="sales-notice">DISCOUNT DAY!</span>` : '')}` : null);
            return sliderInstance;
        },
        open_feeding_menu: function(){
            App.displayList([
                {
                    name: 'food',
                    onclick: () => {
                        App.handlers.open_food_list({filterType: 'food'});
                        return true;
                    }
                },
                {
                    name: 'snacks',
                    onclick: () => {
                        App.handlers.open_food_list({filterType: 'treat'});
                        return true;
                    }
                },
                {
                    name: 'meds',
                    onclick: () => {
                        App.handlers.open_food_list({filterType: 'med'});
                        return true;
                    }
                },
                {
                    // _ignore: !App.isTester(),
                    _disable: App.petDefinition.lifeStage <= PetDefinition.LIFE_STAGE.baby,
                    name: `cook`,
                    onclick: () => {
                        return App.displayList([
                            {
                                name: 'camera',
                                onclick: () => {
                                    return App.displayConfirm(`You take 3 pictures to use as ingredients for your soup! after that, tap to stir until it's mixed!`, [
                                        {
                                            name: 'start',
                                            onclick: () => Activities.cookingGame(),
                                        },
                                        {
                                            name: 'cancel',
                                            class: 'back-btn',
                                            onclick: () => { },
                                        }
                                    ])
                                }
                            },
                            {
                                name: `harvests`,
                                onclick: () => {
                                    let allPlants = [];
                                    const getIngredients = (name) => {
                                        pRandom.save();
                                        const seed = hashCode(name);
                                        const results = new Array(3).fill(null).map((_, i) => {
                                            if(!allPlants.length) 
                                                allPlants = Object.keys(App.definitions.plant)
                                                    .map(name => ({...App.definitions.plant[name], name}))
                                                    .filter( ({inedible}) => !inedible )
                                                    .map( ({name}) => name)

                                            pRandom.seed = seed + ((i + 1) * 321 * seed);
                                            const item = pRandomFromArray(allPlants);
                                            allPlants.splice(allPlants.indexOf(item), 1);
                                            return item;
                                        })
                                        pRandom.load();
                                        return results;
                                    }

                                    return App.displayList([
                                        {
                                            name: `
                                            <div class="flex-between flex-wrap" style="row-gap: 4px">
                                                ${App.getHarvestInventoryUI(item => !item.def.inedible)}
                                            </div>
                                            `,
                                            type: 'text',
                                        },
                                        ...Object.keys(App.definitions.food)
                                            .map(foodName => ({...App.definitions.food[foodName], name: foodName}))
                                            .filter(food => !food.nonCraftable)
                                            .map((food) => {
                                                const ingredients = getIngredients(food.name);
                                                const hasAllIngredients = ingredients.every(ingredientName => App.pet.inventory.harvests[ingredientName]);
                                                return {...food, ingredients, hasAllIngredients}
                                            })
                                            .sort((a, b) => (b.cookableOnly || false) - (a.cookableOnly || false))
                                            .sort((a, b) => b.hasAllIngredients - a.hasAllIngredients)
                                            .map(food => ({
                                                _disable: !food.hasAllIngredients,
                                                class: 'flex-between',
                                                name: `
                                                    ${App.getFoodCSprite(food.sprite)} = ${App.getHarvestIcons(food.ingredients)}
                                                    ${food.cookableOnly ? App.getBadge('★', 'gold') : ''}
                                                `,
                                                onclick: () => {
                                                    const confirm = App.displayConfirm(`
                                                        Cook <div>${App.getFoodCSprite(food.sprite)}</div> <b>${food.cookableOnly ? '★ ' : ''}${food.name}</b>?
                                                        <button id="effects" style="display: none; position: absolute; bottom: 0; right: 0" class="generic-btn stylized"><b>effects</b></button>
                                                    `, [
                                                        {
                                                            name: 'yes',
                                                            onclick: () => {
                                                                food.ingredients.forEach(ingredient => {
                                                                    if(App.pet.inventory.harvests[ingredient] > 0)
                                                                        App.pet.inventory.harvests[ingredient] -= 1;
                                                                })
                                                                Activities.cookingGame({skipCamera: true, resultFoodName: food.name, stirringSpeed: 0.0095});
                                                            },
                                                        },
                                                        {
                                                            name: 'no',
                                                            class: 'back-btn',
                                                            onclick: () => {}
                                                        }
                                                    ])
                                                    
                                                    const effectsBtn = confirm.querySelector('#effects');
                                                    if(effectsBtn){
                                                        effectsBtn.onclick = () => App.handlers.open_food_stats(food.name)
                                                    }
                                                    
                                                    return true;
                                                }
                                            })),
                                        {
                                            name: `★ Symbol indicates the item is only obtainable from cooking and has special effect(s)`,
                                            type: 'info',
                                        },
                                    ])
                                }
                            }
                        ])
                        
                    }
                }
            ], null, 'Feeding')
        },
        open_stats_menu: function(){
            const hasNewlyUnlockedAchievements = App.handlers.open_achievements_list(true);
            App.displayList([
                {
                    name: 'stats',
                    onclick: () => {
                        App.handlers.open_stats();
                        return true;
                    }
                },
                {
                    name: 'profile',
                    onclick: () => {
                        if(!App.userName){
                            App.handlers.show_set_username_dialog();
                            return true;
                        }
                        App.handlers.open_profile();
                        return true;
                    }
                },
                {
                    name: `family tree`,
                    onclick: () => {
                        App.handlers.open_family_tree();
                        return true;
                    }
                },
                {
                    name: `collection`,
                    onclick: () => {
                        App.handlers.open_character_collection();
                        return true;
                    }
                },
                {
                    name: `achievements ${hasNewlyUnlockedAchievements ? App.getBadge('Rewards!') : ''}`,
                    onclick: () => {
                        App.handlers.open_achievements_list();
                        return true;
                    }
                },
                {
                    name: App.settings.genderedPets ? 'set name/gender' : 'set nickname',
                    onclick: () => {
                        const prompt = App.settings.genderedPets ? 'Enter Name and Gender:' : 'Enter a new name for your pet:';
                        App.handlers.show_set_pet_name_dialog(prompt);
                        return true;
                    }
                },
                {
                    _disable: !App.petDefinition.deceasedPredecessors?.length,
                    name: `past generations`,
                    onclick: () => {
                        const generations = 
                            App.petDefinition.deceasedPredecessors
                                .map(def => {
                                    const petDefinition = new PetDefinition(def);
                                    return {
                                        name: `${petDefinition.getCSprite()} ${petDefinition.name}`,
                                        onclick: () => {
                                            App.handlers.open_family_tree(petDefinition, true);
                                            return true;
                                        }
                                    }
                                })
                        App.displayList([
                            {
                                name: 'Select the generation',
                                type: 'text'
                            },
                            ...generations
                        ])
                        return true;
                    }
                },
            ], null, 'Information')
        },
        open_active_buffs: (type) => {
            if(typeof type !== 'string') type = null;
            
            const activeBuffs = Object.values(App.definitions.gameplay_buffs)
                .filter(buff => type ? buff.type === type : true)
                .filter(buff => App.isGameplayBuffActive(buff.key))
            const buffsUI = activeBuffs
                .map(buff => App.getGameplayBuffUI(buff))
                .join('<hr>')
            return App.displayList([
                {
                    name: activeBuffs.length ? buffsUI : App.getEmptyStateUI(`No ${type ?? 'active'} buffs`),
                    type: 'text',
                },
                {
                    name: 'You can get buffs by adopting animals in the backyard!',
                    type: 'info',
                }
            ])
        },
        open_profile: function(){
            const petTraitIcons = [
                {
                    title: 'Potty-trained',
                    img: 'resources/img/misc/poop.png',
                    condition: App.pet.stats.is_potty_trained
                },
                {
                    title: 'Revived',
                    img: 'resources/img/misc/ghost_02.png',
                    condition: App.pet.stats.is_revived_once
                },
                {
                    title: 'Immortal',
                    img: 'resources/img/misc/infinity_01.png',
                    condition: App.pet.stats.is_ghost
                }
            ]

            const playTimeDuration = moment.duration(App.playTime);

            const list = UI.genericListContainer();
            const content = UI.empty('flex flex-dir-col flex-1');
            content.innerHTML = `
                <div class="flex-center flex-1 flex flex-gap-05 inner-padding surface-stylized height-auto relative">
                    ${App.petDefinition.getCSprite(true)}
                    <b>
                        <span>${App.settings.genderedPets ? App.getIcon(App.pet.stats.gender, true) : ''} ${App.petDefinition.name} </span>
                        <br>
                        <small>${App.petDefinition.getLifeStageLabel()} - gen ${App.petDefinition.family.length + 1}</small>
                    </b>
                    ${
                        App.pet.stats.is_ghost ?
                        `
                        <b>
                            ${App.pet.stats.is_ghost === PetDefinition.GHOST_TYPE.angel ? App.constants.SPANS.angel : ''}
                            ${App.pet.stats.is_ghost === PetDefinition.GHOST_TYPE.devil ? App.constants.SPANS.monster : ''}
                        </b>
                        ` : ''
                    }
                    <span>
                        Born ${moment(App.petDefinition.birthday).fromNow()}
                    </span>
                    <div class="pet-trait-icons-container">
                    ${petTraitIcons.map(icon => {
                        return `<div onclick="App.displayPopup('<small>trait:</small> <br> <b>${icon.title}</b> <small>(${icon.condition ? 'active' : 'inactive'})</small>')" title="${icon.title}" class="pet-trait-icon ${!icon.condition ? 'disabled' : ''}">
                            <img src="${icon.img}"></img>
                        </div>`
                    }).join('')}
                    </div>
                </div>
                <div class="user-id surface-stylized inner-padding text-transform-none">
                    <div class="flex flex-dir-col">
                        <small>play time:</small>
                        <span>${Math.floor(playTimeDuration.asHours())} hours and ${playTimeDuration.minutes()} minutes</span>
                    </div>
                </div>
                ${App.getUidUI()}
            `

            list.appendChild(content);
        },
        copyToClipboard: (content) => {
            navigator.clipboard.writeText(content);
            App.displayPopup('Copied!');
        },
        open_plant_stats: function(plant){
            const list = UI.genericListContainer();
            const content = UI.empty();

            const { wateredDuration, deathDuration, growthDelay } = plant.getStatDurations();

            const getTimeDisplay = (time, pastMessage) => {
                const timeAsMoment = moment(time);
                // const text = timeAsMoment.fromNow(true);
                const text = App.getPreciseTimeFromNow(time);
                const isPast = timeAsMoment.isBefore(moment());

                if(isPast) return `<span class="overflow-hidden ellipsis" style="opacity: 0.7;text-decoration: line-through;display: block;">${pastMessage}</span>`;

                return `<span">${text}</span>`;
            }

            const nextGrowthTime = !plant.isDead ? plant.lastGrowthTime + growthDelay : -1;
            const deathTime = plant.lastWatered + deathDuration;
            const hydratedTime = plant.lastWatered + wateredDuration;

            let innerContent = `
                <div>
                    <b>GROWS IN:</b>
                    <div class="surface-stylized inner-padding">${getTimeDisplay(nextGrowthTime, 'GROWN')}</div>
                </div>
                <div>
                    <b>Dehydrates in:</b>
                    <div class="surface-stylized inner-padding">${getTimeDisplay(hydratedTime, 'DEHYDRATED')}</div>
                </div>
                <div>
                    <b>DIES IN:</b>
                    <div><small>(after dehydration)</small></div>
                    <div class="surface-stylized inner-padding">${getTimeDisplay(deathTime, 'DEAD')}</div>
                </div>
            `;

            content.innerHTML = `
                <div class="inner-padding b-radius-10 m surface-stylized">
                    ${innerContent}
                </div>
            `;


            list.appendChild(content);
        },
        open_achievements_list: function(checkIfHasNewUnlocks){
            const configureAchievement = (id, name, description, condition, rewardFn) => {
                const unlockEventName = `unlocked_${id}_achievement`;
                const unlockEventState = App.getEvent(unlockEventName);

                let badge = App.getBadge('★', 'gray');
                if(!unlockEventState){
                    badge = App.getBadge('★');
                }

                const btn = {
                    name: condition
                            ? `<small>${name}</small>${badge}`
                            : `<small><i class="fa-solid fa-lock"></i> ${name}</small>`,
                    _disable: !condition,
                    isNewlyUnlocked: condition && !unlockEventState,
                    onclick: () => { 
                        if(!condition) return true;
                        App.displayConfirm(`<b>${name}</b> <br><br> ${description}`, [
                            {
                                name: unlockEventState ? 'reward collected' : 'collect reward',
                                class: unlockEventState && 'disabled',
                                onclick: () => {
                                    App.sendAnalytics('achievement_reward_collect', name);
                                    App.addEvent(unlockEventName);
                                    // do this to remove the badge from achievements 
                                    // button in stats menu
                                    App.closeAllDisplays();
                                    UI.lastClickedButton = null;
                                    App.handlers.open_stats_menu();
                                    App.handlers.open_achievements_list();

                                    if(rewardFn) rewardFn();
                                }
                            },
                            {
                                name: 'close',
                                class: 'back-btn',
                                onclick: () => {
                                    App.handlers.open_achievements_list();
                                }
                            }
                        ])
                        return false;
                    },
                }

                return btn;
            }

            const list = 
                Object.keys(App.definitions.achievements)
                .map(id => {
                    const { name, description, checkProgress, getReward } = App.definitions.achievements[id];
                    return configureAchievement(
                        id,
                        name,
                        description,
                        checkProgress(),
                        getReward
                    )
                })
                .sort((a, b) => (a._disable == b._disable) ? 0 : a._disable ? 1 : -1)
                .sort((a, b) => (a.isNewlyUnlocked == b.isNewlyUnlocked) ? 0 : a.isNewlyUnlocked ? -1 : 1);

            if(checkIfHasNewUnlocks){
                return list.some(a => a.isNewlyUnlocked);
            }

            return App.displayList(list, null, 'Achievements');
        },
        open_item_list: function(buyMode, activeIndex, customPayload){
            let list = [];
            let sliderInstance;
            let salesDay = App.isSalesDay();
            for(let item of Object.keys(App.definitions.item)){
                // check if current pet has this item on its inventory
                if(!App.pet.inventory.item[item] && !buyMode){
                    continue;
                }
                let current = App.definitions.item[item];

                // 50% off on sales day
                let price = current.price;
                if(salesDay) price = Math.round(price / 2);

                const iconElement = App.getItemCSprite(current.sprite);

                list.push({
                    isNew: !!current.isNew,
                    name: `${iconElement} ${item.toUpperCase()} (x${App.pet.inventory.item[item] || 0}) <b>${buyMode ? `$${price}` : ''}</b> ${current.isNew ? App.getBadge('new!') : ''}`,
                    onclick: (btn, list) => {
                        if(buyMode){
                            if(!App.pay(price)) return true;
                            App.temp.purchasedMallItem = true;
                            App.addNumToObject(App.pet.inventory.item, item, 1);
                            // console.log(list.scrollTop);
                            let nList = App.handlers.open_item_list(true, sliderInstance?.getCurrentIndex());
                                // nList.scrollTop = list.scrollTop;
                            return false;
                        }

                        if(customPayload){
                            return customPayload({...current, name: item});
                        }

                        if("age" in current && !current.age?.includes(App.petDefinition.lifeStage)){
                            return App.displayPopup(`This item is not appropriate for ${App.petDefinition.name}'s age!`);
                        }
                        Activities.useItem({...current, name: item});

                        // let useditem = App.pet.feed(current.sprite, current.hunger_replenish, current.type);
                        // if(useditem) {
                        //     App.pet.inventory.item[item] -= 1;
                        //     App.pet.stats.current_fun += current.fun_replenish;
                        //     if(App.pet.hasMoodlet('healthy') && current.type === 'med')
                        //         App.pet.stats.current_health = App.pet.stats.current_health * 0.6;
                        //     else
                        //         App.pet.stats.current_health += current.health_replenish;
                        // }
                    }
                })
            }

            if(!list.length){
                App.displayPopup(`You don't have any items, purchase some from the mall`, 2000);
                return;
            }

            list = list.sort((a, b) => b.isNew - a.isNew)
            sliderInstance = App.displaySlider(list, activeIndex, {accept: buyMode ? 'Purchase' : 'Use'}, buyMode ? `$${App.pet.stats.gold + (salesDay ? ` <span class="sales-notice">DISCOUNT DAY!</span>` : '')}` : null);
            return sliderInstance;
            return App.displayList(list);
        },
        open_craftables_list: function(){
            let sliderInstance;
            const {
                room_background: roomBackgroundDefs, 
                accessories: accessoryDefs
            } = App.definitions;

            const removeOneHarvestFromInventory = (name) => {
                if(App.pet.inventory.harvests[name] > 0)
                    App.pet.inventory.harvests[name] -= 1;
            }

            const getCraftableUIDef = (current, type, owned) => ({
                current,
                isNew: !!current.isNew,
                name: `
                    ${
                        current.icon ??
                        `<img style="
                            width: min-content;
                            align-self: center;
                        " src="${App.checkResourceOverride(current.image)}"></img>`
                    }
                    ${current.name.toUpperCase()} 
                    <small>${type}</small>
                    <b class="flex-center flex-dir-row">
                    ${
                        owned ? 'OWNED'
                            : App.getHarvestIcons(current.craftingRecipe, undefined, 'opacity-half')
                    }
                    </b> 
                    ${current.isNew ? App.getBadge('new!') : ''}
                `,
                onclick: () => {
                    if(owned) return App.displayPopup(`You already own the this ${type}!`);

                    const hasAllIngredients = current.craftingRecipe.every(ingredientName => App.pet.inventory.harvests[ingredientName]);
                    if(!hasAllIngredients) return App.displayPopup(`You cannot craft this ${type} due to missing ingredients`);

                    current.craftingRecipe.forEach(ingredient => removeOneHarvestFromInventory(ingredient));

                    App.displayPopup(`Crafted x1 <b>${current.name}</b>!`);

                    switch(type){
                        case "room":
                            App.closeAllDisplays();
                            Activities.redecorRoom();
                            App.scene.home.image = App.checkResourceOverride(current.image);
                            break;
                        case "furniture":
                            App.ownedFurniture.push({
                                id: current.id,
                                x: '50%', y: '50%',
                                isActive: false
                            })
                            break;
                        case "accessory":
                            App.pet.inventory.accessory[current.name] = true;
                            break;
                    }

                    App.sendAnalytics('craft', current.name);
                    App.pet.stats.current_expression += 2;
                    App.pet.stats.current_logic += 3;
                }
            });

            // room backgrounds
            const rooms = Object.keys(roomBackgroundDefs)
                .map(roomName => ({...roomBackgroundDefs[roomName], image: App.getFurnishableBackground(roomBackgroundDefs[roomName].image), name: roomName}))
                .filter(room => room.isCraftable)
                .map(current => getCraftableUIDef(current, 'room', current.image === App.scene.home.image))

            // furniture
            const furniture = App.definitions.furniture
                .filter(item => item.isCraftable)
                .map(current => getCraftableUIDef(current, 'furniture', !!App.ownedFurniture.find(f => f.id === current.id)))

            // accessories
            const accessories = Object.keys(accessoryDefs)
                .map(name => ({...accessoryDefs[name], name}))
                .filter(current => current.isCraftable)
                .map(current => getCraftableUIDef( {...current, icon: App.getAccessoryCSprite(current.name)} , 'accessory'))

            const list = [
                ...rooms,
                ...furniture,
                ...accessories,
            ].sort((a, b) => b.isNew - a.isNew)

            
            if(App.isTester()){
                const ingredientUsageMap = {};
                Object.keys(App.definitions.plant).forEach(ing => {
                    if(App.definitions.plant[ing].inedible) App.addNumToObject(ingredientUsageMap, ing, 0)
                })
                list.forEach(item => {
                    item.current.craftingRecipe.forEach(ing => App.addNumToObject(ingredientUsageMap, ing, 1))
                })
                console.log({ingredientUsageMap})
            }

            sliderInstance = App.displaySlider(list, null, {accept: 'Craft'});
            return sliderInstance;

        },
        open_room_background_list: function(onlyFurnishables, filterFn){
            let list = [];
            let sliderInstance;
            let salesDay = App.isSalesDay();
            for(let room of Object.keys(App.definitions.room_background)){                
                const absCurrent = App.definitions.room_background[room];

                if(filterFn && !filterFn(absCurrent)) continue;
                else if(!filterFn && absCurrent.isCraftable) continue;

                let current = 
                    onlyFurnishables ?
                    {...absCurrent, image: App.getFurnishableBackground(absCurrent.image)} :
                    absCurrent;

                // check for unlockables
                if(current.unlockKey && !App.getRecord(current.unlockKey)){
                    continue;
                }

                // 50% off on sales day
                let price = current.price;
                if(onlyFurnishables) price /= 1.5;
                if(salesDay) price = price / 2;
                price = Math.round(price);

                // room type
                const roomType = current.type ?? 'home';
                const scene = App.scene[roomType];
                if(!scene) return console.error('Invalid scene:', {roomType, scene});

                const defaultTypeImage = scene.image || App.scene.home.image;

                list.push({
                    isNew: !!current.isNew,
                    name: `<img style="min-height: 64px" src="${App.checkResourceOverride(current.image)}"></img> ${room.toUpperCase()} <b>$${price}</b> ${current.isNew ? App.getBadge('new!') : ''}`,
                    onclick: (btn, list) => {
                        if(current.image === defaultTypeImage){
                            App.displayPopup('You already own this room');
                            return true;
                        }

                        if(!App.pay(price)) return true;

                        App.closeAllDisplays();
                        App.setScene(scene, true);
                        Activities.redecorRoom();
                        scene.image = current.image;

                        App.sendAnalytics('home_background_change', scene.image);

                        return false;
                    }
                })
            }

            list = list.sort((a, b) => b.isNew - a.isNew)
            sliderInstance = App.displaySlider(list, null, {accept: 'Purchase'}, `$${App.pet.stats.gold + (salesDay ? ` <span class="sales-notice">DISCOUNT DAY!</span>` : '')}`);
            return sliderInstance;
        },
        open_shell_background_list: function(){
            let sliderInstance;
            const list = App.definitions.shell_background
            .filter(current => !(current.unlockKey && !App.getRecord(current.unlockKey)))
            .sort((a, b) => b.isNew - a.isNew)
            .map(current => {
                return {
                    name: `<img src="${current.image}"></img>${current.isNew ? App.getBadge('new!') : ''}`,
                    onclick: (btn, list) => {
                        App.setShellBackground(current.image);
                        return true;
                    }
                }
            })

            sliderInstance = App.displaySlider(list, null, {accept: 'Set'});
            return sliderInstance;
        },
        open_accessory_list: function(props = {}){
            const { 
                buyMode, 
                activeIndex, 
                accessShop,
                onClose,
            } = props;

            let list = [];
            let sliderInstance;
            let salesDay = App.isSalesDay();
            for(let accessoryName of Object.keys(App.definitions.accessories)){
                // check if current pet has this item in its inventory
                if(!App.pet.inventory.accessory[accessoryName] && !buyMode){
                    continue;
                }
                let current = App.definitions.accessories[accessoryName];

                if(buyMode && (current.isCraftable || current.price === -1)) continue;
                if(buyMode && accessShop !== current.accessShop) continue;

                // check for unlockables
                if(current.unlockKey && !App.getRecord(current.unlockKey)){
                    continue;
                }

                // 50% off on sales day
                let price = current.price;
                if(salesDay) price = Math.round(price / 2);

                const equipped = App.petDefinition.accessories.includes(accessoryName);
                const owned = App.pet.inventory.accessory[accessoryName];

                const reopen = (buyMode) => {
                    if(!buyMode) App.handlers.open_stuff_menu();
                    App.handlers.open_accessory_list({
                        ...props,
                        activeIndex: sliderInstance?.getCurrentIndex()
                    });
                    return false;
                }

                list.push({
                    isNew: !!current.isNew,
                    name: `
                        ${App.getAccessoryCSprite(accessoryName)}
                        ${accessoryName.toUpperCase()} 
                        <b>
                        ${
                            buyMode 
                            ? owned ? 'OWNED' : `$${price}`
                            : equipped ? 'EQUIPPED' : 'NOT EQUIPPED'
                        }
                        </b> 
                        ${
                            current.isNew 
                            ? App.getBadge('new!') 
                            : ''
                        }
                    `,
                    onclick: (btn, list) => {
                        if(buyMode){
                            if(App.pet.inventory.accessory[accessoryName]) {
                                App.displayPopup('You already own this accessory');
                                return true;
                            }
                            if(!App.pay(price)) return true;
                            App.temp.purchasedMallItem = true;
                            App.pet.inventory.accessory[accessoryName] = true;
                            //     // nList.scrollTop = list.scrollTop;
                            return reopen(buyMode);
                        }

                        // toggle equip mode
                        if(equipped) App.petDefinition.accessories.splice(App.petDefinition.accessories.indexOf(accessoryName), 1);
                        else App.petDefinition.accessories.push(accessoryName);
                        Activities.getDressed(() => App.pet.equipAccessories(), reopen, !equipped);
                        App.sendAnalytics('accessory', `${accessoryName} (${!equipped})`);
                    }
                })
            }

            if(!list.length){
                App.displayPopup(`You don't have any accessories, purchase some from the mall`, 2000);
                return;
            }

            list = list.sort((a, b) => b.isNew - a.isNew)
            sliderInstance = App.displaySlider(
                list, 
                activeIndex, 
                {
                    accept: buyMode 
                        ? 'Purchase' 
                        : 'Toggle'
                }, 
                buyMode ? `$${App.pet.stats.gold + (salesDay ? ` <span class="sales-notice">DISCOUNT DAY!</span>` : '')}` : null);
            return sliderInstance;
        },
        open_furniture_list: function(activeIndex){
            let list = [];
            let sliderInstance;
            let salesDay = App.isSalesDay();

            App.definitions.furniture.forEach(current => {
                // // check for unlockables
                // if(current.unlockKey && !App.getRecord(current.unlockKey)){
                //     continue;
                // }

                if(current.isCraftable) return;

                // 50% off on sales day
                let price = current.price ?? 1;
                if(salesDay) price = Math.round(price / 2);
                const owned = !!App.ownedFurniture.find(f => f.id === current.id);
                
                const reopen = () => {
                    App.handlers.open_furniture_list(sliderInstance?.getCurrentIndex());
                    return false;
                }

                const image = App.checkResourceOverride(current.image);
                const name = `
                <img style="min-height: 64px; object-fit: contain;" src="${image}"></img> 
                ${current.name.toUpperCase()} 
                <b>
                ${
                    owned ? 'OWNED' : `$${price}`
                }
                </b> 
                ${current.isNew ? App.getBadge('new!') : ''}
                `


                list.push({
                    isNew: !!current.isNew,
                    name,
                    onclick: (btn, list) => {
                        if(owned) return App.displayPopup(`You already own the this furniture!`);

                        if(!App.pay(price)) return true;
                        App.temp.purchasedMallItem = true;

                        App.ownedFurniture.push({
                            id: current.id,
                            x: '50%', y: '50%',
                            isActive: false
                        })

                        return reopen();
                    }
                })
            })

            list = list.sort((a, b) => b.isNew - a.isNew)
            sliderInstance = App.displaySlider(
                list, 
                activeIndex, 
                {accept: 'Purchase'}, 
                `$${App.pet.stats.gold + (salesDay ? ` <span class="sales-notice">DISCOUNT DAY!</span>` : '')}`
            );
            return sliderInstance;
        },
        open_active_furniture_list: function(){
            const list = [
                ...App.activeFurnitureObjects.map(savedFurniture => {
                    const furnitureDef = App.getFurnitureDefFromId(savedFurniture.def.id);
                    const persona = App.getPersona(furnitureDef.name, furnitureDef.image);
                    return {
                        name: persona,
                        onclick: () => {
                            return App.displayList([
                                {
                                    name: `<div class="flex flex-center height-auto">${persona}</div>`,
                                    type: 'text',
                                },
                                {
                                    name: 'edit position',
                                    onclick: () => {
                                        App.closeAllDisplays();
                                        App.editFurniture(savedFurniture, () => {
                                            App.handlers.open_active_furniture_list();
                                        });
                                    }
                                },
                                {
                                    name: 'remove',
                                    class: 'back-btn',
                                    onclick: () => {
                                        return App.displayConfirm(`Are you sure you want to remove this furniture from the room?`, [
                                            {
                                                name: 'yes',
                                                onclick: () => {
                                                    savedFurniture.def.isActive = false;
                                                    App.handleFurnitureSpawn();
                                                    App.closeAllDisplays();
                                                    App.handlers.open_active_furniture_list();
                                                }
                                            },
                                            {
                                                name: 'no',
                                                class: 'back-btn',
                                                onclick: () => {}
                                            }
                                        ])
                                    }     
                                }
                            ])
                        }
                    }
                })
            ]

            const occupiedLength = list.length;
            for(let i = 0; i < App.constants.MAX_PLACED_FURNITURE - occupiedLength; i++){
                list.push({
                    name: '<div class="width-full flex-center"> + </div>',
                    onclick: () => { // add furniture
                        const list = App.ownedFurniture?.filter(f => !f.isActive)
                        .slice()
                        .reverse()
                        .map(furniture => {
                            const def = App.getFurnitureDefFromId(furniture.id);
                            return {
                                _ignore: !def,
                                name: App.getPersona(def?.name, def?.image),
                                onclick: () => {
                                    furniture.isActive = true;
                                    App.closeAllDisplays();
                                    const furnitureObjects = App.handleFurnitureSpawn();
                                    const currentObject = furnitureObjects.find(f => f.def.id === def.id);
                                    App.editFurniture(currentObject, (state) => {
                                        if(!state) {
                                            furniture.isActive = false;
                                        };
                                        App.handleFurnitureSpawn();
                                        App.handlers.open_active_furniture_list();
                                    });
                                }
                            }
                        })

                        if(!App.ownedFurniture?.length || !list.length){
                            return App.displayPopup("You don't own any furniture, purchase some from the mall")
                        }

                        return App.displayList(list, null, 'Add furniture');
                    }
                })
            }

            return App.displayList([...list]);
        },
        getOutsideActivityId: function(id = 'default'){
            const tempId = `_outsideActivity_${id}`;
            return tempId;
        },
        open_activity_list: function(noIndexReset){
            if(!noIndexReset) App.temp[App.handlers.getOutsideActivityId()] = 1;

            return Activities.goToActivities({
                activities: [
                    ...App.definitions.outside_activities
                ]  
            });
        },
        open_devil_town_activity_list: function(noIndexReset){
            const id = 'devilTown';

            if(!noIndexReset) App.temp[App.handlers.getOutsideActivityId(id)] = 1;

            return Activities.goToActivities({
                activities: [
                    {
                        name: "Overworld Entrance",
                        image: 'resources/img/misc/activity_building_devil_home.png',
                        onEnter: () => App.handlers.open_underworld_menu(),
                        isHome: true,
                    },
                    // {
                    //     name: "Restaurant",
                    //     image: 'resources/img/misc/activity_building_devil_restaurant.png',
                    //     onEnter: () => App.handlers.go_to_home(),
                    //     isHome: true,
                    // },
                    {
                        name: "Gathering",
                        image: 'resources/img/misc/activity_building_devil_gathering.png',
                        onEnter: () => Activities.goToDevilTownGathering(),
                        isHome: true,
                    },
                    {
                        name: "Clothing Store",
                        image: 'resources/img/misc/activity_building_devil_clothing_store.png',
                        onEnter: () => {
                            App.handlers.open_accessory_list({
                                buyMode: true,
                                accessShop: 'devilsTown'
                            })
                            return true;
                        },
                        skipUnloading: true,
                    },
                ],
                floorImage: 'resources/img/misc/devil_walkway_02.png',
                scene: App.scene.devil_town_exterior,
                id,
            })
        },
        open_underworld_menu: function(){
            const CURRENCY_NAME = App.constants.UNDERWORLD_TREAT_CURRENCY;
            const CURRENCY_ICON = App.getFoodCSprite(App.definitions.food[CURRENCY_NAME]?.sprite);

            const TICKETS_PRICE = 50,
                POTION_PRICE = 200;

            const backFn = () => {
                App.handlers.open_activity_list(true);
            }

            const payWithCustomCurrency = (amt) => {
                const currentAmount = App.pet.inventory.food[CURRENCY_NAME] || 0;
                if(amt > currentAmount) {
                    App.displayPopup(`Don't have enough ${CURRENCY_NAME}!`);
                    return false;
                }
                App.addNumToObject(App.pet.inventory.food, CURRENCY_NAME, -amt);
                return true;
            }
            const openPurchasableList = (activeIndex) => {
                let sliderInstance;
                const candyAmount = App.pet.inventory.food[CURRENCY_NAME] || 0;

                const foodNames = [
                    'life essence',
                    'potion of aging up', 
                    'potion of fulfillment', 
                    'potion of misbehaving', 
                    'potion of well behaving', 
                    'potion of neglect',
                    'expression skill potion',
                    'logic skill potion',
                    'endurance skill potion',
                ]
                const miscItems = [
                    {
                        name: 'underworld tickets',
                        icon: App.getGenericCSprite(1, App.constants.MISC_SPRITESHEET, App.constants.MISC_SPRITESHEET_DIMENSIONS),
                        price: TICKETS_PRICE,
                        ownedAmount: App.pet.inventory.misc['underworld tickets'],
                        onclick: () => {
                            if(payWithCustomCurrency(TICKETS_PRICE)){
                                App.addNumToObject(App.pet.inventory.misc, 'underworld tickets', 3);
                                openPurchasableList(sliderInstance?.getCurrentIndex());
                                return false;
                            }
                            return true;
                        }
                    }
                ]
                const itemDefs = [
                    ...miscItems,
                    ...foodNames.map(name => {
                        const item = App.definitions.food[name];
                        return {
                            ...item,
                            name,
                            icon: App.getFoodCSprite(item.sprite),
                            price: POTION_PRICE,
                            ownedAmount: App.pet.inventory.food[name],
                            onclick: () => {
                                if(payWithCustomCurrency(POTION_PRICE)){
                                    App.addNumToObject(App.pet.inventory.food, name, 1);
                                    openPurchasableList(sliderInstance?.getCurrentIndex());
                                    return false;
                                }
                                return true;
                            }
                        }
                    })
                ]
                const allItems = [
                    ...itemDefs,
                ].map(current => {
                    return {
                        ...current,
                        name: `
                            ${current.icon} 
                            ${current.name?.toUpperCase()} 
                            (x${current.ownedAmount || 0})
                            <b class="flex align-center flex-gap-025 justify-center">
                                ${CURRENCY_ICON} <span>X${current.price || 0}</span> 
                            </b>
                            ${current.isNew ? App.getBadge('new!') : ''}
                        `,
                    }
                })

                sliderInstance = App.displaySlider(
                    allItems, 
                    activeIndex, 
                    {
                        accept: 'Purchase',
                    },
                    `
                        <div class="flex align-center flex-gap-025">
                            ${CURRENCY_ICON} x${candyAmount}
                        </div>
                    `
                );

                return sliderInstance;
            }

            return App.displayList([
                {
                    name: `Enter Underworld`,
                    onclick: () => {
                        const ownedTickets = App.pet.inventory.misc['underworld tickets'] || 0;
                        const ticketIcon = App.getGenericCSprite(1, App.constants.MISC_SPRITESHEET, App.constants.MISC_SPRITESHEET_DIMENSIONS);
                        const ticketSpan = `<div class="flex align-center justify-center flex-gap-1 bold">${ticketIcon} Ticket</div>`;
                        if(!ownedTickets){
                            return App.displayConfirm(`
                                You don't have a 
                                ${ticketSpan}
                                purchase some from the shop using
                                <div class="flex align-center justify-center flex-gap-1 bold">${CURRENCY_ICON} ${CURRENCY_NAME}</div>
                                `, 
                                [
                                    {
                                        name: 'open shop',
                                        onclick: () => {
                                            openPurchasableList()
                                        }
                                    },
                                    {
                                        name: 'close',
                                        class: 'back-btn',
                                        onclick: () => {}
                                    },
                                ]
                            )
                        }

                        return App.displayConfirm(`Do you want to enter the Underworld? This will cost you x1 ${ticketSpan}`, [
                            {
                                name: 'yes',
                                onclick: () => {
                                    App.closeAllDisplays();
                                    App.addNumToObject(App.pet.inventory.misc, 'underworld tickets', -1);
                                    App.handlers.open_devil_town_activity_list();
                                    App.sendAnalytics('enter_underworld');
                                }
                            },
                            {
                                name: 'no',
                                class: 'back-btn',
                                onclick: () => {}
                            },

                        ])
                    }
                },
                {
                    name: `Trick or Treat ${App.getBadge(CURRENCY_ICON, 'transparent')}`,
                    onclick: () => {
                        return App.displayPopup(
                            `Double jump to get all <br> ${CURRENCY_ICON} <br> while avoiding <br> <img src="resources/img/misc/bat_01.png"></img>`, 
                            false,
                            () => Activities.trickOrTreatGame(App.handlers.open_underworld_menu)
                        );
                    }
                },
                {
                    name: 'Shop',
                    onclick: openPurchasableList,
                },
            ], backFn)
        },
        open_rabbitholes_list: function(){
            if(!App.temp.rabbitholeTraveledFriends) App.temp.rabbitholeTraveledFriends = []

            const backFn = () => {
                App.handlers.open_activity_list(true);
            }
            return App.displayList([
                ...App.definitions.rabbit_hole_activities
                    .sort((a, b) => b.isNew || 0 - a.isNew || 0)
                    .map(hole => ({
                        name: `
                            <span class="ellipsis">${hole.name}<span>
                            ${App.getBadge(`${hole.isNew ? 'New!' : ''} <span> <i class="fa-solid fa-clock fa-xs"></i> ${Math.ceil(hole.duration / 1000 / 60)}</span>`, hole.isNew ? false : 'neutral')}
                        `,
                        onclick: () => {
                            const confirmFn = (otherPet) => {
                                App.displayConfirm(`Are you sure you want to <b>${hole.name}</b>${otherPet ? ` with <i>${otherPet.name}</i>`: ''}? <br><br> ${App.petDefinition.name} will go out for <b>${moment(hole.duration + Date.now()).toNow(true)}</b>`, [
                                    {
                                        name: 'yes',
                                        onclick: () => {
                                            App.pet.stats.current_rabbit_hole = {
                                                name: hole.name,
                                                endTime: Date.now() + hole.duration
                                            }
                                            // Activities.goToCurrentRabbitHole(true);
                                            Activities.goToHomePlanet(otherPet);
                                            App.save();
                                            App.closeAllDisplays();
                                            App.sendAnalytics('rabbit_hole', hole.name);
                                        }
                                    },
                                    {
                                        name: 'no',
                                        class: 'back-btn',
                                        onclick: () => {}
                                    },
                                ])
                            }

                            const dialog = App.displayList([
                                {
                                    name: `${hole.name} ${hole.isNew ? App.getBadge('new!') : ''}`,
                                    icon: 'lemon',
                                    type: 'info',
                                },
                                {
                                    name: 'Alone',
                                    onclick: () => {
                                        confirmFn()
                                        return true;
                                    }
                                },
                                {
                                    name: `With a friend`,
                                    onclick: () => {
                                        App.handlers.open_friends_list(
                                            (selectedFriend) => {
                                                confirmFn(selectedFriend)
                                            }
                                        )
                                        return true;
                                    }
                                },
                            ], undefined, 'Back');

                            // confirmFn();
                            return true;
                        }
                    })),
                {
                    type: 'info',
                    name: `${App.petDefinition.name} will visit their home planet to do one of <i>Homeworld Getaway</i> activities`
                },
            ], backFn)
        },
        open_friends_list: function(onClickOverride, customFilter, additionalButtons = []){
            const friends = customFilter
                ? App.petDefinition.friends.filter(customFilter)
                : App.petDefinition.friends;

            if(!friends.length && !additionalButtons.length){
                App.displayPopup(`${App.petDefinition.name} doesn't have any friends right now<br><br><small>Visit the park to find new friends<small>`, 4000);
                return;
            }

            const monsterIcon = `<img class="icon" src="resources/img/misc/devil_icon.png"></img>`
            const angelIcon = `<img class="icon" src="resources/img/misc/angel_icon.png"></img>`
            const monsterSpan = App.constants.SPANS.monster;
            const angelSpan = App.constants.SPANS.angel;

            let friendsList;
            const mappedFriendsList = friends.map((friendDef, index) => {
                const name = friendDef.name || 'Unknown';
                const icon = friendDef.getCSprite();

                const getInteractionSet = (set, condition) => condition ? set : [];

                // angel and monster interactions
                const monsterInteractions = [
                    {
                        name: `Scare`,
                        onclick: () => {
                            Activities.demon_scare(friendDef);
                            return true;
                        }
                    },
                    {
                        name: `Whisper`,
                        onclick: () => {
                            Activities.demon_whisper(friendDef);
                            return true;
                        }
                    },
                    {
                        name: `Place curse`,
                        onclick: () => {
                            if(App.pet.stats.current_hunger < App.pet.stats.max_hunger / 2){
                                return App.displayPopup("You don't have enough energy to do this.");
                            }

                            App.displayConfirm(`This will turn <b>${friendDef.name}</b> into a ${monsterSpan},</div> do you want to continue?`, [
                                {
                                    name: 'yes',
                                    onclick: () => {
                                        Activities.ghost_convertOtherPet(
                                            friendDef,
                                            PetDefinition.GHOST_TYPE.devil
                                        )
                                    },
                                },
                                {
                                    name: 'no',
                                    class: 'back-btn',
                                    onclick: () => {},
                                },

                            ])
                            return true;
                        }
                    },
                ].map(entry => ({
                    ...entry,
                    name: `${monsterIcon} <span style="color: red;">${entry.name}</span>`
                }))
                const angelInteractions = [
                    {
                        name: `Bless`,
                        onclick: () => {
                            Activities.angel_bless(friendDef);
                            return true;
                        }
                    },
                    {
                        name: `Grant Wish`,
                        onclick: () => {
                            Activities.angel_grantWish(friendDef);
                            return true;
                        }
                    },
                    {
                        name: `Gift Divinity`,
                        onclick: () => {
                            if(App.pet.stats.current_hunger < App.pet.stats.max_hunger / 2){
                                return App.displayPopup("You don't have enough energy to do this.");
                            }

                            App.displayConfirm(`This will turn <b>${friendDef.name}</b> into an ${angelSpan},</div> do you want to continue?`, [
                                {
                                    name: 'yes',
                                    onclick: () => {
                                        Activities.ghost_convertOtherPet(
                                            friendDef,
                                            PetDefinition.GHOST_TYPE.angel
                                        )
                                    },
                                },
                                {
                                    name: 'no',
                                    class: 'back-btn',
                                    onclick: () => {},
                                },

                            ])
                            return true;
                        }
                    },
                ].map(entry => ({
                    ...entry,
                    name: `${angelIcon} <span style="color: forestgreen;">${entry.name}</span>`
                }))

                return {
                    name: icon + name,
                    onclick: () => {
                        const isMonsterGhost = friendDef.stats.is_ghost === PetDefinition.GHOST_TYPE.devil;
                        const isAngelGhost = friendDef.stats.is_ghost === PetDefinition.GHOST_TYPE.angel;
                        if (onClickOverride) return onClickOverride(friendDef);
                        const friendActivitiesList = App.displayList([
                            {
                                name: 'info',
                                onclick: () => {
                                    const list = UI.genericListContainer();                                
                                    UI.genericListContainerContent(`
                                        <div class="inner-padding uppercase surface-stylized b-radius-10 flex flex-dir-col flex-gap-2">
                                            <div class="flex flex-dir-col flex-gap-05">
                                                <div>${icon} ${friendDef.name}</div>
                                                <small>(${friendDef.getLifeStageLabel()})</small>
                                                <small>
                                                    ${isMonsterGhost ? monsterSpan : ''}
                                                    ${isAngelGhost ? angelSpan : ''}
                                                </small>
                                            </div>
                                            <div></div>
                                            <div class="relative flex flex-dir-row align-center flex-gap-1">
                                                <div class="stats-label">Friendship</div>
                                                <b class="outlined-icon flex flex-center" style="width: 18px;">${App.getIcon('smile', true)}</b> 
                                                ${App.createProgressbar( friendDef.getFriendship() / 100 * 100 ).node.outerHTML}
                                            </div>

                                        </div>
                                    `, list)
                                    return true;
                                }
                            },
                            {
                                _ignore: !friendDef.stats.is_ghost || friendDef.stats.is_ghost === App.pet.stats.is_ghost,
                                name: `${isMonsterGhost ? monsterIcon : angelIcon} <span style="color: ${isMonsterGhost ? 'red' : 'forestgreen'};">Be converted</span>`,
                                onclick: () => {
                                    if(friendDef.stats.player_friendship <= 98){
                                        return App.displayPopup(`
                                            You need to be best friends with 
                                            <b>${friendDef.name}</b> 
                                            before asking to be converted to
                                            <div>
                                                ${isMonsterGhost ? monsterSpan : angelSpan}
                                            </div>
                                        `, 3500);
                                    }

                                    return App.displayConfirm(`This will turn your pet into ${isMonsterGhost ? monsterSpan : angelSpan} are you sure you want to continue?`, [
                                        {
                                            name: 'yes',
                                            onclick: () => {
                                                Activities.ghost_beConverted(friendDef, friendDef.stats.is_ghost)
                                            }
                                        },
                                        {
                                            name: 'no',
                                            class: 'back-btn',
                                            onclick: () => {}
                                        }
                                    ])
                                },
                            },
                            ...getInteractionSet(
                                monsterInteractions, 
                                App.pet.stats.is_ghost === PetDefinition.GHOST_TYPE.devil 
                                && friendDef.stats.is_ghost !== App.pet.stats.is_ghost
                            ),
                            ...getInteractionSet(
                                angelInteractions, 
                                App.pet.stats.is_ghost === PetDefinition.GHOST_TYPE.angel 
                                && friendDef.stats.is_ghost !== App.pet.stats.is_ghost
                            ),
                            {
                                _ignore: App.petDefinition.lifeStage < PetDefinition.LIFE_STAGE.adult || friendDef.lifeStage < PetDefinition.LIFE_STAGE.adult || friendDef.stats.is_player_family,
                                name: `go on date`,
                                onclick: () => {
                                    if (friendDef.getFriendship() < 60) {
                                        return App.displayPopup(`${App.petDefinition.name}'s friendship with ${friendDef.name} is too low <br><br> they don't want to go on a date.`, 5000);
                                    }

                                    App.displayConfirm(`Do you want to go on a date with <div>${icon} ${friendDef.name}</div>?`, [
                                        {
                                            name: 'yes',
                                            onclick: () => {
                                                Activities.goOnDate(friendDef);
                                            }
                                        },
                                        {
                                            name: 'cancel',
                                            class: 'back-btn',
                                            onclick: () => { }
                                        }
                                    ])

                                    return true;
                                }
                            },
                            {
                                name: 'invite',
                                onclick: () => {
                                    App.closeAllDisplays();
                                    Activities.invitePlaydate(friendDef);
                                }
                            },
                            {
                                _disable: App.petDefinition.lifeStage <= PetDefinition.LIFE_STAGE.baby,
                                name: 'park',
                                onclick: () => {
                                    App.closeAllDisplays();
                                    Activities.goToPark(friendDef);
                                }
                            },
                            {
                                _disable: App.petDefinition.lifeStage <= PetDefinition.LIFE_STAGE.child,
                                name: 'gift',
                                onclick: () => {
                                    App.displayConfirm(`Are you sure you want to give gift to ${icon} ${name}?`, [
                                        {
                                            name: 'yes',
                                            onclick: () => {
                                                App.closeAllDisplays();
                                                App.handlers.open_item_list(null, null, (item) => {
                                                    App.pet.inventory.item[item.name] -= 1;
                                                    friendDef.increaseFriendship(Math.floor(item.price / 2.7));
                                                    Activities.inviteGiveGift(friendDef);
                                                })
                                                return true;
                                            }
                                        },
                                        {
                                            name: 'no',
                                            class: 'back-btn',
                                            onclick: () => { }
                                        }
                                    ]);
                                    return true;
                                }
                            },
                            {
                                name: 'unfriend',
                                onclick: () => {
                                    App.displayConfirm(`Are you sure you want to unfriend ${icon} ${name}?`, [
                                        {
                                            name: 'yes',
                                            onclick: () => {
                                                friendsList.close();
                                                friendActivitiesList.close();
                                                App.petDefinition.friends.splice(index, 1);
                                                App.handlers.open_friends_list();
                                            }
                                        },
                                        {
                                            name: 'no',
                                            class: 'back-btn',
                                            onclick: () => { }
                                        }
                                    ]);
                                    return true;
                                }
                            }
                        ]);
                        return true;
                    }
                }
            });

            friendsList = App.displayList(
                [
                    ...mappedFriendsList,
                    ...additionalButtons,
                ]
            );
        },
        open_phone: function(){
            App.displayList([
                {
                    _disable: App.petDefinition.lifeStage <= PetDefinition.LIFE_STAGE.baby,
                    name: `<span style="color: #ff00c6"><i class="icon fa-solid fa-globe"></i> hubchi</span>`,
                    onclick: () => {
                        if(App.petDefinition.lifeStage <= PetDefinition.LIFE_STAGE.baby){
                            return App.displayPopup(`${App.petDefinition.name} is not old enough to go to hubchi!`);
                        }

                        if(!App.userName){
                            App.handlers.show_set_username_dialog();
                            return true;
                        }

                        if(App.pet.stats.current_sleep < 10) {
                            return App.displayPopup(`${App.petDefinition.name} is too sleepy to go to HUBCHI!`);
                        }

                        return App.displayConfirm(`Enter Hubchi?`, [
                            {
                                name: 'yes',
                                onclick: async () => {
                                    App.closeAllDisplays();
                                    Activities.onlineHubTransition(async (fadeOverlay) => {
                                        setTimeout(() => App.playSound('resources/sounds/task_complete.ogg', true));
                                        const popup = App.displayPopup('Connecting...', App.INF);
                                        App.temp.online = {};
                                        App.temp.online.hasUploadedPetDef = await App.apiService.getPetDef();
                                        App.temp.online.randomPetDefs = await App.apiService.getRandomPetDefs(7);
                                        // App.temp.online = JSON.parse('{"hasUploadedPetDef":{"status":true,"data":"{\\"name\\":\\"Missiechu\\",\\"sprite\\":\\"resources/img/character/chara_248b.png\\",\\"accessories\\":[\\"mini band\\",\\"secretary\\"]}"},"randomPetDefs":{"status":true,"data":[{"name":"farah3","sprite":"resources/img/character/chara_51b.png","accessories":[],"owner":"test3","ownerId":"test3-1234","interactions":0},{"name":"sep2","sprite":"resources/img/character/chara_50b.png","accessories":[],"owner":"test2","ownerId":"test2-1234","interactions":2},{"name":"qoli4","sprite":"resources/img/character/chara_210b.png","accessories":["witch hat"],"owner":"test4","ownerId":"test4-1234","interactions":0},{"name":"<saman1>","sprite":"resources/img/character/chara_28b.png","accessories":[],"owner":"test","ownerId":"test-1234","interactions":0},{"name":"Missiechu","sprite":"resources/img/character/chara_248b.png","accessories":["mini band","secretary"],"owner":"samandev","ownerId":"samandev-3430186","interactions":3}]}}');
                                        popup.close();
                                        App.closeAllDisplays();
                                        fadeOverlay.direction = false;
                
                                        if(!App.temp.online?.randomPetDefs){
                                            App.displayPopup('Error! Cannot connect.');
                                            App.setScene(App.scene.home);
                                            App.toggleGameplayControls(true);
                                            return false;
                                        }
                                        
                                        setTimeout(() => App.playSound('resources/sounds/task_complete_02.ogg', true));
                                        Activities.goToOnlineHub();
                                    })
            
                                    App.sendAnalytics('go_to_online_hub');
                                }
                            },
                            {
                                name: 'no',
                                class: 'back-btn',
                                onclick: () => {}
                            },
                        ])
                    }
                },
                {
                    _disable: App.petDefinition.lifeStage <= PetDefinition.LIFE_STAGE.baby,
                    name: `<span style="color: mediumvioletred"> <i class="fa-solid fa-burger icon"></i> SnapMeal </span>`,
                    onclick: () => {
                        let list = [
                            ...App.handlers.open_food_list({buyMode: true, getListOnly: true, filterType: 'food', age: PetDefinition.LIFE_STAGE.adult}),
                            ...App.handlers.open_food_list({buyMode: true, getListOnly: true, filterType: 'treat', age: PetDefinition.LIFE_STAGE.adult}),
                            ...App.handlers.open_food_list({
                                buyMode: true, 
                                getListOnly: true, 
                                filterType: 'food', 
                                allowCookableOnly: true,
                                age: PetDefinition.LIFE_STAGE.adult
                            }).filter(item => item.current.cookableOnly),
                        ]
                        .filter(item => item.disabled)
                        .map((food) => ({
                            current: {
                                ...food.current,
                                price: food.current.cookableOnly 
                                    ? Math.floor(food.current.price * 10)
                                    : Math.floor(food.current.price * App.constants.ONLINE_FOOD_ORDER_MARKUP),
                            },
                            foodName: food.foodName
                        }))

                        // make list length odd
                        if(list.length % 2 === 0){
                            list = list.slice(0, -1);
                        }

                        if(!list.length){
                            return App.displayPopup('Sorry but <b>Snapmeal</b> is out of operation today!<br> <small>Please comeback tomorrow!</small>', 5000);
                        }

                        const getOrders = () => list.filter(item => item.current.orderAmount > 0);
                        const getTotalPrice = () => getOrders().reduce(
                                (acc, {current}) => acc + (current.price * current.orderAmount),
                                0
                            )

                        const parentContainer = UI.genericListContainer();
                        const content = UI.create({
                            className: 'flex-grid-2x',
                            parent: parentContainer,
                            children: [
                                ...list.map(({current, foodName}) => 
                                    ({
                                        _mount: (me) => {
                                            me.innerHTML = `
                                                <div class="pointer-events-none">
                                                    <div class="x2"> ${App.getFoodCSprite(current.sprite)} </div>
                                                    <div class="flex-grid-2x__content ${!current.orderAmount ? 'opacity-half' : ''}">
                                                        <span>X</span>
                                                        <span id="order-amount">${current.orderAmount || 0}</span>
                                                    </div>
                                                    <div class="flex-grid-2x__title">
                                                        <small>
                                                            <i>$${current.price}</i>
                                                            ${current.cookableOnly ? '★' : ''}
                                                        </small>
                                                    </div>
                                                </div>
                                            `;
                                        },
                                        componentType: 'button',
                                        className: 'generic-btn stylized',
                                        onClick: (me) => {
                                            const newOrderAmount = ((current.orderAmount || 0) + 1) % 4;
                                            current.orderAmount = newOrderAmount;
                                            me._mount();
                                            parentContainer.querySelector('#submit-order')._mount();
                                        }
                                    })
                                ),
                                {
                                    innerHTML: App.getIcon('spinner fa-spin-pulse', true),
                                    _mount: (me) => {
                                        const totalPrice = getTotalPrice();
                                        me.disabled = !totalPrice;
                                        me.innerHTML = `
                                            <div class="x2"> 
                                                ${App.getIcon('basket-shopping', true)}
                                            </div>
                                            <div class="flex-grid-2x__content">
                                                $${totalPrice}
                                            </div>
                                        `
                                        if(totalPrice){
                                            me.innerHTML += App.getBadge(`Order!`);
                                        }
                                    },
                                    componentType: 'button',
                                    className: 'generic-btn stylized primary solid',
                                    id: 'submit-order',
                                    disabled: true,
                                    onClick: () => {
                                        const totalPrice = getTotalPrice();
                                        return App.displayConfirm(`Are you sure you want to place your order for <b>$${getTotalPrice()}</b>?`, [
                                            {
                                                name: 'Yes',
                                                onclick: () => {
                                                    if(!App.pay(totalPrice)) return false;
                                                    App.sendAnalytics('online_food_order', totalPrice);
                                                    getOrders().forEach(order => {
                                                        App.addNumToObject(App.pet.inventory.food, order.foodName, order.current.orderAmount);
                                                        Missions.done(Missions.TYPES.order_food);
                                                    })
                                                    App.displayPopup(
                                                        `${App.getIcon('check-circle', true)} <br> Thanks for ordering! <br> <small>Your order will arrive shortly!</small>`, 
                                                        2500, 
                                                        () => {
                                                            App.closeAllDisplays();
                                                            Activities.receiveOrderedFood();
                                                        }
                                                    );
                                                }
                                            },
                                            {
                                                name: 'No',
                                                class: 'back-btn',
                                                onclick: () => {}
                                            }
                                        ])
                                    }
                                }
                            ]
                        })

                        return true;
                    }
                },
                {
                    name: `friends`,
                    onclick: () => {
                        App.handlers.open_friends_list(null, null, [
                            {
                                name: `<i class="fa-solid fa-plus icon"></i> Add Friend`,
                                onclick: () => App.handlers.open_hubchi_search(),
                            }
                        ]);
                        return true;
                    }
                },
                {
                    _ignore: App.petDefinition.lifeStage >= PetDefinition.LIFE_STAGE.elder,
                    name: 'have birthday',
                    onclick: () => {
                        let nextBirthday = App.petDefinition.getNextBirthdayDate();
                        if(moment().isBefore( nextBirthday )){
                            return App.displayPopup(`${App.petDefinition.name} hasn't grown enough to age up<br><br>come back <b>${(moment(nextBirthday).fromNow())}</b>`, 5000);
                        }
                        App.displayConfirm(`This will age up ${App.petDefinition.name}<br>Are you sure?`, [
                            {
                                name: 'yes',
                                onclick: () => {
                                    Activities.birthday();
                                }
                            },
                            {
                                name: 'no',
                                class: 'back-btn',
                                onclick: () => {},
                            }
                        ])
                    }
                },
                {
                    _ignore: true,
                    name: 'doctor visit',
                    onclick: () => {
                        // App.displayPopup(`${App.pet.stats.current_health}`, 1000);
                        Activities.inviteDoctorVisit();
                    }
                },
                {
                    _disable: App.petDefinition.lifeStage <= PetDefinition.LIFE_STAGE.child,
                    name: `social media`,
                    onclick: () => {
                        App.handlers.open_social_media();
                        return true;
                    }
                },
                {
                    _disable: App.petDefinition.lifeStage <= PetDefinition.LIFE_STAGE.baby,
                    name: `go on vacation`,
                    onclick: () => {
                        const price = 250;
                        const { goToVacation } = Activities;
                        App.displayConfirm(`Are you sure you want to send ${App.petDefinition.name} on a vacation? <br> it will cost you $${price} and ${App.petDefinition.name} will stay there until you decide to end their vacation <hr> <b>while on vacation, ${App.petDefinition.name}'s needs will not drop</b>`, [
                            {
                                name: `yes ($${price})`,
                                onclick: () => {
                                    const commitFn = () => {
                                        goToVacation(Activities.seaVacation)
                                        App.sendAnalytics('go_on_vacation');
                                        App.definitions.achievements.go_to_vacation_x_times.advance();
                                        App.save();
                                    }

                                    if(!App.pay(price)) return;
                                    if(App.animals?.list?.length){
                                        App.displayPopup('Your animal(s) will be taken care of while you are away!', 5000, commitFn);
                                    } else commitFn();
                                }
                            },
                            {
                                name: 'no',
                                class: 'primary solid',
                                onclick: () => {}
                            }
                        ])
                        return true;
                    }
                },
                {
                    name: `friend codes`,
                    onclick: () => {
                        App.displayList([
                            {
                                name: 'get code',
                                onclick: async () => {
                                    const loading = App.displayPopup('Loading...', App.INF);
                                    const pet = await window.idbKeyval.get('pet');
                                    loading.close();
                                    let charCode = 'friend:' + btoa(encodeURIComponent(JSON.stringify({ user_id: App.userId, pet })));
                                    navigator.clipboard.writeText(charCode);
                                    console.log(charCode);
                                    App.displayConfirm(`Your friend code has been copied to the clipboard!`, [
                                        {
                                            name: 'next',
                                            onclick: () => {
                                                App.displayConfirm(`Send it to your friend and they'll be able to add ${App.petDefinition.name} as a friend using <b>Phone > Friend Codes > Input code</b>`, [
                                                    {
                                                        name: 'ok',
                                                        onclick: () => {}
                                                    },
                                                ])
                                            }
                                        },
                                    ])
                                    return true;
                                }
                            },
                            {
                                name: 'input code',
                                onclick: () => {
                                    App.displayPrompt(`enter your friend code:`, [
                                        {
                                            name: 'enter',
                                            onclick: (rawCode) => {
                                                if(rawCode.indexOf('friend:') == -1) return App.displayPopup(`Invalid friend code!`);

                                                let b64 = rawCode.replace('friend:', '');
                                                try {
                                                    b64 = decodeURIComponent(atob(b64));
                                                    let json = JSON.parse(b64);
                                                    if(!json.pet){
                                                        throw 'error';
                                                    }

                                                    if(json.user_id === App.userId) return App.displayPopup(`You can't add yourself as a friend!`);

                                                    let petDef = json.pet;

                                                    let def = new PetDefinition().loadStats(petDef);
                                                    
                                                    App.displayConfirm(`Are you trying to add <div style="font-weight: bold">${def.getCSprite()} ${def.name}?</div> as a friend?`, [
                                                        {
                                                            name: 'yes',
                                                            onclick: () => {
                                                                App.petDefinition.addFriend(def);
                                                                App.closeAllDisplays();
                                                                return App.displayPopup(`${def.name} was added to the friends list!`, 3000);
                                                            }
                                                        },
                                                        {
                                                            name: 'no',
                                                            class: 'back-btn',
                                                            onclick: () => {}
                                                        },
                                                    ])
                                                } catch(e) {    
                                                    return App.displayPopup('Invalid friend code!');
                                                }
                                            }
                                        },
                                        
                                        {
                                            name: 'cancel',
                                            class: 'back-btn',
                                            onclick: () => { }
                                        },

                                    ])

                                    return true;
                                }
                            },
                        ])

                        return true;
                    }
                }
            ], null, 'Phone')
        },
        open_social_media: function(){
            if(!App.temp.seenSocialMediaPosts){
                App.temp.seenSocialMediaPosts = 0;
            }
            function showPost(petDefinition, noMood, noNextBtn){
                if(++App.temp.seenSocialMediaPosts >= 12 && !noNextBtn){
                    return App.displayPopup('There are no more social media posts, comeback later!');
                }

                Missions.done(Missions.TYPES.check_social_post);

                let post = document.querySelector('.cloneables .post-container').cloneNode(true);
                document.querySelector('.screen-wrapper').appendChild(post);
                post.style.display = '';

                document.querySelector('.post-profile-icon').innerHTML = `${petDefinition.getCSprite()}`;

                let postDrawer = new Drawer(post.querySelector('.post-canvas'), 96, 96);
                // let postDrawer = new Drawer(postCanvas)
                let postText = post.querySelector('.post-text');

                let drawer = setInterval(() => {
                    postDrawer.draw();
                }, 32);
                let close = () => {
                    clearInterval(drawer);
                    App.toggleGameplayControls(true);
                    post.remove();
                }
                App.toggleGameplayControls(false, close);
                post.querySelector('.post-close').onclick = close;
                post.querySelector('.post-next').onclick = () => {
                    close();
                    showRandomPost();
                };
                if(noNextBtn){
                    post.querySelector('.post-next').remove();
                }

                let homeBackground = App.scene.home.image;
                if(petDefinition !== App.petDefinition)
                    homeBackground = randomFromArray(
                        Object.keys(App.definitions.room_background)
                        .map(roomName => 
                            App.definitions.room_background[roomName].image
                        )
                    )
                
                const background = new Object2d({
                    drawer: postDrawer,
                    img: homeBackground,
                    x: 0, y: 0, width: 96, height: 96,
                });


                const characterPositions = ['50%', '20%', '80%'],
                    characterSpritePoses = [1, 11, 14, 8, 2, 12];

                const character = new Object2d({
                    drawer: postDrawer,
                    spritesheet: {...petDefinition.spritesheet, cellNumber: randomFromArray(characterSpritePoses)},
                    // image: App.pet.image.cloneNode(),
                    // img: petDefinition.sprite,
                    image: App.preloadedResources[petDefinition.sprite],
                    x: randomFromArray(characterPositions), y: 55 + (petDefinition.spritesheet.offsetY * 2 || 0),
                })

                post.querySelector('.post-header').innerHTML = petDefinition.name;

                switch(App.pet.state){
                    default:
                        const [text, pose, backgroundImg, backgroundSpritesheetDef] = randomFromArray(App.definitions.tweets.generic);
                        postText.innerHTML = text; // text
                        if(pose) character.spritesheet.cellNumber = pose; // pose
                        if(backgroundImg) background.setImg(backgroundImg); // background
                        if(backgroundSpritesheetDef) background.spritesheet = backgroundSpritesheetDef;
                }

                if(!noMood){
                    if(App.pet.hasMoodlet('hungry')){
                        postText.innerHTML = 'Can go for a bite #hungy';
                        character.spritesheet.cellNumber = 4;
                        background.setImg(homeBackground);
                    }
                    if(App.pet.hasMoodlet('sleepy')){
                        postText.innerHTML = 'battery low, need a nap!';
                        character.spritesheet.cellNumber = 4;
                        background.setImg(homeBackground);
                    }
                    if(App.pet.hasMoodlet('bored')){
                        postText.innerHTML = 'Anyone wanna talk? #bored';
                        character.spritesheet.cellNumber = 4;
                        background.setImg(homeBackground);
                    }
                    if(App.pet.hasMoodlet('sick')){
                        postText.innerHTML = 'Not feeling too good... #tummyache';
                        character.spritesheet.cellNumber = 4;
                        background.setImg(homeBackground);
                    }
                }
            }

            const showRandomPost = () => {
                App.petDefinition.stats.current_fun += random(0, 5);
                switch(random(0, 2, 3)){
                    case 0: App.pet.stats.current_expression += 0.5; break;
                    case 1: App.pet.stats.current_endurance += 0.5; break;
                    case 2: App.pet.stats.current_logic += 0.5; break;
                }
                let otherPetDef;
                if(App.petDefinition.friends && App.petDefinition.friends.length){
                    otherPetDef = randomFromArray(App.petDefinition.friends);
                } else {
                    otherPetDef = App.getRandomPetDef();
                }
                showPost(otherPetDef, true);
            }

            App.displayList([
                {
                    name: 'make post',
                    onclick: () => {
                        App.petDefinition.stats.current_fun += random(1, 5);
                        App.pet.stats.current_expression += 0.5;
                        showPost(App.petDefinition, null, true);
                        return true;
                    }
                },
                {
                    name: 'explore posts',
                    onclick: () => {
                        showRandomPost();
                        return true;
                    }
                },
                {
                    name: 'find friends',
                    onclick: () => {
                        const seed = App.getDayId(true);
                        let potentialFriends = new Array(8)
                            .fill(undefined)
                            .map((spot, i) => App.getRandomPetDef(App.petDefinition.lifeStage, seed + (i * 128)));
                        App.displayGrid([...potentialFriends.map(otherPetDef => {
                            return {
                                name: `${otherPetDef.getFullCSprite()}`,
                                class: 'bg-bef-1',
                                onclick: () => {
                                    App.displayConfirm(`Do you want to send friend request to<br><b>${otherPetDef.getCSprite()} ${otherPetDef.name}?</b>`, [
                                        {
                                            name: 'yes',
                                            onclick: () => {
                                                let willAcceptFriendRequest = random(0, 1) == 1;
                                                if(!willAcceptFriendRequest){
                                                    App.displayPopup(`${otherPetDef.name} did <b style="color: #ff6e74">not accept</b> ${App.petDefinition.name}'s friend request`)
                                                    return;
                                                }
                                                let state = App.petDefinition.addFriend(otherPetDef);
                                                if(state) {
                                                    App.displayPopup(`${otherPetDef.name} <b style="color: #87cf00">accepted</b> ${App.petDefinition.name}'s friend request!`);
                                                    App.pet.stats.current_expression += 2;
                                                } else App.displayPopup(`${App.petDefinition.name} is already friends with ${otherPetDef.name}!`);
                                            }
                                        },
                                        {
                                            name: 'no',
                                            class: 'back-btn',
                                            onclick: () => { }
                                        }
                                    ])
                                    return true;
                                }
                            }
                        }), {
                            name: '<i class="fa-solid fa-arrow-left back-sound"></i>',
                            class: 'back-sound',
                            onclick: () => { }
                        }])
                        return true;
                    }
                },
                {
                    name: `send message`,
                    onclick: () => {
                        App.handlers.open_friends_list((friendDef) => {
                            if(friendDef.sentMessage){
                                App.displayPopup(`${App.petDefinition.name} shouldn't spam ${friendDef.name}'s inbox!`, 3000);
                                return;
                            }
                            App.displayPopup(`sent message to ${friendDef.name}!`, 3000);
                            friendDef.increaseFriendship(10);
                            friendDef.sentMessage = true;
                            App.pet.stats.current_expression += 0.5;
                        })
                        return true;
                    }
                }
            ])
        },
        open_school_activity_list: function(){
            const backFn = () => {
                App.handlers.open_activity_list(true);
            }

            const getFlipCardsDifficulty = (stat) => {
                if(stat < 6){
                    return {
                        activeCards: 1,
                        maxCards: 4,
                        maxAttempts: 2,
                    }
                } else if(stat < 15){
                    return {
                        activeCards: 1,
                        maxCards: 8,
                        maxAttempts: 3,
                    }
                } else if(stat <= 30) {
                    return {
                        activeCards: 1,
                        maxCards: 12,
                        maxAttempts: 3,
                    }
                } else if(stat <= 60) {
                    return {
                        activeCards: 2,
                        maxCards: 12,
                    }
                } else {
                    return {
                        activeCards: 3,
                        maxCards: 12,
                        maxAttempts: 5,
                    }
                }
            }

            const countClassVisit = (payload) => {
                if(App.pet.stats.schoolClassesToday >= App.constants.SCHOOL.maxClassesPerDay){
                    App.handlers.show_attended_school_limit_message();
                    return true;
                }
                App.pet.stats.schoolClassesToday += 1;
                console.log(App.pet.stats.schoolClassesToday)
                App.pet.stats.current_discipline += random(1, 4);
                return payload();
            }

            const startClassGame = (text, payload) => {
                App.displayPopup(text, 2000, () => countClassVisit(payload));
            }

            const flipCardsDescription = `Keep track of cards with the ${App.getIcon('star', true)} symbol and select them after the shuffle!`;

            return App.displayList([
                {
                    name: `${App.getIcon('special:expression')} Expression`,
                    onclick: () => {
                        return App.displayList([
                            {
                                name: 'Tune Practice',
                                onclick: () => {
                                    startClassGame(
                                        'Remember the order the blocks light up, and recreate it when the light turns on!',
                                        () => Activities.school_ExpressionGame({
                                            onEndFn: (pts) => {
                                                App.pet.stats.current_expression += pts;
                                            }
                                        })
                                    )
                                }
                            },
                            {
                                name: 'Flip Cards',
                                onclick: () => startClassGame(flipCardsDescription, () => Activities.school_CardShuffleGame({
                                    ...getFlipCardsDifficulty(App.pet.stats.current_expression),
                                    skillIcon: 'special:expression',
                                    onEndFn: (pts) => {
                                        App.pet.stats.current_expression += pts;
                                    }
                                }))
                            }
                        ])
                    }
                },
                {
                    name: `${App.getIcon('special:logic')} Logic`,
                    onclick: () => {
                        return App.displayList([
                            {
                                name: 'Track',
                                onclick: () => startClassGame(`Keep track of the card with the ${App.getIcon('star', true)} symbol and select it after the shuffle!`, () => Activities.school_CardShuffleGame({
                                    activeCards: 1,
                                    maxCards: 4,
                                    swapDelay: 200,
                                    maxSwaps: 10,
                                    maxAttempts: 1,
                                    skillIcon: 'special:logic',
                                    onEndFn: (pts) => {
                                        App.pet.stats.current_logic += pts;
                                    }
                                }))
                            },
                            {
                                name: 'Flip Cards',
                                onclick: () => startClassGame(flipCardsDescription, () => Activities.school_CardShuffleGame({
                                    ...getFlipCardsDifficulty(App.pet.stats.current_logic),
                                    skillIcon: 'special:logic',
                                    onEndFn: (pts) => {
                                        App.pet.stats.current_logic += pts;
                                    }
                                }))
                            },
                        ])
                    }
                },
                {
                    name: `${App.getIcon('special:endurance')} Endurance`,
                    onclick: () => {
                        return App.displayList([
                            {
                                name: 'Skipping Rope',
                                onclick: () => {
                                    startClassGame('Jump at the perfect time to avoid touching the rope!', () => Activities.school_EnduranceGame({
                                        onEndFn: (pts) => {
                                            App.pet.stats.current_endurance += pts;
                                        }
                                    }))
                                }
                            },
                            {
                                name: 'Flip Cards',
                                onclick: () => startClassGame(flipCardsDescription, () => Activities.school_CardShuffleGame({
                                    ...getFlipCardsDifficulty(App.pet.stats.current_endurance),
                                    skillIcon: 'special:endurance',
                                    onEndFn: (pts) => {
                                        App.pet.stats.current_endurance += pts;
                                    }
                                }))
                            }
                        ])
                    }
                },

            ], backFn)
        },
        open_mall_activity_list: function(){
            const hasNewMainDecor = Object.keys(App.definitions.room_background).some(key => {
                const room = App.definitions.room_background[key];
                if(room.type) return false;
                const isUnlocked = 
                    room.unlockKey ? 
                    App.getRecord(room.unlockKey) : 
                    true;
                return room.isNew && isUnlocked && !room.isCraftable;
            });
            const hasNewKitchenDecor = Object.keys(App.definitions.room_background).some(key => {
                const room = App.definitions.room_background[key];
                if(room.type !== 'kitchen') return false;
                const isUnlocked = 
                    room.unlockKey ? 
                    App.getRecord(room.unlockKey) : 
                    true;
                return room.isNew && isUnlocked && !room.isCraftable;
            });
            const hasNewBathroomDecor = Object.keys(App.definitions.room_background).some(key => {
                const room = App.definitions.room_background[key];
                if(room.type !== 'bathroom') return false;
                const isUnlocked = 
                    room.unlockKey ? 
                    App.getRecord(room.unlockKey) : 
                    true;
                return room.isNew && isUnlocked && !room.isCraftable;
            });
            const hasNewAccessory = Object.keys(App.definitions.accessories).some(key => {
                const accessory = App.definitions.accessories[key];
                const isUnlocked = 
                    accessory.unlockKey ? 
                    App.getRecord(accessory.unlockKey) : 
                    true;
                return accessory.isNew && isUnlocked && !accessory.isCraftable;
            });
            const hasNewItem = Object.keys(App.definitions.item).some(key => {
                const isUnlocked = 
                    App.definitions.item[key].unlockKey ? 
                    App.getRecord(App.definitions.item[key].unlockKey) : 
                    true;
                return App.definitions.item[key].isNew && isUnlocked;
            });
            const hasNewFurniture = Object.keys(App.definitions.furniture).some(key => {
                const furniture = App.definitions.furniture[key];
                const isUnlocked = 
                    furniture.unlockKey ? 
                    App.getRecord(furniture.unlockKey) : 
                    true;
                return furniture.isNew && isUnlocked && !furniture.isCraftable;
            });

            const backFn = () => {
                if(App.temp.purchasedMallItem){
                    App.temp.purchasedMallItem = false;
                    App.closeAllDisplays();
                    Activities.receivePurchasedItems(() => App.handlers.open_activity_list(true));
                } else {
                    App.handlers.open_activity_list(true);
                }
            }

            App.displayList([
                {
                    name: `buy items ${hasNewItem ? App.getBadge('new!') : ''}`,
                    onclick: () => {
                        App.handlers.open_item_list(true);
                        return true;
                    }
                },
                {
                    name: `buy accessories ${hasNewAccessory ? App.getBadge('new!') : ''}`,
                    onclick: () => {
                        App.handlers.open_accessory_list({buyMode: true});
                        return true;
                    }
                },
                {
                    name: `redécor room ${hasNewMainDecor ? App.getBadge('new!') : ''}`,
                    onclick: () => {
                        const createFilterFn = (type) => {
                            return (e) => e.type === type && !e.isCraftable;
                        }
                        return App.displayList([
                            {
                                name: `main room ${hasNewMainDecor ? App.getBadge('new!') : ''}`,
                                onclick: () => {
                                    return App.displayList([
                                        {
                                            name: `Pre-furnished ${hasNewMainDecor ? App.getBadge('new!') : ''}`,
                                            onclick: () => App.handlers.open_room_background_list(false, createFilterFn()),
                                        },
                                        {
                                            name: `Customizable ${hasNewMainDecor ? App.getBadge('new!') : ''}`,
                                            onclick: () => App.handlers.open_room_background_list(true, createFilterFn())
                                        },
                                        {
                                            type: 'info',
                                            name: 'Place up to 5 furniture items of your choosing in customizable rooms.',
                                        },
                                    ])
                                }
                            },
                            {
                                name: `bathroom ${hasNewBathroomDecor ? App.getBadge('new!') : ''}`,
                                onclick: () => App.handlers.open_room_background_list(false, createFilterFn('bathroom')),
                            },
                            {
                                name: `kitchen ${hasNewKitchenDecor ? App.getBadge('new!') : ''}`,
                                onclick: () => App.handlers.open_room_background_list(false, createFilterFn('kitchen')),
                            }
                        ])

                    }
                },
                {
                    name: `Buy furniture ${hasNewFurniture ? App.getBadge('new!') : ''}`,
                    onclick: () => {
                        App.handlers.open_furniture_list();
                        return true;
                    }
                }
            ], backFn);
        },
        open_market_menu: function(){
            const backFn = () => {
                App.handlers.open_activity_list(true);
            }

            App.displayList([
                {
                    name: 'purchase food',
                    onclick: () => {
                        App.handlers.open_food_list({buyMode: true, filterType: 'food'});
                        return true;
                    }
                },
                {
                    name: 'purchase snacks',
                    onclick: () => {
                        App.handlers.open_food_list({buyMode: true, filterType: 'treat'});
                        return true;
                    }
                },
                {
                    name: 'purchase meds',
                    onclick: () => {
                        App.handlers.open_food_list({buyMode: true, filterType: 'med'});
                        return true;
                    }
                },
                {
                    name: `purchase seeds`,
                    onclick: () => {
                        App.handlers.open_seed_list(true);
                        return true;
                    }
                },
                {
                    name: `sell`,
                    onclick: () => {
                        App.handlers.open_sell_list();
                        return true;
                    }
                },
                {
                    name: `Shop stock changes daily, so check back often for new offers!`,
                    type: 'info',
                },
            ], backFn)
        },
        open_sell_list: function(){
            App.displayList([
                {
                    name: 'food',
                    onclick: () => {
                        App.handlers.open_food_list({sellMode: true});
                        return true;
                    }
                },
                {
                    name: 'You can sell special items (★) for more than the market price',
                    type: 'info',
                }
            ])
        },
        open_game_list: function(){
            const tutorialDisplayTime = 2000;
            const backFn = () => {
                App.handlers.open_activity_list(true);
            }
            App.displayList([
                {
                    name: `crop match`,
                    onclick: () => {
                        App.displayPopup(`Memorize the sequence of crops as they appear!`, tutorialDisplayTime, () => Activities.plantMatchingGame())
                        return false;
                    }
                },
                {
                    name: `pet grooming`,
                    onclick: () => {
                        App.displayPopup(`Press the wash icon <i class="fa-solid fa-hands-wash"></i> as much as possible before the timer runs out!`, tutorialDisplayTime, () => Activities.dogWashingGame())
                        return false;
                    }
                },
                {
                    name: `mimic`,
                    onclick: () => {
                        const imgPath = 'resources/img/ui/';
                        const images = `
                        <div class="flex justify-center">
                            <img src="${imgPath}facing_left.png"></img>
                            <img src="${imgPath}facing_center.png"></img>
                            <img src="${imgPath}facing_right.png"></img>
                        </div>
                        `
                        App.displayPopup(`Try to predict your opponents next stance ${images} and mimic them!`, tutorialDisplayTime, () => Activities.opponentMimicGame())
                        return false;
                    }
                },
                {
                    name: `catch`,
                    onclick: () => {
                        App.displayPopup(`Catch as much <img src="resources/img/misc/heart_particle_01.png"></img> while avoiding <img src="resources/img/misc/falling_poop.png"></img>`, tutorialDisplayTime, () => Activities.fallingStuffGame())
                        return false;
                    }
                },
                {
                    name: 'rod rush',
                    onclick: () => {
                        App.displayPopup(`Stop the pointer at the perfect time!`, tutorialDisplayTime, () => Activities.barTimingGame())
                        return false;
                    }
                },
                // {
                //     name: 'guess game (wip)',
                //     onclick: () => {
                //         // return Activities.guessGame();
                //     }
                // },
            ], backFn);
        },
        open_battle_screen: function(){
            Battle.start();
        },
        shell_button: function(){
            if(App.disableGameplayControls && App.gameplayControlsOverwrite){
                if(!App.haveAnyDisplays()){
                    App.gameplayControlsOverwrite();
                    App.vibrate();
                }
                return;
            }

            if(App.disableGameplayControls) return;

            let disallow = false;
            [...document.querySelectorAll('.display')].forEach(display => {
                if(!display.closest('.cloneables')){
                    if(display.classList.contains('popup')) disallow = true;
                    if(display.classList.contains('confirm')) disallow = true;
                    if(display.classList.contains('prompt')) disallow = true;
                }
            });

            if(disallow) return;

            App.setScene(App.scene.home);
            if(App.haveAnyDisplays()) App.closeAllDisplays();
            else App.handlers.open_main_menu();
            App.vibrate();
        },
        sleep: function(){
            App.pet.sleep();
            App.save();
        },
        clean: function(){
            // todo: this belongs in activities
            App.pet.stopMove();
            App.pet.triggerScriptedState('idle', App.INF, false, true);
            App.pet.x = 20;
            App.pet.y = App.scene.home.petY;
            App.toggleGameplayControls(false);
            Missions.done(Missions.TYPES.clean_room);

            const getDraggedWithMop = (object2d, size) => {
                if(object2d.x <= mop.x + mop.width){
                    object2d.x = mop.x + mop.width;
                    if(!object2d._dragStart){
                        object2d._dragStart = App.time;
                    }
                    object2d.setState?.(
                        App.time - object2d._dragStart < 500 
                        ? 'shocked'
                        : App.pet.stats.has_poop_out ? 'idle' : 'mild_uncomfortable'
                    );
                } else delete object2d._dragStart;
            }

            const poopObjects = App.drawer.selectObjects('poop');

            const mop = new Object2d({
                image: App.preloadedResources["resources/img/misc/cleaner.png"],
                x: -100,
                y: 0,
                z: 100,
                rotation: -90,
                width: 96, height: 96,
                onDraw: function(me){
                    Object2d.animations.flip(me);
                    this.x += 1;

                    getDraggedWithMop(App.pet, App.petDefinition.spritesheet.cellSize);
                    poopObjects.forEach(poop => getDraggedWithMop(poop));
                    App.spawnedAnimals?.forEach(animal => getDraggedWithMop(animal))

                    if(this.x >= mop.width/1.5){
                        me.hidden = true;
                        App.pet.setState('idle');

                        App.fadeScreen({
                            middleFn: () => {
                                App.pet.stopScriptedState();
                                App.drawer.removeObject(this);
                                App.toggleGameplayControls(true);
                                App.pet.x = '50%';
                                App.pet.playCheeringAnimationIfTrue(App.pet.stats.has_poop_out, () => {});
                                App.pet.stats.has_poop_out = false;
                                poopObjects.forEach(poop => poop.removeObject())
                                App.spawnedAnimals?.forEach(animal => animal.x = `${random(20, 80)}%`);
                            }
                        })
                    }
                }
            })
        },
    },
    toggleGameplayControls: function(state, onclick){
        App.disableGameplayControls = !state;
        App.gameplayControlsOverwrite = onclick;
        if(App.disableGameplayControls && !onclick){
            App.drawer.canvas.style.cursor = 'not-allowed';
        } else {
            App.drawer.canvas.style.cursor = 'pointer';
        }
        if(App.settings.classicMainMenuUI){
            if(state) document.querySelector('.classic-main-menu__container').classList.remove('disabled');
            else document.querySelector('.classic-main-menu__container').classList.add('disabled');
        }
        return;
    },
    getGameplayControlsState: function(){
        return {
            state: !App.disableGameplayControls,
            onclick: App.gameplayControlsOverwrite,
        }
    },
    createProgressbar: function(percent){
        let progressbar = document.querySelector('.cloneables .progressbar').cloneNode(true);

        let rod = progressbar.querySelector('.progressbar-rod'), background = progressbar.querySelector('.progressbar-background');

        let colors = {
            green: ['#04E762', '#93C48B'],
            red: ['#ED254E', '#ED254E'],
            yellow: ['#FDBA70', '#FF8300']
        }

        function setPercent(percent){
            rod.style.width = `${percent}%`;
            
            let colorSet = colors.green;
            if(percent < 30) colorSet = colors.red;
            else if(percent < 60) colorSet = colors.yellow;
            
            let rodColor = `linear-gradient(90deg, ${colorSet[0]}, ${colorSet[1]})`;
            rod.style.background = rodColor;

            background.style.background = `repeating-linear-gradient(90deg, ${colorSet[1]} 5px, ${colorSet[1]} 7px, transparent 6px, transparent 10px)`;
        }

        setPercent(percent);

        return {
            node: progressbar,
            setPercent
        }
    },
    createStepper: function(maxSteps, currentStep){
        const element = document.createElement('div');
        element.className = 'stepper';
        element.innerHTML = `
            ${
            new Array(maxSteps)
            .fill(undefined)
            .map((_, i) => `
                <div 
                    class="stepper__step ${i+1 <= currentStep ? "active" : ""}"
                >
                    <span class="stepper__text">
                    <i class="fa fa-solid fa-check"></i>
                    </span>
                </div>
            `).join('\n')
            }
        `

        return {node: element}
    },
    closeAllDisplays: function(){
        [...document.querySelectorAll('.display')].forEach(display => {
            if(!display.closest('.cloneables')){
                // display.close();
                if(display.close) display.close();
                else display.remove();
            }
        });
    },
    haveAnyDisplays: function(){
        return !![...document.querySelectorAll('.screen-wrapper .display')].length;
    },
    initTab: function(element){
        const tabs = element.querySelector('.tabs');
        if(!tabs) return;
        const tabTitles = [...element.querySelectorAll('.tab-title')];
        const tabContents = [...element.querySelectorAll('.tab')];
        tabTitles.forEach(tabTitle => {
            const forWhichElement = tabTitle.getAttribute('for');
            const correspondingContent = tabContents.find(t => t.id === forWhichElement);
            tabTitle.onclick = () => {
                [...tabTitles, ...tabContents].forEach(e => e.classList.remove('active'));
                tabTitle.classList.add('active');
                correspondingContent.classList.add('active');
            }
        })
        tabTitles.at(0).click();
    },
    displayList: function(listItems, backFn, backFnTitle){
        const list = UI.genericListContainer(backFn, backFnTitle);
        list._listItems = listItems;

        listItems.forEach((item, i) => {
            if(item._ignore) return;
            if(!item.name) item.name = '';

            let element;
            let defaultClassName;

            switch(item.type){
                case "empty":
                    element = document.createElement('p');
                    element.innerHTML = item.name;
                    defaultClassName = ``;
                    break;
                case "info":
                case "text":
                    element = document.createElement('p');
                    element.innerHTML = item.name;
                    defaultClassName = `inner-padding b-radius-10 uppercase list-text ${item.solid ? 'solid-' : ''}surface-stylized ${item.bold ? 'text-bold' : ''}`;
                    if(item.type === 'info'){
                        element.innerHTML = `
                            <small>
                                ${App.getIcon(item.icon || 'info-circle', true)}
                                ${item.name}
                            </small>
                        `;
                    }
                    break;
                case "separator":
                    element = document.createElement('hr');
                    defaultClassName = 'content-separator';
                    break;
                case 'element':
                    element = item.innerHTML;
                    defaultClassName = ``;
                    break;
                default:
                    element = document.createElement(item.link ? 'a' : 'button');
                    if(item.link){
                        element.href = item.link;
                        element.target = '_blank';
                    }
                    if(item.icon){
                        item.name = `<i class="fa-solid fa-${item.icon} corner-icon"></i> ${item.name}`
                    }
                    if(i == listItems.length - 2) element.className += ' last-btn';
                    // '⤳ ' + 
                    if(item.name.indexOf('<') == -1 && item.name.indexOf('/') == -1) item.name = ellipsis(item.name, item.ellipsisLength);
                    element.innerHTML = item.name;
                    element.disabled = item._disable;
                    element.style = `--child-index:${Math.min(i, 10) + 1}`;
                    element.onclick = () => {
                        UI.lastClickedButton = element;
                        let result = item.onclick(element, list);
                        if(!result){
                            list.close();
                        }
                    };
                    defaultClassName = 'generic-btn stylized';
            }

            element.className = defaultClassName + (item.class ? ' ' + item.class : '');

            if(item.style) element.style = item.style;
            if(item.id) element.id = item.id;

            item._mount?.(element);
            element._mount = () => item._mount?.(element);
            list.appendChild(element);
        })

        document.querySelector('.screen-wrapper').appendChild(list);
        
        return list;
    },
    displayGrid: function(listItems){
        let list = document.querySelector('.cloneables .generic-grid-container').cloneNode(true);

        list.close = function(){
            list.remove();
        }

        listItems.forEach(item => {
            let button = document.createElement('button');
                button.className = 'grid-item ' + (item.class ? item.class : '');
                button.innerHTML = item.name;
                button.onclick = () => {
                    let result = item.onclick(button, list);
                    if(!result){
                        list.close();
                    }
                };
            list.appendChild(button);
        });

        document.querySelector('.screen-wrapper').appendChild(list);

        return list;
    },
    display2xGrid: function(listItems){
        const list = document.querySelector('.cloneables .generic-grid-container').cloneNode(true);
        list.classList.add('flex-wrap', 'flex-gap-1');

        list.close = function(){
            list.remove();
        }

        listItems.forEach(item => {
            let button = document.createElement('button');
                button.className = 'grid-item-2x generic-btn stylized ' + (item.class ? item.class : '');
                button.innerHTML = item.name;
                button.onclick = () => {
                    let result = item.onclick(button, list);
                    if(!result){
                        list.close();
                    }
                };
            list.appendChild(button);
        });

        document.querySelector('.screen-wrapper').appendChild(list);

        return list;
    },
    displaySlider: function(listItems, activeIndex, options, additionalText){
        let list = document.querySelector('.cloneables .generic-slider-container').cloneNode(true);

        if(activeIndex !== 0 && !activeIndex){
            list.classList.add('menu-animation');
        }

        let maxIndex = listItems.length,
            currentIndex = Math.min(activeIndex, listItems.length - 1) || 0,
            contentElement = list.querySelector('.content'),
            acceptBtn = list.querySelector('#accept-btn'),
            cancelBtn = list.querySelector('#cancel-btn');

        list.close = function(){
            list.remove();
        }

        cancelBtn.innerHTML = options?.cancel || /* '<i class="fa-solid fa-arrow-left"></i>' || */ '<i class="fa-solid fa-arrow-left"></i>';
        acceptBtn.innerHTML = options?.accept || 'Accept';
        const defaultAcceptButtonLabel = acceptBtn.innerHTML;

        list.getCurrentIndex = () => currentIndex;

        cancelBtn.onclick = () => {
            options?.onCancel?.();
            list.close();
        }

        changeIndex = diff => {
            if(!diff) diff = 0;
            currentIndex += diff;
            if(currentIndex >= maxIndex) currentIndex = 0;
            else if(currentIndex < 0) currentIndex = maxIndex - 1;

            let item = listItems[currentIndex];
            let button = document.createElement('div');
                button.className = 'slider-item' + (item.class ? item.class : '');
                button.innerHTML = item.name;
                button.setAttribute('data-index', currentIndex);
                acceptBtn.innerHTML = item.acceptLabel || defaultAcceptButtonLabel;
                acceptBtn.disabled = item.disabled;
                acceptBtn.onclick = () => {
                    let result = item.onclick(button, list);
                    if(!result){
                        list.close();
                    }
                };
            
            let animationStart = diff < 0 ?  'slider-item-anim-in-left' : 'slider-item-anim-in-right';
            button.style.animation = `${diff ? animationStart : ''} 0.1s linear forwards`;

            contentElement.innerHTML = '';
            contentElement.appendChild(button);
        }

        list.querySelector('.slide-left').onclick = () => {
            contentElement.querySelector('.slider-item').style.animation = 'slider-item-anim-out-right 0.1s linear forwards';
            setTimeout(() => changeIndex(-1), 150);
        }
        list.querySelector('.slide-right').onclick = () => {
            contentElement.querySelector('.slider-item').style.animation = 'slider-item-anim-out-left 0.1s linear forwards';
            setTimeout(() => changeIndex(1), 150);
        }

        if(additionalText){
            list.querySelector('.additional-text').innerHTML = additionalText;
        } else list.querySelector('.additional-text').remove();

        if(maxIndex === 1){
            list.querySelector('.slide-left').classList.add('disabled');
            list.querySelector('.slide-right').classList.add('disabled');
        }

        changeIndex();

        document.querySelector('.screen-wrapper').appendChild(list);

        return list;
    },
    displayMessageBubble: function(content, icon = ''){
        let splitContent = content;
        if(!containsHtmlTags(content)){
            splitContent = content.split('')
                .map((letter, index) => `<span style="animation-delay: ${index * 0.05}s">${letter}</span>`)
                .join('');
        }
        const display = App.displayEmpty('bg-transparent pointer-events-none');
        display.close = () => {
            UI.fadeOut(display.querySelector('.message-bubble'));
            setTimeout(() => display.remove(), 1000);
        }

        const iconContent = !icon ? '' : `<div class="message-bubble_icon">${icon}</div>`;

        display.innerHTML = `<div class="message-bubble">${iconContent}${splitContent}</div>`
        display.classList.remove('display')
        return display;
    },
    displayPopup: function(content, ms, onEndFn, isReveal){
        let popup = document.querySelector('.cloneables .generic-list-container').cloneNode(true);
            popup.classList.add('popup');
            if(isReveal) popup.classList.add('revealing');
            popup.innerHTML = `
                <div class="uppercase flex-center">
                    <div class="inner-padding b-radius-10 surface-stylized">
                        ${content}
                    </div>
                </div>
            `;
            popup.style['z-index'] = 3;
            popup.style['background'] = 'var(--background-c)';
            popup.close = () => {
                popup.remove();
                if(onEndFn){
                    onEndFn();
                }
            }
        UI.attachScrollableIndicator(popup)
        setTimeout(() => {
            popup.close();
        }, ms || 2000);
        document.querySelector('.screen-wrapper').appendChild(popup);
        return popup;
    },
    displayConfirm: function(text, buttons){
        let list = document.querySelector('.cloneables .generic-list-container').cloneNode(true);
            list.classList.add('confirm', 'inline-flex-between');
            list.innerHTML = `
                <div class="uppercase flex-center flex-1 height-auto">
                    <div class="inner-padding b-radius-10 surface-stylized">
                        ${text}
                    </div>
                </div>
                <div class="buttons-container"></div>
            `;
            list.style['z-index'] = 3;
            list.style['background'] = 'var(--background-d)';
            
            list.close = function(){
                list.remove();
            }
        UI.attachScrollableIndicator(list)

        const btnContainer = list.querySelector('.buttons-container');
        buttons.forEach(def => {
            if(def._ignore) return;

            const btn = document.createElement(def.link ? 'a' : 'button');
            if(def.link){
                btn.href = def.link;
                btn.target = '_blank';
            }
            btn.innerHTML = def.name;
            btn.className = `generic-btn stylized ${def.class || ''}`;
            btn.disabled = def._disable;
            if(def.name == 'back') btn.className += ' back-btn';
            btn.onclick = () => {
                if(!def.onclick()) list.close();
            }
            btnContainer.appendChild(btn);
        });

        document.querySelector('.screen-wrapper').appendChild(list);
        return list;
    },
    displayPrompt: function(text, buttons, defaultValue){
        let list = document.querySelector('.cloneables .generic-list-container').cloneNode(true);
            list.classList.add('prompt');
            list.innerHTML = `
                <div class="uppercase flex-center">
                    <div class="inner-padding b-radius-10 surface-stylized">
                        ${text}
                    </div>
                </div>
                <div class="buttons-container"></div>
            `;
            list.style['z-index'] = 3;
            
            list.close = function(){
                list.remove();
            }
        UI.attachScrollableIndicator(list);
            
        const btnContainer = list.querySelector('.buttons-container');

        let input = document.createElement('input');
            input.setAttribute('spellcheck', false);
        if(defaultValue !== undefined) input.value = defaultValue;

        list.insertBefore(input, btnContainer);

        buttons.forEach(def => {
            if(def._ignore) return;

            const btn = document.createElement('button');
            btn.innerHTML = def.name;
            btn.className = `generic-btn stylized ${def.class || ''}`;
            btn.onclick = () => {
                if(!def.onclick(input.value)) list.close();
            }
            btnContainer.appendChild(btn);
        });

        document.querySelector('.screen-wrapper').appendChild(list);
        input.focus();
        return list;
    },
    displayEmpty: function(addClass){
        let display = document.querySelector('.cloneables .generic-empty-container').cloneNode(true);
        if(addClass) display.className += ' ' + addClass;
        document.querySelector('.screen-wrapper').appendChild(display);
        display.close = function(){
            display.remove();
        }
        return display;
    },
    displayUiModal: function(content){
        let modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = content;
        document.body.appendChild(modal);
    },
    getBadge: function(text, color, expirationDate){
        if(!text && text !== '') text = 'new!';
        if(!color) color = 'red';

        if(expirationDate){
            if(moment(expirationDate).isBefore(moment())) return '';
        }

        return `<span class="badge ${color}">${text}</span>`;
    },
    drawUI: function(){
        App.drawer.drawImmediate({
            x: 5,
            y: 50,
            width: 25,
            height: 25,
            // image: "resources/img/background/house/kitchen_01.png",
            text: 'HEY',
        })
    },
    initSound: function(){
        // audio channel
        try {
            this.audioChannel = new AudioChannel({
                preloadList: SOUNDS
            });
        } catch(e) {}

        // button click event
        const clickSoundClassNames = ['click-sound', 'list-item', 'tab-title'];
        const backSoundClassNames = ['back-btn', 'back-sound'];
        document.addEventListener('click', (e) => {

            // sfx
            if(clickSoundClassNames.some(n => e.target.classList.contains(n)) || e.target.nodeName.toLowerCase() === 'button' || e.target.parentElement?.nodeName.toLowerCase() === 'button'){
                App.vibrate();
                if(backSoundClassNames.some(n => e.target.classList.contains(n)) || e.target.textContent.toLowerCase() == 'back')
                    this.playSound(`resources/sounds/ui_click_02.ogg`, true);
                else
                    this.playSound(`resources/sounds/ui_click_01.ogg`, true);
            }

            // menu animation
            if(e.target.classList.contains('back-btn') || e.target.parentElement?.classList.contains('back-btn')){
                const previousListItem = [...document.querySelectorAll('.screen-wrapper .generic-list-container')].at(-1);
                if(previousListItem){
                    previousListItem.transitionAnim?.();
                    [...previousListItem.children].forEach(child => child?._mount?.(child));
                }
                UI.lastClickedButton = null;
            }
        })
    },
    formatTo12Hours: function(hour){
        return hour > 12 ? hour - 12 + 'pm' : hour + 'am';
    },
    getDayId: function(forCurrentUser){
        if(forCurrentUser){
            return +(
                App.getDayId() + (App.userId || 1234)
            ).toString().slice(0, 10);
        }

        const date = new Date();
        return +`${date.getFullYear()}${date.getMonth()}${date.getDate() + 2}`;
    },
    isSalesDay: function(){
        let day = new Date().getDate();
        return [7, 12, 18, 20, 25, 29, 30].includes(day);
    },
    isDuringChristmas: function(){
        return moment().isBetween(
            moment(App.constants.CHRISTMAS_TIME.start, 'MM-DD'),
            moment(App.constants.CHRISTMAS_TIME.end, 'MM-DD'),
            null, '[]');
    },
    isChristmasDay: function(){
        return moment().isSame(
            moment(App.constants.CHRISTMAS_TIME.absDay, 'MM-DD'), 
            'day');
    },
    isSleepHour: function(hour = new Date().getHours()){
        return App.isWithinHour(
            hour,
            App.constants.SLEEP_START + App.settings.sleepingHoursOffset,
            App.constants.SLEEP_END + App.settings.sleepingHoursOffset
        );
    },
    isWithinHour: function(current, start, end){
        start = App.clampWithin24HourFormat(start);
        end = App.clampWithin24HourFormat(end);
        current = App.clampWithin24HourFormat(current);
        if (start <= end) {
            return current >= start && current < end;
        } else {
            return current >= start || current < end;
        }
    },
    getOutOfStockCounter: (seed = random(1, 999999999)) => {
        pRandom.save();
        pRandom.seed = seed;
        const randomArray = new Array(100).fill(50).map(() => pRandom.getIntBetween(0, 100)).reverse();
        pRandom.load();
        let pointer = 0;

        const isOutOfStock = (percent) => {
            pointer += 1;
            if(pointer >= randomArray.length) pointer = 0;
            return (randomArray.at(pointer) || 50) < percent;
        }

        return isOutOfStock;
    },
    clampWithin24HourFormat: function(hour){
        return ((hour % 24) + 24) % 24;
    },
    getFoodCSprite: function(index){
        const {FOOD_SPRITESHEET_DIMENSIONS, FOOD_SPRITESHEET} = App.constants;
        const size = 
            FOOD_SPRITESHEET_DIMENSIONS.rows 
                * FOOD_SPRITESHEET_DIMENSIONS.cellSize;
        return `<c-sprite 
            naturalWidth="${size}" 
            naturalHeight="${size}" 
            width="${FOOD_SPRITESHEET_DIMENSIONS.cellSize}" height="${FOOD_SPRITESHEET_DIMENSIONS.cellSize}" 
            index="${(index - 1)}"
            src="${FOOD_SPRITESHEET}"></c-sprite>`;
    },
    getItemCSprite: function(index){
        const {ITEM_SPRITESHEET_DIMENSIONS, ITEM_SPRITESHEET} = App.constants;
        const size = 
            ITEM_SPRITESHEET_DIMENSIONS.rows 
                * ITEM_SPRITESHEET_DIMENSIONS.cellSize;
        return `<c-sprite 
            naturalWidth="${size}" 
            naturalHeight="${size}" 
            width="${ITEM_SPRITESHEET_DIMENSIONS.cellSize}" 
            height="${ITEM_SPRITESHEET_DIMENSIONS.cellSize}" 
            index="${(index - 1)}" 
            src="${ITEM_SPRITESHEET}"></c-sprite>`
    },
    getAccessoryCSprite: function(name){
        const current = App.definitions.accessories[name];
        const image = App.checkResourceOverride(current.icon || current.image);
        return current.icon
            ? `<div style="width: 1"><img style="width: 36px; outline: none" src="${image}"></img></div>`
            : `<c-sprite width="64" height="36" index="0" src="${image}"></c-sprite>`;
    },
    getGenericCSprite: function(index, spritesheet, dimensions, className = '', additional = ''){
        const size = dimensions.rows * dimensions.cellSize;
        return `<c-sprite 
            naturalWidth="${size}" 
            naturalHeight="${size}" 
            width="${dimensions.cellSize}" 
            height="${dimensions.cellSize}" 
            index="${(index - 1)}" 
            class="${className}"
            src="${spritesheet}"
            ${additional}></c-sprite>`;
    },
    getPersona: function(name, image){
        return `
            <img style="height: inherit; width: 32px; object-fit: contain; margin-right: 10px" src="${image}"></img>
            <span class="overflow-hidden ellipsis">${name}<span>
        `
    },
    getHarvestIcons: function(plantNameList, delimiter = ' + ', disabledClassName = '') {
        return plantNameList.map(plantName => {
            const hasInInventory = App.pet.inventory.harvests[plantName]
            return Plant.getCSprite(plantName, undefined, hasInInventory ? 'enabled' : disabledClassName);
        }).join(delimiter);
    },
    getHarvestInventoryUI: function(filterFn = () => true){
        const harvestsToShow = Object.keys(App.pet.inventory.harvests)
            .map(name => ({amount: App.pet.inventory.harvests[name], name, def: Plant.getDefinitionByName(name)}) )
            .filter(item => item.amount)
            .filter(filterFn);

        if(!harvestsToShow.length){
            return App.getEmptyStateUI('Empty inventory');
        }

        return `
        ${harvestsToShow
            .map(item => `<div onclick="App.displayPopup('${item.name} <div><b>x${item.amount}</b></div>')" class="flex align-center flex-gap-05">${Plant.getCSprite(item.name)} <span><small>x</small>${item.amount}</span></div>`)
            .join('')}
        `
    },
    getEmptyStateUI: function(text, icon = 'fa-ghost'){
        return `<small class="flex-center width-full flex-gap-05 opacity-half">
            <i class="fa-solid ${icon}"></i>
            <i>${text}</i>
        </small>`;
    },
    getUidUI: () => {
        const UID = App.userName 
            ? `${(App.userName ?? '') + '-' + App.userId?.toString().slice(0, 5)}` 
            : '';
        const isClipboardAvailable = "clipboard" in navigator && !App.isOnItch && UID;
        return `
            <div class="user-id surface-stylized inner-padding text-transform-none">
                <div class="flex flex-dir-col">
                    <small>uid:</small>
                    <span>${UID}</span>
                </div>
                <small onclick="App.handlers.copyToClipboard('${UID}')" class="${isClipboardAvailable ? 'flex' : 'hidden'} justify-end"> 
                    <button class="generic-btn stylized uppercase" id="copy-btn"> 
                        <i class="fa-solid fa-copy"></i>
                    </button> 
                </small>
            </div>
        `;
    },
    isCompanionAllowed: function(room){
        if(!room) room = App.currentScene;

        const allowedScenes = [
            App.scene.home, 
            App.scene.bathroom, 
            App.scene.kitchen,
            App.scene.graveyard,
            App.scene.parentsHome,
        ];

        return allowedScenes.includes(room);
    },
    getRandomGameplayBuff () {
        return randomFromArray(Object.values(App.definitions.gameplay_buffs)).key;
    },
    isGameplayBuffActive: (buffKey) => {
        // currently only check for animals
        // but we can reuse the same method for other buff sources
        const hasBuff = App.animals.list.some(a => a.stats.buff === buffKey);
        return hasBuff;
    },
    getGameplayBuffDefinitionFromKey: (buffKey) => {
        return App.definitions.gameplay_buffs[buffKey];
    },
    getGameplayBuffUI: (buff) => {
        if(typeof buff === 'string') buff = App.getGameplayBuffDefinitionFromKey(buff);

        const getTypeUI = () => {
            let color = '';
            switch(buff.type){
                case 'garden': color = 'green'; break;
            }
            return `<span style="color: ${color}"> <i class="fa-solid fa-arrow-circle-up icon"></i> ${buff.type}</span> Buff`;
        }

        return `
            <div class="font-small flex flex-dir-col gameplay-buff-container">
                <div style="opacity: 0.75;"> ${getTypeUI()} </div>
                <b style="color: #3d00ff"> ${buff.name}</b>
                <i>${buff.description}</i>
            </div>
        `;
    },
    playSound: function(path, force){
        if(!App.settings.playSound) return;

        this.audioChannel?.play(path, force);
    },
    playAdvancedSound: function(config){
        const audioElement = new Audio();
        Object.keys(config).map(key => audioElement[key] = config[key]);
        audioElement.play();
        audioElement.muted = !App.settings.playSound || !App.settings.playMusic;

        if(config.loopTime){
            audioElement.addEventListener('timeupdate', () => {
                if (audioElement.currentTime >= config.loopTime) {
                    audioElement.currentTime = 0;
                    audioElement.play();
                }
            })
        }

        return {
            element: audioElement,
            stop: () => {
                const fadeOutEvent = App.registerOnDrawEvent(() => {
                    const volume = audioElement.volume - (0.0005 * App.deltaTime)
                    audioElement.volume = clamp(volume, 0, 1);
                    if(audioElement.volume <= 0){
                        audioElement.pause();
                        App.unregisterOnDrawEvent(fadeOutEvent);
                    }
                })
            }
        };
    },
    handleSequentiallyLoad: async function(loaders){
        const isValid = (data) => Boolean(data?.lastTime && data.pet?.name);
        let mainData;
        try {
            for (const loader of loaders) {
                const data = await loader();
                if(!mainData) mainData = data; // first loader is main data
                if(data.hasLoadError) throw 'LoadError7520';
                if (isValid(data)) return data;
            }
        } catch(e) {
            const _save = App.save;
            App.save = () => {};
            const display = App.displayConfirm(`${App.getIcon('warning')} Something went wrong when trying to initialize the load system.`, [
                {
                    name: 'Reload',
                    class: 'back-btn',
                    onclick: () => {
                        window.location.reload();
                        return true;
                    }
                },
                {
                    name: 'Continue (Unsafe)',
                    onclick: () => {
                        return App.displayConfirm(`You might lose your progress if you continue!`, [
                            {
                                name: 'Continue',
                                onclick: () => {
                                    App.save = _save;
                                    display.close();
                                    return false;
                                }
                            },
                            {
                                name: 'Cancel',
                                class: 'back-btn',
                                onclick: () => {}
                            }
                        ])
                    }
                },
                {
                    name: 'View Error',
                    onclick: () => {
                        return App.displayConfirm(e, [
                            {
                                name: 'ok', 
                                onclick: () => {}
                            }
                        ])
                    }
                }
            ])
            console.error(e)
            App.sendAnalytics('LoaderError', `${e} - ${navigator?.userAgent}`);
            UI.fadeOut(document.querySelector('.loading-text'));
        }

        return mainData;
    },
    save: function(noIndicator){
        if(!App.pet || !App.loadingEnded) return;

        const timeElapsedSinceLastSave = App.time - (App.temp.lastSaved ?? 0);
        if(noIndicator && timeElapsedSinceLastSave < (App.constants.AUTO_SAVE_INTERVAL_SECS / 2) * 1000){
            return;
        }

        App.temp.lastSaved = Infinity; // prevent re-saving until save is complete
        const localStorageItemKeys = [
            'user_name', 
            'user_id', 
            'pet', 
            'records', 
            'ingame_events_history', 
            'missions',
            'furniture',
            'plants',
            'animals',
            'play_time',
            'last_time',
        ];

        let savingData = [];
        const setItem = (key, value) => {
            savingData = [...savingData, [key, value]];

            if(localStorageItemKeys.includes(key)){
                window.localStorage?.setItem(key, JSON.stringify(value))
            }
        }

        setItem('pet', App.pet.serializeStats());
        setItem('settings', (App.settings));
        setItem('last_time', Date.now());
        setItem('user_id', App.userId);
        setItem('user_name', App.userName);
        setItem('ingame_events_history', (App.gameEventsHistory));
        setItem('play_time', App.playTime);
        setItem('shell_background_v2.1', App.shellBackground);
        setItem('mods', (App.mods));
        setItem('records', (App.records));
        setItem('room_customization', ({
            home: {
                image: App.scene.home.image,
            },
            bathroom: {
                image: App.scene.bathroom.image,
            },
            kitchen: {
                image: App.scene.kitchen.image
            }
        }))
        setItem('missions', ({
            current: Missions.current,
            currentStep: Missions.currentStep,
            currentPts: Missions.currentPts,
            refreshTime: Missions.refreshTime
        }))
        setItem('furniture', App.ownedFurniture);
        setItem('plants', App.plants);
        setItem('animals', {
            ...App.animals,
            list: [
                ...App.animals.list.map(a => a.serialize())
            ]
        });

        if(!noIndicator){
            const saveIcon = document.querySelector('.save-indicator');
            saveIcon.style.display = '';
            setTimeout(() => saveIcon.style.display = 'none', 2000);
        }

        if(!savingData?.length) {
            App.sendErrorLog(`savingData-no-length: ${savingData?.length}`);
            return;
        }
        window.idbKeyval?.setMany(savingData)
            .then(() => App.temp.lastSaved = App.time)
            .catch((e) => {
                setTimeout(() => App.temp.lastSaved = App.time, 5000);
                App.sendErrorLog(`idbKeyval-setMany: ${e}`);
            });
    },
    load: async function() {
        let hasLoadError = false;
        const getLocalStorageItem = (key) => {
            const item = window.localStorage?.getItem(key);
            try {
                const json = JSON.parse(item);
                return json;
            } catch(e) {}
            return false;
        }
        const getItem = async (key, defaultValue) => {
            if(!window.idbKeyval) {
                hasLoadError = true;
                return defaultValue;
            }
            const value = await window.idbKeyval.get(key);
            const fallbackValue = getLocalStorageItem(key);
            if(fallbackValue && !value){
                console.log('save data fallback', {key, value, fallbackValue})
            }
            return value !== null && value !== undefined 
                ? value 
                : fallbackValue || defaultValue;
        }
    
        const pet = await getItem('pet', {});
        const settings = await getItem('settings', null);
        const lastTime = await getItem('last_time', false);
        const eventsHistory = await getItem('ingame_events_history', null);
        const roomCustomizations = await getItem('room_customization', null);
        const mods = await getItem('mods', App.mods);
        const records = await getItem('records', App.records);
    
        const userId = await getItem('user_id', random(100000000000, 999999999999));
        App.userId = userId;
    
        const userName = await getItem('user_name', null);
        App.userName = userName === 'null' ? null : userName;
    
        App.playTime = parseInt(await getItem('play_time', 0), 10);
    
        const shellBackground = await getItem('shell_background_v2.1', 
            App.definitions.shell_background.find(shell => shell.isDefault).image ||
            App.definitions.shell_background[1].image);
    
        const missions = await getItem('missions', {});
        const furniture = await getItem('furniture', false);
        const plants = await getItem('plants', App.plants);
        const animals = await getItem('animals', App.animals);

        App.loadedData = {
            pet,
            settings,
            lastTime,
            eventsHistory,
            roomCustomizations,
            shellBackground,
            playTime: App.playTime,
            mods,
            records,
            missions,
            furniture,
            plants,
            animals,
            hasLoadError
        };
    
        return App.loadedData;
    },
    getDBItems: async function(){
        const entries = await window.idbKeyval.entries();
        return entries.reduce((acc, [key, value]) => acc = {...acc, [key]: value}, {});

        const keys = await window.idbKeyval.keys();
        const items = {};

        for (const key of keys) {
            items[key] = await window.idbKeyval.get(key);
        }
    
        return items;
    },
    loadFromJson: async function(json, callbackFn){
        const ignoreKeys = [
            'user_name',
            'user_id',
            'play_time',
            'last_time',
            'mods',
            'shell_background_v2.1',
        ]
        App.save();
        App.save = () => {};

        // handle animals to update their lastStatsUpdate time to now
        json.animals?.list?.forEach(a => {
            a.lastStatsUpdate = Date.now();
        });

        // handle auto-age on by resetting last birthday
        if(json.pet){
            json.pet.birthday = Date.now();
        }

        for(let key of Object.keys(json)){
            if(ignoreKeys.includes(key)) continue;
            await window.idbKeyval.set(key, json[key]);
        }
        const allowedKeys = [...Object.keys(json), ...ignoreKeys];
        const currentKeys = await window.idbKeyval.keys();
        for(let key of currentKeys){
            if(!allowedKeys.includes(key)){
                await window.idbKeyval.del(key);
            }
        }

        callbackFn?.();
    },
    getSaveCode: async function(providedStorage){
        const storage = providedStorage ?? await App.getDBItems();
        const serializableStorage = Object.assign({}, storage);
        const unserializableAttributes = ['shell_background_v2.1', 'mods'];
        unserializableAttributes.forEach(attribute => delete serializableStorage[attribute]);
        const charCode = `save:${btoa(encodeURIComponent(JSON.stringify(serializableStorage)))}:endsave`;
        return charCode;
    },
    exportSaveCode: async function(providedCode){
        const loadingPopup = App.displayPopup('loading...');
        const code = providedCode ?? await App.getSaveCode();
        loadingPopup.close();
        downloadTextFile(`${App.petDefinition.name}_${generateTimestamp()}.tws`, code);
    },
    vibrate: function(dur, force){
        if(!App.settings.vibrate && !force) return;
        if(!navigator?.vibrate) return;
        navigator?.vibrate(dur || 35);
    },
    sendAnalytics: function(type, value, force){
        if(!force && App.ENV !== 'prod') return;

        if(!type) type = 'default';

        rudderanalytics.track(
            type, {value},
        );

        if(App.isOnItch) type += '_itch';
        else if(App.isOnElectronClient) type += '_electron';

        const user = (App.userName ? App.userName + '-' : '') + App.userId;
        const url = `https://docs.google.com/forms/d/e/1FAIpQLSfzl5hhhnV3IAdxuA90ieEaeBAhCY9Bh4s151huzTMeByMwiw/formResponse?usp=pp_url&entry.1384465975=${user}&entry.1653037117=${App.petDefinition?.name || ''}&entry.1322693089=${type}&entry.1403809294=${value || ''}`;

        fetch(url).catch(e => {});
    },
    sendFeedback: function(text){
        if(!text) return;

        const sendingText = `[game:${VERSION}-pl:${App.isOnItch ? 'itch' : 'web'}]: ${text}`;

        const user = (App.userName ? App.userName + '-' : '') + App.userId;
        const url = `https://docs.google.com/forms/d/e/1FAIpQLSenonpIhjHL8BYJbnOHqF2KudJiDciEveJG56BdGsvJ01-rTA/formResponse?usp=pp_url&entry.1753365981=${user}&entry.233513152=${sendingText}`;
        fetch(url).catch(e => {});
    },
    sendErrorLog: function(error, force){
        if(!force && App.ENV !== 'prod') return;

        if(!error) return;

        if(App.fullTime - App.temp.lastErrorSent < App.constants.ONE_SECOND * 30){
            return;
        }
        App.temp.lastErrorSent = App.fullTime;

        window?.Sentry?.captureException(error, {
            username: App.userName,
            userId: App.userId,
        });

        const versionInfo = `[game:${VERSION}-pl:${App.isOnItch ? 'itch' : 'web'}]`;
        const user = (App.userName ? App.userName + '-' : '') + App.userId;
        const url = `https://docs.google.com/forms/d/e/1FAIpQLScSloIis4P1yyKQ3imYcaipOk2XS12Qj16ZeM4DicTHi3RSCQ/formResponse?usp=pp_url&entry.1957124188=${user}&entry.1587672397=${`${versionInfo} - ${navigator?.userAgent}`}&entry.36658531=${error}`
        fetch(url).catch(e => {});
    },
    installAsPWA: function() { 
        if(!App.deferredInstallPrompt) return false;
        App.deferredInstallPrompt.prompt();
        App.deferredInstallPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                App.sendAnalytics('pwa_install', navigator?.userAgent);
            } else {
                App.sendAnalytics('pwa_install_cancel', navigator?.userAgent);
            }
        });
    },
    setShellBackground: function(url){
        if(!url) return;
        document.querySelector("body > div.root > div.dom-shell").style.backgroundImage = `url(${url})`;
        document.querySelector(".background").style.backgroundImage = `url(${url})`;
        App.shellBackground = url;

        document.querySelector('.shell-btn.main').style.backgroundImage = `url(${App.shellBackground})`;
        document.querySelector('.shell-btn.right').style.backgroundImage = `url(${App.shellBackground})`;
        document.querySelector('.shell-btn.left').style.backgroundImage = `url(${App.shellBackground})`;
        return true;
    },
    addNumToObject: function(obj, key, amount){
        if(!obj[key]) obj[key] = amount;
        else obj[key] += amount;
    },
    pay: function(amount){
        if(App.pet.stats.gold < amount){
            App.displayPopup(`Don't have enough money!`);
            return false;
        }
        App.pet.stats.gold -= amount;
        return true;
    },
    getPreciseTimeFromNow: (time) => {
        const duration = moment.duration(moment(time).diff(moment()));
    
        const hours = Math.floor(duration.asHours());
        const minutes = Math.floor(duration.asMinutes()) % 60;
    
        if (hours > 0) {
            return `${hours} hour${hours !== 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}`;
        } else {
            return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
        }
    },
    useWebcam: function(callback, facingMode, shutterDelay){
        if(!facingMode) facingMode = 'environment';

        const gameplayControlsState = App.getGameplayControlsState();
        App.toggleGameplayControls(false);

        let openStream;

        function unloadWebcam(){
            App.toggleGameplayControls(gameplayControlsState.state, gameplayControlsState.onclick);
            openStream?.getTracks().forEach(function(track) {
                track.stop();
            });
            videoContainer.remove();
        }

        function close(data){
            if(callback) callback(data);
            unloadWebcam();
        }

        function showError(){
            App.displayConfirm(`Can't load the camera on this device`, [
                {
                    name: 'back',
                    onclick: () => {
                        close(-1);
                    }
                }
            ])
        }

        if(!navigator?.mediaDevices) return showError();

        const videoContainer = document.querySelector('.webcam-container').cloneNode(true);

        const videoElement = videoContainer.querySelector('.webcam-video');
        const webcamButton = videoContainer.querySelector('#webcam-button');
        const webcamChangeButton = videoContainer.querySelector('#webcam-change-button');
        const canvas = document.createElement('canvas');

        document.querySelector('.screen-wrapper').appendChild(videoContainer);

        videoElement.onplaying = () => {
            webcamButton.style.display = 'initial';
        }

        webcamButton.onclick = () => {
            webcamButton.disabled = true;
            videoElement.pause();
            videoElement.classList.add('taken');

            const context = canvas.getContext("2d");
            canvas.width = document.querySelector('.screen-wrapper').clientWidth;
            canvas.height = document.querySelector('.screen-wrapper').clientHeight;
            context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            const data = canvas.toDataURL("image/png");

            setTimeout(() => {
                close(data);
            }, (shutterDelay || 250));
        }

        webcamChangeButton.onclick = () => {
            unloadWebcam();
            // videoContainer.remove();
            App.useWebcam(callback, facingMode == 'user' ? 'environment' : 'user');
        }

        navigator?.mediaDevices
            .getUserMedia({
                // video: true,
                video: {
                    facingMode: facingMode
                }
                // audio: true,
            })
            .then((stream) => {
                openStream = stream;
                videoElement.srcObject = stream;
                videoElement.addEventListener("loadedmetadata", () => {
                    videoElement.play();
                });
            })
            .catch(() => {
                videoContainer.remove();
                showError();
            });
    },
    createNotification: function(title, body){
        if(!App.settings.notifications) return false;

        const options = {
          body: body,
          icon: `android-icon-48x48.png`,
        }
        new Notification(title, options);
    },
    checkPetStats: function(){
        if(!App.isTester()) return setTimeout(() => App.checkPetStats(), 10000);

        console.log('checking pet stat');
        App.createNotification('this is on testing interval', `Hello my name is ${Math.random()}`)
        setTimeout(() => {
            App.checkPetStats()
        }, 10000)
    },
    getEncodedInputCode: (code) => {
        const encoded = `${App.constants.INPUT_BASE_64}${btoa(code)}`;
        return encoded;
    },
    getIcon: function(iconName, noRightMargin, color){
        if(iconName.startsWith('special:')){
            const iconDef = App.definitions.icons[iconName.replace('special:', '')];
            return App.getIcon(iconDef.icon, noRightMargin, iconDef.color);
        }
        const style = `${!noRightMargin ? 'margin-right:10px;' : ''}${color ? `color:${color};` : ''}`;
        return `<i class="fa-solid fa-${iconName}" style="${style}"></i>`
    },
    wait: function(ms = 0){
        return new Promise(resolve => setTimeout(resolve, ms))
    },
    fadeScreen: function({ middleFn, endFn, speed = 0.005 } = {}) {
        let phase = 'fadeIn';
        new Object2d({
            image: App.getPreloadedResource('resources/img/misc/black_overlay_01.png'),
            opacity: 0,
            x: 0, y: 0, z: 100,
            onDraw: (me) => {
                const step = speed * App.deltaTime;

                if (phase === 'fadeIn') {
                    me.opacity += step;
                    if (me.opacity >= 1.75) {
                        me.opacity = 1.75;
                        middleFn?.();
                        phase = 'fadeOut';
                    }
                } else if (phase === 'fadeOut') {
                    me.opacity -= step;
                    if (me.opacity <= 0) {
                        endFn?.();
                        me.removeObject();
                    }
                }
            }
        });
    },
    apiService: {
        ENDPOINT: 'https://script.google.com/macros/s/AKfycbxCa6Yo_VdK5t9T7ZCHabxT1EY-xACEC3VUDHgkkwGdduF2U5VMGlp0KXBu9CtE8cWv9Q/exec',
        ENDPOINT_TEST: 'https://script.google.com/macros/s/AKfycbzvoH9j7Ia0Zc_dCBXXYI6dB9UlUR_tGGr1J5Gsu2DG/dev',
        _getUid: () => {
            return App.userName + '-' + App.userId;
        },
        sendRequest: async (params, handler) => {
            return new Promise((resolve, reject) => {
                fetch(`${App.apiService.ENDPOINT}?${params.toString()}`)
                .then(response => response.json())
                .then(json => {
                    const handledResult = handler?.(json, false)
                    resolve(handledResult ?? json);
                })
                .catch(e => {
                    const handledResult = handler?.(e, true)
                    resolve(handledResult ?? {error: e})
                })
            })
        },
        addPetDef: (petDef) => {
            const params = new URLSearchParams({
                action: 'addPetDef',
                userId: App.apiService._getUid(),
                data: JSON.stringify({
                    name: App.petDefinition.name,
                    sprite: App.petDefinition.sprite,
                    accessories: App.petDefinition.accessories,
                    is_ghost: App.petDefinition.stats.is_ghost !== 0 
                        ? App.petDefinition.stats.is_ghost 
                        : undefined,
                })
            });
            return App.apiService.sendRequest(params);
        },
        getPetDef: (userId) => {
            if(!userId) userId = App.apiService._getUid();
            const params = new URLSearchParams({
                action: 'getPetDef',
                userId: userId,
            });
            return App.apiService.sendRequest(params);
        },
        getRandomPetDefs: (amount) => {
            const params = new URLSearchParams({
                action: 'getRandomPetDefs',
                amount: amount ?? 10,
            });
            const handler = (json, error) => {
                if(error) return false;
                if(json){
                    return json.data
                    .filter(petDef => petDef.owner != App.userName)
                    .map(petDef =>
                        new PetDefinition({
                            ...petDef,
                            name: profanityCleaner.clean(sanitize(petDef.name)),
                            owner: profanityCleaner.clean(sanitize(petDef.owner)),
                            sprite: sanitize(petDef.sprite),
                            ownerId: petDef.ownerId,
                            interactions: petDef.interactions,
                        }).setStats({
                            is_ghost: petDef.is_ghost || 0,
                        })
                    );
                }
            }
            return App.apiService.sendRequest(params, handler);
        },
        addInteraction: (ownerId) => {
            const params = new URLSearchParams({
                action: 'addUserInteraction',
                ownerId,
                interactingUserId: App.apiService._getUid(),
            });
            return App.apiService.sendRequest(params);
        }
    }
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    App.deferredInstallPrompt = e;

    const showInstallPrompt = () => {
        App.addEvent(`pwa_install_notice_01`, () => {
            App.displayConfirm(`Do you want to install <b>Tamaweb</b> as an app?`, [
                {
                    name: 'install',
                    onclick: () => {
                        App.installAsPWA();
                    }
                },
                {
                    name: 'cancel',
                    class: 'back-btn',
                    onclick: () => {
                        App.displayPopup(`You can install the game as an app anytime from the <b>settings</b>`)
                    }
                },
            ])
        })
    }

    let checkTries = 10;
    const checkForAwayTimeAndInit = () => {
        if(checkTries-- < 0) return;
        if(App.awayTime){
            showInstallPrompt();
        } else setTimeout(checkForAwayTimeAndInit, 500)
    }

    checkForAwayTimeAndInit();
});