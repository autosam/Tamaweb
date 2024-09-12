class Activities {
    static encounter(){
        if(random(0, 256) != 1) return false;
        const def = new PetDefinition({
            sprite: NPC_CHARACTERS[0],
            name: '-_-',
        }).setStats({
            current_hunger: 0,
            current_health: 0,
            current_fun: 0,
            current_death_tick: 0,
            speed: 0.1,
            wander_min: 0.1,
            wander_max: 0.11
        })
        new Pet(def, {
            opacity: 0.5,
            x: -50,
            castShadow: false,
            z: App.constants.ACTIVE_PET_Z + 1,
            onDraw: (me) => {
                if(!App.pet.stats.is_sleeping){
                    me.removeObject();
                }
            }
        });
        return true;
    }
    static goToVacation(vacationFn){
        App.definitions.achievements.go_to_vacation_x_times.advance();
        App.closeAllDisplays();
        App.toggleGameplayControls(false);
        App.pet.stopMove();
        App.pet.triggerScriptedState('idle', App.INF, 0, true, null);
        Activities.task_foam(
            () => {
                vacationFn()
            },
        )
    }
    static seaVacation(){
        App.pet.stats.is_at_vacation = true;
        App.save();
        App.setScene(App.scene.seaVacation);
        App.sendAnalytics('at_vacation');

        const end = () => {
            App.toggleGameplayControls(false);
            Activities.task_foam(() => {
                App.toggleGameplayControls(true);
                App.pet.stats.is_at_vacation = false;
                App.pet.stopScriptedState();
                App.setScene(App.scene.home);
                App.pet.playCheeringAnimation();
                App.save();
            })
        }

        App.pet.triggerScriptedState('idle', App.INF, 0, true, null, 
            Pet.scriptedEventDrivers.playingWithItem.bind({pet: App.pet})
        );

        setTimeout(() => {
            App.pet.x = '65%';
            App.pet.y = '67%';
            App.pet.stopMove();
        })

        App.toggleGameplayControls(false, () => {
            App.displayConfirm(`Are you sure you want to end ${App.petDefinition.name}'s vacation?`, [
                {
                    name: 'yes',
                    onclick: end
                },
                {
                    name: 'no',
                    class: 'back-btn',
                    onclick: () => { }
                }
            ])
        });
    }
    static async cookingGame(){
        App.closeAllDisplays();
        App.pet.triggerScriptedState('idle', App.INF, 0, false);
        App.sendAnalytics('cooking_game');
        // App.setScene(App.scene.kitchen);

        const potObject = new Object2d({
            img: 'resources/img/misc/cooking_pot_p01.png',
            z: 30, x: 0, y: 0,
        });
        const potInsideObject = new Object2d({
            img: 'resources/img/misc/cooking_pot_p02.png',
            z: 30.1, x: 0, y: 0, clipCircle: true, parent: potObject,
            onDraw: (me) => {
                Object2d.animations.rotateAround(me, stirringSpeed * 50);
            }
        });
        const potTopObject = new Object2d({
            img: 'resources/img/misc/cooking_pot_p03.png',
            z: 30.4, x: 0, y: 0, parent: potObject,
        });

        let stirringSpeed = 0.001;
        const starLogicHandler = (me) => {
            if(!me._originX) me._originX = me.config.drawer.getRelativePositionX(50 - 11);
            if(!me._originY) me._originY = me.config.drawer.getRelativePositionY(50 - 11);
            if(me._current === undefined || me._current == Math.PI) me._current = 0;

            me._current += stirringSpeed * App.deltaTime;

            Object2d.animations.circleAround(me, 20, me._current, me._originX, me._originY);
            Object2d.animations.pulseScale(me, 0.01, Math.min(Math.abs(stirringSpeed) * 10, 0.03));
        }

        const starObjects = [];
        for(let i = 0; i < 3; i++){
            const img = new Object2d({
                img: 'resources/img/misc/star_01.png',
                width: 22, height: 22, y: '50%', x: '50%', z: 30.5,
                _current: 2.0944 * i, pulseScaleFloat: i,
                clipCircle: true, parent: potObject,
                noPreload: true,
                onDraw: starLogicHandler,
            })
            starObjects.push(img);
        }

        let failChance = 25;
        let currentTargetImgIndex = 0;
        App.toggleGameplayControls(false, () => {
            if(currentTargetImgIndex < starObjects.length){
                App.useWebcam((imgData) => {
                    if(!imgData || imgData == -1){
                        // potObject.removeObject();
                        // App.pet.stopScriptedState();
                        // App.toggleGameplayControls(true);
                        imgData = 'resources/img/misc/exclam_01.png';
                        failChance += 35;
                    }
                    starObjects[currentTargetImgIndex].setImg(imgData);
                    currentTargetImgIndex++;
                    stirringSpeed += 0.001;
                });
            } else {
                stirringSpeed += 0.001;
                if(stirringSpeed > 0.02){
                    const failed = random(0, 100) < failChance;
                    App.toggleGameplayControls(false);
                    stirringSpeed = -100;
                    let randomFoodName, backgroundObject;
                    Activities.task_foam(
                        () => { // mid
                            potObject.removeObject();
                            backgroundObject = new Object2d({
                                img: 'resources/img/misc/light_rays_01.png',
                                width: 144, height: 144,
                                x: '50%', y: '50%', z: 30,
                                onDraw: (me) => {
                                    Object2d.animations.rotateAround(me);
                                }
                            })
                            randomFoodName = randomFromArray(Object.keys(App.definitions.food));
                            const randomFood = App.definitions.food[randomFoodName];
                            App.constants.FOOD_SPRITESHEET_DIMENSIONS.cellNumber = randomFood.sprite;
                            if(!failed){
                                setTimeout(() => App.playSound('resources/sounds/task_complete_02.ogg', true), 1000);
                                new Object2d({
                                    img: App.constants.FOOD_SPRITESHEET,
                                    spritesheet: App.constants.FOOD_SPRITESHEET_DIMENSIONS,
                                    x: '50%', y: '50%', z: 31, parent: backgroundObject,
                                    onDraw: (me) => {
                                        Object2d.animations.pulseScale(me, 0.01, 0.01);
                                    }
                                })
                            } else {
                                new Object2d({
                                    img: 'resources/img/misc/exclam_01.png',
                                    width: 32, height: 32,
                                    x: '50%', y: '50%', z: 31, parent: backgroundObject, clipCircle: true,
                                    onDraw: (me) => {
                                        Object2d.animations.pulseScale(me, 0.01, 0.01);
                                    }
                                })
                            }
                        },
                        () => { // end
                            setTimeout(() => {
                                function end(){
                                    backgroundObject.removeObject();
                                    App.toggleGameplayControls(true);
                                    App.pet.stopScriptedState();
                                    App.pet.x = '50%';
                                }
                                if(!failed){
                                    const amount = 1;
                                    App.displayPopup(`${App.petDefinition.name} <br>made x${amount}<br> <b>${randomFoodName}</b>!`, 3000, () => {
                                        end();
                                        App.pet.playCheeringAnimation();
                                        App.pet.stats.current_fun += random(10, 25);
                                        App.addNumToObject(App.pet.inventory.food, randomFoodName, amount);
                                    });
                                } else {
                                    App.displayPopup(`${App.petDefinition.name} <br>failed to make anything edible!<br>`, 3000, () => {
                                        end();
                                        App.pet.stats.current_fun -= random(5, 15);
                                        App.pet.playUncomfortableAnimation();
                                    });
                                }
                            }, 2000);
                        }
                    );
                }
            }
        });

    }
    // activities
    static async getDressed(middleFn, onEndFn){
        App.closeAllDisplays();
        App.toggleGameplayControls(false);
        App.sendAnalytics('getting_dressed');

        let curtainTargetElevation = 16, step = 0;
        const curtainObject = new Object2d({
            img: 'resources/img/misc/dresser_curtain_01.png',
            x: 0, y: -100, z: 9,
            onDraw: (curtain) => {
                // curtain.y = lerp(curtain.y, curtainTargetElevation, 0.001 * App.deltaTime);
                curtain.targetY = curtainTargetElevation;
                curtain.moveToTarget(0.03);
                Object2d.animations.bob(curtain, 0.01, 1);
            }
        })

        App.pet.stopMove();
        App.pet.x = '50%';
        await App.pet.triggerScriptedState('idle', 4000, 0, true);
        if(middleFn) middleFn();
        curtainTargetElevation = -100;
        await App.pet.triggerScriptedState('idle', 2000, 0, true);
        curtainObject.removeObject();
        App.pet.playCheeringAnimation(() => {
            App.toggleGameplayControls(true);
            onEndFn();
        });
    }
    static async pet(){
        App.sendAnalytics('petting');
        let idleTimer = null, closeTimer = null, y = App.pet.y;
        App.pet.stopMove();
        App.pet.x = '50%';
        App.pet.targetY = 132;
        App.pet.shadowOffset = 999;
        App.toggleGameplayControls(false);
        await App.pet.triggerScriptedState('cheering', 1000, null, true);
        App.pet.scale = 2;
        App.pet.targetY = 50;
        await App.pet.triggerScriptedState('cheering', 1000, null, true);
        App.pet.scale = 3;
        App.pet.targetY = 60;
        App.toggleGameplayControls(false, () => {
            App.definitions.achievements.pat_x_times.advance();
            App.pet.setState('blush');
            App.pet.stats.current_fun += random(1, 4) * 0.1;
            if(idleTimer) clearTimeout(idleTimer);
            if(closeTimer) clearTimeout(closeTimer);
            App.playSound('resources/sounds/cute.ogg', true);
            Activities.task_floatingHearts();
            idleTimer = setTimeout(() => {
                App.pet.setState('idle');
                closeTimer = setTimeout(() => App.pet.stopScriptedState(), 5000);
                idleTimer = null;
            }, 250);
        });
        await App.pet.triggerScriptedState('idle', App.INF, null, true, () => {
            // App.pet.y = y;
            // App.pet.x = '50%';
            App.setScene(App.currentScene);
            App.toggleGameplayControls(true);
            App.pet.shadowOffset = 0;
            App.pet.scale = 1;
            App.pet.playCheeringAnimation();
        });
    }
    static standWork(){
        App.closeAllDisplays();
        App.setScene(App.scene.stand);
        App.definitions.achievements.work_x_times.advance();
        let totalMoneyMade = 0;

        let standObject = new Object2d({
            img: 'resources/img/misc/stand_01_booth.png',
            x: 0, y: 0, z: 19
        })

        App.toggleGameplayControls(false, () => {
            App.pet.stopScriptedState();
        });

        function spawnCustomer() {
            const standDuration = random(2000, 5000);

            const badAnimations = ['angry'];
            const midAnimations = ['uncomfortable', 'shocked'];
            const goodAnimations = ['eating', 'cheering'];

            let possibleAnimations = [...goodAnimations, ...midAnimations, ...badAnimations];

            const negativeMoodlets = App.pet.hasMoodlet('hungry') + App.pet.hasMoodlet('bored') + App.pet.hasMoodlet('sick') + App.pet.hasMoodlet('sleepy');
            if(negativeMoodlets && negativeMoodlets <= 2) possibleAnimations = [...midAnimations, ...goodAnimations];
            else if(negativeMoodlets && negativeMoodlets <= 4) possibleAnimations = [...badAnimations, ...midAnimations];
            else possibleAnimations = [...goodAnimations];

            const currentAnimation = randomFromArray(possibleAnimations);

            switch(currentAnimation){
                case "eating":
                case "cheering":
                    totalMoneyMade += random(8, 12);
                    break;
                case "shocked":
                case "uncomfortable":
                    totalMoneyMade += random(3, 5);
                    break;
                case "angry":
                    totalMoneyMade += 2;
                    break;
            }

            let otherPet = new Pet(App.getRandomPetDef(random(1, 2)));
                otherPet.stopMove();
                otherPet.x = -32;
                otherPet.y = '100%';
                otherPet.z = 20;
                otherPet.inverted = true;
                otherPet.targetX = 8;
                App.pet.setState('idle_side');
                otherPet.triggerScriptedState('moving', 4000, 0, true, () => {
                    otherPet.stopMove();
                    otherPet.x = 8;
                    App.pet.setState('eating');
                    otherPet.triggerScriptedState(currentAnimation, standDuration, 0, true, () => {
                        otherPet.targetX = -100;
                        App.pet.setState('idle');
                        App.playSound('resources/sounds/task_complete.ogg', true);
                        otherPet.triggerScriptedState('moving', 5000, 0, true, () => {
                            otherPet.removeObject();
                        })

                    })
                })

            return otherPet;
        }

        App.pet.stopMove();
        App.pet.x = '68%';
        App.pet.y = '70%';
        App.pet.inverted = false;
        let startTime = Date.now();
        let nextCustomerSpawnTime = Date.now() + random(0, 8000);
        let currentCustomer;
        App.pet.triggerScriptedState('idle', 200000, 0, true, () => {
            standObject.removeObject();
            let elapsedTime = Math.round((Date.now() - startTime) / 1000);
            Activities.task_endWork(elapsedTime, totalMoneyMade);
            currentCustomer?.removeObject();
        }, () => {
            // Object2d.animations.bob(App.pet, 0.01, 0.05);
            if(Date.now() > nextCustomerSpawnTime){
                nextCustomerSpawnTime = Date.now() + random(8000, 45000);
                currentCustomer = spawnCustomer();
            }
        });
    }
    static battle(otherPetDef){
        App.setScene(App.scene.battle);

        if(!otherPetDef) otherPetDef = App.getRandomPetDef(App.petDefinition.lifeStage);

        let otherPet = new Pet(otherPetDef);
            otherPet.stopMove();
            otherPet.x = '75%';
            otherPet.y = '40%';
            otherPet.inverted = false;
            otherPet.triggerScriptedState('battle', App.INF, 0, true, () => {
                otherPet.removeObject();
            }, () => {
                Object2d.animations.bob(otherPet, 0.01, 0.1)
            })
        
        App.pet.stopMove();
        App.pet.x = '25%';
        App.pet.y = '90%';
        App.pet.inverted = true;
        App.pet.triggerScriptedState('battle', App.INF, 0, true, () => {
            // end
        }, () => {
            Object2d.animations.bob(App.pet, 0.01, 0.12)
        })

        App.toggleGameplayControls(false, () => {

        })
    }
    static playEggUfoAnimation(callback){
        if(!App.pet.eggObject) return;

        App.toggleGameplayControls(false);

        let egg = App.pet.eggObject;
            egg.y = -40;

        let stage = 0;

        this.ufoObject = new Object2d({
            image: App.preloadedResources['resources/img/misc/ufo_01.png'],
            y: -120,
            x: 0,
        });

        let drawEvent = () => {
            egg.y = lerp(egg.y, 72, 0.0008 * App.deltaTime);
            
            if(stage == 0){
                this.ufoObject.y = lerp(this.ufoObject.y, 0, 0.007 * App.deltaTime);
                if(egg.y >= 65) stage = 1;
            } else {
                this.ufoObject.y = lerp(this.ufoObject.y, -120, 0.001 * App.deltaTime);
                if(this.ufoObject.y <= -110) stage = 2;
            }

            if(stage == 2){
                App.toggleGameplayControls(true);
                if(callback) callback();
                this.ufoObject.removeObject();
                App.unregisterOnDrawEvent(drawEvent);
            }
        }

        App.registerOnDrawEvent(drawEvent);
    }
    static stayAtParents(end){
        App.sendAnalytics('stay_at_parents');

        if(end){
            App.toggleGameplayControls(true);
            App.setScene(App.scene.home);
            App.pet.playCheeringAnimation();
            App.pet.stats.is_at_parents = false;
            App.save();
            return;
        }

        App.toggleGameplayControls(false, () => {
            App.displayConfirm(`Pickup ${App.petDefinition.name} from their parents house?`, [
                {
                    name: 'yes',
                    onclick: () => {
                        Activities.stayAtParents(true); // ending
                    }
                },
                {
                    name: 'no',
                    class: 'back-btn',
                    onclick: () => { }
                }
            ])
        });

        App.setScene(App.scene.parentsHome);

        App.pet.stats.is_at_parents = true;
        App.save();
    }
    static goToClinic(){
        App.toggleGameplayControls(false);

        function task_visit_doctor(){
            App.setScene(App.scene.hospitalInterior);
            App.pet.stopMove();
            App.pet.x = -30;
            App.pet.targetX = 50;
            App.pet.triggerScriptedState('moving', 4000, null, true, () => {
                App.displayPopup(`<b>Dr. Banzo:</b><br>let's see...`, 3500);
                App.pet.x = '20%';
                // App.toggleGameplayControls(true);
                App.pet.inverted = true;
                App.pet.triggerScriptedState('idle_side', 4100, null, true, () => {
                    let health = App.pet.stats.current_health;
    
                    let state = 'very healthy';
                    if(health <= App.pet.stats.max_health * 0.20) state = 'very sick';
                    else if(health <= App.pet.stats.max_health * 0.45) state = 'sick';
                    else if(health <= App.pet.stats.max_health * 0.75) state = 'healthy'
    
                    if(state == 'very sick' || state == 'sick'){
                        App.pet.triggerScriptedState('shocked', 2000, false, true, () => {
                            App.displayPopup(`${App.pet.petDefinition.name} is ${state}`, 5000, () => App.pet.x = '50%');
                            App.setScene(App.scene.home);
                            App.toggleGameplayControls(true);
                        })
                    } else {
                        App.pet.triggerScriptedState('cheering_with_icon', 2000, false, true, () => {
                            App.displayPopup(`${App.pet.petDefinition.name} is ${state}`, 5000, () => App.pet.x = '50%');
                            App.setScene(App.scene.home);
                            App.toggleGameplayControls(true);
                        })
                    }
                });
    
            });
        }

        function task_goto_hospital(){
            App.setScene(App.scene.hospitalExterior);
            App.pet.stopMove();
            App.pet.x = '50%';
            App.pet.y = 130;
            App.pet.targetY = 80;
            App.pet.triggerScriptedState('moving', 2500, 0, true, () => {
                App.pet.stopMove();
                task_visit_doctor();
            })
        }

        task_goto_hospital();
    }
    static bathe(){
        App.closeAllDisplays();
        App.setScene(App.scene.bathroom);
        let foams = [];
        App.toggleGameplayControls(false, () => {
            App.pet.inverted = !App.pet.inverted;
            let flipTime = random(200, 300);

            let foamSpeed = random(5, 13) * 0.001;
            let foamStr = random(1, 4) * 0.1;
            let foam = new Object2d({
                img: 'resources/img/misc/foam_single.png',
                x: 50 + random(-15, 15) + Math.random(), 
                y: 42 + random(-2, 2) + Math.random(),
                z: 20,
                onDraw: (me) => {
                    Object2d.animations.flip(me, flipTime);
                    Object2d.animations.bob(me, foamSpeed, foamStr);
                }
            })
            foams.push(foam);

            if(foams.length >= 10){
                foams.forEach(f => f.removeObject());
                App.toggleGameplayControls(false);
                App.pet.stopScriptedState();
            }

            App.pet.stats.current_cleanliness += 25;
            App.playSound(`resources/sounds/ui_click_03.ogg`, true);
        });

        let bathObject = new Object2d({
            img: 'resources/img/misc/bathroom_01_bath.png',
            x: 0, y: 0, z: 19
        })

        App.pet.stopMove();
        App.pet.x = '64%';
        App.pet.y = '64%';
        App.pet.triggerScriptedState('idle', App.INF, 0, true, () => {
            App.pet.x = '50%';
            App.pet.y = '100%';
            bathObject.removeObject();
            App.pet.playCheeringAnimation(() => {
                App.setScene(App.scene.home);
                App.toggleGameplayControls(true);
            });
        });
    }
    static poop(){
        // todo: add automatic pooping and poop training symbols to player

        App.closeAllDisplays();
        App.setScene(App.scene.bathroom);
        App.toggleGameplayControls(false);

        if(App.pet.stats.current_bladder > App.pet.stats.max_bladder / 2){ // more than half
            App.pet.playRefuseAnimation(() => {
                App.setScene(App.scene.home);
                App.toggleGameplayControls(true);
            });
            return;
        }

        App.definitions.achievements.use_toilet_x_times.advance();

        App.pet.needsToiletOverlay.hidden = false;
        App.pet.stats.current_bladder = App.pet.stats.max_bladder;
        App.pet.stopMove();
        App.pet.x = '21%';
        App.pet.y = '85%';
        App.pet.inverted = true;
        App.pet.triggerScriptedState('sitting', 5000, 0, true, () => {
            App.pet.x = '50%';
            App.pet.y = '100%';
            App.pet.playCheeringAnimation(() => {
                App.setScene(App.scene.home);
                App.toggleGameplayControls(true);
            });
        });
    }
    static wedding(otherPetDef){
        App.closeAllDisplays();
        App.setScene(App.scene.wedding);
        App.toggleGameplayControls(false);
        App.petDefinition.maxStats();

        App.definitions.achievements.marry_x_times.advance();

        const otherPet = new Pet(otherPetDef);

        try {
            App.sendAnalytics('wedding', JSON.stringify({
                a: App.petDefinition.sprite,
                b: otherPetDef.sprite
            }));
        } catch(e) {}

        const overlay = new Object2d({
            img: 'resources/img/background/house/wedding_overlay.png',
            x: 0,
            y: 0,
            z: 99
        })

        App.pet.stopMove();
        otherPet.stopMove();

        otherPet.x = '33%';
        App.pet.x = '67%';

        App.pet.y = 0;
        otherPet.y = 0;

        App.pet.targetY = 56;
        otherPet.targetY = 56;

        otherPet.inverted = true;
        App.pet.inverted = false;

        otherPet.triggerScriptedState('blush', App.INF, 0, true);
        App.pet.triggerScriptedState('blush', App.INF, 0, true);

        setTimeout(() => {
            App.playSound('resources/sounds/wedding_song_01.ogg', true);
        })

        setTimeout(() => {
            otherPet.triggerScriptedState('idle_side', App.INF, 0, true);
            App.pet.triggerScriptedState('idle_side', App.INF, 0, true);
        }, 8000);

        setTimeout(() => {
            otherPet.triggerScriptedState('kissing', App.INF, 0, true);
            App.pet.triggerScriptedState('kissing', App.INF, 0, true);
        }, 12380);

        setTimeout(() => {
            Activities.task_foam(() => {
                App.pet.removeObject();
                otherPet.removeObject();
                overlay.removeObject();

                let parentA = App.petDefinition,
                    parentB = otherPetDef;

                App.petDefinition = App.getPetDefFromParents(parentA, parentB);

                App.pet.stopMove();

                App.setScene(App.scene.home);

                App.pet = App.createActivePet(App.petDefinition);
            }, () => {
                App.toggleGameplayControls(true);

                App.handlers.show_set_pet_name_dialog();
            })
        }, 18000);
    }
    static dbg_randomMarriage(){
        App.pet.removeObject();

        let parentA = App.petDefinition;
        const parentAFamily = parentA.family;
        parentA = App.getRandomPetDef(2);
        parentA.family = parentAFamily;

        App.petDefinition = App.getPetDefFromParents(parentA, App.getRandomPetDef(2));

        App.pet.stopMove();

        App.setScene(App.scene.home);

        App.pet = new Pet(App.petDefinition);
        App.pet.stats.is_egg = false;
    }
    static birthday(){
        App.setScene(App.scene.home);
        App.toggleGameplayControls(false);
        App.pet.stats.has_poop_out = false;
        App.pet.stats.current_bladder = 100;
        App.definitions.achievements.birthday_x_times.advance();

        let otherPetDefs =  [...App.petDefinition.friends]
                            .map(value => ({ value, sort: Math.random() }))
                            .sort((a, b) => a.sort - b.sort)
                            .map(({ value }) => value); // shuffling friends array
        for(let i = 0; i < 3; i++){
            let def = new PetDefinition({
                sprite: randomFromArray(PET_TEEN_CHARACTERS),
            });
            otherPetDefs.push(def);
        }

        let otherPets = [];
        otherPetDefs.slice(0, 3).forEach(def => {
            let pet = new Pet(def);
            otherPets.push(pet);
        });
        
        const table = new Object2d({
            img: 'resources/img/misc/table_01.png',
            x: 28,
            y: 68,
        });
        const cake = new Object2d({
            img: 'resources/img/misc/cake_01.png',
            x: 39,
            y: 58,
        });

        otherPets.forEach((pet, i) => {
            pet.stopMove();
            pet.targetX = 20;
            pet.x = -10 * i;
            switch(i){
                case 0:
                    pet.targetX = 30;
                    pet.targetY = 65;
                    break;
                case 1:
                    pet.targetX = 15;
                    pet.targetY = 75;
                    break;
                case 2:
                    pet.targetX = 5;
                    pet.targetY = 85;
                    break;
            }
            pet.triggerScriptedState('moving', App.INF, 0, true, null, (pet) => {
                if(!pet.isMoving){
                    pet.setState('cheering');
                }
            })
        })

        App.pet.x = '80%';
        App.pet.stopMove();
        App.pet.inverted = false;
        App.pet.triggerScriptedState('idle_side', 3000, 0, true, () => {
            App.playSound('resources/sounds/birthday_song_01.ogg', true);
            App.pet.triggerScriptedState('cheering', 13000, 0, true, () => {
                App.pet.triggerScriptedState('cheering', 10000, 0, true);
                Activities.task_foam(() => {
                    otherPets.forEach(pet => pet.removeObject());
                    table.removeObject();
                    cake.removeObject();

                    App.pet.ageUp();
                    App.pet.x = '50%';
                    App.pet.y = 60;
                    App.pet.stopMove();

                    App.pet.triggerScriptedState('blush', 3000, 0, true, () => {
                        App.setScene(App.scene.home);
                        App.toggleGameplayControls(true);
                        App.pet.playCheeringAnimation();
                    });

                    App.sendAnalytics('age_up', App.petDefinition.lifeStage, true);
                });
            });
        });
    }
    static redecorRoom(){
        App.setScene(App.scene.home);
        App.toggleGameplayControls(false);
        let otherPetDef = new PetDefinition({
            sprite: 'resources/img/character/chara_290b.png',
        })
        let otherPet = new Pet(otherPetDef);
        App.definitions.achievements.redecor_x_times.advance();

        otherPet.stopMove();
        otherPet.x = '100%';
        App.pet.stopMove();
        App.pet.x = 10;

        function task_otherPetMoveIn(){
            otherPet.triggerScriptedState('moving', App.INF, null, true);
            otherPet.targetX = 80 - otherPet.spritesheet.cellSize;
            App.pet.triggerScriptedState('idle', 3000, null, true, () => {
                otherPet.stopScriptedState();
                task_redecor();
            })
        }

        function task_redecor(){
            otherPet.x = 80 - otherPet.spritesheet.cellSize;
            otherPet.stopMove();
            App.pet.stopMove();

            Activities.task_foam(
            () => {
                App.setScene(App.scene.home);
                App.pet.x = 10;
            }, 
            () => {
                App.pet.stopScriptedState();
            })

            otherPet.triggerScriptedState('idle', App.INF);
            App.pet.triggerScriptedState('idle', App.INF, null, true, () => {
                otherPet.stopScriptedState();
                task_otherPetMoveOut();
            });
        }

        function task_otherPetMoveOut(){
            otherPet.triggerScriptedState('moving', App.INF);
            otherPet.targetX = 120;
            App.pet.inverted = true;
            App.pet.triggerScriptedState('idle_side', 3000, null, true, () => {
                otherPet.stopScriptedState();
                App.pet.x = '50%';
                App.pet.stats.current_fun += 55;
                App.pet.statsManager();
                App.pet.playCheeringAnimationIfTrue(App.pet.hasMoodlet('amused'), () => App.setScene(App.scene.home));
                App.drawer.removeObject(otherPet);
                App.toggleGameplayControls(true);
            });
        }

        task_otherPetMoveIn();
    }
    static inviteGiveGift(otherPetDef){
        App.setScene(App.scene.home);
        App.toggleGameplayControls(false);
        let otherPet = new Pet(otherPetDef);
        App.definitions.achievements.give_gifts_x_times.advance();

        const wantedFriendDef = App.petDefinition.friends[App.pet.stats.current_want.item];
        App.petDefinition.checkWant(otherPetDef == wantedFriendDef, App.constants.WANT_TYPES.playdate)

        otherPet.stopMove();
        otherPet.x = '100%';
        App.pet.stopMove();
        App.pet.x = 10;

        let gift = new Object2d({
            img: 'resources/img/misc/gift.png',
            x: '50%', y: '80%'
        });

        function task_otherPetMoveIn(){
            otherPet.triggerScriptedState('moving', App.INF, null, true);
            otherPet.targetX = 90 - otherPet.spritesheet.cellSize;
            App.pet.inverted = true;
            App.pet.triggerScriptedState('idle_side', 2500, null, true, () => {
                otherPet.stopScriptedState();
                task_gift();
            })
        }

        function task_gift(){
            otherPet.x = 90 - otherPet.spritesheet.cellSize;
            App.pet.x = 10;

            otherPet.stopMove();
            App.pet.stopMove();

            otherPet.triggerScriptedState('cheering', App.INF);
            App.pet.triggerScriptedState('cheering', 3000, null, true, () => {
                // App.drawer.removeObject(gift);
                otherPet.stopScriptedState();
                task_otherPetMoveOut();
            });
        }

        function task_otherPetMoveOut(){
            gift.y += 10;
            otherPet.triggerScriptedState('moving', App.INF, false, true, null, () => {
                gift.x = otherPet.x + 10;
            });
            otherPet.targetX = 120;
            App.pet.inverted = true;
            App.pet.triggerScriptedState('blush', 3000, null, true, () => {
                otherPet.stopScriptedState();
                App.pet.x = '50%';
                App.pet.stats.current_fun += 55;
                App.pet.statsManager();
                App.pet.playCheeringAnimationIfTrue(App.pet.hasMoodlet('amused'), () => App.setScene(App.scene.home));
                App.drawer.removeObject(otherPet);
                App.drawer.removeObject(gift);
                App.toggleGameplayControls(true);
            });
        }

        task_otherPetMoveIn();
    }
    static officeWork(){
        App.closeAllDisplays();
        App.setScene(App.scene.office);
        App.definitions.achievements.work_x_times.advance();

        App.toggleGameplayControls(false, () => {
            App.pet.stopScriptedState();
        });

        let laptop = new Object2d({
            img: "resources/img/misc/laptop.png",
            x: '70%', y: '50%',
        });
        laptop.x = '70%';
        laptop.y = '50%';
        App.pet.stopMove();
        App.pet.inverted = true;
        App.pet.x = '50%';
        App.pet.y = '60%';
        let startTime = Date.now();
        App.pet.triggerScriptedState('eating', 200000, false, true, () => {
            laptop.removeObject();
            let elapsedTime = Math.round((Date.now() - startTime) / 1000);
            Activities.task_endWork(elapsedTime, Math.round(elapsedTime / 2.5));
        })
    }
    static inviteDoctorVisit(){
        App.setScene(App.scene.home);
        App.toggleGameplayControls(false);
        let otherPetDef = new PetDefinition({
            sprite: 'resources/img/character/chara_291b.png',
        })
        let otherPet = new Pet(otherPetDef);

        otherPet.stopMove();
        otherPet.x = '100%';
        App.pet.stopMove();
        App.pet.x = 20;

        function task_otherPetMoveIn(){
            otherPet.triggerScriptedState('moving', App.INF, null, true);
            otherPet.targetX = 80 - otherPet.spritesheet.cellSize;
            App.pet.triggerScriptedState('idle', 3000, null, true, () => {
                otherPet.stopScriptedState();
                task_visiting();
            })
        }

        function task_visiting(){
            otherPet.x = 80 - otherPet.spritesheet.cellSize;
            App.pet.x = 20;

            otherPet.stopMove();
            App.pet.stopMove();

            App.pet.inverted = true;

            otherPet.triggerScriptedState('eating', App.INF);
            App.pet.triggerScriptedState('eating', 8000, null, true, () => {
                otherPet.stopScriptedState();
                task_otherPetMoveOut();
            });
        }

        function task_otherPetMoveOut(){
            otherPet.triggerScriptedState('moving', App.INF);
            otherPet.targetX = 120;
            App.pet.inverted = true;
            App.pet.triggerScriptedState('idle_side', 3000, null, true, () => {
                otherPet.stopScriptedState();
                App.pet.x = '50%';
                // App.pet.playCheeringAnimationIfTrue(App.pet.hasMoodlet('amused'), () => App.setScene(App.scene.home));

                let health = App.pet.stats.current_health;

                let state = 'very healthy';
                if(health <= App.pet.stats.max_health * 0.20) state = 'very sick';
                else if(health <= App.pet.stats.max_health * 0.45) state = 'sick';
                else if(health <= App.pet.stats.max_health * 0.75) state = 'healthy'

                if(state == 'very sick' || state == 'sick'){
                    App.pet.triggerScriptedState('shocked', 2000, false, true, () => {
                        App.displayPopup(`${App.pet.petDefinition.name} is ${state}`, 5000);
                    })
                } else {
                    App.pet.triggerScriptedState('cheering', 2000, false, true, () => {
                        App.displayPopup(`${App.pet.petDefinition.name} is ${state}`, 5000);
                    })
                }

                App.drawer.removeObject(otherPet);
                App.toggleGameplayControls(true);
            });
        }

        task_otherPetMoveIn();
    }
    static goToMall(){
        App.toggleGameplayControls(false, () => {
            App.pet.stopScriptedState();
        });
        App.setScene(App.scene.walkway);

        App.pet.x = '100%';
        App.pet.y = '74%';

        App.pet.targetX = -20;

        App.pet.triggerScriptedState('moving', 3000, null, true, () => {
            App.setScene(App.scene.home);
            App.handlers.open_mall_activity_list();
            App.toggleGameplayControls(true);
        });

        // App.pet.triggerScriptedState('moving', 1000, null, true, () => {
        //     App.setScene(App.scene.home);
        //     App.handlers.open_mall_activity_list();
        //     App.toggleGameplayControls(true);
        // }, Pet.scriptedEventDrivers.movingOut.bind({pet: App.pet}));
    }
    static goToArcade(){
        App.toggleGameplayControls(false, () => {
            App.pet.stopScriptedState();
        });
        App.setScene(App.scene.arcade);

        let randomNpcs = new Array(2).fill(undefined).map((item, i) => {

            let petDef = App.getRandomPetDef(1);
            let npcPet = new Pet(petDef);
            
            if(i == 1) npcPet.x = 15;
            else npcPet.x = 0;

            npcPet.stopMove();
            npcPet.triggerScriptedState('cheering', App.INF, null, true);

            return npcPet;
        })

        App.pet.triggerScriptedState('moving', 2500, null, true, () => {
            App.setScene(App.scene.home);
            App.handlers.open_game_list();
            App.toggleGameplayControls(true);

            randomNpcs.forEach(npc => npc.removeObject());
        }, Pet.scriptedEventDrivers.movingIn.bind({pet: App.pet}));
    }
    static goToMarket(){
        App.toggleGameplayControls(false, () => {
            App.pet.stopScriptedState();
        });
        App.setScene(App.scene.market);

        let randomNpcs = new Array(2).fill(undefined).map((item, i) => {

            let petDef = App.getRandomPetDef(2);
            let npcPet = new Pet(petDef);
            
            if(i == 1) npcPet.x = 30;
            else {
                npcPet.x = 0;
                npcPet.inverted = true;
            }

            npcPet.stopMove();
            npcPet.triggerScriptedState('eating', App.INF, null, true);

            return npcPet;
        })

        App.pet.triggerScriptedState('moving', 2500, null, true, () => {
            App.setScene(App.scene.home);
            App.handlers.open_market_menu();
            App.toggleGameplayControls(true);

            randomNpcs.forEach(npc => npc.removeObject());
        }, Pet.scriptedEventDrivers.movingIn.bind({pet: App.pet}));
    }
    static inviteHousePlay(otherPetDef){
        App.setScene(App.scene.home);
        App.toggleGameplayControls(false);
        otherPetDef.increaseFriendship(8);
        let otherPet = new Pet(otherPetDef);

        const wantedFriendDef = App.petDefinition.friends[App.pet.stats.current_want.item];
        App.petDefinition.checkWant(otherPetDef == wantedFriendDef, App.constants.WANT_TYPES.playdate)

        otherPet.stopMove();
        otherPet.x = '100%';
        App.pet.stopMove();
        App.pet.x = 20;

        function task_otherPetMoveIn(){
            otherPet.triggerScriptedState('moving', App.INF, null, true);
            otherPet.targetX = 80 - otherPet.spritesheet.cellSize;
            App.pet.triggerScriptedState('idle', 3000, null, true, () => {
                otherPet.stopScriptedState();
                task_playing();
            })
        }

        function task_playing(){
            otherPet.x = 80 - otherPet.spritesheet.cellSize;
            App.pet.x = 20;

            otherPet.stopMove();
            App.pet.stopMove();

            otherPet.triggerScriptedState('cheering', App.INF);
            App.pet.triggerScriptedState('cheering', 5000, null, true, () => {
                otherPet.stopScriptedState();
                task_otherPetMoveOut();
            });
        }

        function task_otherPetMoveOut(){
            otherPet.triggerScriptedState('moving', App.INF);
            otherPet.targetX = 120;
            App.pet.inverted = true;
            App.pet.triggerScriptedState('idle_side_uncomfortable', 3000, null, true, () => {
                otherPet.stopScriptedState();
                App.pet.x = '50%';
                App.pet.stats.current_fun += 55;
                App.pet.statsManager();
                App.pet.playCheeringAnimationIfTrue(App.pet.hasMoodlet('amused'), () => App.setScene(App.scene.home));
                App.drawer.removeObject(otherPet);
                App.toggleGameplayControls(true);
            });
        }

        task_otherPetMoveIn();
    }
    static goToPark(otherPetDef){
        if(!otherPetDef){
            if(random(1, 100) <= 60){
                otherPetDef = App.getRandomPetDef(App.petDefinition.lifeStage);
            }
        } else {
            const wantedFriendDef = App.petDefinition.friends[App.pet.stats.current_want.item];
            App.petDefinition.checkWant(otherPetDef == wantedFriendDef, App.constants.WANT_TYPES.playdate)
        }
        App.setScene(App.scene.park);
        App.toggleGameplayControls(false);

        let otherPet;
        if(otherPetDef){
            otherPet = new Pet(otherPetDef);
            otherPet.nextRandomTargetSelect = 0;
            App.petDefinition.addFriend(otherPetDef, 1);
            otherPetDef.increaseFriendship();
        }
        App.pet.triggerScriptedState('playing', 10000, null, true, () => {
            App.pet.x = '50%';
            App.pet.stats.current_fun += 40;
            App.pet.statsManager();
            App.pet.playCheeringAnimationIfTrue(App.pet.hasMoodlet('amused'), () => App.setScene(App.scene.home));
            if(otherPet) App.drawer.removeObject(otherPet);
            App.toggleGameplayControls(true);
        }, Pet.scriptedEventDrivers.playing.bind({pet: App.pet}));
    }


    // games
    static parkRngGame(){
        App.closeAllDisplays();
        App.setScene(App.scene.park);
        App.toggleGameplayControls(false);
        App.petDefinition.checkWant(true, App.constants.WANT_TYPES.minigame);

        // const randomPetRef = App.getRandomPetDef();
        const randomPetRef = new PetDefinition({
            name: 'park_game_npc',
            sprite: 'resources/img/character/chara_175b.png',
        });
        const randomPet = new Pet(randomPetRef);
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
                    App.displayPopup(`${App.petDefinition.name} won $${winningGold}`);
                    App.toggleGameplayControls(true);
                    App.setScene(App.scene.home);
                    App.handlers.open_game_list();
                });
            } else {
                App.pet.playAngryAnimation(() => {
                    App.displayPopup(`${App.petDefinition.name} lost!`);
                    App.pet.stats.current_fun -= 15;
                    App.toggleGameplayControls(true);
                    App.setScene(App.scene.home);
                    App.handlers.open_game_list();
                });
            }
        });
        
        return false;  
    }
    static barTimingGame(){
        App.closeAllDisplays();
        App.toggleGameplayControls(false);
        App.petDefinition.checkWant(true, App.constants.WANT_TYPES.minigame);

        let screen = App.displayEmpty();
        screen.innerHTML = `
        <div class="flex-container flex-row-down height-100p" style="background: url(${App.scene.arcade_game01.image});background-size: contain;image-rendering: pixelated;">
            <div class="timing-bar-container">
                <div class="timing-bar-rod"></div>
                <div class="timing-bar-rod"></div>
                <div class="timing-bar-rod"></div>
                <div class=timing-bar-cursor></div>
            </div>
        </div>
        `;

        const cursor = screen.querySelector('.timing-bar-cursor');
        
        let moneyWon = 0, round = 0, roundsWin = 0;
        let cursorSpeed = 0.19;
        let cursorCurrentPos = 0;

        let reset = (cursorSpeedAdd) => {
            cursorCurrentPos = 0;
            cursor.style.opacity = 1;
        }

        reset();

        App.onDraw = () => {
            cursorCurrentPos += cursorSpeed * App.nDeltaTime;
            if(cursorCurrentPos >= 98 || cursorCurrentPos <= 0){
                cursorSpeed *= -1;
                cursorCurrentPos = clamp(cursorCurrentPos, 0, 100);
                // App.vibrate(25);
                App.playSound(`resources/sounds/ui_click_04.ogg`, true);
            }
            cursor.style.left = `${cursorCurrentPos}%`;
        }

        screen.onclick = () => {
            if(cursorSpeed == 0) return;

            cursorSpeed = 0;
            cursor.style.opacity = 0.3;

            if(cursorCurrentPos >= 90) {
                App.playSound(`resources/sounds/ui_click_03.ogg`, true);
                App.vibrate(80);
                // success
                moneyWon += 20;
                roundsWin++;
            } else if(cursorCurrentPos >= 70) {
                App.playSound(`resources/sounds/ui_click_01.ogg`, true);
                moneyWon += 3;
            } else {
                App.playSound(`resources/sounds/ui_click_01.ogg`, true);
                moneyWon -= 5;
                moneyWon = clamp(moneyWon, 0, 999);
            }

            round++;

            if(round == 3){
                setTimeout(() => {
                    screen.close();
                    App.onDraw = null;
                    App.displayPopup(`${App.petDefinition.name} won $${moneyWon}!`, null, () => {
                        App.toggleGameplayControls(false);
                        App.pet.stats.gold += moneyWon;
                        App.pet.stats.current_fun += roundsWin * 10;
                        App.setScene(App.scene.arcade);
                        App.pet.stopMove();
                        App.pet.x = '50%';
                        const onEnd = () => {
                            App.toggleGameplayControls(true);
                            App.handlers.open_game_list();
                            App.setScene(App.scene.home);
                        }
                        if(roundsWin <= 1){
                            // App.pet.triggerScriptedState('uncomfortable', 3000, 0, true, onEnd);
                            App.pet.playAngryAnimation(onEnd);
                        } else {
                            if(roundsWin == 3){
                                App.definitions.achievements.perfect_minigame_rodrush_win_x_times.advance();
                            }
                            App.pet.playCheeringAnimationIfTrue(roundsWin == 3, onEnd);
                        }
                    });
                }, 500);
            } else {
                setTimeout(() => {
                    reset(0.15);

                    cursorSpeed = round == 1 ? 0.27 : 0.37;
                }, 500);
            }
        }
    }
    static fallingStuffGame(){
        App.closeAllDisplays();
        App.setScene(App.scene.park);
        App.toggleGameplayControls(false);
        App.petDefinition.checkWant(true, App.constants.WANT_TYPES.minigame);
        App.mouse.x = null;
        
        App.pet.speedOverride = 0.07;
        App.pet.x = '50%';
        App.pet.stopMove();
        App.pet.triggerScriptedState('idle', 99999999, 0, true, null, (pet) => {
            if(App.mouse.x === null) return;

            const center = App.mouse.x - pet.spritesheet.cellSize/2;

            if(pet.x != center){
                const diff = pet.x - center;
                if(diff > 0) pet.inverted = false;
                else pet.inverted = true;
                pet.targetX = center;
                if(Math.abs(diff) > 0.5) pet.setState('moving');
            } else {
                pet.setState('idle_side');
            }
        });

        let lives = 2, moneyWon = 0;
        let nextSpawnMs = 0, projectileSpeed = 0.05, spawnDelay = 1250;
        const petHeight = 80 - App.pet.spritesheet.cellSize/1.2;
        const petWidth = 32/2;
        const spawnerObject = new Object2d({
            x: -999, y: -999,
            onDraw: () => {
                if(App.lastTime > nextSpawnMs){
                    nextSpawnMs = App.lastTime + spawnDelay;

                    projectileSpeed += 0.0018;
                    if(projectileSpeed > 0.15) projectileSpeed = 0.15;
                    spawnDelay -= 20;
                    if(spawnDelay < 800) spawnDelay = 800;

                    const xPercentage = randomFromArray(['10%', '37%', '63%', '90%']);
                    const currentIsFaulty = random(0, 3) == 1;
                    const projectileObject = new Object2d({
                        parent: spawnerObject,
                        img: currentIsFaulty ? 'resources/img/misc/falling_poop.png' : 'resources/img/misc/heart_particle_01.png',
                        y: -20, x: xPercentage, rotation: random(0, 180), z: 6, width: 15, height: 13,
                        speed: projectileSpeed,
                        onDraw: (me) => {
                            const xCenter = me.x - me.width/2;
                            me.y += me.speed * App.deltaTime;

                            me.rotation += me.speed * App.deltaTime;

                            if(
                                me.y > petHeight && me.y < 80 && 
                                xCenter > App.pet.x - petWidth && xCenter < App.pet.x + petWidth
                            ) {
                                spawnSmoke(xCenter, me.y);
                                me.removeObject();
                                me.setImg('resources/img/misc/heart_particle_02.png')
                                score(currentIsFaulty);
                            }

                            if(me.y > 90) me.removeObject();
                        }
                    })
                }
            }
        })

        const spawnSmoke = (x, y) => {
            new Object2d({
                img: 'resources/img/misc/foam_single.png',
                x, y, z: 6, opacity: 1, scale: 1.2,
                onDraw: (me) => {
                    me.rotation += 0.1 * App.deltaTime;
                    me.opacity -= 0.001 * App.deltaTime;
                    me.scale -= 0.001 * App.deltaTime;
                    me.y -= 0.01 * App.deltaTime;
                    if(me.opacity <= 0.1 || me.scale <= 0.1) me.removeObject();
                }
            })
        }

        const screen = UI.empty();
        document.querySelector('.screen-wrapper').appendChild(screen);
        screen.innerHTML = `
        <div class="width-full" style="position: absolute; bottom: 0; left: 0;">
            <div class="flex-container" style="justify-content: space-between; padding: 4px">
            <div class="flex-container" style="
                background: #ff00c647;
                padding: 0 4px;
                border-radius: 6px;
                color: #ffcaf4;
            ">
                $
                <div id="moneyWon">${moneyWon}</div>
            </div>
            <div class="flex-container">
                <div id="lives">${lives}</div>
            </div>
            </div>
        </div>
        `;

        const uiMoneyWon = screen.querySelector('#moneyWon'),
        uiLives = screen.querySelector('#lives');

        const updateUI = () => {
            uiMoneyWon.textContent = moneyWon;
            uiLives.innerHTML = new Array(lives).fill('').map(() => {
                return `<img src="resources/img/misc/heart_particle_01.png"></img>`
            }).join(' ');
        }

        updateUI();

        const finish = () => {
            screen.remove();
            spawnerObject.removeObject();
            App.pet.stopScriptedState();
            App.pet.x = '50%';

            const end = () => {
                App.setScene(App.scene.home);
                App.handlers.open_game_list();
                App.toggleGameplayControls(true);
                App.pet.stats.gold += moneyWon;
                App.pet.stats.current_fun += moneyWon / 6;
                App.pet.speedOverride = 0;
                if(moneyWon >= App.definitions.achievements.perfect_minigame_catch_win_x_gold.required){
                    App.definitions.achievements.perfect_minigame_catch_win_x_gold.advance();
                }
                if(moneyWon)
                    App.displayPopup(`${App.petDefinition.name} won $${moneyWon}`);
                else 
                    App.displayPopup(`${App.petDefinition.name} lost!`);
            }

            if(moneyWon > 30){
                App.pet.playCheeringAnimation(() => end());
            } else {
                App.pet.playUncomfortableAnimation(() => end());
            }
        }

        const score = (faulty) => {
            if(faulty){
                App.playSound(`resources/sounds/sad.ogg`, true);
                lives--;
                if(lives == 0){
                    lives = 0;
                    finish();
                }
            } else {
                App.playSound(`resources/sounds/cute.ogg`, true);
                moneyWon += random(1, 2);
            }

            updateUI();
        }
    }
    static opponentMimicGame(){
        App.closeAllDisplays();
        App.setScene(App.scene.arcade);
        App.toggleGameplayControls(false);
        App.petDefinition.checkWant(true, App.constants.WANT_TYPES.minigame);

        const opponentPetDef = new PetDefinition({
            name: 'park_game_npc',
            sprite: 'resources/img/character/chara_175b.png',
        });

        const opponentPet = new Pet(opponentPetDef, {x: '70%'});
        
        let totalRounds = 3, playedRounds = 0, roundsWon = 0;

        const reset = () => {
            if(playedRounds >= totalRounds){
                App.pet.stopScriptedState();
                opponentPet.removeObject();
                App.pet.x = '50%';

                const end = () => {
                    App.setScene(App.scene.home);
                    App.handlers.open_game_list();
                    App.toggleGameplayControls(true);
                    const moneyWon = roundsWon * random(20, 30);
                    App.pet.stats.gold += moneyWon;
                    App.pet.stats.current_fun += roundsWon * 15;
                    if(moneyWon)
                        App.displayPopup(`${App.petDefinition.name} won $${moneyWon}`);
                    else 
                        App.displayPopup(`${App.petDefinition.name} lost!`);
                    if(roundsWon == totalRounds){
                        App.definitions.achievements.perfect_minigame_mimic_win_x_times.advance();
                    }
                }

                if(roundsWon >= 2){
                    App.pet.playCheeringAnimation(() => end());
                } else if(roundsWon == 0){
                    App.pet.playUncomfortableAnimation(() => end());
                } else {
                    end();
                }

                return;
            }

            opponentPet.stopMove();
            opponentPet.triggerScriptedState('idle', App.INF, null, true);
            opponentPet.x = '70%';
            opponentPet.inverted = true;

            App.pet.x = '30%';
            App.pet.inverted = false;
            App.pet.stopMove();
            App.pet.triggerScriptedState('idle', App.INF, null, true);

            setTimeout(() => {
                const screen = App.displayEmpty();
                const imgPath = 'resources/img/ui/';
                screen.innerHTML = `
                <div class="flex-container flex-dir-col height-100p" style="background: var(--background-c)">
                    <div class="solid-surface-stylized inner-padding b-radius-10 relative">
                        <div class="surface-stylized" style="padding: 0px 10px;position: absolute;top: -20px;left: 0px;">
                            ${playedRounds + 1}/${totalRounds}
                        </div>
                        Which direction will your opponent turn?
                    </div>
                    <div class="mimic-game__btn-container">
                        <button id="left" class="generic-btn stylized"> <img src="${imgPath}facing_left.png"></img> </button>
                        <button id="center" class="generic-btn stylized"> <img src="${imgPath}facing_center.png"></img> </button>
                        <button id="right" class="generic-btn stylized"> <img src="${imgPath}facing_right.png"></img> </button>
                    </div>
                </div>
                `;
                ['left', 'center', 'right'].forEach((dir) => {
                    const btn = screen.querySelector(`#${dir}`);
                    btn.onclick = () => {
                        setPredictedDirection(dir);
                        screen.close();
                    }
                })
            }, 800)
        }

        reset();

        const deriveStateFromDirection = (dir) => {
            switch(dir){
                case 'center': return {state: 'idle', inverted: false};
                case 'right': return {state: 'idle_side', inverted: true};
                case 'left': return {state: 'idle_side', inverted: false};
            }
        }

        const setPredictedDirection = (dir) => {
            const randomDir = randomFromArray(['left', 'center', 'right']);
            setTimeout(() => {
                const opponentState = deriveStateFromDirection(randomDir);
                opponentPet.setState(opponentState.state)
                opponentPet.inverted = opponentState.inverted;

                const playerState = deriveStateFromDirection(dir);
                App.pet.setState(playerState.state)
                App.pet.inverted = playerState.inverted;

                // if(randomDir === dir){
                //     App.playSound(`resources/sounds/task_complete_02.ogg`, true);
                // } else {
                //     App.playSound(`resources/sounds/task_fail_01.ogg`, true);
                // }
                App.playSound(`resources/sounds/task_complete.ogg`, true);

                setTimeout(() => {
                    playedRounds++;
                    if(randomDir === dir){
                        App.pet.setState('cheering');
                        opponentPet.setState('angry');
                        roundsWon++;
                    } else {
                        App.pet.setState('angry');
                        opponentPet.setState('cheering');
                    }
                    setTimeout(reset, 1000);
                }, 1500);
            }, 1000);
        }
        
        return false;  
    }


    // utils
    static task_foam(middleFn, endFn){
        let foam = new Object2d({
            img: 'resources/img/misc/foam_01.png',
            x: 0, y: 0, z: 1001,
            onDraw: (me) => {
                Object2d.animations.flip(me, 400)
            }
        });

        setTimeout(() => {
            foam.setImg('resources/img/misc/foam_02.png');
        }, 500);

        setTimeout(() => {
            foam.setImg('resources/img/misc/foam_03.png');
        }, 1000);

        setTimeout(() => {
            foam.setImg('resources/img/misc/foam_04.png');
        }, 1500);

        setTimeout(() => {
            if(middleFn) middleFn();
        }, 2000);

        setTimeout(() => {
            foam.setImg('resources/img/misc/foam_03.png');
        }, 3000);
        setTimeout(() => {
            foam.setImg('resources/img/misc/foam_02.png');
        }, 3500);
        setTimeout(() => {
            foam.setImg('resources/img/misc/foam_01.png');
        }, 4000);

        setTimeout(() => {
            App.drawer.removeObject(foam);
        }, 4500);

        setTimeout(() => {
            if(endFn) endFn();
        }, 5500);
    }
    static task_endWork(elapsedTime, moneyMade){
        App.displayPopup(`${App.petDefinition.name} worked for ${elapsedTime} seconds`, 2500, () => {
            if(elapsedTime > 10){
                App.pet.stats.gold += moneyMade;
            } else moneyMade = 0;
            App.pet.stats.current_fun -= elapsedTime / 3.5;
            App.displayConfirm(`${App.petDefinition.name} made $${moneyMade}`, [
                {
                    name: 'ok',
                    onclick: () => {
                        App.setScene(App.scene.home);
                    }
                }
            ]);
        });
        App.toggleGameplayControls(true);
    }
    static task_floatingHearts(num){
        if(!num) num = random(1, 4);
        for(let i = 0; i < num; i++){
            let floatSpeed = random(4, 5) * 0.01, 
                swayFloat = 0, 
                swaySpeed = random(2, 20) * 0.001;
            const heartObject = new Object2d({
                img: `resources/img/misc/heart_particle_0${random(1, 2)}.png`, 
                z: randomFromArray([0, 100]), 
                x: `${random(0, 100)}%`, 
                y: `${random(105, 115)}%`
            });
            heartObject.onDraw = (me) => {
                if(isNaN(me.y)) return;

                me.y -= floatSpeed * App.deltaTime;

                swayFloat += swaySpeed * App.deltaTime;
                me.x += Math.sin(swayFloat) * 2;
                if(me.y < -16) me.removeObject();
            }
        }
    }
}