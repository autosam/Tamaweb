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
    handlers: {
        open_stats: function(){
            let list = document.querySelector('.cloneables .generic-list-container').cloneNode(true);
            
            list.innerHTML = `
                <b>HUNGER:</b> ${App.createProgressbar( App.pet.stats.current_hunger / App.pet.stats.max_hunger * 100 ).node.outerHTML}
                <br>
                <b>SLEEP:</b> ${App.createProgressbar( App.pet.stats.current_sleep / App.pet.stats.max_sleep * 100 ).node.outerHTML}
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
                list.push({
                    name: food.toUpperCase(),
                    onclick: () => {
                        // App.foods.hidden = false;
                        // App.foods.x = App.pet.x - 10;
                        // App.foods.y = App.pet.y - 10;
                        // App.foods.spritesheet.cellNumber = App.defintions.food[food].sprite;
                        
                        // App.pet.inverted = false;
                        // App.pet.stats.current_hunger += App.defintions.food[food].value;
                        // App.pet.stopMove();
                        // App.pet.triggerScriptedState('eating', 4000, null, true, () => {
                        //     App.pet.triggerScriptedState('cheering', 3000, null, true);
                        //     App.foods.hidden = true;
                        // });
                        App.pet.feed(App.defintions.food[food].sprite, App.defintions.food[food].value);
                    }
                })
            }

            App.displayList(list);
        },
        sleep: function(){
            App.pet.isSleeping = true;
        }
    },
    defintions: {
        food: {
            "slice of pizza": {
                sprite: 11,
                value: 15,
            },
            "carrot": {
                sprite: 2,
                value: 5
            },
            "hamburger": {
                sprite: 9,
                value: 15
            }
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

class Drawer {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        // this.bounds = canvas.getBoundingClientRect();
        this.bounds = {
            width: this.canvas.width,
            height: this.canvas.height
        }
        this.objects = [];
    }
    draw() {
        this.clear();
        this.objects.forEach(object => {
            if(object.hidden) return;

            if (object.onDraw !== undefined)
                object.onDraw();

            if (object.x.toString().indexOf('%') >= 0) {
                let width = object.spritesheet ? object.spritesheet.cellSize : object.width || object.image.width;
                object.x = this.getRelativePositionX(Number(object.x.toString().slice(0, object.x.toString().length - 1))) - width / 2;
            }
            if (object.y.toString().indexOf('%') >= 0) {
                let height = object.spritesheet ? object.spritesheet.cellSize : object.height || object.image.height;
                object.y = this.getRelativePositionY(Number(object.y.slice(0, object.y.length - 1))) - height / 2;
            }

            let x = object.x,
                y = object.y;

            if (object.additionalX) x += object.additionalX;
            if (object.additionalY) y += object.additionalY;

            // fixes blurriness on some frames
            y = Math.round(y);
            x = Math.round(x);

            if (object.inverted) {
                this.context.save();
                this.context.scale(-1, 1);
                if(object.spritesheet){
                    let cellNumber = object.spritesheet.cellNumber - 1;
                    this.context.drawImage(
                        object.image,
                        (cellNumber % object.spritesheet.rows) * object.spritesheet.cellSize,
                        Math.floor(cellNumber / object.spritesheet.columns) * object.spritesheet.cellSize,
                        object.spritesheet.cellSize,
                        object.spritesheet.cellSize,
                        -x - object.spritesheet.cellSize,
                        y,
                        object.spritesheet.cellSize,
                        object.spritesheet.cellSize
                    );
                }
                this.context.restore();
            } else {
                if(object.spritesheet){
                    let cellNumber = object.spritesheet.cellNumber - 1;
                    this.context.drawImage(
                        object.image,
                        (cellNumber % object.spritesheet.rows) * object.spritesheet.cellSize,
                        Math.floor(cellNumber / object.spritesheet.columns) * object.spritesheet.cellSize,
                        object.spritesheet.cellSize,
                        object.spritesheet.cellSize,
                        x,
                        y,
                        object.spritesheet.cellSize,
                        object.spritesheet.cellSize
                    );
                } else {
                    this.context.drawImage(
                        object.image,
                        x,
                        y,
                        object.width || object.image.width,
                        object.height || object.image.height
                    )
                }
            }

            if (object.onLateDraw !== undefined)
                object.onLateDraw();
        })
    }
    clear() {
        this.context.clearRect(0, 0, this.bounds.width, this.bounds.height);
    }
    getRelativePositionX(percent) {
        return percent / 100 * this.bounds.width;
    }
    getRelativePositionY(percent) {
        return percent / 100 * this.bounds.height;
    }
    addObject(object) {
        let id = this.objects.push(object);
        return id - 1;
    }
    removeObject(id) {

    }
}

class Object2d {
    constructor(config) {
        // parent drawer
        if (!config.drawer) {
            if (Object2d.defaultDrawer) {
                config.drawer = Object2d.defaultDrawer;
            } else {
                console.log('no default drawer');
                return false;
            }
        }

        // basic position
        this.x = '50%';
        this.y = '50%';

        // props
        for (let key of Object.keys(config)) {
            this[key] = config[key];
        }

        // initializing
        if(!this.image){
            this.image = new Image();
            this.image.src = config.img;
        }

        this.id = this.drawer.addObject(this);
    }
    setImg(img){ // this one gets image url
        this.image.src = img;
    }
    setImage(image){ // this one gets img object (presume preloadedResource)
        this.image = image;
    }
    static setDrawer(drawer) {
        Object2d.defaultDrawer = drawer;
    }
}

class Pet extends Object2d {
    // basic init
    defaultElevation = -20;
    y = '100%';
    additionalY = this.defaultElevation;
    animation = {
        currentFrame: 0,
        nextFrameTime: 0,
        set: null,
    }
    scriptedEventCooldowns = {};
    state = 'idle';
    activeMoodlets = [];

    // metadata
    animations = {
        idle: {
            start: 1,
            end: 2,
            frameTime: 500
        },
        idle_uncomfortable: {
            start: 4,
            end: 5,
            frameTime: 500,
        },
        moving: {
            start: 10,
            end: 12,
            frameTime: 100
        },
        sitting: {
            start: 14,
            end: 16,
            frameTime: 300
        },
        uncomfortable: {
            start: 5,
            end: 6,
            frameTime: 500
        },
        angry: {
            start: 6,
            end: 7,
            frameTime: 500
        },
        eating: {
            start: 9,
            end: 11,
            frameTime: 250
        },
        cheering: {
            start: 2,
            end: 4,
            frameTime: 250,
        },
        refuse: {
            start: 8,
            end: 9,
            frameTime: 300
        },
        sleeping: {
            start: 15,
            end: 16,
            frameTime: 1000,
        }
    }
    stats = {
        speed: 0.01,
        max_hunger: 100,
        hunger_satisfaction: 80, // note: when reaching this they won't want anymore food
        hunger_min_desire: 40, // note: when below this number they desire it
        max_sleep: 100,
        sleep_satisfaction: 70,
        sleep_min_desire: 20,
        hunger_depletion_rate: 0.09,
        light_sleepiness: 0.01,
        sleep_depletion_rate: 0.06,
        sleep_replenish_rate: 0.1,
        activity_sleep_depletion: 0.3,
        activity_hunger_depletion: 0.5,
        wander_min: 1,
        wander_max: 5,

        // current
        current_hunger: 40 || 80,
        current_sleep: 70,
    }

    onLateDraw() {
        this.behavior();
    }
    behavior() {
        this.think();
        this.moveToTarget();
        this.stateManager();
        this.animationHandler();
    }
    switchScene(scene){
        // todo: not hardcode these values,
        // instead it should be defined on the scene
        // so that every scene can have it's own values
        switch(scene){
            case 'house':
                App.background.setImg('resources/img/background/house/01.jpg');
                this.y = '100%';
                break;
            case 'kitchen':
                App.background.setImg('resources/img/background/house/kitchen_01.png');
                App.foods.x = 40;
                App.foods.y = 58;
                this.x = 62;
                this.y = 74;
                break;
        }
    }
    feed(foodSpriteCellNumber, value){
        this.stopMove();

        if(this.hasMoodlet('full')){
            this.triggerScriptedState('refuse', 2000, null, true);
            this.switchScene('house');
            App.foods.hidden = true;
            return;
        }

        App.foods.hidden = false;
        App.foods.spritesheet.cellNumber = foodSpriteCellNumber;
        
        this.inverted = false;
        this.stats.current_hunger += value;

        this.switchScene('kitchen');

        this.triggerScriptedState('eating', 4000, null, true, () => {
            this.triggerScriptedState('cheering', 2000, null, true, () => {
                this.switchScene('house');
            });
            App.foods.hidden = true;
        });        
    }
    think(){
        if(!this.nextThinkTime){
            this.nextThinkTime = App.lastTime + 500;
        } else if(this.nextThinkTime < App.lastTime){
            this.nextThinkTime = 0;
            return;
        } else {
            return;
        }

        // thinking
        this.statsManager();

        if(this.state == 'sleeping') 
            return;

        if(!this.scriptedEventTime){
            this.wander();

            if(random(0, 100) == 1){
                if(this.stats.current_sleep < this.stats.max_sleep / 3){
                    this.triggerScriptedState('tired', 10000, 20000);
                    this.stopMove();
                }
            }
            if(random(0, 100) < 10){
                if(this.hasMoodlet('sleepy')){
                    this.triggerScriptedState('angry', 4000, random(20000, 30000));
                    this.stopMove();
                }
                if(this.hasMoodlet('hungry')){
                    this.triggerScriptedState('uncomfortable', 4000, random(20000, 30000));
                    this.stopMove();
                }
            }
        }
    }
    statsManager(){
        let stats = this.stats;
        /*
            Hunger: ${this.stats.current_hunger}
            <br>
            Sleep: ${this.stats.current_sleep}
            <br>
        */
        document.querySelector('#debug').innerHTML = `
        Hunger: ${this.stats.current_hunger}
        <br>
        Sleep: ${this.stats.current_sleep}
        <br>
            State: ${this.state}
            <br>
            Mood: ${this.activeMoodlets.join(' - ') || "normal"}
        `;

        let hunger_depletion_rate = stats.hunger_depletion_rate;
        let sleep_depletion_rate = stats.sleep_depletion_rate;

        if(this.state == 'sleeping'){
            hunger_depletion_rate = 0;
            sleep_depletion_rate = -stats.sleep_replenish_rate;
        }

        stats.current_hunger = clamp(stats.current_hunger, 0, stats.max_hunger);
        stats.current_sleep = clamp(stats.current_sleep, 0, stats.max_sleep);

        stats.current_hunger -= hunger_depletion_rate;
        if(stats.current_hunger <= 0){
            stats.current_hunger = 0;
            console.log('dead?');
        }

        stats.current_sleep -= sleep_depletion_rate;
        if(stats.current_sleep <= 0){
            stats.current_sleep = 0;
            this.isSleeping = true;
        }

        this.triggerMoodlet(
            stats.current_hunger,
            stats.hunger_min_desire, 'hungry',
            stats.hunger_satisfaction, 'full'
        );
        this.triggerMoodlet(
            stats.current_sleep,
            stats.sleep_min_desire, 'sleepy',
            stats.sleep_satisfaction, 'rested'
        );
    }
    triggerMoodlet(current, min, minName, max, maxName){
        if(current < min){
            this.addMoodlet(minName);
        } else {
            this.removeMoodlet(minName);
        }

        if(current > max){
            this.addMoodlet(maxName);
        } else {
            this.removeMoodlet(maxName);
        }
    }
    addMoodlet(mood){
        if(this.activeMoodlets.indexOf(mood) >= 0) return;
        this.activeMoodlets.push(mood);
        return true;
    }
    removeMoodlet(mood){
        let index = this.activeMoodlets.indexOf(mood);
        if(index == -1) return;
        this.activeMoodlets.splice(index, 1);
        return true;
    }
    hasMoodlet(mood){
        return this.activeMoodlets.indexOf(mood) >= 0;
    }
    triggerScriptedState(state, length, cooldown, forced, onEndFn){
        if(!forced){
            if(this.scriptedEventTime){
                return; // already during scripted event
            }
    
            if(this.scriptedEventCooldowns[state]){
                if(this.scriptedEventCooldowns[state] > App.lastTime){
                    return;
                }
            }
        }

        if(cooldown){
            this.scriptedEventCooldowns[state] = App.lastTime + cooldown;
        }

        this.scriptedEventTime = App.lastTime + length;
        this.scriptedEventOnEndFn = onEndFn;
        this.setState(state);
        console.log("Scripted State: ", state);
    }
    setState(newState){
        if(newState != this.state){
            this.animation.currentFrame = 0;
            this.animation.nextFrameTime = 0;
            this.animation.set = this.animations[newState];

            this.state = newState;
        }
    }
    stateManager(){
        if(this.scriptedEventTime){
            if(this.scriptedEventTime < App.lastTime){ // ending scripted event time
                this.scriptedEventTime = null;
                if(this.scriptedEventOnEndFn) {
                    this.scriptedEventOnEndFn();
                    return;
                }
            } else {
                return;
            }
        }
        
        if(this.isSleeping){
            if(this.stats.current_sleep >= this.stats.max_sleep || (this.hasMoodlet('rested') && Math.random() < this.stats.light_sleepiness)){
                this.isSleeping = false;
                return;
            }
            this.stopMove();
            this.setState('sleeping');  
        }
        else if(this.isMoving)
            this.setState('moving');
        else {
            if(this.hasMoodlet('hungry' || this.hasMoodlet('sleepy')))
                this.setState('idle_uncomfortable');
            else
                this.setState('idle');
        }
    }
    animationHandler(){
        if(!this.animation.set) return;

        let set = this.animation.set;

        let frameRound = set.end - set.start;

        if(this.animation.nextFrameTime < App.lastTime){ // go to next frame
            this.animation.nextFrameTime = App.lastTime + set.frameTime;

            this.animation.currentFrame = (this.animation.currentFrame + 1) % frameRound;
            this.spritesheet.cellNumber = set.start + this.animation.currentFrame;

            // document.querySelector('#debug').innerHTML = this.animation.currentFrame;
        }
    }
    nextRandomTargetSelect = 1;
    wander() {
        if(this.isMoving){
            this.nextRandomTargetSelect = 0;
        }

        if (!this.nextRandomTargetSelect) {
            this.nextRandomTargetSelect = App.lastTime + random(this.stats.wander_min, this.stats.wander_max) * 1000;
        }

        if (App.lastTime > this.nextRandomTargetSelect) {
            this.targetX = this.drawer.getRelativePositionX(50) + random(-50, 25);
            this.nextRandomTargetSelect = 0;
        }
    }
    stopMove(){
        this.targetX = undefined;
        this.targetY = undefined;
    }
    moveToTarget() {
        if (this.targetX !== undefined && this.targetX != this.x) {
            this.isMoving = true;
            if (this.x > this.targetX)
                this.moveLeft(this.targetX);
            else if(this.x < this.targetX)
                this.moveRight(this.targetX);
        } else {
            this.isMoving = false;
        }
    }
    moveRight(maxX) {
        if (this.x + this.stats.speed * App.deltaTime > maxX) {
            this.x = maxX;
        } else {
            this.x = this.x + this.stats.speed * App.deltaTime;
        }
        this.inverted = true;
    }
    moveLeft(minX) {
        if (this.x - this.stats.speed * App.deltaTime < minX) {
            this.x = minX;
        } else {
            this.x = this.x - this.stats.speed * App.deltaTime;
        }
        this.inverted = false;
    }
}

App.init();