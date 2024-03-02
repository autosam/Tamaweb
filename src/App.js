let App = {
    INF: 999999999, deltaTime: 0, lastTime: 0, mouse: {x: 0, y: 0}, userId: '_', ENV: location.port == 5500 ? 'dev' : 'prod', sessionId: Math.round(Math.random() * 9999999999), playTime: 0,
    gameEventsHistory: [], deferredInstallPrompt: null, shellBackground: '', isOnItch: false,
    settings: {
        screenSize: 1,
        playSound: true,
        vibrate: true,
        displayShell: true,
    },
    async init () {
        // init
        this.initSound();
        this.drawer = new Drawer(document.querySelector('.graphics-canvas'));
        Object2d.setDrawer(App.drawer);

        // check for itch
        if(location.host.indexOf('itch') !== -1) App.isOnItch = true;

        // load data
        let loadedData = this.load();
        console.log({loadedData});

        // shell background
        this.setShellBackground(loadedData.shellBackground);

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
        let preloadedResources = await this.preloadImages(forPreload);
        this.preloadedResources = {};
        preloadedResources.forEach((resource, i) => {
            // let name = forPreload[i].slice(forPreload[i].lastIndexOf('/') + 1);
            let name = forPreload[i];
            this.preloadedResources[name] = resource;
        });

        // creating game objects
        App.background = new Object2d({
            // img: "resources/img/background/house/01.jpg",
            image: null, x: 0, y: 0, width: 96, height: 96,
        })
        App.foods = new Object2d({
            image: App.preloadedResources["resources/img/item/foods.png"],
            x: 10, y: 10,
            spritesheet: {
                cellNumber: 11,
                cellSize: 16,
                rows: 4,
                columns: 4
            },
            hidden: true,
        })
        App.poop = new Object2d({
            image: App.preloadedResources["resources/img/misc/poop.png"],
            x: '80%', y: '80%',
            hidden: true,
            onDraw: function() {
                if(!this.nextFlipMs || App.time > this.nextFlipMs) {
                    this.inverted = !this.inverted;
                    this.nextFlipMs = App.time + 300;
                }

            }
        })
        App.petDefinition = new PetDefinition({
            name: getRandomName(),
            sprite: randomFromArray(PET_BABY_CHARACTERS),
        }).setStats({is_egg: true}).loadStats(loadedData.pet);
        App.pet = new Pet(App.petDefinition);
        App.setScene(App.scene.home);
        App.darkOverlay = new Object2d({
            img: "resources/img/background/house/dark_overlay.png",
            hidden: true,
        })
        // App.pet.loadStats(loadedData.pet);

        // simulating offline progression
        if(loadedData.lastTime){
            let elapsedTime = Date.now() - loadedData.lastTime;
            App.pet.simulateOfflineProgression(elapsedTime);

            let awaySeconds = Math.round(elapsedTime/1000);
            let awayMinutes = Math.round(awaySeconds/60);
            let awayHours = Math.round(awayMinutes/60);

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

        // entries
        window.onload = function () {
            // function update(time) {
            //     App.deltaTime = time - App.lastTime;
            //     App.lastTime = time;

            //     App.drawer.draw(App.deltaTime);
            //     requestAnimationFrame(update);
            //     // document.querySelector('.background-canvas').getContext('2d').drawImage(App.drawer.canvas, 0, 0);
            // }

            const analyticsData = {
                session_id: App.sessionId,
                play_time_mins: (Math.round(App.playTime) / 1000 / 60).toFixed(2),
                away: (App.awayTime || -1),
                sprite: App.petDefinition.sprite,
                hunger: Math.round(App.pet.stats.current_hunger),
                fun: Math.round(App.pet.stats.current_fun),
                health: Math.round(App.pet.stats.current_health),
                sleep: Math.round(App.pet.stats.current_sleep),
                bladder: Math.round(App.pet.stats.current_bladder),
                is_egg: App.pet.stats.is_egg,
                has_poop_out: App.pet.stats.has_poop_out,
                is_sleeping: App.pet.stats.is_sleeping,
                gold: App.pet.stats.gold,
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
        document.addEventListener('mousemove', (evt) => {
            var rect = App.drawer.canvas.getBoundingClientRect();
            let x = evt.clientX - rect.left, y = evt.clientY - rect.top;
            if(x < 0) x = 0;
            if(x > rect.width) x = rect.width;
            if(y < 0) y = 0;
            if(y > rect.height) y = rect.height;

            App.mouse = { x: x / 2, y: y / 2 };
        })

        // saver
        setInterval(() => {
            App.save();
        }, 5000);

        // in-game events
        this.handleInGameEvents();

        // load room customizations
        this.applyRoomCustomizations(loadedData.roomCustomizations);

        // hide loading
        document.querySelector('.loading-text').style.display = 'none';  
    },
    applySettings: function(){
        // screen size
        document.querySelector('.graphics-wrapper').style.transform = `scale(${this.settings.screenSize})`;
        document.querySelector('.dom-shell').style.transform = `scale(${this.settings.screenSize})`;
        document.querySelector('.dom-shell').style.display = App.settings.displayShell ? '' : 'none';
    },
    onFrameUpdate: function(time){
        App.time = time;
        App.deltaTime = time - App.lastTime;
        App.lastTime = time;
        App.nDeltaTime = clamp(App.deltaTime || 0, 0, 200) // normal delta time

        App.playTime += App.deltaTime;

        if(App.deltaTime > 5000){ // simulating offline progression
            App.pet.simulateAwayProgression(App.deltaTime);
        }

        requestAnimationFrame(App.onFrameUpdate);
        
        App.fpsCurrentTime = Date.now();
        App.fpsElapsedTime = App.fpsCurrentTime - App.fpsLastTime;

        if(App.fpsElapsedTime > App.fpsInterval){
            App.fpsLastTime = App.fpsCurrentTime - (App.fpsElapsedTime % App.fpsInterval);
            App.drawer.draw();
            App.onDraw();
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
    
                image.src = url;
    
                image.onload = () => resolve(image);
                image.onerror = () => reject(`Image failed to load: ${url}`);
            });
        });
    
        return Promise.all(promises);
    },
    addEvent: function(name, payload){
        App.gameEventsHistory = App.loadedData.eventsHistory || {};
        if(App.gameEventsHistory[name] !== true){
            App.gameEventsHistory[name] = true;
            payload();
            return true;
        }
        return false;
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
            default:
                if(rawCode.indexOf('save:') != -1){ // is char code
                    let b64 = rawCode.replace('save:', '');
                    try {
                        b64 = atob(b64);
                        let json = JSON.parse(b64);
                        if(!json.pet){
                            throw 'error';
                        }
                        let petDef = JSON.parse(json.pet);
                        console.log(json.user_id, App.userId, json.user_id===App.userId);

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
                                                            App.save = () => {};
                                                            window.localStorage.clear();
                                                            for(let key of Object.keys(json)){
                                                                window.localStorage.setItem(key, json[key]);
                                                            }
                                                            window.localStorage.setItem('user_id', App.userId);
                                                            window.localStorage.setItem('play_time', App.playTime);
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
                                            _ignore: json.user_id===App.userId,
                                            name: 'add friend',
                                            onclick: () => {
                                                App.petDefinition.friends.push(def);
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
                                onclick: () => {}
                            },
                        ])
                    } catch(e) {    
                        return App.displayPopup('Character code is corrupted');
                    }
                    return;
                }
                App.displayPopup(`Invalid code`);
                break;
        }
    },
    handleInGameEvents: function(){
        if(!App.awayTime || App.awayTime == -1) return;

        const addEvent = App.addEvent;

        const date = new Date();
        const dayId = date.getFullYear() + '_' + date.getMonth() + '_' + date.getDate();

        // if(addEvent(`update_02_notice`, () => {
        //     App.displayConfirm(`<b>update notice</b>bunch of options were moved from activity menu to the new mobile icon`, [
        //         {
        //             name: 'ok',
        //             onclick: () => {},
        //         }
        //     ]);
        // })) return;

        if(addEvent(`game_suggestions_poll_01`, () => {
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
        })) return;

        if(App.isSalesDay()){
            if(addEvent(`sales_day_${dayId}_notice`, () => {
                App.displayConfirm(`<b>discount day!</b>Shops are selling their products at a discounted rate! Check them out and pile up on them!`, [
                    {
                        name: 'ok',
                        onclick: () => {},
                    }
                ]);
            })) return;
        }
    },
    defintions: {
        food: {
            "bread": {
                sprite: 1,
                hunger_replenish: 15,
                fun_replenish: 0,
                health_replenish: 2,
                price: 2,
                age: [1, 2],
            },
            "slice of pizza": {
                sprite: 10,
                hunger_replenish: 20,
                fun_replenish: 5,
                health_replenish: -5,
                price: 5,
                age: [1, 2],
            },
            "carrot": {
                sprite: 2,
                hunger_replenish: 10,
                fun_replenish: 1,
                health_replenish: 5,
                price: 2,
                age: [1, 2],
            },
            "hamburger": {
                sprite: 9,
                hunger_replenish: 40,
                fun_replenish: 10,
                health_replenish: -20,
                price: 15,
                age: [1, 2],
            },
            "broccoli": {
                sprite: 5,
                hunger_replenish: 15,
                fun_replenish: 0,
                health_replenish: 10,
                price: 3,
                age: [1, 2],
            },
            "milk": {
                sprite: 15,
                hunger_replenish: 50,
                fun_replenish: 10,
                price: 0,
                age: [0],
            },
            "medicine": {
                sprite: 13,
                hunger_replenish: 0,
                fun_replenish: -20,
                health_replenish: 999,
                price: 20,
                type: 'med',
                age: [0, 1, 2],
            },
        },
        item: {
            "foxy": {
                sprite: 1,
                fun_replenish: 20,
                price: 50,
                interaction_time: 12000,
                interruptable: true,
            },
            "dumble": {
                sprite: 2,
                fun_replenish: 10,
                price: 100
            },
            "music player": {
                sprite: 3,
                fun_replenish: 20,
                price: 65
            },
            "ball": {
                sprite: 4,
                fun_replenish: 30,
                price: 35,
                interaction_time: 100000,
                interruptable: true,
            },
            "smartphone": {
                sprite: 5,
                fun_replenish: 80,
                price: 350,
                interaction_time: 100000,
                interruptable: true,
            },
            "magazine": {
                sprite: 6,
                fun_replenish: 10,
                price: 20,
                interaction_time: 60000,
                interruptable: true,
            },
            "microphone": {
                sprite: 7,
                fun_replenish: 20,
                price: 75,
                interaction_time: 60000,
                interruptable: true,
            },   
        },
        room_background: {
            "blue": {
                image: 'resources/img/background/house/02.png',
                price: 200,
            },
            "peachy": {
                image: 'resources/img/background/house/03.png',
                price: 250,
            },
        },
        shell_background: {
            "1": {
                image: 'https://cdn.wallpapersafari.com/23/55/gNpmf4.jpg',
            },
            "2": {
                image: 'https://www.freevector.com/uploads/vector/preview/30386/Outstanding_Colorful_Background_3.jpg',
            },
            "3": {
                image: 'https://cdn.wallpapersafari.com/51/53/4JEOtw.jpg',
            },
            "4": {
                image: 'https://images.rawpixel.com/image_800/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvdjc2MC10b29uLTEyXzEuanBn.jpg',
            },
            "5": {
                image: 'https://e0.pxfuel.com/wallpapers/294/264/desktop-wallpaper-cute-kawaii-background-background-cute-kawaii-computer.jpg',
            },
            "6": {
                image: 'https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTA5L3Jhd3BpeGVsb2ZmaWNlOV9hX3NreV9maWxsZWRfd2l0aF9jbG91ZHNfYW5kX3N0YXJzX21hZGVfb2ZfY290dF85Nzk3Nzk0My0wMDJjLTQwYTQtYjk2NS0zNDUzNDZjNjRhMjBfMS5qcGc.jpg',
            },
            "7": {
                image: 'https://wallpapers-clan.com/wp-content/uploads/2023/12/cute-winter-homes-cozy-wallpaper-scaled.jpg',
            },
            "8": {
                image: 'https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTA5L3Jhd3BpeGVsX29mZmljZV8zM193YWxscGFwZXJfb2ZfY3V0ZV9jbG91ZHNfcmFpbmJvd19ncmFkaWVudF9nbF9iMTg3MGIxNi1kOWY3LTQyODAtYmFkMy1mYzAxMDE0MTg1M2JfMS5qcGc.jpg',
            },
        },
    },
    scene: {
        home: new Scene({
            image: 'resources/img/background/house/02.png',
            petX: '50%', petY: '100%',
            onLoad: () => {
                App.poop.absHidden = false;
            },
            onUnload: () => {
                App.poop.absHidden = true;
            }
        }),
        kitchen: new Scene({
            image: 'resources/img/background/house/kitchen_02.png',
            foodsX: 40, foodsY: 52,
            petX: 62, petY: 74,
        }),
        park: new Scene({
            image: 'resources/img/background/outside/park_02.png',
        }),
        mallWalkway: new Scene({
            image: 'resources/img/background/outside/mall_walkway.png'
        }),
        office: new Scene({
            image: 'resources/img/background/house/office_01.png',
        }),
        wedding: new Scene({
            petX: '50%', petY: '100%',
            image: 'resources/img/background/house/wedding_01.png',
        }),
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
    },
    applyRoomCustomizations(data){
        if(!data) return;

        if(data.home.image) App.scene.home.image = data.home.image;

        App.setScene(App.currentScene);
    },
    getRandomPetDef: function(age){
        if(age === undefined) age = 2;

        let sprite;
        if(age == 0) sprite = randomFromArray(PET_BABY_CHARACTERS);
        else if(age == 1) sprite = randomFromArray(PET_TEEN_CHARACTERS);
        else sprite = randomFromArray(PET_ADULT_CHARACTERS);

        let pet = new PetDefinition({
            sprite,
            name: getRandomName(),
        });
        pet.setStats({
            current_hunger: 100,
            current_sleep: 100,
            current_fun: 100
        });
        return pet;
    },
    handlers: {
        open_main_menu: function(){
            if(App.disableGameplayControls) {
                if(App.gameplayControlsOverwrite) {
                    App.gameplayControlsOverwrite();
                    App.playSound(`resources/sounds/ui_click_01.ogg`, true);
                    App.vibrate();
                }
                return;
            }
            App.playSound(`resources/sounds/ui_click_01.ogg`, true);
            App.vibrate();
            App.displayGrid([
                {
                    name: '<i class="fa-solid fa-line-chart"></i>',
                    name: '<i class="fa-solid fa-dashboard"></i>',
                    onclick: () => {
                        App.handlers.open_stats_menu();
                    }
                },
                {
                    name: '<i class="fa-solid fa-cutlery"></i>',
                    onclick: () => {
                        App.handlers.open_food_list();
                    }
                },
                {
                    name: '<i class="fa-solid fa-bath"></i>',
                    onclick: () => {
                        App.handlers.clean();
                    }
                },
                {
                    name: '<i class="fa-solid fa-bed"></i>',
                    onclick: () => {
                        App.handlers.sleep();
                    }
                },
                {
                    name: '<i class="fa-solid fa-door-open"></i>',
                    onclick: () => {
                        App.handlers.open_activity_list();
                    }
                },
                {
                    name: '<i class="fa-solid fa-box"></i>',
                    onclick: () => {
                        App.handlers.open_item_list();
                    }
                },
                {
                    name: '<i class="fa-solid fa-mobile-alt"></i>',
                    onclick: () => {
                        App.handlers.open_phone();
                    }
                },
                {
                    name: '<i class="fa-solid fa-gear"></i>',
                    onclick: () => {
                        App.handlers.open_settings();
                    }
                }, 
                {
                    name: '<i class="fa-solid fa-arrow-left"></i>',
                    onclick: () => { }
                }, 
                
            ])
        },
        open_settings: function(){
            const settings = App.displayList([
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
                    name: 'system settings',
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
                    name: 'change shell',
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
                                name: 'select shell',
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
                                                btn.querySelector('label').click();
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
                                                    {name: 'cancel', onclick: () => {}},
                                                ]);
                                                return true;
                                            }
                                        }
                                    ]);

                                    let input = display.querySelector('#shell-image-file');
                                    input.onchange = () => {
                                        const file = input.files[0];
                                        const reader = new FileReader();
                                        reader.addEventListener(
                                            "load",
                                            () => {
                                                let res = App.setShellBackground(reader.result);
                                                if(res) App.displayPopup('Shell background set');
                                                return true;
                                            },
                                            false,
                                        );
                                        if (file) {
                                            reader.readAsDataURL(file);
                                        }
                                    }

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
                            {name: 'cancel', onclick: () => {}},
                        ]);
                        return true;
                    }
                },
                {
                    name: 'get save code',
                    onclick: () => {
                        let charCode = 'save:' + btoa(JSON.stringify(window.localStorage));
                        App.displayConfirm(`Here you'll be able to copy your unique save code and continue your playthrough on another device`, [
                            {
                                name: 'ok',
                                onclick: () => {
                                    App.displayConfirm(`After copying the code, open tamaweb on another device and paste the code in <b>settings > input code</b>`, [
                                        {
                                            name: 'ok',
                                            onclick: () => {
                                                navigator.clipboard.writeText(charCode);
                                                console.log('save code copied', charCode);
                                                App.displayPopup('Save code copied!', 1000);
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
                                onclick: () => { }
                            }
                        ])
                        return true;
                    }
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
            ])
        },
        open_stats: function(){
            let list = document.querySelector('.cloneables .generic-list-container').cloneNode(true);
            
            // list.innerHTML = `
            // <div class="inner-padding">
            //     <b>GOLD:</b> $${App.pet.stats.gold}
            //     <br>
            //     <b>HUNGER:</b> ${App.createProgressbar( App.pet.stats.current_hunger / App.pet.stats.max_hunger * 100 ).node.outerHTML}
            //     <b>SLEEP:</b> ${App.createProgressbar( App.pet.stats.current_sleep / App.pet.stats.max_sleep * 100 ).node.outerHTML}
            //     <b>FUN:</b> ${App.createProgressbar( App.pet.stats.current_fun / App.pet.stats.max_fun * 100 ).node.outerHTML}
            // </div>
            // `;

            list.innerHTML = `
            <div class="inner-padding">
                <b>GOLD:</b> $${App.pet.stats.gold}
                <br>
                <b>HUNGER:</b> ${App.createProgressbar( App.pet.stats.current_hunger / App.pet.stats.max_hunger * 100 ).node.outerHTML}
                <b>SLEEP:</b> ${App.createProgressbar( App.pet.stats.current_sleep / App.pet.stats.max_sleep * 100 ).node.outerHTML}
                <b>FUN:</b> ${App.createProgressbar( App.pet.stats.current_fun / App.pet.stats.max_fun * 100 ).node.outerHTML}
            </div>
            `;

            let backBtn = document.createElement('button');
                backBtn.className = 'list-item back-btn';
                backBtn.innerHTML = 'BACK';
                backBtn.onclick = () => {
                    list.remove();
                };

            list.appendChild(backBtn);
            list.style['z-index'] = 3;

            document.querySelector('.screen-wrapper').appendChild(list);
        },
        open_food_list: function(buyMode, activeIndex){
            let list = [];
            let sliderInstance;
            let salesDay = App.isSalesDay();
            for(let food of Object.keys(App.defintions.food)){
                let current = App.defintions.food[food];

                if(!current.age.includes(App.petDefinition.lifeStage)) continue;

                if(buyMode && current.price == 0) continue;

                // check if current pet has this food on its inventory
                if(current.price && !App.pet.inventory.food[food] && !buyMode){
                    continue;
                }

                // 50% off on sales day
                let price = current.price;
                if(salesDay) price = Math.round(price / 2);

                list.push({
                    name: `<c-sprite width="16" height="16" index="${(current.sprite - 1)}" src="resources/img/item/foods.png"></c-sprite> ${food.toUpperCase()} (x${App.pet.inventory.food[food] > 0 ? App.pet.inventory.food[food] : (!current.price ? '∞' : 0)}) <b>${buyMode ? `$${price}` : ''}</b>`,
                    onclick: (btn, list) => {
                        if(buyMode){
                            if(App.pet.stats.gold < price){
                                App.displayPopup(`Don't have enough gold!`);
                                return true;
                            }
                            App.pet.stats.gold -= price;
                            if(!App.pet.inventory.food[food]){
                                App.pet.inventory.food[food] = 1;
                            } else {
                                App.pet.inventory.food[food] += 1;
                            }
                            // console.log(list.scrollTop);
                            let nList = App.handlers.open_food_list(true, sliderInstance?.getCurrentIndex());
                                // nList.scrollTop = list.scrollTop;
                            return false;
                        }
                        let ateFood = App.pet.feed(current.sprite, current.hunger_replenish, current.type);
                        if(ateFood) {
                            App.pet.inventory.food[food] -= 1;
                            App.pet.stats.current_fun += current.fun_replenish;
                            if(App.pet.hasMoodlet('healthy') && current.type === 'med')
                                App.pet.stats.current_health = App.pet.stats.current_health * 0.6;
                            else
                                App.pet.stats.current_health += current.health_replenish;
                        }
                    }
                })
            }

            if(!list.length){
                App.displayPopup(`You don't have any food, purchase some from the mall`, 2000);
                return;
            }

            sliderInstance = App.displaySlider(list, activeIndex, {accept: buyMode ? 'Purchase' : 'Eat'}, buyMode ? `$${App.pet.stats.gold + (salesDay ? ` <span class="sales-notice">DISCOUNT DAY!</span>` : '')}` : null);
            return sliderInstance;
            return App.displayList(list);
        },
        open_stats_menu: function(){
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
                    name: 'achievements',
                    onclick: () => {
                        App.handlers.open_achievements_list();
                        return true;
                    }
                },
                {
                    name: 'set pet name',
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
                            {name: 'cancel', onclick: () => {}},
                        ], App.pet.petDefinition.name);
                        return true;
                    }
                },

            ])
        },
        open_profile: function(){
            let age = 'baby';
            switch(App.petDefinition.getLifeStage()){
                case 1: age = 'teen'; break;
                case 2: age = 'adult'; break;
            }

            App.displayConfirm(`
                ${App.petDefinition.getCSprite()}
                <br>
                <b>${App.petDefinition.name} <br><small>(${age})</small></b>
                <br>
                Born ${moment(App.petDefinition.birthday).utc().fromNow()}
            `, [
                {
                    name: 'back',
                    onclick: () => {}
                }
            ])
        },
        open_achievements_list: function(){
            const configureAchievement = (name, id, condition) => {
                let btn = {
                    name: `<small>???</small>`,
                    onclick: () => { return true },
                }
                
                if(condition){
                    btn.name = `<small>${name}</small>${App.getBadge('★', 'gray')}`;
                }

                return btn;
            }
            let list = [
                configureAchievement('a week with you', `pass_10_days_with_pet`, moment().diff(App.petDefinition.birthday, 'days') >= 7),
                configureAchievement('rich kid', `rich_kid`, App.pet.stats.gold > 2000),
                configureAchievement('play for 10 minutes', `10_mins`, (App.playTime / 1000 / 60) >= 10),
                configureAchievement('play for 2 hours', `2_hours`, (App.playTime / 1000 / 60 / 60) >= 2),
                configureAchievement('play for 5 hours', `5_hours`, (App.playTime / 1000 / 60 / 60) >= 5),
                configureAchievement('play for 10 hours', `10_hours`, (App.playTime / 1000 / 60 / 60) >= 10),

                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
                configureAchievement('placeholder', `_placeholder_`, false),
            ];

            return App.displayList(list);
        },
        open_item_list: function(buyMode, activeIndex, customPayload){
            let list = [];
            let sliderInstance;
            let salesDay = App.isSalesDay();
            for(let item of Object.keys(App.defintions.item)){
                // check if current pet has this item on its inventory
                if(!App.pet.inventory.item[item] && !buyMode){
                    continue;
                }
                let current = App.defintions.item[item];

                // 50% off on sales day
                let price = current.price;
                if(salesDay) price = Math.round(price / 2);

                list.push({
                    name: `<c-sprite width="22" height="22" index="${(current.sprite - 1)}" src="resources/img/item/items.png"></c-sprite> ${item.toUpperCase()} (x${App.pet.inventory.item[item] || 0}) <b>${buyMode ? `$${price}` : ''}</b>`,
                    onclick: (btn, list) => {
                        if(buyMode){
                            if(App.pet.stats.gold < price){
                                App.displayPopup(`Don't have enough gold!`);
                                return true;
                            }
                            App.pet.stats.gold -= price;
                            if(!App.pet.inventory.item[item]){
                                App.pet.inventory.item[item] = 1;
                            } else {
                                App.pet.inventory.item[item] += 1;
                            }
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
            const buyMode = true;
            for(let room of Object.keys(App.defintions.room_background)){
                let current = App.defintions.room_background[room];

                // 50% off on sales day
                let price = current.price;
                if(salesDay) price = Math.round(price / 2);

                list.push({
                    // name: `<c-sprite width="22" height="22" index="${(current.sprite - 1)}" src="resources/img/item/items.png"></c-sprite> ${item.toUpperCase()} (x${App.pet.inventory.item[item] || 0}) <b>$${buyMode ? `${price}` : ''}</b>`,
                    name: `<img src="${current.image}"></img> ${room.toUpperCase()} <b>$${price}</b>`,
                    onclick: (btn, list) => {
                        if(current.image === App.scene.home.image){
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
                        App.scene.home.image = current.image;

                        App.sendAnalytics('home_background_change', App.scene.home.image);

                        return false;
                    }
                })
            }

            sliderInstance = App.displaySlider(list, null, {accept: 'Purchase'}, `$${App.pet.stats.gold + (salesDay ? ` <span class="sales-notice">DISCOUNT DAY!</span>` : '')}`);
            return sliderInstance;
            return App.displayList(list);
        },
        open_shell_background_list: function(){
            let list = [];
            let sliderInstance;
            let salesDay = App.isSalesDay();
            for(let entry of Object.keys(App.defintions.shell_background)){
                let current = App.defintions.shell_background[entry];

                // 50% off on sales day
                let price = current.price;
                if(salesDay) price = Math.round(price / 2);

                list.push({
                    // name: `<c-sprite width="22" height="22" index="${(current.sprite - 1)}" src="resources/img/item/items.png"></c-sprite> ${item.toUpperCase()} (x${App.pet.inventory.item[item] || 0}) <b>$${buyMode ? `${price}` : ''}</b>`,
                    name: `<img src="${current.image}"></img>`,
                    onclick: (btn, list) => {
                        // if(current.image === App.scene.home.image){
                        //     App.displayPopup('You already own this entry');
                        //     return true;
                        // }

                        // if(App.pet.stats.gold < price){
                        //     App.displayPopup(`Don't have enough gold!`);
                        //     return true;
                        // }
                        // App.pet.stats.gold -= price;

                        // App.closeAllDisplays();
                        // Activities.redecorRoom();
                        // App.scene.home.image = current.image;

                        // App.sendAnalytics('home_background_change', App.scene.home.image);
                        App.setShellBackground(current.image);
                        return true;
                    }
                })
            }

            sliderInstance = App.displaySlider(list, null, {accept: 'Set'});
            return sliderInstance;
            return App.displayList(list);
        },
        open_activity_list: function(){
            return App.displayList([
                {
                    name: 'mall',
                    onclick: () => {
                        Activities.goToMall();
                    }
                },
                {
                    name: 'park',
                    onclick: () => { // going to park with random pet
                        Activities.goToPark();
                    }
                },
                {
                    _ignore: App.petDefinition.lifeStage < 2,
                    name: 'work',
                    onclick: () => {
                        Activities.officeWork();
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
        open_friends_list: function(){
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
                        const friendActivitiesList = App.displayList([
                            {
                                name: 'info',
                                onclick: () => {
                                    let list = document.querySelector('.cloneables .generic-list-container').cloneNode(true);
            
                                    // list.innerHTML = `
                                    // <div class="inner-padding">
                                    //     <b>GOLD:</b> $${App.pet.stats.gold}
                                    //     <br>
                                    //     <b>HUNGER:</b> ${App.createProgressbar( App.pet.stats.current_hunger / App.pet.stats.max_hunger * 100 ).node.outerHTML}
                                    //     <b>SLEEP:</b> ${App.createProgressbar( App.pet.stats.current_sleep / App.pet.stats.max_sleep * 100 ).node.outerHTML}
                                    //     <b>FUN:</b> ${App.createProgressbar( App.pet.stats.current_fun / App.pet.stats.max_fun * 100 ).node.outerHTML}
                                    // </div>
                                    // `;
                        
                                    list.innerHTML = `
                                    <div class="inner-padding uppercase">
                                        ${icon} ${friendDef.name}
                                        <br>
                                        <b>Friendship:</b> ${App.createProgressbar( friendDef.getFriendship() / 100 * 100 ).node.outerHTML}
                                    </div>
                                    `;
                        
                                    let backBtn = document.createElement('button');
                                        backBtn.className = 'list-item back-btn';
                                        backBtn.innerHTML = 'BACK';
                                        backBtn.onclick = () => {
                                            list.remove();
                                        };
                        
                                    list.appendChild(backBtn);
                                    list.style['z-index'] = 3;
                        
                                    document.querySelector('.screen-wrapper').appendChild(list);
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
                                                        onclick: () => {}
                                                    },
                                                ]);
                                            }
                                        },
                                        {
                                            name: 'cancel',
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
                                    Activities.inviteHousePlay(friendDef);
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
                                            }
                                        },
                                        {
                                            name: 'no',
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
                    name: 'friends',
                    onclick: () => {
                        // App.displayPopup('To be implemented...', 1000);
                        App.handlers.open_friends_list();
                        return true;
                    }
                },
                {
                    _ignore: App.petDefinition.lifeStage >= 2,
                    name: 'have birthday',
                    onclick: () => {
                        let nextBirthday = App.petDefinition.nextBirthdayDate();
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
                                onclick: () => {},
                            }
                        ])
                    }
                },
                {
                    name: 'doctor visit',
                    onclick: () => {
                        // App.displayPopup(`${App.pet.stats.current_health}`, 1000);
                        Activities.inviteDoctorVisit();
                    }
                },
            ])
        },
        open_mall_activity_list: function(){
            App.displayList([
                {
                    name: 'game center',
                    onclick: () => {
                        App.handlers.open_game_list();
                        return true;
                    }
                },
                {
                    name: 'buy groceries',
                    onclick: () => {
                        App.handlers.open_food_list(true);
                        return true;
                    }
                },
                {
                    name: 'buy items',
                    onclick: () => {
                        App.handlers.open_item_list(true);
                        return true;
                    }
                },
                {
                    name: 'redécor room',
                    onclick: () => {
                        App.handlers.open_room_background_list(true);
                        return true;
                    }
                },
            ]);
        },
        open_game_list: function(){
            App.displayList([
                {
                    name: 'rod rush',
                    onclick: () => {
                        // return Activities.barTimingGame();
                        App.displayPopup(`Stop the pointer at the perfect time!`, 1500, () => Activities.barTimingGame())
                        return false;
                    }
                },
                {
                    name: 'park game',
                    onclick: () => {
                        return Activities.parkRngGame();
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
            if(App.disableGameplayControls) return;
            let displayCount = 0;
            [...document.querySelectorAll('.display')].forEach(display => {
                if(!display.closest('.cloneables')){
                    displayCount++;
                }
            });

            if(displayCount) App.closeAllDisplays();
            else App.handlers.open_main_menu();
        },
        sleep: function(){
            App.pet.sleep();
            App.save();
        },
        clean: function(){
            App.pet.stopMove();
            App.pet.triggerScriptedState('idle', App.INF, false, true);
            App.pet.x = 20;
            App.toggleGameplayControls(false);
            const mop = new Object2d({
                image: App.preloadedResources["resources/img/misc/cleaner.png"],
                x: 0,
                y: -100,
                width: 96, height: 96,
                onDraw: function(){
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
                        App.pet.stats.current_bladder = App.pet.stats.max_bladder;
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
        return;
        let gameplayButtons = [...document.querySelectorAll('.main-action-icon')];
        if(!state){
            // gameplayButtons.classList.add('disabled');
            gameplayButtons.forEach(btn => {
                if(btn.id == 'stats') return;
                btn.classList.add('disabled');
            })
        } else {
            gameplayButtons.forEach(btn => {
                btn.classList.remove('disabled');
            })
        }
    },
    createProgressbar: function(percent){
        let progressbar = document.querySelector('.cloneables .progressbar').cloneNode(true);

        let rod = progressbar.querySelector('.progressbar-rod'), background = progressbar.querySelector('.progressbar-background');

        let colors = {
            green: ['#00ff3978', '#2f793f'],
            red: ['#ff000075', '#ff0000'],
            yellow: ['#ffcd71b0', '#ffcd71']
        }

        function setPercent(percent){
            rod.style.width = `${percent}%`;
            
            let colorSet = colors.green;
            if(percent < 30) colorSet = colors.red;
            else if(percent < 60) colorSet = colors.yellow;
            
            let rodColor = `linear-gradient(90deg, ${colorSet[0]}, ${colorSet[1]})`;
            rod.style.background = rodColor;

            background.style.background = `repeating-linear-gradient(90deg, ${colorSet[1]} 5px, transparent, transparent 10px)`;
        }

        setPercent(percent);

        return {
            node: progressbar,
            setPercent
        }
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
    displayList: function(listItems, backFn){
        listItems.push({
            name: 'BACK',
            class: 'back-btn',
            onclick: () => {
                if(backFn) backFn();
                return false;
            }
        })

        let list = document.querySelector('.cloneables .generic-list-container').cloneNode(true);

        list.close = function(){
            list.remove();
        }

        listItems.forEach((item, i) => {
            if(item._ignore) return;

            let button = document.createElement(item.link ? 'a' : 'button');
                if(item.link){
                    button.href = item.link;
                    button.target = '_blank';
                }
                button.className = 'list-item' + (item.class ? ' ' + item.class : '');
                if(i == listItems.length - 2) button.className += ' last-btn';
                // '⤳ ' + 
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

        let maxIndex = listItems.length,
            currentIndex = activeIndex || 0,
            contentElement = list.querySelector('.content'),
            acceptBtn = list.querySelector('.accept-btn'),
            cancelBtn = list.querySelector('.cancel-btn');

        list.close = function(){
            list.remove();
        }

        cancelBtn.innerHTML = options?.cancel || 'Back';
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
    displayPopup: function(content, ms, onEndFn){
        let list = document.querySelector('.cloneables .generic-list-container').cloneNode(true);
            list.innerHTML = `
                <div class="uppercase flex-center">
                    <div class="inner-padding bg-white b-radius-10">
                        ${content}
                    </div>
                </div>
            `;
            list.style['z-index'] = 3;
        setTimeout(() => {
            list.remove();
            if(onEndFn){
                onEndFn();
            }
        }, ms || 2000);
        document.querySelector('.screen-wrapper').appendChild(list);
        return list;
    },
    displayConfirm: function(text, buttons){
        let list = document.querySelector('.cloneables .generic-list-container').cloneNode(true);
            list.innerHTML = `
                <div class="uppercase flex-center">
                    <div class="inner-padding bg-white b-radius-10">
                        ${text}
                    </div>
                </div>
                <div class="buttons-container"></div>
            `;
            list.style['z-index'] = 3;
            list.style['background'] = 'linear-gradient(0deg, #aec6ff, #dec0ff)';
            
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
            btn.className = 'list-item';
            if(def.name == 'back') btn.className += ' back-btn';
            btn.onclick = () => {
                if(!def.onclick()) list.close();
            }
            btnContainer.appendChild(btn);
        });

        document.querySelector('.screen-wrapper').appendChild(list);
        return list;
    },
    displayPrompt: function(text, buttons, defualtValue){
        let list = document.querySelector('.cloneables .generic-list-container').cloneNode(true);
            list.innerHTML = `
                <div class="uppercase flex-center">
                    <div class="inner-padding bg-white b-radius-10">
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
        if(defualtValue !== undefined) input.value = defualtValue;

        list.insertBefore(input, btnContainer);

        buttons.forEach(def => {
            if(def._ignore) return;

            const btn = document.createElement('button');
            btn.innerHTML = def.name;
            btn.className = 'list-item';
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
    getBadge: function(text, color){
        if(!text) text = 'new!';
        if(!color) color = 'red';
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
        document.addEventListener('click', (e) => {
            if(e.target.nodeName.toLowerCase() === 'button' || e.target.classList.contains('list-item') || e.target.classList.contains('click-sound') || e.target.parentElement?.nodeName.toLowerCase() === 'button'){
                App.vibrate();
                if(e.target.classList.contains('back-btn') || e.target.textContent.toLowerCase() == 'back')
                    this.playSound(`resources/sounds/ui_click_02.ogg`, true);
                else
                    this.playSound(`resources/sounds/ui_click_01.ogg`, true);
            }
        })
    },
    isSalesDay: function(){
        let day = new Date().getDate();
        return [7, 12, 18, 20, 25, 29, 30].includes(day);
    },
    playSound: function(path, force){
        if(!App.settings.playSound) return;

        if(this.audioChannelIsBusy && !force) return false;

        if(this.audioElement.src != path)
            this.audioElement.src = path;
        this.audioElement.play();
        this.audioChannelIsBusy = true;
    },
    save: function(){
        // return;
        // setCookie('pet', App.pet.serializeStats(), 365);
        window.localStorage.setItem('pet', App.pet.serializeStats());
        window.localStorage.setItem('settings', JSON.stringify(App.settings));
        window.localStorage.setItem('last_time', Date.now());
        window.localStorage.setItem('user_id', App.userId);
        window.localStorage.setItem('ingame_events_history', JSON.stringify(App.gameEventsHistory));
        window.localStorage.setItem('play_time', App.playTime);
        window.localStorage.setItem('shell_background', App.shellBackground);
        window.localStorage.setItem('room_customization', JSON.stringify({
            home: {
                image: App.scene.home.image,
            }
        }))
        // -3600000
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

        // user id
        let userId = window.localStorage.getItem('user_id') || Math.round(Math.random() * 9999999999);
        App.userId = userId;

        App.playTime = parseInt(window.localStorage.getItem('play_time') || 0);

        let shellBackground = window.localStorage.getItem('shell_background') || `https://cdn.wallpapersafari.com/23/55/gNpmf4.jpg`;
        App.shellBackground = shellBackground;

        App.loadedData = {
            pet, settings, lastTime, eventsHistory, roomCustomizations, shellBackground
        };

        return App.loadedData;
    },
    vibrate: function(dur){
        if(!App.settings.vibrate) return;
        navigator?.vibrate(dur || 35);
    },
    sendAnalytics: function(type, value, force){
        if(!force && App.ENV !== 'prod') return;

        if(!type) type = 'default';

        if(App.isOnItch) type += '_itch';

        let url = `https://docs.google.com/forms/d/e/1FAIpQLSfzl5hhhnV3IAdxuA90ieEaeBAhCY9Bh4s151huzTMeByMwiw/formResponse?usp=pp_url&entry.1384465975=${App.userId}&entry.1653037117=${App.petDefinition?.name || ''}&entry.1322693089=${type}&entry.1403809294=${value || ''}`;

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
        return true;
    },
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
                    onclick: () => {
                        App.displayPopup(`You can install the game as an app anytime from the <b>settings</b>`)
                    }
                },
            ])
        })
    }
});