let App = {
    deltaTime: 0, lastTime: 0, mouse: {x: 0, y: 0},
    async init () {
        this.initSound();
        this.drawer = new Drawer(document.querySelector('.graphics-canvas'));

        Object2d.setDrawer(App.drawer);

        let loadedData = this.load();

        console.log({loadedData});

        let forPreload = [
            "resources/img/background/house/01.jpg",
            "resources/img/background/house/kitchen_01.png",
            "resources/img/item/foods.png",
            ...PET_CHARACTERS,
        ];
        
        let preloadedResources = await this.preloadImages(forPreload);

        this.preloadedResources = {};
        preloadedResources.forEach((resource, i) => {
            // let name = forPreload[i].slice(forPreload[i].lastIndexOf('/') + 1);
            let name = forPreload[i];
            this.preloadedResources[name] = resource;
        });

        App.background = new Object2d({
            // img: "resources/img/background/house/01.jpg",
            image: App.preloadedResources["resources/img/background/house/01.jpg"],
            x: 0, y: 0, width: 96, height: 96,
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

        App.petDefinition = new PetDefinition({
            name: 'pet',
            sprite: "resources/img/character/chara_189b.png",
        }).loadStats(loadedData.pet);

        App.pet = new Pet(App.petDefinition);
        // App.pet.loadStats(loadedData.pet);

        window.onload = function () {
            // function update(time) {
            //     App.deltaTime = time - App.lastTime;
            //     App.lastTime = time;

            //     App.drawer.draw(App.deltaTime);
            //     requestAnimationFrame(update);
            //     // document.querySelector('.background-canvas').getContext('2d').drawImage(App.drawer.canvas, 0, 0);
            // }

            // update(0);
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
    onFrameUpdate: function(time){
        App.deltaTime = time - App.lastTime;
        App.lastTime = time;

        App.drawer.draw();
        // App.drawer.pixelate();
        // App.drawUI();
        requestAnimationFrame(App.onFrameUpdate);
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
                price: 3,
            },
            "slice of pizza": {
                sprite: 10,
                hunger_replenish: 15,
                fun_replenish: 5,
                price: 5,
            },
            "carrot": {
                sprite: 2,
                hunger_replenish: 10,
                fun_replenish: 1,
                price: 2,
            },
            "hamburger": {
                sprite: 9,
                hunger_replenish: 40,
                fun_replenish: 10,
                price: 15,
            },
            "broccoli": {
                sprite: 5,
                hunger_replenish: 15,
                fun_replenish: 0,
                price: 3,
            }
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
            if(App.disableGameplayControls) return;
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
                    name: '🛣️',
                    onclick: () => {
                        App.handlers.open_activity_list();
                    }
                },
                {
                    name: '💤',
                    onclick: () => {
                        App.handlers.sleep();
                    }
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
                        let ateFood = App.pet.feed(current.sprite, current.hunger_replenish);
                        if(ateFood) {
                            App.pet.inventory.food[food] -= 1;
                            App.pet.stats.current_fun += current.fun_replenish;
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
        open_activity_list: function(){
            let dis = App.displayList;
            return dis([
                {
                    name: 'mall',
                    onclick: () => {
                        App.pet.switchScene('park');
                        App.pet.triggerScriptedState('moving', 1000, null, true, () => {
                            App.pet.switchScene('house');
                            App.handlers.open_mall_activity_list();
                        }, Pet.scriptedEventDrivers.movingOut.bind({pet: App.pet}));
                    }
                },
                {
                    name: 'park',
                    onclick: () => { // going to park with random pet
                        App.handlers.go_to_park();
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
                    name: 'baby sitter',
                    onclick: () => {
                        App.displayPopup('To be implemented...', 1000);
                        return true;
                    }
                },
            ])
        },
        open_friends_list: function(){
            if(!App.petDefinition.friends.length){
                App.displayPopup(`You don't have any friends right now`, 2000);
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
                                name: 'park',
                                onclick: () => {
                                    App.closeAllDisplays();
                                    App.handlers.go_to_park(friendDef);
                                }
                            },
                            {
                                name: 'unfriend',
                                onclick: () => {
                                    App.displayPrompt(`Are you sure you want to unfriend ${name}?`, [
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
        go_to_park: function(otherPetDef){
            if(!otherPetDef){
                otherPetDef = App.getRandomPetDef();
            }
            App.pet.switchScene('park');
            App.toggleGameplayControls(false);
            let otherPet = new Pet(otherPetDef);
            if(App.petDefinition.friends.indexOf(otherPetDef) === -1){ 
                App.petDefinition.friends.push(otherPetDef);
            }
            App.pet.triggerScriptedState('playing', 10000, null, true, () => {
                App.pet.x = '50%';
                App.pet.stats.current_fun += 40;
                App.pet.statsManager();
                App.pet.playCheeringAnimationIfTrue(App.pet.hasMoodlet('amused'), () => App.pet.switchScene('house'));
                App.drawer.removeObject(otherPet);
                App.toggleGameplayControls(true);
            }, Pet.scriptedEventDrivers.playing.bind({pet: App.pet}));
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
            ]);
        },
        open_game_list: function(){
            App.displayList([
                {
                    name: 'park game',
                    onclick: () => {
                        return Games.parkRngGame();
                    }
                },
                {
                    name: 'guess game (wip)',
                    onclick: () => {
                        return Games.guessGame();
                    }
                },
            ]);
        },
        open_battle_screen: function(){
            Battle.start();
        },
        sleep: function(){
            App.pet.sleep();
        }
    },
    toggleGameplayControls: function(state){
        App.disableGameplayControls = !state;
        if(App.disableGameplayControls){
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

        let rod = progressbar.querySelector('.progressbar-rod');

        rod.style.width = `${percent}%`;

        return {
            node: progressbar,
            setPercent: function(percent){
                rod.style.width = `${percent}%`;
            }
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
            name: '<',
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
    displayPopup: function(content, ms){
        let list = document.querySelector('.cloneables .generic-list-container').cloneNode(true);
            list.innerHTML = `
                <div class="inner-padding uppercase flex-center">
                    ${content}
                </div>
            `;
            list.style['z-index'] = 3;
        setTimeout(() => {
            list.remove();
        }, ms || 1000);
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
    },
    load: function(){
        let pet = localStorage.getItem('pet');
            pet = pet ? JSON.parse(pet) : {};
        return {
            pet,
        }
    }
}