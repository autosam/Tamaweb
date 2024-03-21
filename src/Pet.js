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
    animObjectsQueue = [];

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

        this.additionalY += this.petDefinition.spritesheet.offsetY || 0;

        this.needsToiletOverlay = new Object2d({
            img: 'resources/img/misc/needstoilet_01.png',
            x: 0,
            y: 0,
            width: this.petDefinition.spritesheet.cellSize, height: this.petDefinition.spritesheet.cellSize,
            hidden: true,
            onDraw: (overlay) => {
                overlay.x = this.x;
                overlay.y = this.y + this.additionalY;
                Object2d.animations.flip(overlay, 250);
            }
        });

        this.dirtyOverlay = new Object2d({
            img: 'resources/img/misc/stinky_01.png',
            x: 0,
            y: 0,
            width: this.petDefinition.spritesheet.cellSize, height: this.petDefinition.spritesheet.cellSize,
            hidden: true,
            onDraw: (overlay) => {
                overlay.x = this.x;
                overlay.y = this.y + this.additionalY;
                Object2d.animations.flip(overlay, 300);
            }
        });
    }

    onLateDraw() {
        this.behavior();
    }
    behavior() {
        this.isMainPet = this === App.pet;

        if(this.stats.is_egg) return this.handleEgg();

        this.think();
        this.moveToTarget();
        this.stateManager();
        this.animationHandler();
    }
    handleEgg(){
        this.x = -600;

        App.toggleGameplayControls(false, () => {
            App.displayPopup('wait for your egg to hatch');
        })

        if(!this.eggObject){
            this.eggStartTime = Date.now();
            this.hatchTime = this.eggStartTime + random(20000, 60000);
            this.eggObject = new Object2d({
                img: 'resources/img/misc/egg.png',
                x: '50%', 
                y: '80%',
            });
        }

        if(Math.random() < 0.006){
            this.eggObject.setImg('resources/img/misc/egg_02.png');
            setTimeout(() => this.eggObject.setImg('resources/img/misc/egg.png'), 200);
            if(Date.now() > this.hatchTime){
                this.stats.is_egg = false;
                App.setScene(App.scene.home);
                App.toggleGameplayControls(true);
                App.drawer.removeObject(this.eggObject);
                this.eggObject = null;
                this.triggerScriptedState('uncomfortable', 5000);
            }
        }
    }
    _switchScene(scene){
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
        if(this.stats.is_sleeping) return;
        this.stopMove();
        this.x = '50%';
        if(this.hasMoodlet('rested')){
            this.playRefuseAnimation();
            return;
        }
        this.stats.is_sleeping = true;
    }
    feed(foodSpriteCellNumber, value, type){
        const me = this;

        if(!type) type = 'food';

        App.toggleGameplayControls(false, () => {
            this.stopScriptedState();
        });
        this.stopMove();

        function refuse(){
            me.playRefuseAnimation();
            App.setScene(App.scene.home);
            // App.foods.hidden = true;
            App.uiFood.style.visibility = 'hidden';
            App.toggleGameplayControls(true);
            return false;
        }

        switch(type){
            case "food": 
                if(this.hasMoodlet('full')) return refuse();
                break;
        }

        /* App.foods.hidden = false; // remove this getting rid of ui food
        App.foods.spritesheet.cellNumber = foodSpriteCellNumber; */

        let baseFoodSpriteIndex = foodSpriteCellNumber - 1;
        let foodSpriteIndex = baseFoodSpriteIndex;
        let lastFoodSpriteIndexChangeMs = App.time;

        App.uiFood.style.visibility = 'visible';
        App.uiFood.setAttribute('index', foodSpriteCellNumber - 1);
        
        this.inverted = false;
        this.stats.current_hunger += value;

        App.setScene(App.scene.kitchen);

        this.triggerScriptedState('eating', 4000, null, true, () => {
            switch(type){
                case "med":
                    this.playCheeringAnimationIfTrue(this.hasMoodlet('healthy'), () => App.setScene(App.scene.home));
                    break;
                default:
                    this.playCheeringAnimationIfTrue(this.hasMoodlet('full'), () =>{
                        App.closeAllDisplays();
                        
                        App.handlers.open_feeding_menu();
                        App.handlers.open_food_list(null, null, type);
                        App.setScene(App.scene.home);
                    });
                    break;
            }
            // App.foods.hidden = true;
            App.uiFood.style.visibility = 'hidden';
            App.toggleGameplayControls(true);
        }, () => {
            if(App.time - lastFoodSpriteIndexChangeMs > 1200){
                lastFoodSpriteIndexChangeMs = App.time;

                foodSpriteIndex = clamp(foodSpriteIndex + 1, baseFoodSpriteIndex, baseFoodSpriteIndex + 2);

                App.uiFood.setAttribute('index', foodSpriteIndex);
            }
        });

        return true;
    }
    useItem(item){
        let itemObject = new Object2d({
            img: "resources/img/item/items.png",
            spritesheet: {
                cellNumber: item.sprite,
                cellSize: 22,
                rows: 10,
                columns: 10
            },
            x: 20, y: 20
        });

        itemObject.x = '55%', itemObject.y = '47%';


        App.toggleGameplayControls(false);

        let interruptFn = () => {
            App.pet.stopScriptedState();
        }
        App.toggleGameplayControls(false, (item.interruptable ? interruptFn : false))

        this.stopMove();
        this.x = '30%';
        this.y = '63%';
        this.inverted = true;
        this.triggerScriptedState('cheering', item.interaction_time || 10000, false, true, () => {  
            App.drawer.removeObject(itemObject);

            App.pet.stats.current_fun += item.fun_replenish || 0;
            App.pet.stats.current_sleep += item.sleep_replenish || 0;

            App.pet.playCheeringAnimation();

            App.setScene(App.currentScene); // to reset pet pos
            
            App.toggleGameplayControls(true);
        }, Pet.scriptedEventDrivers.playingWithItem.bind({pet: App.pet, item: item, itemObject}))
    }
    playCheeringAnimationIfTrue(requirement, onEndFn){
        if(requirement)
            this.playCheeringAnimation(onEndFn);
        else
            if(onEndFn) onEndFn();
    }
    playCheeringAnimation(onEndFn){
        this.stopMove();
        setTimeout(() => this.playSound('resources/sounds/cheer_success.ogg', true));
        this.triggerScriptedState('cheering_with_icon', 2000, null, true, () => {
            if(onEndFn) onEndFn();
        });
    }
    playRefuseAnimation(onEndFn){
        this.stopMove();
        this.triggerScriptedState('refuse', 2000, null, true, () => {
            if(onEndFn) onEndFn();
        });
    }
    playAngryAnimation(onEndFn){
        this.stopMove();
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
    statsManager(isOfflineProgression, hour){
        if(!this.isMainPet) return;

        let stats = this.stats;
        /*
            Hunger: ${this.stats.current_hunger}
            <br>
            Sleep: ${this.stats.current_sleep}
            <br>
        */
        // document.querySelector('#debug').innerHTML = `
        // Hunger: ${this.stats.current_hunger}
        // <br>
        // Sleep: ${this.stats.current_sleep}
        // <br>
        //     State: ${this.state}
        //     <br>
        //     Mood: ${this.activeMoodlets.join(' - ') || "normal"}
        // `;

        let depletion_mult = 1, offlineAndIsNight = false;
        if(isOfflineProgression){
            depletion_mult = 0.5;

            if(hour && (hour >= 22 || hour < 9)){
                offlineAndIsNight = true;
                depletion_mult = 0.05;
            }
        }

        switch(this.petDefinition.lifeStage){
            case 0: depletion_mult *= 1.65;
            case 1: depletion_mult *= 1.3;
        }

        let hunger_depletion_rate = stats.hunger_depletion_rate * depletion_mult;
        let sleep_depletion_rate = stats.sleep_depletion_rate * depletion_mult;
        let fun_depletion_rate = stats.fun_depletion_rate * depletion_mult;
        let bladder_depletion_rate = stats.bladder_depletion_rate * depletion_mult;
        let health_depletion_rate = stats.health_depletion_rate * depletion_mult;
        let cleanliness_depletion_rate = stats.cleanliness_depletion_rate * depletion_mult;

        if(isOfflineProgression){
            health_depletion_rate = 0;
        }

        // sleeping case
        if(this.stats.is_sleeping || offlineAndIsNight){
            // fun_depletion_rate = 0;
            // hunger_depletion_rate = 0;
            health_depletion_rate = 0;

            let sleepAdditionalDepletionMult = 1;
            if(offlineAndIsNight) sleepAdditionalDepletionMult = 2;
            sleep_depletion_rate = -stats.sleep_replenish_rate * sleepAdditionalDepletionMult;
        }

        // clamping between 0 and max
        stats.current_hunger = clamp(stats.current_hunger, 0, stats.max_hunger);
        stats.current_sleep = clamp(stats.current_sleep, 0, stats.max_sleep);
        stats.current_fun = clamp(stats.current_fun, 0, stats.max_fun);
        stats.current_bladder = clamp(stats.current_bladder, 0, stats.max_bladder);
        stats.current_health = clamp(stats.current_health, 0, stats.max_health);
        stats.current_cleanliness = clamp(stats.current_cleanliness, 0, stats.max_cleanliness);

        // depletion
        stats.current_hunger -= hunger_depletion_rate;
        if(stats.current_hunger <= 0){
            stats.current_hunger = 0;
            // console.log('dead?');
        }
        stats.current_sleep -= sleep_depletion_rate;
        if(stats.current_sleep <= 0){
            stats.current_sleep = 0;
            this.stats.is_sleeping = true;
        }
        stats.current_fun -= fun_depletion_rate;
        if(stats.current_fun <= 0){
            stats.current_fun = 0;
            // console.log('All my friends no fun?');
        }
        stats.current_bladder -= bladder_depletion_rate;
        if(stats.current_bladder <= 0){
            stats.current_bladder = stats.max_bladder;
            this.stats.has_poop_out = true;
            // console.log('pooping myself');
        }
        if(stats.current_bladder <= stats.max_bladder / 4){
            this.needsToiletOverlay.hidden = false;
        } else {
            this.needsToiletOverlay.hidden = true;
        }
        if(this.stats.has_poop_out){
            App.poop.hidden = false;
        } else {
            App.poop.hidden = true;
        }
        stats.current_cleanliness -= cleanliness_depletion_rate;
        if(stats.current_cleanliness <= 0){
            stats.current_cleanliness = 0;
        }
        if(stats.current_cleanliness <= 25){
            // App.pet.dirtyPatches = true;
            this.dirtyOverlay.hidden = false;
        } else {
            // App.pet.dirtyPatches = false;
            this.dirtyOverlay.hidden = true;
        }
        if(this.stats.has_poop_out || this.stats.current_cleanliness <= 0){ // gradually decrease health if poop is nearby or dirty
            stats.current_health -= health_depletion_rate * stats.health_depletion_mult;
            stats.current_cleanliness -= cleanliness_depletion_rate * stats.cleanliness_depletion_mult;
        }
        if(stats.current_health <= 0){
            stats.current_health = 0;
            // console.log('dead of sickness?');
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
        this.triggerMoodlet(
            stats.current_health,
            stats.max_health * 0.25, 'sick',
            stats.max_health * 0.8, 'healthy'
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
        // console.log("Scripted State: ", state);
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

        if(this.isMainPet){
            App.darkOverlay.hidden = !this.stats.is_sleeping;
        }

        if(this.stats.is_sleeping){
            if(this.stats.current_sleep >= this.stats.max_sleep || (this.hasMoodlet('rested') && Math.random() < this.stats.light_sleepiness * 0.01)){
                this.stats.is_sleeping = false;
                App.toggleGameplayControls(true);
                return;
            }
            this.stopMove();
            this.setState('sleeping');  
            App.toggleGameplayControls(false, () => {
                this.stats.is_sleeping = false;
                App.toggleGameplayControls(true);
                if(!this.hasMoodlet('rested')){
                    App.pet.triggerScriptedState('uncomfortable', 3000);
                } else {
                    App.pet.playCheeringAnimation();
                }
            });
        }
        else if(this.isMoving)
            this.setState('moving');
        else {
            if(this.state.indexOf('idle') == -1){
                if(this.hasMoodlet('hungry') || this.hasMoodlet('sleepy') || this.hasMoodlet('bored') || this.hasMoodlet('sick')){
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
        const me = this;

        if(!this.animation.set) return;

        let set = this.animation.set;

        let frameRound = set.end - set.start;

        if(this.animation.nextFrameTime < App.lastTime){ // go to next frame

            if(this.animObjectsQueue.length){
                this.animObjectsQueue.forEach(obj => {
                    if(obj._lives && obj._lives > 0){
                        obj._lives --;
                        return;
                    }
                    App.drawer.removeObject(obj);
                })
            }

            this.animation.nextFrameTime = App.lastTime + set.frameTime;

            this.animation.currentFrame = (this.animation.currentFrame + 1) % frameRound;
            this.spritesheet.cellNumber = set.start + this.animation.currentFrame;

            // document.querySelector('#debug').innerHTML = this.animation.currentFrame;
            if(set.sound){
                if(!set.sound._counter) set.sound._counter = 0;
                if(++set.sound._counter == set.sound.interval){
                    set.sound._counter = 0;
                    this.playSound(`resources/sounds/${set.sound.file}`);
                }
            }

            if(set.objects){
                set.objects.forEach(objectDef => {
                    if(!objectDef._counter) objectDef._counter = 0;
                    if(++objectDef._counter == objectDef.interval){
                        objectDef._counter = 0;
                        let object = new Object2d(objectDef);
                        me.animObjectsQueue.push(object);
                    }
                })
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

        if (this.targetY !== undefined && this.targetY != this.y) {
            this.y = lerp(this.y, this.targetY, this.stats.speed * App.deltaTime * 0.1);
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
    simulateAwayProgression(elapsedTime){
        this.isMainPet = true;

        // calling stats manager once every second instead of twice every second
        let iterations = Math.floor((elapsedTime / 1000));
        for(let i = 0; i < iterations; i++){
            if(this.stats.is_egg){
                this.handleEgg();
                continue;
            }
            this.statsManager();
        }
    }
    simulateOfflineProgression(elapsedTime){
        this.isMainPet = true;
        // getting caught up with the stats simulation
        // since pets call statsManager twice each seconds
        // we are going to simulate that by approximating
        // (max offline progression is 12 hours)

        const startTime = Date.now();
        let iterations = Math.floor(clamp(elapsedTime / 1000, 0, 43200) * 2);
        for(let i = 0; i < iterations; i++){
            elapsedTime -= 500;
            let date = new Date(startTime - elapsedTime);
            let hour = date.getHours();

            // suppying hour because from 22:00 to 9:00 the starts will drop much slower and pet will get sleep
            if(this.stats.is_egg){
                this.handleEgg();
                continue;
            }
            this.statsManager(true, hour);
        }
    }
    ageUp(){
        this.petDefinition.ageUp()
        this.removeObject();
        App.pet = new Pet(this.petDefinition);
        App.save();
    }
    serializeStats(){
        return this.petDefinition.serializeStats();
    }
    loadStats(json){
        this.petDefinition.loadStats(json);
    }
    playSound(sound, force){
        if(!this.isMainPet) return;
        App.playSound(sound, force);
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
        },
        movingIn: function(){
            this.pet.setState('moving');

            if(this.moving_init_done === undefined){
                this.moving_init_done = true;
                this.pet.x = '105%';
                this.pet.targetX = -20;
            }
        },
        playingWithItem: function(start){
            if(!this.item) return false;

            
            switch(this.item.name){
                default:
                    var possibleStates = ['cheering', 'eating', 'shocked', 'sitting', 'blush'];
                    if(Math.random() < 0.007){
                        this.pet.setState(randomFromArray(possibleStates));
                        // this.pet.inverted = random(0, 1) ? true : false;
                        // if(this.pet.inverted){
                        //     this.itemObject.x = '75%';
                        // } else {
                        //     this.itemObject.x = '25%';
                        // }
                    }
            }
        }
    }
}