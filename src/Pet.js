class Pet extends Object2d {
    // basic init
    defaultElevation = -20;
    y = '100%';
    z = App.constants.NPC_PET_Z;
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
    accessoryObjects = [];
    castShadow = true;
    speedOverride = 0;

    constructor(petDefinition, additionalProps){
        const image = petDefinition.spriteSkin 
            ? App.getPreloadedResource(petDefinition.spriteSkin)
            : App.getPreloadedResource(petDefinition.sprite);

        const config = {
            image,
            spritesheet: petDefinition.spritesheet,
        };
        super(config);

        this.petDefinition = petDefinition;
        this.stats = this.petDefinition.stats;
        this.inventory = this.petDefinition.inventory;
        this.animations = this.petDefinition.animations;
        this.additionalY += this.petDefinition.spritesheet.offsetY || 0;

        for(let prop in additionalProps){
            this[prop] = additionalProps[prop];
        }

        this.createOverlays();
        this.equipAccessories();
    }

    createOverlays(){
        this.needsToiletOverlay = new Object2d({
            parent: this,
            img: 'resources/img/misc/needstoilet_01.png',
            x: 0,
            y: 0,
            width: this.petDefinition.spritesheet.cellSize, height: this.petDefinition.spritesheet.cellSize,
            hidden: true,
            onDraw: (overlay) => {
                overlay.mimicParent(['inverted', 'upperHalfOffsetY']);
                Object2d.animations.flip(overlay, 250);
            }
        });

        this.dirtyOverlay = new Object2d({
            parent: this,
            img: 'resources/img/misc/stinky_01.png',
            x: 0,
            y: 0,
            width: this.petDefinition.spritesheet.cellSize, height: this.petDefinition.spritesheet.cellSize,
            hidden: true,
            onDraw: (overlay) => {
                overlay.mimicParent(['inverted', 'upperHalfOffsetY']);
                Object2d.animations.flip(overlay, 300);
            }
        });

        this.shadowOverlay = new Object2d({
            parent: this,
            img: 'resources/img/misc/shadow_01.png',
            width: this.petDefinition.spritesheet.cellSize, 
            height: this.petDefinition.spritesheet.cellSize,
            // z: (this.z - 0.1) || 4.9,
            z: 4.89,
            hidden: !this.castShadow,
            onDraw: (overlay) => {
                overlay.x = this.x;

                if(App.currentScene.noShadows) {
                    overlay.y = -9999;
                    return;
                }

                if (this.staticShadow === undefined && this.isMainPet !== undefined){
                    if(this.isMainPet) this.staticShadow = false;
                    else this.staticShadow = true;
                }

                if (this.staticShadow) {
                    overlay.y = this.y + this.additionalY + Math.ceil(this.spritesheet.cellSize / 2.1);
                    return;
                }

                overlay.y = 96 + this.additionalY + (App.currentScene.shadowOffset || 0) + (this.shadowOffset || 0);
                const distanceToCaster = overlay.y - this.y;
                overlay.scale = 1 - ((distanceToCaster + 4) * 0.01);
            }
        })

        this.sicknessOverlay = new Object2d({
            parent: this,
            img: 'resources/img/misc/sickness_overlay_01.png',
            x: 0,
            y: 0,
            hidden: true,
            z: App.constants.ACTIVE_PET_Z + 0.1,
            onDraw: (overlay) => {
                Object2d.animations.flip(overlay, 750);
            }
        });
    }
    equipAccessories(){
        // removing old accessories
        this.accessoryObjects.forEach(accessoryObject => accessoryObject?.removeObject());
        this.accessoryObjects = [];

        if(!this.petDefinition.accessories) return;
        this.petDefinition.accessories.forEach((accName) => {
            const accessory = App.definitions.accessories[accName];
            if(!accessory) return;

            const accessoryObject = 
                accessory.createFn 
                    ? accessory.createFn(this) 
                    : new Object2d({
                        parent: this,
                        img: accessory.image,
                        z: accessory.front ? (this.z + 0.1) || 5.1 : (this.z - 0.1) || 4.9,
                        spritesheet: {
                            cellNumber: 1,
                            cellSize: 64,
                            rows: 4,
                            columns: 4,
                        },
                        onDraw: (overlay) => {
                            overlay.mimicParent();
                            overlay.x -= 16;
                            overlay.y -= 16;
                        }
                    });

            this.accessoryObjects.push(accessoryObject);
        })
    }
    onLateDraw() {
        this.behavior();
    }
    behavior() {
        this.isMainPet = this === App.pet;

        if(this.stats.is_dead) return this.handleDead();
        if(this.stats.is_egg) return this.handleEgg();

        this.think();
        this.moveToTarget(this.speedOverride || this.stats.speed);
        this.stateManager();
        this.handleAnimation();

        Object2d.animations.pixelBreath(this);
    }
    handleWants(){
        if(!this.isMainPet || App.haveAnyDisplays()) return;

        const {current_want} = this.stats;
        if(current_want.pendingFulfilled){
            this.showThought(App.constants.WANT_TYPES.fulfilled);
            current_want.pendingFulfilled = null;
        }

        if(App.fullTime > current_want.next_refresh_ms || 0){
            App.petDefinition.refreshWant()
            App.pet.showCurrentWant()
        }
    }
    handleDead(){
        const me = this;
        this.x = -600;

        App.toggleGameplayControls(false, () => {
            const handleReceiveEgg = () => {
                const lastPet = App.petDefinition;
                App.pet.removeObject();
                App.petDefinition = new PetDefinition({
                    name: getRandomName(),
                    sprite: randomFromArray(PET_BABY_CHARACTERS),
                }).setStats({is_egg: true});

                App.petDefinition.inventory = lastPet.inventory;
                App.petDefinition.stats.gold = lastPet.stats.gold;
                App.petDefinition.deceasedPredecessors = [...lastPet.deceasedPredecessors, 
                    {
                        birthday: lastPet.birthday,
                        family: lastPet.family,
                        sprite: lastPet.sprite,
                        name: lastPet.name,
                    }
                ];

                App.pet = App.createActivePet(App.petDefinition);
                setTimeout(() => {
                    Activities.playEggUfoAnimation(() => App.handlers.show_set_pet_name_dialog());
                }, 100);
                App.setScene(App.scene.home);
                App.toggleGameplayControls(true);
            }

            if(App.pet.stats.is_revived_once){
                App.displayConfirm(`Do you want to receive a new egg?`, [
                    {
                        name: 'yes',
                        onclick: handleReceiveEgg
                    },
                    {
                        name: 'no',
                        class: 'back-btn',
                        onclick: () => { }
                    },
                ], false);
            } else {
                const revivalPrice = clamp(Math.floor(App.pet.stats.gold / 2), App.constants.MIN_REVIVE_GOLDS, App.constants.MAX_REVIVE_GOLDS);
                App.displayConfirm(`<b>${App.petDefinition.name}</b> is dead but you can choose to revive them only <b>once</b>, do you want to revive them?`, [
                    {
                        name: `revive ($${revivalPrice})`,
                        onclick: () => {
                            if(App.pay(revivalPrice)){
                                Activities.revive()
                                return false;
                            }
                            return true;
                        }
                    },
                    {
                        name: 'get a new egg',
                        onclick: handleReceiveEgg
                    },
                    {
                        name: 'back',
                        class: 'back-btn',
                        onclick: () => {}
                    }
                ])
            }

        })

        if(!this.ghostObject){
            this.ghostObject = new Object2d({
                img: 'resources/img/misc/ghost_01.png',
                x: 0, 
                y: -5,
                onDraw: (ghostObject) => {
                    Object2d.animations.bob(ghostObject, 0.001, 0.1);
                    Object2d.animations.flip(ghostObject, 1500);

                    if(!App.pet.stats.is_dead) {
                        ghostObject.removeObject();
                        delete me.ghostObject;
                    }
                }
            });

            App.setScene(App.scene.graveyard);
        }
    }
    handleEgg(){
        this.x = -600;

        App.toggleGameplayControls(false, () => {
            App.displayPopup('Wait for your egg to hatch');
        })

        if(!this.eggObject){
            this.eggStartTime = Date.now();
            this.hatchTime = this.eggStartTime + random(15000, 30000);
            this.eggObject = new Object2d({
                img: 'resources/img/misc/egg.png',
                x: '50%', 
                y: '80%',
            });
            this.eggMotionFloat = 0;
            this.eggMotionFloatSpeed = 0.001;
            return;
        }

        this.eggMotionFloatSpeed = clamp(this.eggMotionFloatSpeed + (0.000001 * App.deltaTime), 0, 0.02);

        this.eggMotionFloat += this.eggMotionFloatSpeed * App.deltaTime;
        const motion = Math.sin(this.eggMotionFloat);

        if(this.eggMotionFloatSpeed === 0.02){
            this.eggObject.setImg('resources/img/misc/egg_02.png')
        }
        // this.eggObject.rotation = Math.round(motion / 22.5) * 22.5;
        this.eggObject.x = 40 + (motion * 1.5);
        
        // this.eggObject.x += this.eggCurrentDirection * App.deltaTime;
        // if(this.eggObject.x > 55 - 8 || this.eggObject.x < 45 - 8) this.eggCurrentDirection *= -1;

        // this.eggObject.rotation = lerp(this.eggObject.rotation, 0, 0.01 * App.deltaTime);

        // if(Math.random() < 0.01){
        //     // this.eggObject.setImg('resources/img/misc/egg_02.png');
        //     // setTimeout(() => this.eggObject?.setImg('resources/img/misc/egg.png'), 200);
        //     this.eggObject.rotation = randomFromArray([45, -45])
        // }

        if(Date.now() > this.hatchTime){
            this.stats.is_egg = false;
            App.setScene(App.scene.home);
            App.toggleGameplayControls(true);
            this.eggObject?.removeObject();
            this.eggObject = null;
            this.triggerScriptedState('uncomfortable', 5000);
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
        if(this.stats.is_sleeping || App.currentScene !== App.scene.home) return;
        this.stopMove();
        this.x = '50%';
        if(this.hasMoodlet('rested') && !App.isSleepHour()){
            this.playRefuseAnimation();
            return;
        }
        this.stats.is_sleeping = true;
    }
    feed(foodSpriteCellNumber, value, type, forced, onEndFn){
        const me = this;

        if(!type) type = 'food';

        App.toggleGameplayControls(false, () => {
            this.stopScriptedState();
        });
        this.stopMove();

        const refuse = () => {
            // App.foods.hidden = true;
            me.playRefuseAnimation();
            App.setScene(App.scene.home);
            App.uiFood.style.visibility = 'hidden';
            App.toggleGameplayControls(true);
            return false;
        }

        const shouldRefuse = () => {
            switch(type){
                case "food": 
                    if(this.hasMoodlet('full')) return true;
                    break;
            }

            // checking for over feeding the same item
            const reFedAmount = this.petDefinition.stats.last_eaten.reduce(
                (sum, current) => current === foodSpriteCellNumber ? sum + 1 : sum, 
                0
            );
            if(reFedAmount >= App.constants.FEEDING_PICKINESS.refeedingTolerance && type !== 'med') {
                this.showThought('thought_vomit');
                return true;
            }

            return false;
        }

        const wantedFoodItem = App.definitions.food[this.stats.current_want.item];
        if(this.petDefinition.checkWant(foodSpriteCellNumber === wantedFoodItem?.sprite, App.constants.WANT_TYPES.food)){
            forced = true;
        }

        if(!forced){
            if(shouldRefuse()) return refuse();
        }

        // keeping a track of last X consumed items
        this.petDefinition.stats.last_eaten = [
            foodSpriteCellNumber, 
            ...this.petDefinition.stats.last_eaten
        ].toSpliced(App.constants.FEEDING_PICKINESS.bufferSize);

        Missions.done(Missions.TYPES.food);

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
                    this.playCheeringAnimationIfTrue(this.hasMoodlet('healthy'), () => {
                        App.setScene(App.scene.home);
                        App.toggleGameplayControls(true);
                    });
                    break;
                default:
                    const end = (noLongerHungry) => {
                        App.closeAllDisplays();
                        App.toggleGameplayControls(true);
                        App.setScene(App.scene.home);
                        // if(!noLongerHungry){
                        //     App.handlers.open_feeding_menu();
                        //     App.handlers.open_food_list(null, null, type);
                        // }
                        onEndFn?.(noLongerHungry);
                    }
                    if(this.hasMoodlet('full')){
                        App.toggleGameplayControls(false);
                        this.playCheeringAnimation(() => { end(true) });
                    } else end();
                    break;
            }
            // App.foods.hidden = true;
            App.uiFood.style.visibility = 'hidden';
            // App.toggleGameplayControls(true);
        }, () => {
            if(App.time - lastFoodSpriteIndexChangeMs > 1200){
                lastFoodSpriteIndexChangeMs = App.time;

                foodSpriteIndex = clamp(foodSpriteIndex + 1, baseFoodSpriteIndex, baseFoodSpriteIndex + 2);

                App.uiFood.setAttribute('index', foodSpriteIndex);
            }
        });

        return true;
    }
    playCheeringAnimationIfTrue(requirement, onEndFn){
        if(requirement)
            this.playCheeringAnimation(onEndFn);
        else
            if(onEndFn) onEndFn();
    }
    playCheeringAnimation(onEndFn, noSoundAndIcon){
        this.stopMove();
        if(!noSoundAndIcon) setTimeout(() => this.playSound('resources/sounds/cheer_success.ogg', true));
        const stateName = !noSoundAndIcon ? 'cheering_with_icon' : 'cheering';
        this.triggerScriptedState(stateName, 2000, null, true, () => {
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
    playUncomfortableAnimation(onEndFn){
        this.stopMove();
        this.triggerScriptedState('uncomfortable', 2000, null, true, () => {
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

        if(!this.isDuringScriptedState()){
            this.wander();
            this.handleRandomGestures();
            this.handleWants();
        }
    }
    handleRandomGestures(){
        /* if(random(0, 100) == 1){
            if(this.stats.current_sleep < this.stats.max_sleep / 3){
                this.triggerScriptedState('tired', 10000, 20000);
                this.stopMove();
                return;
            }
        } */

        // bad animations
        if(random(0, 100) < 10){
            if(this.hasMoodlet('sleepy')){
                this.triggerScriptedState('angry', 4000, random(20000, 30000));
                this.stopMove();
                return;
            }
            if(this.hasMoodlet('hungry') || this.hasMoodlet('bored')){
                this.triggerScriptedState('uncomfortable', 4000, random(20000, 30000));
                this.stopMove();
                return;
            }
        }

        // const hasGoodMoodlets = ['amused', 'rested', 'full', 'healthy'].map(moodName => this.hasMoodlet(moodName)).some(moodlet => moodlet);
        const hasBadMoodlets = ['bored', 'sleepy', 'hungry', 'sick'].map(moodName => this.hasMoodlet(moodName)).some(moodlet => moodlet);

        // good animations
        if(!hasBadMoodlets){
            if(random(0, 100) < 10){
                let animations = [
                    {name: 'sitting', length: random(2000, 4000)}, 
                    {name: 'blush', length: random(550, 1000)}, 
                    {name: 'cheering', length: random(550, 1000)}, 
                    {name: 'shocked', length: random(450, 800)}, 
                ];
                let animation = randomFromArray(animations);
                this.triggerScriptedState(animation.name, animation.length, random(10000, 20000));
                this.stopMove();
            } else if(random(0, 105) < 3 && this.isMainPet){
                this.jump();
            }
        }
    }
    statsManager(isOfflineProgression, hour){
        if(!this.isMainPet || this.stats.is_dead) return;
        if(!hour) hour = App.hour;

        let stats = this.stats;
        const previousStats = Object.assign({}, this.stats);

        let depletion_mult = 1, offlineAndIsNight = false;
        if(isOfflineProgression){
            depletion_mult = 0.25;

            if(App.isSleepHour()){
                offlineAndIsNight = true;
                depletion_mult = 0.05;
            }
        }

        switch(this.petDefinition.lifeStage){
            case PetDefinition.LIFE_STAGE.baby: depletion_mult *= 1.65; break;
            case PetDefinition.LIFE_STAGE.child: depletion_mult *= 1.46; break;
            case PetDefinition.LIFE_STAGE.teen: depletion_mult *= 1.3; break;
        }

        if(this.stats.is_at_parents){
            if((hour < App.constants.PARENT_DAYCARE_START || hour >= App.constants.PARENT_DAYCARE_END)){
                if(!isOfflineProgression) {
                    Activities.stayAtParents(true);
                }
                this.stats.is_at_parents = false;
            }
        }
        if(!offlineAndIsNight && this.stats.is_at_parents) depletion_mult = -0.1;

        if(this.stats.is_at_vacation) depletion_mult = -0.1;

        let hunger_depletion_rate = stats.hunger_depletion_rate * depletion_mult;
        let sleep_depletion_rate = stats.sleep_depletion_rate * depletion_mult;
        let fun_depletion_rate = stats.fun_depletion_rate * depletion_mult;
        let bladder_depletion_rate = stats.bladder_depletion_rate * depletion_mult;
        let health_depletion_rate = stats.health_depletion_rate * depletion_mult;
        let cleanliness_depletion_rate = stats.cleanliness_depletion_rate * depletion_mult;
        let max_death_tick = stats.max_death_tick;
        switch(this.petDefinition.lifeStage){
            case PetDefinition.LIFE_STAGE.baby: max_death_tick = stats.baby_max_death_tick; break;
            case PetDefinition.LIFE_STAGE.child: max_death_tick = stats.child_max_death_tick; break;
            case PetDefinition.LIFE_STAGE.teen: max_death_tick = stats.teen_max_death_tick; break;
        }

        if(isOfflineProgression){
            // health_depletion_rate = 0;
            sleep_depletion_rate /= 2;
        }

        // sleeping case
        if(this.stats.is_sleeping || offlineAndIsNight){
            // fun_depletion_rate = 0;
            // hunger_depletion_rate = 0;

            // health_depletion_rate = 0;

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
            if(App.currentScene === App.scene.home){
                this.stats.is_sleeping = true;
            }
        }
        stats.current_fun -= fun_depletion_rate;
        if(stats.current_fun <= 0){
            stats.current_fun = 0;
            // console.log('All my friends no fun?');
        }
        stats.current_bladder -= bladder_depletion_rate;
        if(stats.current_bladder <= 0){
            stats.current_bladder = stats.max_bladder;
            if(!stats.is_potty_trained)
                this.stats.has_poop_out = true;
            else if(!isOfflineProgression) {
                App.queueEvent(() => {
                    Activities.poop(true);
                }, 'poop');
            }
        }
        this.needsToiletOverlay.hidden = stats.current_bladder > stats.max_bladder / 4;
        App.poop.hidden = !this.stats.has_poop_out;
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
        if(this.stats.has_poop_out || !this.dirtyOverlay.hidden){ // gradually decrease health if poop is nearby or dirty
            stats.current_health -= health_depletion_rate * stats.health_depletion_mult;
            stats.current_cleanliness -= cleanliness_depletion_rate * stats.cleanliness_depletion_mult;
        }
        if(stats.current_health <= 0){
            stats.current_health = 0;
            // console.log('dead of sickness?');
        }

        if(stats.current_health <= 0 && 
            stats.current_cleanliness <= 0 && 
            stats.current_fun <= 0 && 
            stats.current_hunger <= 0
        ) stats.current_death_tick -= stats.death_tick_rate;
        else stats.current_death_tick = max_death_tick;

        if(stats.current_death_tick <= 0){
            App.pet.stats.is_dead = true;
        }
        this.sicknessOverlay.hidden = stats.current_death_tick >= max_death_tick / 2;

        // care rating check
        const careAffectingStats = [
            'current_health',
            'current_fun',
            'current_hunger',
            'current_cleanliness',
        ]
        careAffectingStats.forEach(statName => {
            // decreasing
            if(
                previousStats[statName] != 0
                && this.stats[statName] == 0
            ) {
                this.petDefinition.adjustCare(false);
            }
        })
        // increasing
        const careIncreaseThreshold = this.stats.hunger_satisfaction || 85; // this value is based on lowest satisfaction stat
        const eligibleForCareIncrease = careAffectingStats.every(statName => this.stats[statName] > careIncreaseThreshold);
        const shouldResetCareIncreaseFlag = careAffectingStats.some(statName => this.stats[statName] < 65);
        if(eligibleForCareIncrease){
            if(this.stats.should_care_increase){
                this.stats.should_care_increase = false;
                this.petDefinition.adjustCare(true);
            }
        } else if(shouldResetCareIncreaseFlag) {
            this.stats.should_care_increase = true;
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
        return new Promise((resolve, reject) => {
            if(!forced){
                if(this.scriptedEventTime){
                    return resolve(); // already during scripted event
                }
        
                if(this.scriptedEventCooldowns[state]){
                    if(this.scriptedEventCooldowns[state] > App.lastTime){
                        return resolve();
                    }
                }
            }

            /* check if this is needed
            // if(this.scriptedEventTime){
            //     if(this.scriptedEventOnEndFn) this.scriptedEventOnEndFn();
            // } */
    
            if(cooldown){
                this.scriptedEventCooldowns[state] = App.lastTime + cooldown;
            }
    
            this.scriptedEventTime = App.lastTime + length;
            this.scriptedEventOnEndFn = (...args) => {
                if(typeof onEndFn === "function") onEndFn(...args);
                onEndFn = null;
                resolve();
            };
            this.scriptedEventDriverFn = driverFn;
            this.setState(state);
        })
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
    isDuringScriptedState(){
        return !!this.scriptedEventTime;
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
        
        if(this.stats.is_sleeping){
            if(
                (this.stats.current_sleep >= this.stats.max_sleep 
                || (this.hasMoodlet('rested') && Math.random() < this.stats.light_sleepiness * 0.01)) 
                && !App.isSleepHour()
            ){
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
                else {
                    this.setState('idle');
                }
            }
        }
    }
    handleAnimation(){
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
    wander() {
        if(this.isMoving){
            this.nextRandomTargetSelect = 0;
        }

        if (!this.nextRandomTargetSelect) {
            this.nextRandomTargetSelect = App.lastTime + random(this.stats.wander_min, this.stats.wander_max) * 1000;
        }

        if (App.lastTime > this.nextRandomTargetSelect) {
            this.targetX = random(this.drawer.getRelativePositionX(0), this.drawer.getRelativePositionX(100) - this.spritesheet.cellSize);
            this.nextRandomTargetSelect = 0;
        }
    }
    jump(strength = 0.28, silent){
        if(this.isJumping !== undefined) return false;

        this.isJumping = true;
        const gravity = 0.001;
        const startY = this.y;
        let velocity = strength;
        if(!silent) App.playSound('resources/sounds/jump.ogg', true);

        this.triggerScriptedState('jumping', App.INF, 0, true, 
        () => { // on end
            this.y = startY;
            this.isJumping = undefined;
        }, () => { // driver fn
            velocity -= gravity * App.deltaTime;
            this.y -= velocity * App.deltaTime;
            if(this.y >= startY){
                this.stopScriptedState();
            }
        });
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
        // deprecated: (max offline progression is 12 hours)
        // (max offline progression is 7 days)

        // 3600(secs in 1 hour) * 24(1 day) * 7(7 days) = 604800
        const maxOfflineProgressionSeconds = 604800;

        const startTime = Date.now();
        let iterations = Math.floor(clamp(elapsedTime / 1000, 0, maxOfflineProgressionSeconds) * 2);
        for(let i = 0; i < iterations; i++){
            elapsedTime -= 500;
            let date = new Date(startTime - elapsedTime);
            let hour = date.getHours();

            // supplying hour because from 22:00 to 9:00 the starts will 
            // drop much slower and pet will get sleep
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
        App.pet = App.createActivePet(this.petDefinition);
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
    getStatsDepletionRates(offline){
        App.petDefinition.maxStats();
        
        let seconds = 3600 * 100;
        let report = {};
        // let offline = false;

        for(let i = 0; i < seconds; i++){
            this.statsManager(offline);
            this.statsManager(offline);

            let min = {m: i / 60, s: i, h: i / 60 / 60};
            if(this.stats.current_hunger <= 0 && !report.hunger) report.hunger = {...min, stat: this.stats.current_hunger};
            if(this.stats.current_sleep <= 2 && !report.sleep) report.sleep = {...min, stat: this.stats.current_sleep};
            if(this.stats.current_fun <= 0 && !report.fun) report.fun = {...min, stat: this.stats.current_fun};
            if(this.stats.current_bladder <= 3 && !report.bladder) report.bladder = {...min, stat: this.stats.current_bladder};
            if(this.stats.current_cleanliness <= 0 && !report.cleanliness) report.cleanliness = {...min, stat: this.stats.current_cleanliness};
            if(this.stats.current_health <= 0 && !report.health) report.health = {...min, stat: this.stats.current_health};
            if(this.stats.current_death_tick <= 0 && !report.death_tick) report.death_tick = {...min, stat: this.stats.current_death_tick};
        }

        console.log(`Time every stats hit ~0:`, report);
        App.petDefinition.maxStats();
    }
    showCurrentWant(){
        if(this.stats.current_want.type){
            this.showThought(this.stats.current_want.type, this.stats.current_want.item);
        }
    }
    showThought(type, item, disappearDelay = 5000){
        const bubble = new Object2d({
            parent: this,
            img: 'resources/img/misc/thought_bubble_01.png',
            x: -999, 
            y: -999,
            opacity: 0,
            z: App.constants.ACTIVE_PET_Z + 0.1,
            shouldFadeout: false,
            float: 0,
            onDraw: (me) => {
                me.x = this.x;
                me.float += 0.004 * App.deltaTime;
                if(me.float > App.PI2) me.float = 0;
                me.y = this.y - (this.spritesheet.cellSize * 1.5) - (this.spritesheet.offsetY * 1.8 || 0) + Math.sin(me.float); 
                const opacityTarget = me.shouldFadeout ? 0 : 1;
                me.opacity = lerp(me.opacity, opacityTarget, App.deltaTime * 0.01);
            }
        })

        this.activeBubble?.removeObject?.();
        this.activeBubble = bubble;

        // shows type icon if exists
        if([
            App.constants.WANT_TYPES.food,
            App.constants.WANT_TYPES.playdate,
            App.constants.WANT_TYPES.item,
        ].includes(type)) {
            const typeIcon = new Object2d({
                parent: bubble,
                img: `resources/img/misc/thought_bubble_type_${type}.png`,
                x: 0, 
                y: 0,
                opacity: 0,
                z: 10.01,
                shouldFadeout: false,
                float: 0,
                onDraw: (me) => {
                    me.opacity = bubble.opacity;
                    me.x = bubble.x;
                    me.y = bubble.y;
                }
            })
        }

        const scale = 1 || 0.62;

        switch(type){
            case App.constants.WANT_TYPES.food:
                const foodSpriteIndex = App.definitions.food[item]?.sprite;
                if(!foodSpriteIndex) break;
                new Object2d({
                    parent: bubble,
                    image: App.preloadedResources[App.constants.FOOD_SPRITESHEET],
                    x: 10, y: 10, z: 10,
                    scale: 0.62,
                    spritesheet: {
                        cellNumber: foodSpriteIndex,
                        cellSize: 24,
                        rows: 33,
                        columns: 33,
                    },
                    onDraw: (me) => {
                        me.opacity = bubble.opacity;
                        me.x = bubble.x + 4;
                        me.y = bubble.y + 1;
                    }
                })
                break;
            case App.constants.WANT_TYPES.playdate:
                const friendDef = item instanceof PetDefinition 
                    ? item 
                    : this.petDefinition.friends[item];
                if(!friendDef) break;
                new Object2d({
                    parent: bubble,
                    image: App.preloadedResources[friendDef.sprite],
                    x: 10, y: 10, z: 10,
                    scale: 0.62,
                    spritesheet: friendDef.spritesheet,
                    onDraw: (me) => {
                        me.opacity = bubble.opacity;
                        me.x = bubble.x + (friendDef.spritesheet.offsetY ?? 0);
                        me.y = bubble.y - 4 + (friendDef.spritesheet.offsetY ?? 0);
                    }
                })
                break;
            case App.constants.WANT_TYPES.item:
                const itemSpriteIndex = App.definitions.item[item]?.sprite;
                if(!itemSpriteIndex) break;
                new Object2d({
                    parent: bubble,
                    image: App.preloadedResources["resources/img/item/items.png"],
                    x: 10, y: 10, z: 10,
                    scale: 0.7,
                    spritesheet: {
                        cellNumber: itemSpriteIndex,
                        cellSize: 22,
                        rows: 10,
                        columns: 10
                    },
                    onDraw: (me) => {
                        me.opacity = bubble.opacity;
                        me.x = bubble.x + 5;
                        me.y = bubble.y + 2;
                    }
                })
                break;
            case App.constants.WANT_TYPES.minigame:
                new Object2d({
                    parent: bubble,
                    image: App.preloadedResources["resources/img/misc/minigames.png"],
                    x: 10, y: 10, z: 10,
                    onDraw: (me) => {
                        me.opacity = bubble.opacity;
                        me.x = bubble.x;
                        me.y = bubble.y;
                    }
                })
                break;
            case App.constants.WANT_TYPES.fulfilled:
                new Object2d({
                    parent: bubble,
                    image: App.preloadedResources["resources/img/misc/want_fulfilled.png"],
                    x: 10, y: 10, z: 10,
                    onDraw: (me) => {
                        me.opacity = bubble.opacity;
                        me.x = bubble.x;
                        me.y = bubble.y;
                    }
                })
                break;
            default:
                new Object2d({
                    parent: bubble,
                    image: App.preloadedResources[`resources/img/misc/${type}.png`],
                    x: 10, y: 10, z: 10,
                    onDraw: (me) => {
                        me.opacity = bubble.opacity;
                        me.x = bubble.x;
                        me.y = bubble.y;
                    }
                })
        }

        setTimeout(() => {
            bubble.shouldFadeout = true;
            setTimeout(() => bubble.removeObject(), 1000);
        }, disappearDelay);
    }
    setLocalZBasedOnSelf(otherObject){
        const currentBoundingBox = this.getBoundingBox();
        const otherBoundingBox = otherObject.getBoundingBox();
        
        const localZ = (otherBoundingBox.y + otherBoundingBox.height) - (currentBoundingBox.y + currentBoundingBox.height);

        otherObject.z = this.z;
        otherObject.localZ = localZ;
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
        moveCheck: function(){
            if(this.pet.x === this.pet.targetX || this.pet.targetX === undefined) {
                this.pet.stopScriptedState();
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
        playingWithItem: function(){ // this.pet, this.item, this.itemObject
            const skipLimitedFpsItems = ['grimoire', 'skate'];

            if(!skipLimitedFpsItems.includes(this.item?.name)){
                if(this.lastMs && App.time <= this.lastMs + 500) return;
                this.lastMs = App.time;
            }

            switch(this.item?.name){
                case "skate":
                    if(!this.init){
                        this.init = true;
                        App.setScene(App.scene.skate_park);
                        this.animationPosition = {x: -30, y: 75};
                        this.pet.setState('idle_side');
                        this.pet.inverted = true;
                        this.animationSpeed = 0.075;
                        this.petOffset = {x: 0, y: 0};
                    }


                    this.animationPosition.x += this.animationSpeed * App.deltaTime;
                    const isRightPast = this.animationPosition.x > App.drawer.bounds.width + 32;
                    const isLeftPast = this.animationPosition.x < -64;

                    if(isRightPast || isLeftPast) {
                        // crossed
                        this.animationSpeed = (isRightPast ? -0.075 : 0.075);
                        this.pet.inverted = this.animationSpeed > 0;


                        if(random(0, 2) && this.itemObject.rotation === 0){
                            this.petOffset.y + 5;
                            this.itemObject.rotation = 15;
                            this.pet.setState('jumping');
                            this.animationPosition.y = 55;
                        } else {
                            this.pet.setState('idle_side');
                            this.itemObject.rotation = 0;
                            this.petOffset.x = 0;
                            this.petOffset.y = 0;
                            this.animationPosition.y = 75;
                        }
                    }

                    this.pet.x = this.animationPosition.x + this.petOffset.x + (this.pet.petDefinition.spritesheet.offsetY || 0);
                    this.pet.y = this.animationPosition.y + this.petOffset.y + (this.pet.petDefinition.spritesheet.offsetY || 0);

                    this.itemObject.x = this.animationPosition.x + 5;
                    this.itemObject.y = this.animationPosition.y;
                    break;
                case "grimoire":
                    if(!this.startTime) {
                        this.startTime = App.time;
                        this.float = 0;
                        this.x = 0;
                        this.itemObject.scale = 1;
                        this.itemObject.opacity = 1;
                    }
                    if(App.time <= this.startTime + 2000){
                        this.pet.setState('idle');
                        this.pet.x = '50%';
                        this.pet.y = '80%';
                        this.itemObject.x = '50%';
                    } else {
                        this.pet.setState(this.itemObject.opacity > 0 ? 'shocked' : 'mild_uncomfortable');
                        this.float += 0.025 * App.deltaTime;
                        this.x = this.pet.x;
                        this.itemObject.x = this.x - (Math.cos(this.float) * 20);
                        this.itemObject.scale += this.float * 0.001;
                        if(this.float > 80){
                            this.itemObject.opacity -= 0.001 * App.deltaTime;
                        }
                    }
                    this.itemObject.y = 70 - (Math.sin(this.float) * 20);
                    this.itemObject.z = App.constants.ACTIVE_PET_Z + 0.1;
                    break;
                case "microphone":
                    this.pet.x = randomFromArray(['25%', '50%', '75%']);
                    this.pet.y = '85%';
                    this.pet.inverted = !this.pet.inverted;

                    this.itemObject.x = this.pet.x;
                    this.itemObject.y = ((App.drawer.getRelativePositionY(92) - App.constants.ITEM_SPRITESHEET_DIMENSIONS.cellSize));
                    this.itemObject.z = this.pet.z + 0.1;
                    this.itemObject.inverted = this.pet.inverted;

                    this.itemObject.onDraw = function() {
                        if(!this._animFloat) this._animFloat = 0;
                        this._animFloat += 0.005 * App.deltaTime;
                        this.rotation = 0 + (Math.sin(this._animFloat) * 25);
                    }
                    break;

                case "smartphone":
                case "magazine":
                    this.pet.setState(randomFromArray(['sitting', 'sitting', this.item?.name === 'smartphone' ? 'eating' : 'sitting', 'shocked', 'blush']));
                    this.itemObject.x = this.pet.x + App.petDefinition.spritesheet.cellSize / 1.5;
                    this.itemObject.y = ((this.pet.y - 13) + random(-2, 2));
                    break;

                case "ball":
                    this.pet.y = '100%';
                    this.pet.x = '50%';

                    this.itemObject.x = randomFromArray(['40%', '60%']);
                    this.itemObject.y = ((App.drawer.getRelativePositionY(95) - App.constants.ITEM_SPRITESHEET_DIMENSIONS.cellSize) + random(-2, 2));
                    this.itemObject.z = this.pet.z + (randomFromArray([0.1, -0.1]));

                    break;
                case "music player":
                    this.pet.x = randomFromArray(['25%', '50%', '75%']);
                    this.pet.y = randomFromArray(['100%', '80%', '90%']);
                    this.pet.inverted = !this.pet.inverted;

                    this.itemObject.x = '50%';
                    this.itemObject.y = '70%';

                    this.itemObject.onDraw = function() {
                        if(!this._animFloat) this._animFloat = 0;
                        this._animFloat += 0.015 * App.deltaTime;
                        this.scale = 1 + (Math.sin(this._animFloat) * 0.09);
                    }
                    break;
                case "dumble":
                    this.pet.setState(randomFromArray(['uncomfortable', 'shocked']));
                    this.pet.x = '50%';
                    this.pet.y = '90%';
                    this.itemObject.z = this.pet.z + 0.1;
                    this.itemObject.x = '50%';
                    this.itemObject.y = ((App.drawer.getRelativePositionY(95) - App.constants.ITEM_SPRITESHEET_DIMENSIONS.cellSize) + random(-2, 2));
                    this.itemObject.inverted = !this.itemObject.inverted;
                    break;
                case "foxy":
                case "bear":
                    this.pet.setState(randomFromArray(['cheering', 'shocked', 'blush']));
                    const xOffset = (App.petDefinition.spritesheet.cellSize / 2) * (random(0, 1) ? -0.5 : 1);
                    this.itemObject.z = this.pet.z + 0.1;
                    this.itemObject.x = this.pet.x + xOffset;
                    this.itemObject.y = ((this.pet.y - 10) + random(-2, 2));
                    this.itemObject.inverted = !this.itemObject.inverted;
                    break;
                case "rattle":
                    this.pet.y = '100%';

                    this.pet.x = randomFromArray(['30%', '50%', '70%']);

                    const possibleItemPositions = ['25%', '50%', '75%'];
                    this.itemObject.x = randomFromArray(possibleItemPositions);
                    this.itemObject.y = randomFromArray(possibleItemPositions);
                    this.itemObject.inverted = !this.itemObject.inverted;
                    break;
                default:
                    if(Math.random() < 0.5){
                        const possibleStates = ['cheering', 'eating', 'shocked', 'sitting', 'blush'];
                        this.pet.setState(randomFromArray(possibleStates));
                        this.pet.inverted = random(0, 1) ? true : false;
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