let App = {
    deltaTime: 0, lastTime: 0,
    async init () {
        App.drawer = new Drawer(document.querySelector('.graphics-canvas'));

        Object2d.setDrawer(App.drawer);

        let loadedData = this.load();

        console.log({loadedData});

        let forPreload = [
            "resources/img/background/house/01.jpg",
            "resources/img/background/house/kitchen_01.png",
            "resources/img/item/foods.png",
            "resources/img/character/sonic.png",
            "resources/img/character/chara_195b.png",
            "resources/img/character/chara_189b.png",
        ]
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

        App.pet = new Pet({
            image: App.preloadedResources["resources/img/character/chara_189b.png"],
            spritesheet: {
                cellNumber: 0,
                cellSize: 32,
                rows: 4,
                columns: 4,
            },
        });
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
                sprite: 1,
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
    handlers: {
        open_stats: function(){
            let list = document.querySelector('.cloneables .generic-list-container').cloneNode(true);
            
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
                    name: `<c-sprite width="16" height="16" index="${current.sprite - 1}" src="resources/img/item/foods.png"></c-sprite>${food.toUpperCase()} (x${App.pet.inventory.food[food] || 0}) ${buyMode ? ` - $${current.price}` : ''}`,
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
                        App.pet.inventory.food[food] -= 1;
                        App.pet.feed(current.sprite, current.hunger_replenish);
                        App.pet.stats.current_fun += current.fun_replenish;
                    }
                })
            }

            sliderInstance = App.displaySlider(list, activeIndex);
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
                    onclick: () => {
                        App.pet.switchScene('park');
                        App.toggleGameplayControls(false);
                        let randomPet = new Pet({
                            img: "resources/img/character/red_sonic.png",
                            spritesheet: {
                                cellNumber: 0,
                                cellSize: 32,
                                rows: 4,
                                columns: 4,
                            }
                        });
                        App.pet.triggerScriptedState('playing', 10000, null, true, () => {
                            App.pet.stats.current_fun += 40;
                            App.pet.statsManager();
                            App.pet.playCheeringAnimationIfTrue(App.pet.hasMoodlet('amused'), () => App.pet.switchScene('house'));
                            App.drawer.removeObject(randomPet);
                            App.toggleGameplayControls(true);
                        }, Pet.scriptedEventDrivers.playing.bind({pet: App.pet}));
                    }
                }
            ])
        },
        open_mall_activity_list: function(){
            App.displayList([
                {
                    name: 'play game',
                    onclick: () => {
                        App.pet.switchScene('park');
                        App.toggleGameplayControls(false);
                        let randomPet = new Pet({
                            img: "resources/img/character/red_sonic.png",
                            spritesheet: {
                                cellNumber: 0,
                                cellSize: 32,
                                rows: 4,
                                columns: 4,
                            }
                        });
                        randomPet.stopMove();
                        randomPet.triggerScriptedState('eating', 5000, null, true);
                        randomPet.x = 20;
                        randomPet.inverted = true;

                        App.pet.x = 80 - App.pet.spritesheet.cellSize;
                        App.pet.inverted = false;
                        App.pet.stopMove();
                        App.pet.triggerScriptedState('eating', 5000, null, true, () => {
                            App.drawer.removeObject(randomPet);
                            App.pet.x = '50%';
                            if(Math.random() > 0.5){ // win
                                let winningGold = 25;
                                App.pet.stats.gold += winningGold;
                                App.pet.stats.current_fun += 35;
                                App.pet.playCheeringAnimation(() => {
                                    App.displayPopup(`You've won $${winningGold}`);
                                    App.toggleGameplayControls(true);
                                    App.pet.switchScene('house');
                                    App.handlers.open_mall_activity_list();
                                });
                            } else {
                                App.pet.playAngryAnimation(() => {
                                    App.displayPopup(`You've lost!`);
                                    App.pet.stats.current_fun -= 15;
                                    App.toggleGameplayControls(true);
                                    App.pet.switchScene('house');
                                    App.handlers.open_mall_activity_list();
                                });
                            }
                        });
                        
                        return false;
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
        open_battle_screen: function(){
            Battle.start();
        },
        sleep: function(){
            App.pet.sleep();
        }
    },
    toggleGameplayControls: function(state){
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
    displayList: function(listItems){
        listItems.push({
            name: 'BACK',
            class: 'back-btn',
            onclick: () => {
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
    displaySlider: function(listItems, activeIndex){
        let list = document.querySelector('.cloneables .generic-slider-container').cloneNode(true);

        let maxIndex = listItems.length,
            currentIndex = activeIndex || 0,
            contentElement = list.querySelector('.content'),
            acceptBtn = list.querySelector('.accept-btn'),
            cancelBtn = list.querySelector('.cancel-btn');

        list.close = function(){
            list.remove();
        }

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
    save: function(){
        setCookie('pet', App.pet.serializeStats(), 365);
    },
    load: function(){
        let pet = getCookie('pet');
            pet = pet ? JSON.parse(pet) : {};
        return {
            pet,
        }
    }
}