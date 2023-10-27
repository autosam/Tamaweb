let App = {
    deltaTime: 0, lastTime: 0,
    async init () {
        App.drawer = new Drawer(document.querySelector('.graphics-canvas'));

        Object2d.setDrawer(App.drawer);

        let forPreload = [
            "resources/img/background/house/01.jpg",
            "resources/img/background/house/kitchen_01.png",
            "resources/img/item/foods.png",
            "resources/img/character/sonic.png",
        ]
        let preloadedResources = await this.preloadImages(forPreload);

        this.preloadedResources = {};
        preloadedResources.forEach((resource, i) => {
            // let name = forPreload[i].slice(forPreload[i].lastIndexOf('/') + 1);
            let name = forPreload[i];
            this.preloadedResources[name] = resource;
        });

        console.log(this.preloadedResources);

        App.background = new Object2d({
            // img: "resources/img/background/house/01.jpg",
            image: App.preloadedResources["resources/img/background/house/01.jpg"],
            x: 0, y: 0, width: 100, height: 100,
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
            image: App.preloadedResources["resources/img/character/sonic.png"],
            spritesheet: {
                cellNumber: 0,
                cellSize: 32,
                rows: 4,
                columns: 4,
            },
        });

        window.onload = function () {
            function update(time) {
                App.deltaTime = time - App.lastTime;
                App.lastTime = time;

                App.drawer.draw(App.deltaTime);
                requestAnimationFrame(update);
                document.querySelector('.background-canvas').getContext('2d').drawImage(App.drawer.canvas, 0, 0);
            }

            update(0);
        }
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
                hunger_replenish: 5,
                fun_replenish: 0,
            },
            "slice of pizza": {
                sprite: 10,
                hunger_replenish: 15,
                fun_replenish: 10,
            },
            "carrot": {
                sprite: 2,
                hunger_replenish: 5,
                fun_replenish: 1,
            },
            "hamburger": {
                sprite: 9,
                hunger_replenish: 15,
                fun_replenish: 8,
            },
            "broccoli": {
                sprite: 5,
                hunger_replenish: 7,
                fun_replenish: 0,
            }
        }
    },
    handlers: {
        open_stats: function(){
            let list = document.querySelector('.cloneables .generic-list-container').cloneNode(true);
            
            list.innerHTML = `
                <b>HUNGER:</b> ${App.createProgressbar( App.pet.stats.current_hunger / App.pet.stats.max_hunger * 100 ).node.outerHTML}
                <br>
                <b>SLEEP:</b> ${App.createProgressbar( App.pet.stats.current_sleep / App.pet.stats.max_sleep * 100 ).node.outerHTML}
                <br>
                <b>FUN:</b> ${App.createProgressbar( App.pet.stats.current_fun / App.pet.stats.max_fun * 100 ).node.outerHTML}
            `;

            let backBtn = document.createElement('button');
                backBtn.className = 'list-item back-btn';
                backBtn.innerHTML = 'BACK';
                backBtn.onclick = () => {
                    list.remove();
                };

            list.appendChild(backBtn);

            document.querySelector('.screen-wrapper').appendChild(list);
        },
        open_food_list: function(){
            let list = [];
            for(let food of Object.keys(App.defintions.food)){
                let current = App.defintions.food[food];
                list.push({
                    name: food.toUpperCase(),
                    onclick: () => {
                        App.pet.feed(current.sprite, current.hunger_replenish);
                        App.pet.stats.current_fun += current.fun_replenish;
                    }
                })
            }

            App.displayList(list);
        },
        open_activity_list: function(){
            let dis = App.displayList;
            dis([
                {
                    name: 'outside',
                    onclick: () => {
                        dis([
                            {
                                name: 'park',
                                onclick: () => {
                                    App.pet.switchScene('park');
                                    let randomPet = new Pet({
                                        img: "resources/img/character/sonic.png",
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
                                    }, App.pet.scriptedEventDrivers.playing);
                                }
                            }
                        ])
                    }
                }
            ])
        },
        sleep: function(){
            App.pet.isSleeping = true;
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
                    let result = item.onclick();
                    if(!result){
                        list.close();
                    }
                };
            list.appendChild(button);
        });

        document.querySelector('.screen-wrapper').appendChild(list);

        return list;
    }
}