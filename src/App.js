let App = {
    INF: 999999999, deltaTime: 0, lastTime: 0, mouse: {x: 0, y: 0},
    settings: {
        screenSize: 1,
    },
    async init () {
        // init
        this.initSound();
        this.drawer = new Drawer(document.querySelector('.graphics-canvas'));
        Object2d.setDrawer(App.drawer);

        // load data
        let loadedData = this.load();
        console.log({loadedData});

        // handle settings
        if(loadedData.settings){
            Object.assign(this.settings, loadedData.settings);
        }
        this.applySettings();

        // handle preloading
        let forPreload = [
            ...SPRITES,
            ...PET_CHARACTERS,
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
        })
        App.petDefinition = new PetDefinition({
            name: getRandomName(),
            sprite: randomFromArray(PET_CHARACTERS),
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


            if(awaySeconds > 2){
                App.displayPrompt(`Welcome back!\n<b>${App.petDefinition.name}</b> missed you in those <b>${message}</b> you were away`, [
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

            // update(0);
            App.targetFps = 60;
            App.fpsInterval = 1000 / App.targetFps;
            App.fpsLastTime = Date.now();
            App.fpsStartTime = App.fpsLastTime;
            App.onFrameUpdate(0);
        }
        window.onbeforeunload = function(){
            App.save();
        }

        // mouse pos on canvas
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
    },
    applySettings: function(){
        // screen size
        document.querySelector('.graphics-wrapper').style.transform = `scale(${this.settings.screenSize})`;
    },
    onFrameUpdate: function(time){
        App.deltaTime = time - App.lastTime;
        App.lastTime = time;

        if(App.deltaTime > 5000){ // simulating offline progression
            App.pet.simulateAwayProgression(App.deltaTime);
        }

        requestAnimationFrame(App.onFrameUpdate);
        
        App.fpsCurrentTime = Date.now();
        App.fpsElapsedTime = App.fpsCurrentTime - App.fpsLastTime;

        if(App.fpsElapsedTime > App.fpsInterval){
            App.fpsLastTime = App.fpsCurrentTime - (App.fpsElapsedTime % App.fpsInterval);
            App.drawer.draw();
        }

        // App.drawer.pixelate();
        // App.drawUI();
        // document.querySelector('.background-canvas').getContext('2d').drawImage(App.drawer.canvas, 0, 0);
    },
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
    defintions: {
        food: {
            "bread": {
                sprite: 1,
                hunger_replenish: 15,
                fun_replenish: 0,
                health_replenish: 2,
                price: 3,
            },
            "slice of pizza": {
                sprite: 10,
                hunger_replenish: 15,
                fun_replenish: 5,
                health_replenish: -5,
                price: 5,
            },
            "carrot": {
                sprite: 2,
                hunger_replenish: 10,
                fun_replenish: 1,
                health_replenish: 5,
                price: 2,
            },
            "hamburger": {
                sprite: 9,
                hunger_replenish: 40,
                fun_replenish: 10,
                health_replenish: -20,
                price: 15,
            },
            "broccoli": {
                sprite: 5,
                hunger_replenish: 15,
                fun_replenish: 0,
                health_replenish: 10,
                price: 3,
            },
            "medicine": {
                sprite: 13,
                hunger_replenish: 0,
                fun_replenish: -20,
                health_replenish: 999,
                price: 20,
                type: 'med',
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
        }
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
            image: 'resources/img/background/house/kitchen_01.png',
            foodsX: 40, foodsY: 58,
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
    },
    getRandomPetDef: function(){
        let pet = new PetDefinition({
            name: getRandomName(),
            sprite: randomFromArray(PET_CHARACTERS),
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
                }
                return;
            }
            App.playSound(`resources/sounds/ui_click_01.ogg`, true);
            App.displayGrid([
                {
                    name: '📊',
                    onclick: () => {
                        App.handlers.open_stats();
                    }
                },
                {
                    name: '🍴',
                    onclick: () => {
                        App.handlers.open_food_list();
                    }
                },
                {
                    name: '🛁',
                    onclick: () => {
                        App.handlers.clean();
                    }
                },
                {
                    name: '🛏️',
                    onclick: () => {
                        App.handlers.sleep();
                    }
                },
                {
                    name: '🚪',
                    onclick: () => {
                        App.handlers.open_activity_list();
                    }
                },
                {
                    name: '📦',
                    onclick: () => {
                        App.handlers.open_item_list();
                    }
                },
                {
                    name: '💓',
                    onclick: () => {
                        App.handlers.open_friends_list();
                    }
                },
                {
                    name: '⚙️',
                    onclick: () => {
                        App.handlers.open_settings();
                    }
                }, 
            ])
        },
        open_settings: function(){
            const settings = App.displayList([
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
                {
                    name: 'set pet name',
                    onclick: () => {
                        App.pet.petDefinition.name = prompt(`Enter your pet's name:`, App.pet.petDefinition.name) || App.pet.petDefinition.name;
                        App.save();
                        App.displayPopup(`Name set to "${App.pet.petDefinition.name}"`)
                    }
                },
                // {
                //     name: 'set pet def',
                //     onclick: () => {
                //         // "resources/img/character/chara_246b.png"
                //         App.pet.petDefinition.sprite = prompt(`Enter character's id:`, App.pet.petDefinition.sprite) || App.pet.petDefinition.sprite;
                //         App.save();
                //         location.reload();
                //     }
                // },
                {
                    name: 'reset save data',
                    onclick: () => {
                        App.displayPrompt('Are you sure you want to delete your save game?', [
                            {
                                name: 'yes',
                                onclick: () => {
                                    App.save = () => {};
                                    localStorage.clear();
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
                }
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
            for(let food of Object.keys(App.defintions.food)){
                // check if current pet has this food on its inventory
                if(!App.pet.inventory.food[food] && !buyMode){
                    continue;
                }
                let current = App.defintions.food[food];
                list.push({
                    name: `<c-sprite width="16" height="16" index="${(current.sprite - 1)}" src="resources/img/item/foods.png"></c-sprite> ${food.toUpperCase()} (x${App.pet.inventory.food[food] || 0}) ${buyMode ? ` - $${current.price}` : ''}`,
                    onclick: (btn, list) => {
                        if(buyMode){
                            if(App.pet.stats.gold < current.price){
                                App.displayPopup(`Don't have enough gold!`);
                                return true;
                            }
                            App.pet.stats.gold -= current.price;
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

            sliderInstance = App.displaySlider(list, activeIndex, {accept: buyMode ? 'Purchase' : 'Eat'});
            return sliderInstance;
            return App.displayList(list);
        },
        open_item_list: function(buyMode, activeIndex, customPayload){
            let list = [];
            let sliderInstance;
            for(let item of Object.keys(App.defintions.item)){
                // check if current pet has this item on its inventory
                if(!App.pet.inventory.item[item] && !buyMode){
                    continue;
                }
                let current = App.defintions.item[item];
                list.push({
                    name: `<c-sprite width="22" height="22" index="${(current.sprite - 1)}" src="resources/img/item/items.png"></c-sprite> ${item.toUpperCase()} (x${App.pet.inventory.item[item] || 0}) ${buyMode ? ` - $${current.price}` : ''}`,
                    onclick: (btn, list) => {
                        if(buyMode){
                            if(App.pet.stats.gold < current.price){
                                App.displayPopup(`Don't have enough gold!`);
                                return true;
                            }
                            App.pet.stats.gold -= current.price;
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

            sliderInstance = App.displaySlider(list, activeIndex, {accept: buyMode ? 'Purchase' : 'Use'});
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
                    name: 'friends',
                    onclick: () => {
                        // App.displayPopup('To be implemented...', 1000);
                        App.handlers.open_friends_list();
                        return true;
                    }
                },
                {
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
                {
                    name: 'doctor visit',
                    onclick: () => {
                        // App.displayPopup(`${App.pet.stats.current_health}`, 1000);
                        Activities.inviteDoctorVisit();
                    }
                }
            ])
        },
        open_friends_list: function(){
            if(!App.petDefinition.friends.length){
                App.displayPopup(`${App.petDefinition.name} doesn't have any friends right now`, 2000);
                return;
            }

            const friendsList = App.displayList(App.petDefinition.friends.map((friendDef, index) => {
                const name = friendDef.name || 'Unknown';
                const icon = `<c-sprite width="20" height="20" index="0" src="${friendDef.sprite}" pos-x="6" pos-y="4" style="margin-right: 10px;"></c-sprite>`;
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
                                    App.displayPrompt(`Are you sure you want to give gift to ${icon} ${name}?`, [
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
                                    App.displayPrompt(`Are you sure you want to unfriend ${icon} ${name}?`, [
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
            ]);
        },
        open_game_list: function(){
            App.displayList([
                {
                    name: 'park game',
                    onclick: () => {
                        return Activities.parkRngGame();
                    }
                },
                {
                    name: 'guess game (wip)',
                    onclick: () => {
                        // return Activities.guessGame();
                    }
                },
            ]);
        },
        open_battle_screen: function(){
            Battle.start();
        },
        sleep: function(){
            App.pet.sleep();
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
                display.close();
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

        listItems.forEach(item => {
            let button = document.createElement('button');
                button.className = 'list-item ' + (item.class ? item.class : '');
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
        listItems.push({
            name: '⬅️',
            class: 'back-btn',
            onclick: () => {
                return false;
            }
        })

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
    displaySlider: function(listItems, activeIndex, options){
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
                <div class="inner-padding uppercase flex-center">
                    ${content}
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
    displayPrompt: function(text, buttons){
        let list = document.querySelector('.cloneables .generic-list-container').cloneNode(true);
            list.innerHTML = `
                <div class="inner-padding uppercase flex-center">
                    ${text}
                </div>
                <div class="buttons-container"></div>
            `;
            list.style['z-index'] = 3;
            
            list.close = function(){
                list.remove();
            }

        const btnContainer = list.querySelector('.buttons-container');
        buttons.forEach(def => {
            const btn = document.createElement('button');
            btn.innerHTML = def.name;
            btn.className = 'list-item';
            btn.onclick = () => {
                if(!def.onclick()) list.close();
            }
            btnContainer.appendChild(btn);
        });

        document.querySelector('.screen-wrapper').appendChild(list);
        return list;
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
            if(e.target.nodeName.toLowerCase() === 'button'){
                if(e.target.classList.contains('back-btn') || e.target.textContent.toLowerCase() == 'back')
                    this.playSound(`resources/sounds/ui_click_02.ogg`, true);
                else
                    this.playSound(`resources/sounds/ui_click_01.ogg`, true);
            }
        })
    },
    playSound: function(path, force){
        if(this.audioChannelIsBusy && !force) return false;

        if(this.audioElement.src != path)
            this.audioElement.src = path;
        this.audioElement.play();
        this.audioChannelIsBusy = true;
    },
    save: function(){
        // setCookie('pet', App.pet.serializeStats(), 365);
        localStorage.setItem('pet', App.pet.serializeStats());
        localStorage.setItem('settings', JSON.stringify(App.settings));
        localStorage.setItem('last_time', Date.now());
        // -3600000
    },
    load: function(){
        let pet = localStorage.getItem('pet');
            pet = pet ? JSON.parse(pet) : {};

        let settings = localStorage.getItem('settings');
            settings = settings ? JSON.parse(settings) : null;

        let lastTime = localStorage.getItem('last_time') || false;
        return {
            pet, settings, lastTime
        }
    }
}