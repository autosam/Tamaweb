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

    constructor(petDefinition){
        const config = {
            image: App.preloadedResources[petDefinition.sprite],
            spritesheet: petDefinition.spritesheet,
        };
        super(config);

        this.petDefinition = petDefinition;
        this.stats = this.petDefinition.stats;
        this.inventory = this.petDefinition.inventory;
        this.animations = this.petDefinition.animations;
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
        this.y = '100%';
        this.x = '50%';
        switch(scene){
            case 'house':
                App.background.setImg('resources/img/background/house/01.jpg');
                break;
            case 'kitchen':
                App.background.setImg('resources/img/background/house/kitchen_01.png');
                App.foods.x = 40;
                App.foods.y = 58;
                this.x = 62;
                this.y = 74;
                break;
            case 'park':
                App.background.setImg('resources/img/background/outside/park_01.png');
                break;
        }
    }
    sleep(){
        if(this.isSleeping) return;
        this.stopMove();
        this.x = '50%';
        if(this.hasMoodlet('rested')){
            this.playRefuseAnimation();
            return;
        }
        this.isSleeping = true;
    }
    feed(foodSpriteCellNumber, value){
        this.stopMove();

        if(this.hasMoodlet('full')){
            this.playRefuseAnimation();
            this.switchScene('house');
            App.foods.hidden = true;
            return false;
        }

        App.foods.hidden = false;
        App.foods.spritesheet.cellNumber = foodSpriteCellNumber;
        
        this.inverted = false;
        this.stats.current_hunger += value;

        this.switchScene('kitchen');

        this.triggerScriptedState('eating', 4000, null, true, () => {
            this.playCheeringAnimationIfTrue(this.hasMoodlet('full'), () => this.switchScene('house'));
            App.foods.hidden = true;
        });

        return true;
    }
    playCheeringAnimationIfTrue(requirement, onEndFn){
        if(requirement)
            this.playCheeringAnimation(onEndFn);
        else
            onEndFn();
    }
    playCheeringAnimation(onEndFn){
        this.triggerScriptedState('cheering', 2000, null, true, () => {
            if(onEndFn) onEndFn();
        });
    }
    playRefuseAnimation(onEndFn){
        this.triggerScriptedState('refuse', 2000, null, true, () => {
            if(onEndFn) onEndFn();
        });
    }
    playAngryAnimation(onEndFn){
        this.triggerScriptedState('angry', 2000, null, true, () => {
            if(onEndFn) onEndFn();
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
        let fun_depletion_rate = stats.fun_depletion_rate;

        // sleeping case
        if(this.state == 'sleeping'){
            fun_depletion_rate = 0;
            hunger_depletion_rate = 0;
            sleep_depletion_rate = -stats.sleep_replenish_rate;
        }

        // clamping between 0 and max
        stats.current_hunger = clamp(stats.current_hunger, 0, stats.max_hunger);
        stats.current_sleep = clamp(stats.current_sleep, 0, stats.max_sleep);
        stats.current_fun = clamp(stats.current_fun, 0, stats.max_fun);

        // depletion
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
        stats.current_fun -= fun_depletion_rate;
        if(stats.current_fun <= 0){
            stats.current_fun = 0;
            console.log('All my friends no fun?');
        }

        // moodlets
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
        this.triggerMoodlet(
            stats.current_fun,
            stats.fun_min_desire, 'bored',
            stats.fun_satisfaction, 'amused'
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
    triggerScriptedState(state, length, cooldown, forced, onEndFn, driverFn){
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
        this.scriptedEventDriverFn = driverFn;
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
    stopScriptedState(){
        this.stopMove();
        this.scriptedEventTime = null;
        if(this.scriptedEventOnEndFn) {
            this.scriptedEventOnEndFn();
            return true;
        }
        return false;
    }
    stateManager(){
        if(this.scriptedEventTime){
            if(this.scriptedEventTime < App.lastTime){ // ending scripted event time
                if(this.stopScriptedState()) return;
            } else { // during scripted event
                if(this.scriptedEventDriverFn) this.scriptedEventDriverFn(this);
                return;
            }
        }
        
        if(this.isSleeping){
            if(this.stats.current_sleep >= this.stats.max_sleep || (this.hasMoodlet('rested') && Math.random() < this.stats.light_sleepiness * 0.01)){
                this.isSleeping = false;
                App.toggleGameplayControls(true);
                return;
            }
            this.stopMove();
            this.setState('sleeping');  
            App.toggleGameplayControls(false);
        }
        else if(this.isMoving)
            this.setState('moving');
        else {
            if(this.state.indexOf('idle') == -1){
                if(this.hasMoodlet('hungry') || this.hasMoodlet('sleepy') || this.hasMoodlet('bored')){
                    if(random(0, 1))
                        this.setState('idle_uncomfortable');
                    else 
                        this.setState('idle_side_uncomfortable');
                }
                else
                    this.setState('idle');
            }
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
            if(set.sound){
                if(!set.sound._counter) set.sound._counter = 0;
                if(++set.sound._counter == set.sound.interval){
                    set.sound._counter = 0;
                    App.playSound(`resources/sounds/${set.sound.file}`);
                }
            }
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
    serializeStats(){
        return this.petDefinition.serializeStats();
    }
    loadStats(json){
        this.petDefinition.loadStats(json);
    }

    static scriptedEventDrivers = {
        playing: function(start){
            this.pet.setState('moving');

            if(this.playing_current_target_x === undefined){
                this.playing_current_target_x = true;
                this.pet.targetX = 0;
            }

            if(this.pet.x == this.pet.targetX){
                if(this.pet.targetX == 0) this.pet.targetX = 100 - this.pet.spritesheet.cellSize;
                else this.pet.targetX = 0;
            }
        },
        movingOut: function(start){
            this.pet.setState('moving');

            if(this.moving_init_done === undefined){
                this.moving_init_done = true;
                this.pet.x = 0;
                this.pet.targetX = -20;
            }
        }
    }
}