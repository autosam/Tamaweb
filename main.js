let App = {
    deltaTime: 0, lastTime: 0,
    init: function () {
        App.drawer = new Drawer(document.querySelector('.graphics-canvas'));

        Object2d.setDrawer(App.drawer);

        App.background = new Object2d({
            img: "resources/img/background/house/01.jpg",
            x: 0, y: 0, width: 100, height: 100
        })

        App.pet = new Pet({
            img: "resources/img/character/sonic.png",
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
    handlers: {
        open_food_list: function(){
            App.displayList([
                {
                    name: 'Orange',
                    onclick: () => {
                        App.pet.stats.current_hunger += 25;
                        App.pet.stopMove();
                        App.pet.triggerScriptedState('eating', 4000, null, true, () => {
                            App.pet.triggerScriptedState('cheering', 3000, null, true);
                        });
                    }
                },
            ])
        }
    },
    displayList: function(listItems){
        /*
            listItems:

            [
                {
                    name: 'item',
                    onclick: fn(){}
                }
            ]
        */

        listItems.push({
            name: 'BACK',
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
                button.className = 'list-item';
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
        this.image = new Image();
        this.image.src = config.img;

        this.id = this.drawer.addObject(this);
    }
    static setDrawer(drawer) {
        Object2d.defaultDrawer = drawer;
    }
}

class Pet extends Object2d {
    // basic init
    y = '100%';
    additionalY = -17;
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
        wander_min: 1,
        wander_max: 5,
        hunger_depletion_rate: 0.09,
        sleep_depletion_rate: 0.06,
        activity_sleep_depletion: 0.3,
        activity_hunger_depletion: 0.5,

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
        document.querySelector('#debug').innerHTML = `
            Hunger: ${this.stats.current_hunger}
            <br>
            Sleep: ${this.stats.current_sleep}
            <br>
            State: ${this.state}
            <br>
            Mood: ${this.activeMoodlets.join(' - ') || "normal"}
        `;

        this.stats.current_hunger -= this.stats.hunger_depletion_rate;
        if(this.stats.current_hunger <= 0){
            this.stats.current_hunger = 0;
            console.log('dead?');
        }

        this.stats.current_sleep -= this.stats.sleep_depletion_rate;
        if(this.stats.current_sleep <= 0){
            this.stats.current_sleep = 0;
            console.log('fell sleep?');
        }

        if(this.stats.current_hunger < this.stats.hunger_min_desire){
            this.addMoodlet('hungry');
        } else {
            this.removeMoodlet('hungry');
        }

        if(this.stats.current_sleep < this.stats.sleep_min_desire){
            this.addMoodlet('sleepy');
        } else {
            this.removeMoodlet('sleepy');
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
                    this.scriptedEventOnEndFn = null;
                    return;
                }
            } else {
                return;
            }
        }

        if(this.isMoving)
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