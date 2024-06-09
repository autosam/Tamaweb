class Activities {
    // activities
    static standWork(){
        App.closeAllDisplays();
        App.setScene(App.scene.stand);
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

            const possibleAnimations = ['eating', 'cheering', 'shocked', 'angry', 'uncomfortable'];
            const currentAnimation = randomFromArray(possibleAnimations);

            switch(currentAnimation){
                case "eating":
                case "cheering":
                case "shocked":
                    totalMoneyMade += random(6, 12);
                    break;
                case "uncomfortable":
                    totalMoneyMade += 4;
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
            Object2d.animations.bob(App.pet, 0.005, 0.05);
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

                parentA.stats.player_friendship = 100;
                parentA.stats.is_player_family = true;
                parentB.stats.player_friendship = 80;
                parentB.stats.is_player_family = true;

                // new pet
                App.petDefinition = new PetDefinition({
                    name: getRandomName(),
                    sprite: randomFromArray(PET_BABY_CHARACTERS),
                }).setStats({is_egg: true});

                App.petDefinition.friends = [
                    parentA,
                    parentB
                ];
                App.petDefinition.inventory = parentA.inventory;
                App.petDefinition.stats.gold = parentA.stats.gold += 50;
                App.petDefinition.stats.current_health = 100;

                App.pet.stopMove();

                App.setScene(App.scene.home);

                App.pet = new Pet(App.petDefinition);
            }, () => {
                App.toggleGameplayControls(true);

                App.handlers.show_set_pet_name_dialog();
            })
        }, 18000);
    }
    static birthday(){
        App.setScene(App.scene.home);
        App.toggleGameplayControls(false);
        App.pet.stats.has_poop_out = false;
        App.pet.stats.current_bladder = 100;

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
        App.toggleGameplayControls(false);
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
        App.toggleGameplayControls(false);
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
        let otherPet = new Pet(otherPetDef);
        
        otherPetDef.increaseFriendship(8);

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
        }
        App.setScene(App.scene.park);
        App.toggleGameplayControls(false);

        let otherPet;
        if(otherPetDef){
            otherPet = new Pet(otherPetDef);
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

        let screen = App.displayEmpty();
        screen.innerHTML = `
        <div class="flex-container flex-row-down height-100p" style="background: #e6d4ef">
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
                        let onEnd = () => {
                            App.toggleGameplayControls(true);
                            App.handlers.open_game_list();
                            App.setScene(App.scene.home);
                        }
                        if(roundsWin <= 1){
                            // App.pet.triggerScriptedState('uncomfortable', 3000, 0, true, onEnd);
                            App.pet.playAngryAnimation(onEnd);
                        } else {
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
    static guessGame(){
        App.closeAllDisplays();
        App.setScene(App.scene.park);
        App.toggleGameplayControls(false);
        
        App.pet.x = '50%';
        App.pet.stopMove();
        App.pet.triggerScriptedState('idle', 99999999, 0, true, null, (pet) => {
            let center = App.mouse.x - pet.spritesheet.cellSize/2;

            if(pet.x != center){
                let diff = pet.x - center;
                if(diff > 0) pet.inverted = true;
                else pet.inverted = false;
                pet.x = center;
                if(Math.abs(diff) > 2) pet.setState('moving');
            } else {
                pet.setState('idle');
            }

        });
    }


    // utils
    static task_foam(middleFn, endFn){
        let foam = new Object2d({
            img: 'resources/img/misc/foam_01.png',
            x: 0, y: 0, z: 99,
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
}