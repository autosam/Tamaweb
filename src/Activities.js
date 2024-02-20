class Activities {
    static wedding(otherPetDef){
        App.closeAllDisplays();
        App.setScene(App.scene.wedding);
        App.toggleGameplayControls(false);
        App.petDefinition.maxStats();

        const otherPet = new Pet(otherPetDef);

        App.pet.stopMove();
        otherPet.stopMove();

        otherPet.x = '33%';
        App.pet.x = '67%';

        App.pet.y = 55;
        otherPet.y = 55;

        otherPet.inverted = true;
        App.pet.inverted = false;

        otherPet.triggerScriptedState('kissing', App.INF, 0, true);
        App.pet.triggerScriptedState('kissing', App.INF, 0, true);

        setTimeout(() => {
            Activities.task_foam(() => {
                App.pet.removeObject();
                otherPet.removeObject();

                let parentA = App.petDefinition,
                    parentB = otherPetDef;

                parentA.stats.player_friendship = 100;
                parentB.stats.player_friendship = 80;

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

                App.pet.stopMove();

                App.setScene(App.scene.home);

                App.pet = new Pet(App.petDefinition);
            }, () => {
                App.toggleGameplayControls(true);
            })
        }, 5000)
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
        console.log(otherPets);
        
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
                    App.pet.y = 65;
                    App.pet.stopMove();
                    App.pet.triggerScriptedState('idle', 3000, 0, true, () => {
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

            let foam = new Object2d({
                img: 'resources/img/misc/foam_01.png',
                x: 0, y: 0
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
                App.setScene(App.scene.home);
                App.pet.x = 10;
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
                App.pet.stopScriptedState();
            }, 5500);

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
            App.drawer.removeObject(laptop);
            let elapsedTime = Math.round((Date.now() - startTime) / 1000);
            App.displayPopup(`${App.petDefinition.name} worked for ${elapsedTime} seconds`, 2500, () => {
                let moneyMade = 0;
                if(elapsedTime > 10){
                    moneyMade = Math.round(elapsedTime / 3);
                    App.pet.stats.gold += moneyMade;
                }
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
        App.toggleGameplayControls(false);
        App.setScene(App.scene.mallWalkway);
        App.pet.triggerScriptedState('moving', 1000, null, true, () => {
            App.setScene(App.scene.home);
            App.handlers.open_mall_activity_list();
            App.toggleGameplayControls(true);
        }, Pet.scriptedEventDrivers.movingOut.bind({pet: App.pet}));
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
            if(random(1, 100) <= 50){
                otherPetDef = App.getRandomPetDef(App.petDefinition.lifeStage);
                console.log(otherPetDef, App.petDefinition.lifeStage);
            }
        }
        App.setScene(App.scene.park);
        App.toggleGameplayControls(false);

        let otherPet;
        if(otherPetDef){
            otherPet = new Pet(otherPetDef);
            if(App.petDefinition.friends.indexOf(otherPetDef) === -1){ // new friend
                App.petDefinition.friends.push(otherPetDef);
            }
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
                    App.handlers.open_mall_activity_list();
                });
            } else {
                App.pet.playAngryAnimation(() => {
                    App.displayPopup(`${App.petDefinition.name} lost!`);
                    App.pet.stats.current_fun -= 15;
                    App.toggleGameplayControls(true);
                    App.setScene(App.scene.home);
                    App.handlers.open_mall_activity_list();
                });
            }
        });
        
        return false;  
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

    static task_foam(middleFn, endFn){
        let foam = new Object2d({
            img: 'resources/img/misc/foam_01.png',
            x: 0, y: 0
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
}