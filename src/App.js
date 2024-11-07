let App = {
    PI2: Math.PI * 2, INF: 999999999, deltaTime: 0, lastTime: 0, mouse: {x: 0, y: 0}, userId: '_', userName: null, ENV: location.port == 5500 ? 'dev' : 'prod', sessionId: Math.round(Math.random() * 9999999999), playTime: 0,
    gameEventsHistory: {}, deferredInstallPrompt: null, shellBackground: '', isOnItch: false, isOnElectronClient: false, hour: 12,
    misc: {}, mods: [], records: {}, temp: {},
    settings: {
        screenSize: 1,
        playSound: true,
        vibrate: true,
        displayShell: true,
        displayShellButtons: true,
        shellShape: 1,
        backgroundColor: '#FFDEAD',
        notifications: false,
        automaticAging: false,
        sleepingHoursOffset: 0,
        classicMainMenuUI: false,
    },
    constants: {
        FOOD_SPRITESHEET: 'resources/img/item/foods_on.png',
        FOOD_SPRITESHEET_DIMENSIONS: {
            cellNumber: 1,
            cellSize: 24,
            rows: 33,
            columns: 33,
        },
        SLEEP_START: 21,
        SLEEP_END: 8,
        PARENT_DAYCARE_START: 8,
        PARENT_DAYCARE_END: 18,
        ACTIVE_PET_Z: 5,
        NPC_PET_Z: 4.6,
        MAX_SHELL_SHAPES: 5,
        AFTERNOON_TIME: [12, 17],
        EVENING_TIME: [17, 20],
        NIGHT_TIME: [20, 6],
        MANUAL_AGE_HOURS_BABY: 6,
        MANUAL_AGE_HOURS_TEEN: 12,
        AUTO_AGE_HOURS_BABY: 24,
        AUTO_AGE_HOURS_TEEN: 48,
        WANT_TYPES: {
            food: 'food',
            playdate: 'playdate',
            item: 'item',
            minigame: 'minigame',
            fulfilled: 'fulfilled',
        },
        CHAR_UNLOCK_PREFIX: 'ch_unl',
    },
    routes: {
        BLOG: 'https://tamawebgame.github.io/blog/',
    },
    async init () {
        // init
        this.initSound();
        this.drawer = new Drawer(document.querySelector('.graphics-canvas'));
        Object2d.setDrawer(App.drawer);

        // check for platforms
        if(location.host.indexOf('itch') !== -1) App.isOnItch = true;
        if(navigator?.userAgent == 'electron-client') App.isOnElectronClient = true;

        // load data
        let loadedData = this.load();
        console.log({loadedData});

        // shell background
        this.setShellBackground(loadedData.shellBackground);

        // mods
        this.loadMods(loadedData.mods);

        // handle settings
        if(loadedData.settings){
            Object.assign(this.settings, loadedData.settings);
        }
        this.applySettings();

        // handle preloading
        let forPreload = [
            ...SPRITES,
            ...PET_ADULT_CHARACTERS,
            ...PET_TEEN_CHARACTERS,
            ...PET_BABY_CHARACTERS,
            ...NPC_CHARACTERS,
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
            image: null, x: 0, y: 0, width: 96, height: 96, z: -10,
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
            hidden: true,
            z: 10, opacity: 0.85,
            composite: "source-atop",
        })
        App.poop = new Object2d({
            image: App.preloadedResources["resources/img/misc/poop.png"],
            x: '80%', y: '80%',
            hidden: true,
            onDraw: (me) => {
                Object2d.animations.flip(me, 300);
            }
        })
        App.sky = new Object2d({
            image: App.preloadedResources["resources/img/background/sky/night.png"],
            x: 0, y: 0, z: 99999,
            composite: "destination-over",
            // absHidden: true
        })
        App.skyOverlay = new Object2d({
            image: App.preloadedResources["resources/img/background/sky/night_overlay.png"],
            x: 0, y: 0, z: 999,
            composite: "source-atop",
            opacity: 1,
        })
        App.skyWeather = new Object2d({
            image: App.preloadedResources["resources/img/background/sky/rain_01.png"],
            x: 0, y: 0, z: 999.1,
            composite: "xor",
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
            while(moment().utc().isAfter( App.petDefinition.getNextAutomaticBirthdayDate() )){
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

            if(awaySeconds > 2 && App.ENV !== 'dev'){
                App.displayConfirm(`Welcome back!\n<b>${App.petDefinition.name}</b> missed you in those <b>${message}</b> you were away`, [
                    {
                        name: 'ok',
                        onclick: () => {}
                    }
                ])
            }
        }

        // check if at daycare
        if(App.pet.stats.is_at_parents){
            Activities.stayAtParents();
        }

        // check if at vacation
        if(App.pet.stats.is_at_vacation){
            Activities.seaVacation();
        }

        // entries
        window.onload = function () {
            const analyticsData = {
                session_id: App.sessionId,
                play_time_mins: (Math.round(App.playTime) / 1000 / 60).toFixed(2),
                away: (App.awayTime || -1),
                sprite: App.petDefinition.sprite,
                is_egg: App.pet.stats.is_egg,
                gold: App.pet.stats.gold,
                ver: VERSION
            }
            App.sendAnalytics('login', JSON.stringify(analyticsData));

            // update(0);
            App.targetFps = 60;
            App.fpsInterval = 1000 / App.targetFps;
            App.fpsLastTime = Date.now();
            App.fpsStartTime = App.fpsLastTime;
            App.onFrameUpdate(0);
        }
        window.onbeforeunload = function(){
            const analyticsData = {
                session_id: App.sessionId,
                hunger: Math.round(App.pet.stats.current_hunger),
                fun: Math.round(App.pet.stats.current_fun),
                health: Math.round(App.pet.stats.current_health),
                sleep: Math.round(App.pet.stats.current_sleep),
                bladder: Math.round(App.pet.stats.current_bladder),
                is_egg: App.pet.stats.is_egg,
                has_poop_out: App.pet.stats.has_poop_out,
                is_sleeping: App.pet.stats.is_sleeping,
            }
            App.sendAnalytics('logout', JSON.stringify(analyticsData));

            App.save();
        }

        // touch / mouse pos on canvas
        App.registerInputUpdates();

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
        if(loadedData.eventsHistory && !Array.isArray(loadedData.eventsHistory)){
            App.gameEventsHistory = loadedData.eventsHistory;
        }
        this.handleInGameEvents();

        // load room customizations
        this.applyRoomCustomizations(loadedData.roomCustomizations);

        // records
        App.records = loadedData.records;

        // random encounters
        App.runRandomEncounters();

        // missions
        Missions.init(loadedData.missions);

        // saver
        setInterval(() => {
            App.save(true);
        }, 5000);

        // hide loading
        setTimeout(() => {
            UI.fadeOut(document.querySelector('.loading-text'));
        })
    },
    registerInputUpdates: function(){
        document.addEventListener('mousemove', (evt) => {
            const rect = App.drawer.canvas.getBoundingClientRect();
            let x = evt.clientX - rect.left, y = evt.clientY - rect.top;
            if(x < 0) x = 0;
            if(x > rect.width) x = rect.width;
            if(y < 0) y = 0;
            if(y > rect.height) y = rect.height;

            App.mouse = { x: x / 2, y: y / 2 };
        })
        document.addEventListener('touchmove', (evt) => {
            const rect = App.drawer.canvas.getBoundingClientRect();
            const targetTouch = evt.targetTouches[0];
            let x = targetTouch.clientX - rect.left, y = targetTouch.clientY - rect.top;
            if(x < 0) x = 0;
            if(x > rect.width) x = rect.width;
            if(y < 0) y = 0;
            if(y > rect.height) y = rect.height;
    
            App.mouse = { x: x / 2, y: y / 2 };
        })
    },
    applySettings: function(){
        const graphicsWrapper = document.querySelector('.graphics-wrapper');

        // background
        document.body.style.backgroundColor = this.settings.backgroundColor;
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        metaThemeColor?.setAttribute('content', this.settings.backgroundColor);

        // screen size
        graphicsWrapper.style.transform = `scale(${this.settings.screenSize})`;
        document.querySelector('.dom-shell').style.transform = `scale(${this.settings.screenSize})`;
        
        // shell
        const domShell = document.querySelector('.dom-shell');
        domShell.style.display = App.settings.displayShell ? '' : 'none';
        domShell.className = `dom-shell shell-shape-${this.settings.shellShape}`
        document.querySelector('.shell-btn.main').style.display = App.settings.displayShellButtons ? '' : 'none';
        document.querySelector('.shell-btn.right').style.display = App.settings.displayShellButtons ? '' : 'none';
        document.querySelector('.shell-btn.left').style.display = App.settings.displayShellButtons ? '' : 'none';

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
        }
    },
    loadMods: function(mods){
        if(!mods || !mods.length) return;
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
        let index = typeof inp === "function" ? this.registeredDrawEvents.indexOf(inp) : inp;
        if(index != -1) this.registeredDrawEvents.splice(index, 1);
    },
    onFrameUpdate: function(time){
        App.date = new Date();
        App.hour = App.date.getHours();
        App.fullTime = App.date.getTime();
        App.time = time;
        App.deltaTime = time - App.lastTime;
        App.lastTime = time;
        App.nDeltaTime = clamp(App.deltaTime || 0, 0, 200) // normal delta time

        App.playTime += App.deltaTime;

        if(App.deltaTime > 5000){ // simulating offline progression
            App.pet.simulateAwayProgression(App.deltaTime);
        }

        requestAnimationFrame(App.onFrameUpdate);
        
        App.fpsCurrentTime = App.date.getTime();
        App.fpsElapsedTime = App.fpsCurrentTime - App.fpsLastTime;

        if(App.fpsElapsedTime > App.fpsInterval){
            App.fpsLastTime = App.fpsCurrentTime - (App.fpsElapsedTime % App.fpsInterval);
            App.drawer.draw();
            if(App.onDraw) App.onDraw();
            if(App.registeredDrawEvents.length){
                App.registeredDrawEvents.forEach(fn => fn());
            }
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
    resourceOverrides: {},
    checkResourceOverride: function(res){
        if(!res) return res;
        return this.resourceOverrides[res.replace(location.href, '')] || res;
    },
    isTester: function(){
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
    addRecord: function(name, newValue, shouldReplaceValue){
        if(newValue === undefined) newValue = 1;
        const currentValue = this.getRecord(name) || 0;
        this.records[name] = shouldReplaceValue ? newValue : currentValue + newValue;
        return this.records[name];
    },
    getRecord: function(name){
        return this.records[name];
    },
    handleInputCode: function(rawCode){
        const addEvent = App.addEvent;

        function showAlreadyUsed(){
            App.displayPopup(`You can only use this code once`);
            return false;
        }
        
        let code = rawCode.toString().toUpperCase();

        let codeEventId = `input_code_event_${code}`;

        switch(code){
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
                            const b64 = atob(commandPayload.replace(':endsave', ''));
                            console.log(b64)
                            let json = JSON.parse(b64);
                            if(!json.pet){
                                throw 'error';
                            }
                            let petDef = JSON.parse(json.pet);
                            console.log(json.user_id, App.userId, json.user_id === App.userId);
    
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
                                                                App.loadFromJson(json);
                                                                App.displayPopup(`${def.name} is now your pet!`, App.INF);
                                                                setTimeout(() => {
                                                                    location.reload();  
                                                                }, 3000);
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
                        App.displayConfirm(`Are you sure you want to change your pet's sprite?`, [
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
                    default: showInvalidError();
                }
        }
    },
    handleInGameEvents: function(){
        if(!App.awayTime || App.awayTime == -1) {
            App.handlers.show_onboarding();
            return;
        }

        const addEvent = App.addEvent;

        const date = new Date();
        const dayId = date.getFullYear() + '_' + date.getMonth() + '_' + date.getDate();

        if(!App.userName){
            App.handlers.show_set_username_dialog();
            return;
        }

        if(addEvent(`update_10_notice`, () => {
            App.displayList([
                {
                    name: 'New update is available!',
                    type: 'text',
                    solid: true,
                    bold: true,
                },
                {
                    name: `Grab exclusive rewards from the limited-time Hubchi event, Open chests by doing the new Daily missions, and try to grow your collection from the stats menu!`,
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
        })) return;

        if(addEvent(`discord_server_01_notice`, () => {
            App.displayConfirm(`<b>We have a Discord server now!</b>Join to see the growth chart and decide which features get in the game first!`, [
                {
                    name: 'next',
                    onclick: () => {
                        App.displayConfirm(`Do you want to join and get updated on all the latest changes and exclusive items?`, [
                            {
                                link: 'https://discord.gg/FdwmmWRaTd',
                                name: 'yes',
                                onclick: () => {
                                    return false;
                                },
                            }, 
                            {
                                name: 'no',
                                onclick: () => {
                                    App.displayPopup('You can join the server through <b>Settings > Join Discord</b> if you ever change your mind', 5000)
                                }
                            }
                        ]);
                    },
                }
            ]);
        })) return; */

        if(App.isSalesDay()){
            if(addEvent(`sales_day_${dayId}_notice`, () => {
                App.displayConfirm(`<b>discount day!</b><br>Shops are selling their products at a discounted rate! Check them out and pile up on them!`, [
                    {
                        name: 'ok',
                        class: 'solid primary',
                        onclick: () => {},
                    }
                ]);
            })) return;
        }
    },
    scene: {
        home: new Scene({
            image: 'resources/img/background/house/02.png',
            petX: '50%', petY: '100%',
            onLoad: () => {
                App.poop.absHidden = false;
                App.pet.staticShadow = false;

                if(random(0, 10) == 0){
                    App.pet.showCurrentWant();
                }
            },
            onUnload: () => {
                App.poop.absHidden = true;
                App.pet.staticShadow = true;
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
        })
    },
    setScene(scene){
        if(App.currentScene && App.currentScene.onUnload){
            App.currentScene.onUnload(scene);
        }

        App.currentScene = scene;
        App.pet.x = scene.petX || '50%';
        App.pet.y = scene.petY || '100%';
        if(scene.foodsX) App.foods.x = scene.foodsX;
        if(scene.foodsY) App.foods.y = scene.foodsY;
        App.background.setImg(scene.image);

        if(scene.onLoad){
            scene.onLoad();
        }

        this.applySky();
    },
    applySky() {
        const { AFTERNOON_TIME, EVENING_TIME, NIGHT_TIME } = App.constants;
        const date = new Date();
        const h = new Date().getHours();

        const isOutside = App.background.imageSrc?.indexOf('outside/') != -1;

        // weather
        App.skyWeather.z = isOutside ? 999.1 : -998;
        const weatherEffectChance = random(3, 10, date.getDate())
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
        else sky = 'morning'
        App.sky.setImage(App.preloadedResources[`resources/img/background/sky/${sky}.png`]);
        App.skyOverlay.setImage(App.preloadedResources[`resources/img/background/sky/${sky}_overlay.png`]);
        setTimeout(() => App.skyOverlay.hidden = !isOutside)
        if(sky == 'afternoon' || sky == 'morning') App.skyOverlay.hidden = true;
    },
    applyRoomCustomizations(data){
        if(!data) return;

        if(data.home.image) App.scene.home.image = data.home.image;

        App.setScene(App.currentScene);
    },
    getRandomPetDef: function(age, seed){
        pRandom.save();
        let rndArrayFn = randomFromArray;

        if(seed !== undefined) {
            pRandom.seed = seed;
            rndArrayFn = pRandomFromArray;
        }

        if(age === undefined) age = 2;

        let sprite;
        switch(age){
            case 0:
                sprite = rndArrayFn(PET_BABY_CHARACTERS);
                break;
            case 1:
                sprite = rndArrayFn(PET_TEEN_CHARACTERS);
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
        newPetDefinition = new PetDefinition({
            name: getRandomName(),
            sprite: randomFromArray(PET_BABY_CHARACTERS),
        }).setStats({is_egg: true});

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
        }
    },
    createActivePet: function(petDef, props = {}){
        if(petDef.sprite){
            App.addEvent(`${App.constants.CHAR_UNLOCK_PREFIX}_${PetDefinition.getCharCode(petDef.sprite)}`)
        }
        return new Pet(petDef, {
            z: App.constants.ACTIVE_PET_Z, 
            scale: 1, 
            castShadow: true,
            ...props
        });
    },
    runRandomEncounters: function(){
        if(Activities.encounter()) return;
    },
    handlers: {
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
        show_set_pet_name_dialog: function(){
            App.displayPrompt(`Name your new egg:`, [
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
            App.displayGrid([
                ...App.definitions.main_menu,
                {
                    name: '<i class="fa-solid fa-arrow-left back-sound"></i>',
                    class: 'back-sound',
                    onclick: () => { }
                }
            ])
        },
        open_care_menu: function(){
            App.displayList([
                {
                    name: `daily missions ${App.getBadge()}`,
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
                        App.pet.showCurrentWant();
                    }
                },
            ])
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
                        if(App.petDefinition.lifeStage != 2){
                            return App.displayPopup(`${App.petDefinition.name} is not old enough to wear accessories`);
                        }
                        App.handlers.open_accessory_list();
                        return true;
                    }
                },
            ])
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
                    name: 'clean',
                    onclick: () => {
                        App.handlers.clean();
                    }
                }
            ])
        },
        open_settings: function(){
            const settings = App.displayList([
                {
                    _ignore: !App.isTester(),
                    name: `devtools ${App.getBadge('debug', 'neutral')}`,
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
                                name: 'localStorage size',
                                onclick: () => {
                                    let total = [];
                                    var _lsTotal = 0,
                                        _xLen, _x;
                                    for (_x in localStorage) {
                                        if (!localStorage.hasOwnProperty(_x)) {
                                            continue;
                                        }
                                        _xLen = ((localStorage[_x].length + _x.length) * 2);
                                        _lsTotal += _xLen;
                                        const text = (_x.substr(0, 50) + " = " + (_xLen / 1024).toFixed(2) + " KB")
                                        total.push(text);
                                    };
                                    const totalText = (_lsTotal / 1024).toFixed(2) + " KB";

                                    const ui = UI.genericListContainer();
                                    const content = UI.empty()
                                    ui.appendChild(content);
                                    content.innerHTML = [...total, `total = ${totalText}`].join('<br>');

                                    return true;
                                }
                            },
                        ])
                    }
                },
                {
                    _ignore: !App.deferredInstallPrompt,
                    name: 'install app',
                    onclick: () => {
                        // App.pet.stats.gold += 250;
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
                    // _ignore: !App.isTester(),
                    _ignore: App.isOnItch,
                    name: `mods`,
                    onclick: () => {
                        const display = App.displayList([
                            {
                                name: 'Note: <br>install / uninstalling mods will refresh the game',
                                type: 'text'
                            },
                            {
                                name: '<label class="custom-file-upload"><input id="mod-file" type="file"></input>+ Add mod</label>',
                                onclick: (btn) => {
                                    return true;
                                }
                            },
                            {
                                name: 'active mods',
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

                            } catch(e) {
                                console.log(e);
                                App.displayPopup(`Something went wrong, Invalid package: ${e}`);
                            }
                        })
                        

                        return true;
                    },
                },
                { type: 'separator' },
                {
                    name: `gameplay settings`,
                    onclick: () => {
                        return App.displayList([
                            {
                                _mount: (e) => e.innerHTML = `Auto aging: <i>${App.settings.automaticAging ? 'On' : 'Off'}</i>`,
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
                                    content.querySelector('#add').onclick = () => {
                                        App.settings.sleepingHoursOffset++;
                                        updateUI();
                                    }
                                    content.querySelector('#subtract').onclick = () => {
                                        App.settings.sleepingHoursOffset--;
                                        updateUI();
                                    }
                                    updateUI();

                                    list.appendChild(content);
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
                                name: '+ screen size',
                                onclick: () => {
                                    App.settings.screenSize += 0.1;
                                    App.applySettings();
                                    return true;
                                }
                            },
                            {
                                name: '- screen size',
                                onclick: () => {
                                    App.settings.screenSize -= 0.1;
                                    App.applySettings();
                                    return true;
                                }
                            },
                            {
                                name: 'reset screen size',
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
                    name: `change shell`,
                    onclick: () => {
                        // App.handlers.open_shell_background_list();
                        // return true;

                        App.displayList([
                            {
                                name: `display shell: <i>${App.settings.displayShell ? 'yes' : 'no'}</i>`,
                                onclick: (item) => {
                                    App.settings.displayShell = !App.settings.displayShell;
                                    item.innerHTML = `display shell: <i>${App.settings.displayShell ? 'yes' : 'no'}</i>`;  
                                    App.applySettings();
                                    return true;
                                }
                            },
                            {
                                name: `shell button: <i>${App.settings.displayShellButtons ? 'yes' : 'no'}</i>`,
                                onclick: (item) => {
                                    App.settings.displayShellButtons = !App.settings.displayShellButtons;
                                    item.innerHTML = `shell button: <i>${App.settings.displayShellButtons ? 'yes' : 'no'}</i>`;  
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
                                        const isUnlocked = entry.unlockKey && App.getRecord(entry.unlockKey);
                                        return entry.isNew && isUnlocked;
                                    });
                                    e.innerHTML = `change shell ${hasNew ? App.getBadge() : ''}`
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

                                    App.handleFileLoad(display.querySelector('#shell-image-file'), 'readAsDataURL', (data) => {
                                        let res = App.setShellBackground(data);
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
                    name: 'get save code',
                    onclick: () => {
                        // let charCode = 'save:' + btoa(JSON.stringify(window.localStorage));
                        let charCode = `save:${btoa(JSON.stringify(window.localStorage))}:endsave`;
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
                {
                    name: 'reset save data',
                    onclick: () => {
                        App.displayConfirm('Are you sure you want to delete your save game?', [
                            {
                                name: 'yes',
                                onclick: () => {
                                    App.save();
                                    App.save = () => {};
                                    // window.localStorage.clear();
                                    window.localStorage.removeItem('last_time');
                                    window.localStorage.removeItem('pet');
                                    location.reload();
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
                { type: 'separator' },
                {
                    name: `send feedback`,
                    onclick: () => {
                        return App.displayPrompt(`what would you like to to be added in the next update?`, [
                            {
                                name: 'send',
                                onclick: (data) => {
                                    if(!data) return true;
                                    App.displayPopup(`<b>Suggestion sent!</b><br> thanks for participating!`, 4000);
                                    App.sendAnalytics('game_feedback', data, true);
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
                    // _ignore: true,
                    link: App.routes.BLOG,
                    name: `<b>see changelog</b> ${App.getBadge(null, 'neutral')}`,
                    onclick: () => {
                        // App.pet.stats.gold += 250;
                        App.sendAnalytics('go_to_blog');
                        return true;
                    },
                },
                {
                    // _ignore: true,
                    link: 'https://discord.gg/FdwmmWRaTd',
                    name: '<b>join discord</b>',
                    onclick: () => {
                        // App.pet.stats.gold += 250;
                        return true;
                    },
                },
                { type: 'separator' },
                {
                    _disable: true,
                    name: `Version ${VERSION || '???'}`,
                    onclick: () => {
                        return true;
                    },
                },
            ])
        },
        open_stats: function(){
            const list = UI.genericListContainer();
            const content = UI.empty();
            const careRatingIcons = new Array(App.pet.stats.max_care).fill('').map((_, i) => {
                const style = i >= App.pet.stats.current_care ? 'opacity: 0.5; filter:grayscale()' : 'filter:hue-rotate(310deg)';
                return `<img style="margin-top: 2px; ${style}" src="resources/img/misc/star_01.png"></img>`
            }).join(' ')
            content.innerHTML = `
            <div class="inner-padding b-radius-10 m surface-stylized">
                <div>
                    <b>GOLD:</b> $${App.pet.stats.gold}
                </div>
                <div>
                    <b>HUNGER:</b> ${App.createProgressbar( App.pet.stats.current_hunger / App.pet.stats.max_hunger * 100 ).node.outerHTML}
                </div>
                <div>
                    <b>SLEEP:</b> ${App.createProgressbar( App.pet.stats.current_sleep / App.pet.stats.max_sleep * 100 ).node.outerHTML}
                </div>
                <div>
                    <b>FUN:</b> ${App.createProgressbar( App.pet.stats.current_fun / App.pet.stats.max_fun * 100 ).node.outerHTML}
                </div>
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <b>CARE:</b> <div style="display: inline-flex; gap: 1px">${careRatingIcons}</div>
                </div>
            </div>
            `;
            list.appendChild(content);
        },
        open_character_collection: function(){
            App.addEvent(`${App.constants.CHAR_UNLOCK_PREFIX}_${PetDefinition.getCharCode(App.petDefinition.sprite)}`)

            let unlockedCount = 0;
            const allCharacters = [
                ...PET_BABY_CHARACTERS,
                ...PET_TEEN_CHARACTERS,
                ...PET_ADULT_CHARACTERS,
            ];
            const charactersDef = allCharacters.map(char => {
                const charCode = PetDefinition.getCharCode(char);
                const isUnlocked = App.getEvent(`${App.constants.CHAR_UNLOCK_PREFIX}_${charCode}`)
                if(isUnlocked) unlockedCount++;
                return {
                    componentType: 'div',
                    className: `collection__char ${!isUnlocked ? 'locked' : ''}`,
                    innerHTML: PetDefinition.generateFullCSprite(char),
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
                return App.displayPopup(`${petDefinition.name} is the pioneer of the family!<br> comeback when your family has grown!`)
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
                        <b>${moment(oldestAncestor.birthday).utc().fromNow()}</b>
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
                                        ${PetDefinition.generateFullCSprite(b.sprite)}
                                        <small>${b.name}</small>
                                    </div>

                                    <div class="family-tree__vertical-line"></div>  

                                    <div class="family-tree__member-container">
                                        ${PetDefinition.generateFullCSprite(a.sprite)}
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
        open_food_list: function(buyMode, activeIndex, filterType){
            let list = [];
            let sliderInstance;
            let salesDay = App.isSalesDay();
            for(let food of Object.keys(App.definitions.food)){
                let current = App.definitions.food[food];

                // lifestage check
                if(!current.age.includes(App.petDefinition.lifeStage)) continue;

                // buy mode and is free
                if(buyMode && current.price == 0) continue;

                // filter check
                if(filterType && (current.type || 'food') != filterType) continue;

                // check if current pet has this food on its inventory
                if(current.price && !App.pet.inventory.food[food] && !buyMode){
                    continue;
                }

                // 50% off on sales day
                let price = current.price;
                if(salesDay) price = Math.round(price / 2);

                list.push({
                    name: `${App.getFoodCSprite(current.sprite)} ${food.toUpperCase()} (x${App.pet.inventory.food[food] > 0 ? App.pet.inventory.food[food] : (!current.price ? '∞' : 0)}) <b>${buyMode ? `$${price}` : ''}</b>`,
                    onclick: (btn, list) => {
                        if(buyMode){
                            if(App.pet.stats.gold < price){
                                App.displayPopup(`Don't have enough gold!`);
                                return true;
                            }
                            App.pet.stats.gold -= price;
                            App.addNumToObject(App.pet.inventory.food, food, 1);
                            // console.log(list.scrollTop);
                            let nList = App.handlers.open_food_list(true, sliderInstance?.getCurrentIndex(), filterType);
                                // nList.scrollTop = list.scrollTop;
                            Missions.done(Missions.TYPES.buy_food);
                            return false;
                        }

                        App.closeAllDisplays();
                        let ateFood = App.pet.feed(current.sprite, current.hunger_replenish, current.type);
                        if(ateFood) {
                            if(App.pet.inventory.food[food] > 0)
                                App.pet.inventory.food[food] -= 1;

                            App.pet.stats.current_fun += current.fun_replenish ?? 0;
                            App.pet.stats.current_sleep += current.sleep_replenish ?? 0;
                            if(App.pet.hasMoodlet('healthy') && food === 'medicine')
                                App.pet.stats.current_health = App.pet.stats.current_health * 0.6;
                            else
                                App.pet.stats.current_health += current.health_replenish ?? 0;
                        }
                    }
                })
            }

            if(!list.length){
                App.displayPopup(`You don't have any consumables, purchase some from the market`, 2000);
                return;
            }

            sliderInstance = App.displaySlider(list, activeIndex, {accept: buyMode ? 'Purchase' : 'Eat'}, buyMode ? `$${App.pet.stats.gold + (salesDay ? ` <span class="sales-notice">DISCOUNT DAY!</span>` : '')}` : null);
            return sliderInstance;
            return App.displayList(list);
        },
        open_feeding_menu: function(){
            App.displayList([
                {
                    name: 'food',
                    onclick: () => {
                        App.handlers.open_food_list(null, null, 'food');
                        return true;
                    }
                },
                {
                    name: 'snacks',
                    onclick: () => {
                        App.handlers.open_food_list(null, null, 'treat');
                        return true;
                    }
                },
                {
                    name: 'meds',
                    onclick: () => {
                        App.handlers.open_food_list(null, null, 'med');
                        return true;
                    }
                },
                {
                    // _ignore: !App.isTester(),
                    name: `cook`,
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
                }
            ])
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
                    name: `collection ${App.getBadge()}`,
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
                {
                    name: 'set nickname',
                    onclick: () => {
                        App.displayPrompt(`Enter your pet's name:`, [
                            {
                                name: 'set',
                                onclick: (value) => {
                                    if(!value) return false;

                                    App.pet.petDefinition.name = value;
                                    App.save();
                                    App.displayPopup(`Name set to "${App.pet.petDefinition.name}"`)
                                }
                            },
                            {name: 'cancel', class: 'back-btn', onclick: () => {}},
                        ], App.pet.petDefinition.name);
                        return true;
                    }
                },

            ])
        },
        open_profile: function(){
            const list = UI.genericListContainer();
            const content = UI.empty();
            content.style.height = '100%';
            content.innerHTML = `
                <div class="user-id surface-stylized text-transform-none">
                    uid:<span>${(App.userName ?? '') + '-' + App.userId?.toString().slice(0, 5)}</span>
                </div>
                <div class="flex-center inner-padding surface-stylized height-auto">
                    ${App.petDefinition.getCSprite()}
                    <b>
                        ${App.petDefinition.name} 
                        <br>
                        <small>${App.petDefinition.getLifeStageLabel()} - gen ${App.petDefinition.family.length + 1}</small>
                    </b>
                    Born ${moment(App.petDefinition.birthday).utc().fromNow()}
                </div>
            `

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
                    name: `${iconElement} ${item.toUpperCase()} (x${App.pet.inventory.item[item] || 0}) <b>${buyMode ? `$${price}` : ''}</b>`,
                    onclick: (btn, list) => {
                        if(buyMode){
                            if(App.pet.stats.gold < price){
                                App.displayPopup(`Don't have enough gold!`);
                                return true;
                            }
                            App.pet.stats.gold -= price;
                            App.addNumToObject(App.pet.inventory.item, item, 1);
                            // console.log(list.scrollTop);
                            let nList = App.handlers.open_item_list(true, sliderInstance?.getCurrentIndex());
                                // nList.scrollTop = list.scrollTop;
                            return false;
                        }

                        if(customPayload){
                            return customPayload({...current, name: item});
                        }
                        App.pet.useItem({...current, name: item});

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

            sliderInstance = App.displaySlider(list, activeIndex, {accept: buyMode ? 'Purchase' : 'Use'}, buyMode ? `$${App.pet.stats.gold + (salesDay ? ` <span class="sales-notice">DISCOUNT DAY!</span>` : '')}` : null);
            return sliderInstance;
            return App.displayList(list);
        },
        open_room_background_list: function(){
            let list = [];
            let sliderInstance;
            let salesDay = App.isSalesDay();
            for(let room of Object.keys(App.definitions.room_background)){
                let current = App.definitions.room_background[room];

                // check for unlockables
                if(current.unlockKey && !App.getRecord(current.unlockKey)){
                    continue;
                }

                // 50% off on sales day
                let price = current.price;
                if(salesDay) price = Math.round(price / 2);

                const image = App.checkResourceOverride(current.image);

                list.push({
                    // name: `<c-sprite width="22" height="22" index="${(current.sprite - 1)}" src="resources/img/item/items.png"></c-sprite> ${item.toUpperCase()} (x${App.pet.inventory.item[item] || 0}) <b>$${buyMode ? `${price}` : ''}</b>`,
                    isNew: !!current.isNew,
                    name: `<img style="min-height: 64px" src="${image}"></img> ${room.toUpperCase()} <b>$${price}</b> ${current.isNew ? App.getBadge() : ''}`,
                    onclick: (btn, list) => {
                        if(image === App.scene.home.image){
                            App.displayPopup('You already own this room');
                            return true;
                        }

                        if(App.pet.stats.gold < price){
                            App.displayPopup(`Don't have enough gold!`);
                            return true;
                        }
                        App.pet.stats.gold -= price;

                        App.closeAllDisplays();
                        Activities.redecorRoom();
                        App.scene.home.image = image;

                        App.sendAnalytics('home_background_change', App.scene.home.image);

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
            .map(current => {
                // check for unlockables

                return {
                    name: `<img src="${current.image}"></img>${current.isNew ? App.getBadge() : ''}`,
                    onclick: (btn, list) => {
                        App.setShellBackground(current.image);
                        return true;
                    }
                }
            })

            sliderInstance = App.displaySlider(list, null, {accept: 'Set'});
            return sliderInstance;
        },
        open_accessory_list: function(buyMode, activeIndex, customPayload){
            let list = [];
            let sliderInstance;
            let salesDay = App.isSalesDay();
            for(let accessoryName of Object.keys(App.definitions.accessories)){
                // check if current pet has this item on its inventory
                if(!App.pet.inventory.accessory[accessoryName] && !buyMode){
                    continue;
                }
                let current = App.definitions.accessories[accessoryName];
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
                    App.handlers.open_accessory_list(buyMode, sliderInstance?.getCurrentIndex());
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
                            ? App.getBadge() 
                            : ''
                        }
                    `,
                    onclick: (btn, list) => {
                        if(buyMode){
                            if(App.pet.inventory.accessory[accessoryName]) {
                                App.displayPopup('You already own this accessory');
                                return true;
                            }
                            if(App.pet.stats.gold < price){
                                App.displayPopup(`Don't have enough gold!`);
                                return true;
                            }
                            App.pet.stats.gold -= price;
                            App.pet.inventory.accessory[accessoryName] = true;
                            //     // nList.scrollTop = list.scrollTop;
                            return reopen(buyMode);
                        }

                        // toggle equip mode
                        if(equipped) App.petDefinition.accessories.splice(App.petDefinition.accessories.indexOf(accessoryName), 1);
                        else App.petDefinition.accessories.push(accessoryName);
                        Activities.getDressed(() => App.pet.createAccessories(), reopen, !equipped);
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
        open_activity_list: function(){
            return App.displayList([
                {
                    name: `mall`,
                    onclick: () => {
                        Activities.goToMall();
                    }
                },
                {
                    name: `market`,
                    onclick: () => {
                        Activities.goToMarket();
                    }
                },
                {
                    name: `game center`,
                    onclick: () => {
                        // App.handlers.open_game_list();
                        Activities.goToArcade();
                        // return true;
                    }
                },
                {
                    _disable: App.petDefinition.lifeStage < 2,
                    name: `work`,
                    onclick: () => {
                        App.displayList([
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
                        ])
                        return true;
                    }
                },
                {
                    name: 'park',
                    onclick: () => { // going to park with random pet
                        Activities.goToPark();
                    }
                },
                {
                    name: `visit doctor`,
                    onclick: () => {
                        Activities.goToClinic();
                    }
                },
                // {
                //     name: 'baby sitter',
                //     onclick: () => {
                //         App.displayPopup('To be implemented...', 1000);
                //         return true;
                //     }
                // },
            ])
        },
        open_friends_list: function(onClickOverride){
            if(!App.petDefinition.friends.length){
                App.displayPopup(`${App.petDefinition.name} doesn't have any friends right now<br><br><small>Visit the park to find new friends<small>`, 4000);
                return;
            }

            const friendsList = App.displayList(App.petDefinition.friends.map((friendDef, index) => {
                const name = friendDef.name || 'Unknown';
                const icon = friendDef.getCSprite();
                return {
                    name: icon + name,
                    onclick: () => {
                        if(onClickOverride) return onClickOverride(friendDef);
                        const friendActivitiesList = App.displayList([
                            {
                                name: 'info',
                                onclick: () => {
                                    const list = UI.genericListContainer();
                                    UI.genericListContainerContent(`
                                    <div class="inner-padding uppercase surface-stylized b-radius-10">
                                        ${icon} ${friendDef.name}
                                        <br>
                                        <b>Friendship:</b> ${App.createProgressbar( friendDef.getFriendship() / 100 * 100 ).node.outerHTML}
                                        <hr>
                                        <b>Age:</b> ${friendDef.getLifeStageLabel()}
                                    </div>
                                    `, list);

                                    return true;
                                }
                            },
                            {
                                _ignore: App.petDefinition.lifeStage < 2 || friendDef.lifeStage < 2 || friendDef.stats.is_player_family,
                                name: 'marry',
                                onclick: () => {
                                    if(friendDef.getFriendship() < 70){
                                        return App.displayPopup(`${App.petDefinition.name}'s friendship with ${friendDef.name} is too low <br><br> they don't want to marry each other`, 5000);
                                    }

                                    App.displayConfirm(`${App.petDefinition.name} and <div>${icon} ${friendDef.name}</div> will get married and you'll recieve their egg`, [
                                        {
                                            name: 'ok',
                                            onclick: () => {
                                                App.displayConfirm(`Are you sure?`, [
                                                    {
                                                        name: 'yes',
                                                        onclick: () => {
                                                            Activities.wedding(friendDef);
                                                        }
                                                    },
                                                    {
                                                        name: 'no',
                                                        class: 'back-btn',
                                                        onclick: () => {}
                                                    },
                                                ]);
                                            }
                                        },
                                        {
                                            name: 'cancel',
                                            class: 'back-btn',
                                            onclick: () => {}
                                        }
                                    ])

                                    return true;
                                }
                            },
                            {
                                name: 'park',
                                onclick: () => {
                                    App.closeAllDisplays();
                                    Activities.goToPark(friendDef);
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
            }));
        },
        open_phone: function(){
            App.displayList([
                {
                    name: `<span style="color: #ff00c6"><i class="icon fa-solid fa-globe"></i> hubchi</span> ${App.getBadge()}`,
                    onclick: () => {
                        if(!App.userName){
                            App.handlers.show_set_username_dialog();
                            return true;
                        }

                        if(App.pet.stats.current_sleep < 10) {
                            return App.displayPopup(`${App.petDefinition.name} is too sleepy to go to HUBCHI!`);
                        }

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
                    name: 'friends',
                    onclick: () => {
                        App.handlers.open_friends_list();
                        return true;
                    }
                },
                {
                    _ignore: App.petDefinition.lifeStage >= 2,
                    name: 'have birthday',
                    onclick: () => {
                        let nextBirthday = App.petDefinition.getNextBirthdayDate();
                        if(moment().utc().isBefore( nextBirthday )){
                            return App.displayPopup(`${App.petDefinition.name} hasn't grown enough to age up<br><br>come back <b>${(moment(nextBirthday).utc().fromNow())}</b>`, 5000);
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
                    _disable: App.petDefinition.lifeStage == 0,
                    name: `social media`,
                    onclick: () => {
                        App.handlers.open_social_media();
                        return true;
                    }
                },
                {
                    _disable: App.petDefinition.lifeStage == 0,
                    name: `go on vacation`,
                    onclick: () => {
                        const price = 250;
                        const { goToVacation } = Activities;
                        App.displayConfirm(`Are you sure you want to send ${App.petDefinition.name} on a vacation? <br> it will cost you $${price} and ${App.petDefinition.name} will stay there until you decide to end their vacation <hr> <b>while on vacation, ${App.petDefinition.name}'s needs will not drop</b>`, [
                            {
                                name: `yes ($${price})`,
                                onclick: () => {
                                    if(App.pet.stats.gold - price < 0) {
                                        App.displayPopup(`You don't have enough gold!`);
                                        return;
                                    }
                                    App.pet.stats.gold -= price;
                                    goToVacation(Activities.seaVacation)
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
                                onclick: () => {
                                    let charCode = 'friend:' + btoa(JSON.stringify(window.localStorage));
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
                                                    b64 = atob(b64);
                                                    let json = JSON.parse(b64);
                                                    if(!json.pet){
                                                        throw 'error';
                                                    }

                                                    if(json.user_id === App.userId) return App.displayPopup(`You can't add yourself as a friend!`);

                                                    let petDef = JSON.parse(json.pet);

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
            ])
        },
        open_social_media: function(){
            function showPost(petDefinition, noMood){
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

                let homeBackground = App.scene.home.image;
                if(petDefinition !== App.petDefinition)
                    homeBackground = randomFromArray([
                        "resources/img/background/house/01.jpg",
                        "resources/img/background/house/02.png",
                        "resources/img/background/house/03.png",
                        "resources/img/background/house/04.png",
                    ])
                
                let background = new Object2d({
                    drawer: postDrawer,
                    img: homeBackground,
                    x: 0, y: 0, width: 96, height: 96,
                });


                let characterPositions = ['50%', '20%', '80%'],
                    characterSpritePoses = [1, 11, 14, 8, 2, 12];

                let character = new Object2d({
                    drawer: postDrawer,
                    spritesheet: {...petDefinition.spritesheet, cellNumber: randomFromArray(characterSpritePoses)},
                    // image: App.pet.image.cloneNode(),
                    // img: petDefinition.sprite,
                    image: App.preloadedResources[petDefinition.sprite],
                    x: randomFromArray(characterPositions), y: 55,
                })

                post.querySelector('.post-header').innerHTML = petDefinition.name;

                switch(App.pet.state){
                    default:
                        let generalTweets = [
                            [`Found a crumb today, it's like a feast! #TinyTreats`, 1, "resources/img/background/house/kitchen_02.png"],
                            ['#vibing_around', 1, null],
                            ['#sunny_day', 1, "resources/img/background/outside/park_02.png"],
                            ['Riding on a leaf down the stream. Best. Day. Ever. #LeafBoat', 2, null],
                            ['Naptime in a matchbox bed. Cozy as can be! #SmallDreams', 16, "resources/img/background/house/dark_overlay.png"],
                            ['Danced in a raindrop, got soaked! #RaindropDance', 8, "resources/img/background/house/dark_overlay.png"],
                            ['Whispered my wish to a dandelion. Hope it comes true! #DandelionWishes', 10, null],
                            ['Tried to lift a pebble, felt like a superhero! #TinyStrength', 1, "resources/img/background/outside/park_02.png"],
                            [`Stargazing tonight, every star is a giant wish waiting to happen! #StarrySky`, 1, "resources/img/background/outside/park_02.png"],
                            [`A butterfly landed on me, I'm a landing pad! #ButterflyFriends`, 2, "resources/img/background/outside/park_02.png"],
                            [`A dewdrop became my crystal ball. I see big adventures ahead! #DewdropVisions`, 7, null],
                            [`Got lost in a garden maze of grass. Blades like skyscrapers! #GrasslandAdventures`, 1, "resources/img/background/outside/park_02.png"],
                            [`Shared a berry with an ant. It's all about sharing, no matter your size! #BerryFeast`, 8, "resources/img/background/outside/park_02.png"],
                            [`Found a feather and flew for a moment. #FeatherFlight`, 8, null],
                            [`Played hide and seek. Best hider ever! #TinyGames`, 2, null],
                            [`A leaf fell on me. Guess I'm a tree now!`, 8, "resources/img/background/outside/park_02.png"],
                            [`#onthatgrind`, 14, "resources/img/background/house/office_01.png"],
                            [`checking out the market #shopping`, 10, "resources/img/background/outside/market_01.png"],
                            [`the prices are so high! #whatisthis`, 7, "resources/img/background/outside/market_01.png"],
                            [`looking for a cute #headband!`, 8, "resources/img/background/outside/market_01.png"],
                            [`lost again! don't wanna play anymore! #hategaming`, 6, "resources/img/background/house/arcade_01.png"],
                            [`I'm just better! #gaming`, 2, "resources/img/background/house/arcade_01.png"],
                            [`Won again! #ilovegaming`, 2, "resources/img/background/house/arcade_01.png"],
                        ];

                        let tweet = randomFromArray(generalTweets);

                        postText.innerHTML = tweet[0]; // text
                        if(tweet[1]) character.spritesheet.cellNumber = tweet[1]; // pose
                        if(tweet[2]) background.setImg(tweet[2]); // background
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

            App.displayList([
                {
                    name: 'make post',
                    onclick: () => {
                        App.petDefinition.stats.current_fun += random(1, 5);
                        showPost(App.petDefinition);
                        return true;
                    }
                },
                {
                    name: 'explore posts',
                    onclick: () => {
                        App.petDefinition.stats.current_fun += random(0, 5);
                        let otherPetDef;
                        if(App.petDefinition.friends && App.petDefinition.friends.length){
                            otherPetDef = randomFromArray(App.petDefinition.friends);
                        } else {
                            otherPetDef = App.getRandomPetDef();
                        }
                        showPost(otherPetDef, true);
                        return true;
                    }
                },
                {
                    name: 'find friends',
                    onclick: () => {
                        const date = new Date();
                        const dayId = date.getFullYear() + date.getMonth() + date.getDate();

                        let seed = App.userId + dayId;

                        let potentialFriends = new Array(8).fill(undefined).map((spot, i) => App.getRandomPetDef(App.petDefinition.lifeStage, seed + (i * 128)));

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
                                                if(state) App.displayPopup(`${otherPetDef.name} <b style="color: #87cf00">accepted</b> ${App.petDefinition.name}'s friend request!`);
                                                else App.displayPopup(`${App.petDefinition.name} is already friends with ${otherPetDef.name}!`);
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
                        })
                        return true;
                    }
                }
            ])
        },
        open_mall_activity_list: function(){
            const hasNewDecor = Object.keys(App.definitions.room_background).some(key => {
                const isUnlocked = App.definitions.room_background[key].unlockKey && App.getRecord(App.definitions.room_background[key].unlockKey);
                return App.definitions.room_background[key].isNew && isUnlocked;
            });
            const hasNewAccessory = Object.keys(App.definitions.accessories).some(key => {
                const isUnlocked = App.definitions.accessories[key].unlockKey && App.getRecord(App.definitions.accessories[key].unlockKey);
                return App.definitions.accessories[key].isNew && isUnlocked;
            });

            const backFn = () => { // unused
                setTimeout(() => App.handlers.open_activity_list(), 0)
            }

            App.displayList([
                {
                    name: 'buy items',
                    onclick: () => {
                        App.handlers.open_item_list(true);
                        return true;
                    }
                },
                {
                    name: `buy accessories ${hasNewAccessory ? App.getBadge() : ''}`,
                    onclick: () => {
                        App.handlers.open_accessory_list(true);
                        if(App.petDefinition.lifeStage != 2){
                            App.displayPopup(`${App.petDefinition.name} is not old enough to wear accessories yet, but you can buy some for later`);
                        }
                        return true;
                    }
                },
                {
                    name: `redécor room ${hasNewDecor ? App.getBadge() : ''}`,
                    onclick: () => {
                        App.handlers.open_room_background_list(true);
                        return true;
                    }
                },
            ]);
        },
        open_market_menu: function(){
            App.displayList([
                {
                    name: 'purchase food',
                    onclick: () => {
                        App.handlers.open_food_list(true, null, "food");
                        return true;
                    }
                },
                {
                    name: 'purchase snacks',
                    onclick: () => {
                        App.handlers.open_food_list(true, null, "treat");
                        return true;
                    }
                },
                {
                    name: 'purchase meds',
                    onclick: () => {
                        App.handlers.open_food_list(true, null, "med");
                        return true;
                    }
                },
            ])
        },
        open_game_list: function(){
            const tutorialDisplayTime = 2000;
            App.displayList([
                {
                    name: `mimic`,
                    onclick: () => {
                        const imgPath = 'resources/img/ui/';
                        const images = `
                            <img src="${imgPath}facing_left.png"></img>
                            <img src="${imgPath}facing_center.png"></img>
                            <img src="${imgPath}facing_right.png"></img>
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
            ]);
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
            App.pet.stopMove();
            App.pet.triggerScriptedState('idle', App.INF, false, true);
            App.pet.x = 20;
            App.pet.y = App.scene.home.petY;
            App.toggleGameplayControls(false);
            Missions.done(Missions.TYPES.clean_room);
            const mop = new Object2d({
                image: App.preloadedResources["resources/img/misc/cleaner.png"],
                x: 0,
                y: -100,
                z: 100,
                width: 96, height: 96,
                onDraw: function(me){
                    Object2d.animations.flip(me);
                    this.y += 1;
                    if(this.y >= 50){
                        App.pet.stopScriptedState();
                        App.drawer.removeObject(this);
                        App.toggleGameplayControls(true);
                        App.pet.x = '50%';
                        // App.poop.hidden = true;
                        App.pet.playCheeringAnimationIfTrue(App.pet.stats.has_poop_out, () => {});
                        App.pet.stats.has_poop_out = false;
                        App.poop.hidden = true;
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
                ></div>
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
    displayList: function(listItems, backFn, backFnTitle){
        // if(backFn !== false)
        //     listItems.push({
        //         name: /* '<i class="fa-solid fa-arrow-left"></i>' || */ 'BACK',
        //         class: 'back-btn solid primary bold',
        //         onclick: () => {
        //             if(backFn) backFn();
        //             return false;
        //         }
        //     });

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
                case "text":
                    element = document.createElement('p');
                    element.innerHTML = item.name;
                    defaultClassName = `inner-padding b-radius-10 uppercase list-text ${item.solid ? 'solid-' : ''}surface-stylized ${item.bold ? 'text-bold' : ''}`;
                    break;
                case "separator":
                    element = document.createElement('hr');
                    defaultClassName = 'content-separator';
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
        // listItems.push({
        //     name: '⬅️',
        //     class: 'back-btn',
        //     onclick: () => {
        //         return false;
        //     }
        // })

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
    displaySlider: function(listItems, activeIndex, options, additionalText){
        let list = document.querySelector('.cloneables .generic-slider-container').cloneNode(true);

        if(activeIndex !== 0 && !activeIndex){
            list.classList.add('menu-animation');
        }

        let maxIndex = listItems.length,
            currentIndex = activeIndex || 0,
            contentElement = list.querySelector('.content'),
            acceptBtn = list.querySelector('#accept-btn'),
            cancelBtn = list.querySelector('#cancel-btn');

        list.close = function(){
            list.remove();
        }

        cancelBtn.innerHTML = options?.cancel || /* '<i class="fa-solid fa-arrow-left"></i>' || */ '<i class="fa-solid fa-arrow-left"></i>';
        acceptBtn.innerHTML = options?.accept || 'Accept';

        list.getCurrentIndex = () => currentIndex;

        cancelBtn.onclick = () => {
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
                acceptBtn.onclick = () => {
                    let result = item.onclick(button, list);
                    if(!result){
                        list.close();
                    }
                };
            
            let animationStart = diff < 0 ? 'slider-item-anim-in-right' : 'slider-item-anim-in-left';
            button.style.animation = `${diff ? animationStart : ''} 0.1s linear forwards`;

            contentElement.innerHTML = '';
            contentElement.appendChild(button);
        }

        list.querySelector('.slide-left').onclick = () => {
            contentElement.querySelector('.slider-item').style.animation = 'slider-item-anim-out-left 0.1s linear forwards';
            setTimeout(() => changeIndex(-1), 150);
        }
        list.querySelector('.slide-right').onclick = () => {
            contentElement.querySelector('.slider-item').style.animation = 'slider-item-anim-out-right 0.1s linear forwards';
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

        return `<span class="badge ${color}">${text}<span>`;
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
        this.audioChannelIsBusy = false;
        this.audioElement = new Audio();
        this.audioElement.volume = 0.5;
        this.audioElement.addEventListener('ended', () => {
            this.audioElement.currentTime = 0;
            this.audioChannelIsBusy = false;
        });

        // button click event
        const clickSoundClassNames = ['click-sound', 'list-item'];
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
                if(previousListItem && previousListItem.transitionAnim) previousListItem.transitionAnim();
                UI.lastClickedButton = null;
            }
        })
    },
    formatTo12Hours: function(hour){
        return hour > 12 ? hour - 12 + 'pm' : hour + 'am';
    },
    isSalesDay: function(){
        let day = new Date().getDate();
        return [7, 12, 18, 20, 25, 29, 30].includes(day);
    },
    isSleepHour: function(){
        const hour = new Date().getHours();
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
    clampWithin24HourFormat: function(hour){
        if(hour >= 24) return hour - 24;
        else if(hour < 0) return hour + 24;
        return hour;
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
        return `<c-sprite width="22" height="22" index="${(index - 1)}" src="resources/img/item/items.png"></c-sprite>`
    },
    getAccessoryCSprite: function(name){
        const current = App.definitions.accessories[name];
        const image = App.checkResourceOverride(current.icon || current.image);
        return current.icon
            ? `<div style="width: 1"><img style="width: 36px; outline: none" src="${image}"></img></div>`
            : `<c-sprite width="64" height="36" index="0" src="${image}"></c-sprite>`;
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
    playSound: function(path, force){
        if(!App.settings.playSound) return;

        if(this.audioChannelIsBusy && !force) return false;

        if(this.audioElement.src != path)
            this.audioElement.src = path;
        this.audioElement.play();
        this.audioChannelIsBusy = true;
    },
    save: function(noIndicator){
        // setCookie('pet', App.pet.serializeStats(), 365);
        window.localStorage.setItem('pet', App.pet.serializeStats());
        window.localStorage.setItem('settings', JSON.stringify(App.settings));
        window.localStorage.setItem('last_time', Date.now());
        // window.localStorage.setItem('last_time', Date.now() - 86400 * 1000 * 10);
        window.localStorage.setItem('user_id', App.userId);
        window.localStorage.setItem('user_name', App.userName);
        window.localStorage.setItem('ingame_events_history', JSON.stringify(App.gameEventsHistory));
        window.localStorage.setItem('play_time', App.playTime);
        window.localStorage.setItem('shell_background_v2.1', App.shellBackground);
        window.localStorage.setItem('mods', JSON.stringify(App.mods));
        window.localStorage.setItem('records', JSON.stringify(App.records));
        window.localStorage.setItem('room_customization', JSON.stringify({
            home: {
                image: App.scene.home.image,
            }
        }))
        window.localStorage.setItem('missions', JSON.stringify({
            current: Missions.current,
            currentStep: Missions.currentStep,
            currentPts: Missions.currentPts,
            refreshTime: Missions.refreshTime
        }))
        // -3600000
        if(!noIndicator){
            const saveIcon = document.querySelector('.save-indicator');
            saveIcon.style.display = '';
            setTimeout(() => saveIcon.style.display = 'none', 2000);
        }
    },
    load: function(){
        let pet = window.localStorage.getItem('pet');
            pet = pet ? JSON.parse(pet) : {};

        let settings = window.localStorage.getItem('settings');
            settings = settings ? JSON.parse(settings) : null;

        let lastTime = window.localStorage.getItem('last_time') || false;

        let eventsHistory = window.localStorage.getItem('ingame_events_history');
            eventsHistory = eventsHistory ? JSON.parse(eventsHistory) : null;

        let roomCustomizations = window.localStorage.getItem('room_customization');
        roomCustomizations = roomCustomizations ? JSON.parse(roomCustomizations) : null;

        let mods = window.localStorage.getItem('mods');
        mods = mods ? JSON.parse(mods) : App.mods;

        let records = window.localStorage.getItem('records');
        records = records ? JSON.parse(records) : App.records;

        // user
        let userId = window.localStorage.getItem('user_id') || random(100000000000, 999999999999);
        App.userId = userId;
        let userName = window.localStorage.getItem('user_name');
        App.userName = userName == 'null' ? null : userName;
        
        App.playTime = parseInt(window.localStorage.getItem('play_time') || 0);

        let shellBackground = window.localStorage.getItem('shell_background_v2.1') || App.definitions.shell_background[0].image;

        let missions = window.localStorage.getItem('missions');
        missions = missions ? JSON.parse(missions) : {};

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
        };

        return App.loadedData;
    },
    loadFromJson: function(json){
        const ignoreKeys = [
            'user_name',
            'user_id',
            'play_time',
            'last_time',
            'mods',
        ]
        App.save();
        App.save = () => {};
        for(let key of Object.keys(json)){
            if(ignoreKeys.includes(key)) continue;
            window.localStorage.setItem(key, json[key]);
        }
        const allowedKeys = [...Object.keys(json), ...ignoreKeys];
        Object.keys(localStorage).forEach(key => {
            if(!allowedKeys.includes(key)){
                window.localStorage.removeItem(key);
            }
        })
    },
    vibrate: function(dur){
        if(!navigator?.vibrate || !App.settings.vibrate) return;
        navigator?.vibrate(dur || 35);
    },
    sendAnalytics: function(type, value, force){
        if(!force && App.ENV !== 'prod') return;

        if(!type) type = 'default';

        if(App.isOnItch) type += '_itch';
        else if(App.isOnElectronClient) type += '_electron';

        let user = (App.userName ? App.userName + '-' : '') + App.userId;
        let url = `https://docs.google.com/forms/d/e/1FAIpQLSfzl5hhhnV3IAdxuA90ieEaeBAhCY9Bh4s151huzTMeByMwiw/formResponse?usp=pp_url&entry.1384465975=${user}&entry.1653037117=${App.petDefinition?.name || ''}&entry.1322693089=${type}&entry.1403809294=${value || ''}`;

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
    getIcon: function(iconName, noRightMargin){
        return `<i class="fa-solid fa-${iconName}" style="${!noRightMargin ? 'margin-right:10px' : ''}"></i>`
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

    if(App.awayTime !== -1){
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
});