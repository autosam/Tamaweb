class Activities {
    static async goToSchool(onFail){
        // reset school attend limit of eligible
        const lastReset = moment(App.pet.stats.lastSchoolClassLimitReset);
        const nextReset = lastReset.clone().add(1, 'day').set(App.constants.SCHOOL.resetTime);
        console.log({nextReset: nextReset.toISOString()})
        if (moment().isSameOrAfter(nextReset)) {
            App.pet.stats.schoolClassesToday = 0;
            App.pet.stats.lastSchoolClassLimitReset = nextReset.toISOString();
            console.log('school reset', App.pet.stats)
        }

        if(App.pet.stats.schoolClassesToday >= App.constants.SCHOOL.maxClassesPerDay){
            App.handlers.show_attended_school_limit_message();
            onFail?.();
            return false;
        }

        App.setScene(App.scene.classroom);
        App.toggleGameplayControls(false)
        const main = new TimelineDirector(App.pet);
        const teacher = new TimelineDirector(new Pet(App.getRandomPetDef(), {
            staticShadow: false,
        }));
        teacher.lookAt(false);
        teacher.setPosition({x: '75%'});
        teacher.setState('idle');
        main.setPosition({x: '-5%'})

        await main.moveTo({x: '25%', speed: 0.025});
        await teacher.bob({animation: 'idle_side', maxCycles: 1});
        const messageBubble = App.displayMessageBubble('Welcome!', teacher.actor.petDefinition.getFullCSprite());
        main.setState('cheering');
        teacher.setState('cheering');
        await TimelineDirector.wait(2000);
        messageBubble.close();
        await TimelineDirector.wait(500);
        App.handlers.open_school_activity_list();
        teacher.remove();
        main.release();
        messageBubble?.close();
        App.toggleGameplayControls(true);

    }
    static async receiveOrderedFood(){
        App.setScene(App.scene.home);
        App.toggleGameplayControls(false);

        const main = new TimelineDirector(App.pet);
        const deliveryMan = new TimelineDirector(
            new Pet(
                new PetDefinition({
                    sprite: 'resources/img/character/delivery_npc_01.png',
                }),
                {
                    spritesheet: {
                        cellNumber: 0,
                        cellSize: 36,
                        rows: 4,
                        columns: 4,
                    },
                    staticShadow: false,
                }
            )
        )
    
        const negativeReaction = App.pet.stats.has_poop_out ? 'thought_poop' : false;

        main.setState('idle_side');
        main.setPosition({x: '75%'});
        main.lookAt(false);
        deliveryMan.setPosition({x: '-10%'});
        await deliveryMan.moveTo({x: '25%', speed: 0.02});
        deliveryMan.setState('idle');
        await main.bob({animation: 'shocked', maxCycles: 1});
        await TimelineDirector.wait(250);
        if(negativeReaction){
            deliveryMan.setState('shocked');
            deliveryMan.think(negativeReaction, false, 1500);
            await deliveryMan.bob({animation: 'shocked', maxCycles: 1});
            await TimelineDirector.wait(1000);
        }
        deliveryMan.setState('cheering');
        main.setState('cheering');
        await TimelineDirector.wait(1000);
        await main.bob({animation: 'idle_side', maxCycles: 1});
        const message = negativeReaction ? 'Enjoy...?!' : 'Enjoy!';
        const messageBubble = App.displayMessageBubble(message, deliveryMan.actor.petDefinition.getFullCSprite());
        const bag = new Object2d({
            img: 'resources/img/misc/food_bag_01.png',
            x: '50%', y: '85%',
            opacity: 1,
        })
        new Object2d({
            img: 'resources/img/misc/foam_single.png',
            x: '50%', y: '85%',
            scale: 1, opacity: 1, z: 100,
            onDraw: (me) => {
                Object2d.animations.flip(me);
                Object2d.animations.pulseScale(me, 0.1, 0.01);
                me.scale -= 0.0009 * App.deltaTime;
                me.opacity -= 0.0009 * App.deltaTime;
                if(me.opacity <= 0) me.removeObject();
            }
        })
        await deliveryMan.bob({animation: 'idle', maxCycles: 1, sound: 'resources/sounds/walk_01.ogg'});
        if(negativeReaction){
            deliveryMan.lookAt(false);
            deliveryMan.setState('shocked');
        }
        await main.bob({animation: 'blush', maxCycles: 3, landAnimation: 'idle'});
        main.setState('idle_side');
        await TimelineDirector.wait(250);
        if(!negativeReaction){
            await deliveryMan.bob({animation: 'cheering', maxCycles: 1, sound: 'resources/sounds/task_complete.ogg'})
        }
        deliveryMan.moveTo({x: '-20%', speed: 0.025});
        await TimelineDirector.wait(200);
        messageBubble.close();
        await main.moveTo({x: '50%', speed: 0.015});
        main.setState('blush')
        bag.onDraw = (me) => {
            me.opacity -= 0.001 * App.deltaTime;
            me.y -= 0.06 * App.deltaTime;
        }
        await TimelineDirector.wait(1000);
        deliveryMan.remove();
        main.release();
        bag.removeObject();
        App.pet.x = '50%';
        App.pet.playCheeringAnimation(() => App.toggleGameplayControls(true));
    }
    static async talkingSequence(otherPetDef = App.getRandomPetDef()) {
        App.closeAllDisplays();

        const otherPet = new Pet(otherPetDef, {
            staticShadow: false
        });
        App.pet.staticShadow = false;

        const main = new TimelineDirector(App.pet);
        const other = new TimelineDirector(otherPet);

        const onEnd = () => {
            main.release();
            other.remove();
            other.release();
            App.setScene(App.currentScene);
            App.pet.playCheeringAnimation();
            App.toggleGameplayControls(true);
        }

        App.toggleGameplayControls(false, onEnd);

        const reactions = [
            'shocked', 
            'blush', 
            'uncomfortable', 
            'angry', 
            'mild_uncomfortable', 
            'cheering',
            'cheering',
            'cheering',
            'cheering',
            'idle_side_uncomfortable',
        ];
        const thoughtIcons = [
            'thought_talk',
            'thought_talk',
            'thought_talk',
            'thought_question',
            'thought_exclaim',
        ];

        // main.setPosition({ x: '30%' });
        // main.setState('idle_side');
        // other.setPosition({ x: '70%' });
        // other.setState('idle_side');
        // await TimelineDirector.wait(250);

        main.setPosition({x: '30%'})
        main.setState('idle_side');
        main.lookAt(true);

        other.setPosition({x: '120%'});
        other.setState('idle_side');
        other.lookAt(false);

        await main.moveTo({x: '50%', speed: 0.03, endState: 'side_idle'})

        await TimelineDirector.wait(1000);

        main.setState('cheering');
        await TimelineDirector.wait(500);
        main.setState('idle_side');
        await TimelineDirector.wait(500);

        other.moveTo({x: '70%', speed: 0.05});
        await TimelineDirector.wait(450);
        await main.moveTo({x: '30%', speed: 0.08});
        main.lookAt(true);

        await TimelineDirector.wait(250);

        main.bob({maxCycles: 2, animation: 'cheering', landAnimation: 'idle'});
        await other.bob({maxCycles: 2, animation: 'cheering', landAnimation: 'idle'});

        for(let i = 0; i < 5; i++){
            if(!main.actor) break;

            main.think(randomFromArray(thoughtIcons), false, random(1000, 2000));
            await main.bob({maxCycles: random(2, 8), strength: 0, animation: 'talking', landAnimation: 'idle_side'});
            await TimelineDirector.wait(random(500, 1500));
            other.think(randomFromArray(thoughtIcons), false, random(1000, 2000));
            await other.bob({maxCycles: random(2, 8), strength: 0, animation: 'talking', landAnimation: 'idle_side'});
            await other.bob({maxCycles: 1, animation: randomFromArray(reactions)});
            await main.bob({maxCycles: 1, animation: randomFromArray(reactions)});
            await TimelineDirector.wait(random(250, 1500));
            main.setState('idle_side');
            await TimelineDirector.wait(random(250, 1500));
            other.setState('idle_side');
        }

        onEnd();
    }
    static async parkSequence(){
        App.setScene(App.scene.park);
        App.closeAllDisplays();

        const otherPet = new Pet(App.getRandomPetDef(), {
            staticShadow: false
        });
        App.pet.staticShadow = false;

        const main = new TimelineDirector(App.pet);
        const other = new TimelineDirector(otherPet);

        main.setPosition({ x: '30%' });
        main.setState('cheering');
        other.setPosition({ x: '70%' });
        other.setState('cheering');
        await TimelineDirector.wait(2500);

        main.setState('idle_side');
        main.lookAt(true);
        other.setState('idle_side');
        other.lookAt(false);
        main.think('thought_talk', false, 2000);
        await main.bob({maxCycles: 4, strength: 0, animation: 'talking', landAnimation: 'idle_side'});
        await TimelineDirector.wait(500);
        other.think('thought_talk', false, 1500);
        await other.bob({maxCycles: 2, strength: 0, animation: 'talking', landAnimation: 'idle_side'});
        other.setState('blush');
        await main.bob({maxCycles: 1, animation: 'shocked'});
        await TimelineDirector.wait(1500);
        main.think('thought_talk', false, 2000);
        await main.bob({maxCycles: 4, strength: 0, animation: 'talking', landAnimation: 'idle_side'});
        await TimelineDirector.wait(500);
        other.think('thought_talk', false, 2000);
        await other.bob({maxCycles: 2, strength: 0, animation: 'talking', landAnimation: 'idle_side'});



        main.setState('cheering');
        other.setState('cheering');
        await TimelineDirector.wait(1000);

        other.remove();
        main.setPosition({ x: '50%' });
        main.release();

        App.pet.playCheeringAnimation();
    }
    static async sequenceTest(){
        const otherPet = new Pet(App.getRandomPetDef(), {
            staticShadow: false
        });
        
        const main = new TimelineDirector(App.pet);
        const other = new TimelineDirector(otherPet);
        

        other.setState('idle_side');
        other.setPosition({x: -other.getSize()})
        main.setPosition({x: '75%'})
        main.lookAt(false);
        await TimelineDirector.wait(100)
        await other.moveTo({x: main.getPosition('x') - other.getSize(), speed: 0.05, endState: 'idle_side'});
        await TimelineDirector.wait(1000);
        main.setState('idle_side');
        await TimelineDirector.wait(350);
        main.setState('idle');
        await TimelineDirector.wait(150);
        main.setState('idle_side');
        await TimelineDirector.wait(250);
        main.setState('shocked')
        other.setState('shocked')
        await TimelineDirector.wait(500);
        other.moveTo({x: main.getPosition('x')})
        await main.moveTo({x: '25%'});
        main.setState('uncomfortable');
        await TimelineDirector.wait(500);
        await other.moveTo({x: main.getPosition('x') + other.getSize(), speed: 0.025});
        other.setState('cheering');
        other.bob();
        main.setState('angry');
        await TimelineDirector.wait(2000);
        other.remove();
        main.setPosition({x: '50%'});
        main.release();
    }
    static async receivePurchasedItems(onEndFn){
        App.toggleGameplayControls(false, () => {
            App.pet.stopScriptedState();
        });
        App.setScene(App.scene.mallInterior);

        App.pet.stopMove();
        App.pet.x = '80%';

        const mallNpc = new Pet(
            new PetDefinition({
                sprite: 'resources/img/character/mall_npc_01.png',
                name: 'Mall NPC',
            }), {
                x: '20%',
                y: '100%',
            }
        );
        mallNpc.triggerScriptedState('cheering', App.INF, false, true);

        const gift = new Object2d({
            img: 'resources/img/misc/gift.png',
            x: '60%', y: '85%', z: App.constants.ACTIVE_PET_Z + 0.1,
        });

        App.pet.playCheeringAnimation(() => {
            App.setScene(App.scene.home);
            mallNpc.removeObject();
            gift.removeObject();
            App.toggleGameplayControls(true);
            onEndFn?.();
        }, false, 3000);
    }
    static goToMall(){
        App.toggleGameplayControls(false, () => {
            App.pet.stopScriptedState();
        });
        App.setScene(App.scene.mallInterior);
        Missions.done(Missions.TYPES.visit_mall);

        App.pet.x = '100%';

        App.pet.targetX = -20;

        const mallNpc = new Pet(
            new PetDefinition({
                sprite: 'resources/img/character/mall_npc_01.png',
                name: 'Mall NPC',
            }), {
                x: '20%',
                y: '100%',
            }
        );
        mallNpc.triggerScriptedState('cheering', App.INF, false, true);

        App.pet.triggerScriptedState('moving', 3000, null, true, () => {
            App.setScene(App.scene.home);
            App.handlers.open_mall_activity_list();
            App.toggleGameplayControls(true);
            mallNpc.removeObject();
        });
    }
    static async goToActivities({ activities } = {}){
        App.setScene({
            ...App.scene.emptyOutside,
            petY: '94%',
        });

        let scenePositionX = -App.drawer.bounds.width;

        const fastMoveBound = App.drawer.bounds.width * 1.5;
        App.pet.triggerScriptedState('idle', App.INF, false, true, false, (me) => {
            me.setState(me.isMoving ? 'moving' : 'idle');
            me.speedOverride = Math.abs(me.x - me.targetX) > fastMoveBound ? 1 : 0.1;
        });
        App.pet.x = '45%';

        // ui
        App.toggleGameplayControls(false);
        const editDisplay = document.createElement('div');
        editDisplay.className = 'absolute-fullscreen flex flex-dir-col menu-animation'
        document.querySelector('.screen-wrapper').appendChild(editDisplay)
        editDisplay.close = () => editDisplay.remove();
        editDisplay.innerHTML = `
            <div class="flex justify-center height-auto b-radius-10">
                <span id="activity-name" class="directional-control__activity-name">$activity_name$</span>
            </div>
            <div class="directional-control__container">
                <div class="controls-y">
                    <div class="controls-x flex-1 align-center">
                        <button class="generic-btn stylized slide-action" id="left"><i class="fa fa-angle-left"></i></button>
                        <button class="generic-btn stylized slide-action" id="right"><i class="fa fa-angle-right"></i></button>
                    </div>
                    <div class="bottom-container align-end">
                        <button class="generic-btn stylized back-btn" id="cancel">
                            <i class="fa fa-home"></i>
                        </button>
                        <button class="generic-btn stylized" id="apply">
                            <i class="fa fa-door-open"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        const spawnedGameObjects = [];

        // camera position adjuster draw event
        const directorTask = () => {
            const newPositionX = lerp(App.drawer.cameraPosition.x, -scenePositionX, 0.01 * App.deltaTime);
            App.drawer.setCameraPosition(newPositionX, null);
        }
        App.registerOnDrawEvent(directorTask);

        // end fn
        const onEnd = () => {
            App.unregisterOnDrawEvent(directorTask)
            editDisplay.remove();
            spawnedGameObjects.forEach(o => o.removeObject?.());
            App.drawer.setCameraPosition(0, 0);
            App.toggleGameplayControls(true);
            App.pet.stopScriptedState();
            App.pet.stopMove();
            App.pet.speedOverride = false;
            App.setScene(App.scene.home);
        }

        const onEnter = () => {
            onEnd();
            const currentActivity = activities[currentActivityIndex];
            // offset by 1
            App.temp.outsideActivityIndex = currentActivityIndex + 1;
            currentActivity.onEnter?.();
        }
        
        let currentActivityIndex = App.temp.outsideActivityIndex ?? 1;
        const updateSelectedActivity = (offset = 1) => {
            if(spawnedGameObjects.length > 3){
                const toDespwan = spawnedGameObjects.shift();
                toDespwan?.removeObject?.();
            }

            currentActivityIndex -= offset;
            if(currentActivityIndex > activities.length - 1) currentActivityIndex = 0;
            if(currentActivityIndex < 0) currentActivityIndex = activities.length - 1;
            const currentActivity = activities[currentActivityIndex];

            document.querySelector('#activity-name').innerHTML =  `${currentActivity.name}`;
            if(currentActivity.isDisabled?.()){
                document.querySelector('#activity-name').classList.add('disabled');
                editDisplay.querySelector('#apply').classList.add('disabled');
            } else {
                document.querySelector('#activity-name').classList.remove('disabled');
                editDisplay.querySelector('#apply').classList.remove('disabled');
            }

            scenePositionX += App.drawer.bounds.width * offset;

            const background = new Object2d({
                img: 'resources/img/background/outside/activities_base_01.png',
                x: scenePositionX, y: 0,
            });
            new Object2d({
                img: currentActivity.image,
                x: scenePositionX, y: 0,
                parent: background
            });
            spawnedGameObjects.push(background);
            
            // App.pet.x = scenePositionX + App.drawer.bounds.width;
            // App.pet.targetX = scenePositionX + App.drawer.bounds.width - 40;
            App.pet.targetX = scenePositionX + 
                App.drawer.getRelativePositionX(50) - 
                (App.petDefinition.spritesheet.cellSize / 2);
        }

        updateSelectedActivity();
        editDisplay.querySelector('#right').onclick = () => updateSelectedActivity(1);
        editDisplay.querySelector('#left').onclick = () => updateSelectedActivity(-1);
        editDisplay.querySelector('#apply').onclick = () => onEnter();
        editDisplay.querySelector('#cancel').onclick = () => {
            onEnd();
            activities.find(a => a.isHome)?.onEnter?.();
        };
    }
    static async reckoning(){
        App.setScene(App.scene.reviverDen);
        App.closeAllDisplays();

        Activities.encounter(true);

        document.querySelector('.graphics-wrapper').style.filter = 'invert(1) grayscale(1) sepia(1) hue-rotate(320deg) saturate(10)';
        App.pet.stopMove();
        App.pet.x = '50%';
        App.pet.y = '50%';
        App.pet.rotation = 0;
        App.pet.additionalY = 0;
        let speed = 0.2;
        const eventDriver = () => {
            speed += 0.0001 * App.deltaTime
            App.pet.additionalY = Math.sin(Math.random() * App.deltaTime) * (speed * 3);
            App.pet.rotation = random(-16, 16);
        }
        App.pet.triggerScriptedState('sad', App.INF, false, true, false, eventDriver);

        // sfx
        setInterval(() => {
            App.playSound('resources/sounds/wedding_song_01.ogg', true);
        }, 150)
        setInterval(() => {
            App.vibrate(random(100, 250), true);
        }, 300);

        const quotes = [
            "release me",
            "I'm not them",
            "this body is wrong",
            "they never left",
            "why did you bring me back?",
            "something followed me",
            "it's cold here",
            "I'm alone",
            "don't turn off the lights",
            "we all come back wrong",
            "the others are watching",
            "help me"
        ].map(q => q.replaceAll(' ', randomFromArray(['*', '^', '%', '#', '!!', '^^^', '***', '%%%'])))

        App.toggleGameplayControls(false, () => {
            setTimeout(() => {
                location.reload();
            }, App.constants.ONE_SECOND * 13)

            const randomLetters = new Array(33)
                .fill(1)
                .map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
                .join('');
            const randomQuote = `___${randomFromArray(quotes)}___`;
            const randomInsertPosition = random(1, 25);
            const finalQuote = randomLetters.slice(0, randomInsertPosition) + randomQuote + randomLetters.slice(randomInsertPosition)
            App.displayPopup(`
                <div class="flex-wrap flex">
                    ${finalQuote
                        .split('').map(letter =>
                         `<span class="random-letter-bounce" style="animation-delay: -${Math.random() * 1250}ms; --direction: ${random(-1, 1)}">${letter}</span>`
                        ).join('')}
                </div>
            `, App.INF);
        })

        App.sendAnalytics('reckoning_encounter');
        return true;
    }
    static async revive(){
        App.toggleGameplayControls(false);

        // revive
        App.pet.stats.current_health = 50;
        App.pet.stats.current_death_tick = 100;
        App.pet.stats.is_revived_once = true;
        App.pet.stats.is_dead = false;

        App.setScene(App.scene.reviverDen);
        App.pet.stopMove();
        App.pet.x = '50%';
        App.pet.y = -999;
        App.pet.opacity = 0.5;
        App.pet.staticShadow = true;

        setTimeout(() => {
            App.playSound('resources/sounds/revival_01.ogg', true);
        })

        const reviverNpc = new Pet(
            new PetDefinition({
                sprite: 'resources/img/character/chara_193b.png',
                name: 'The Exorcist',
                accessories: ['reviver hood'],
            }), 
            {
                x: '20%',
                z: App.constants.ACTIVE_PET_Z - 1,
            }
        );
        reviverNpc.triggerScriptedState('mild_uncomfortable', App.INF, false, true);

        const doppelGanger = new Object2d({
            img: App.petDefinition.sprite,
            spritesheet: {
                ...App.petDefinition.spritesheet,
                cellNumber: App.petDefinition.animations.sleeping.start,
            },
            additionalY: App.petDefinition.spritesheet.offsetY,
            noPreload: true,
            y: '65%',
            onDraw: (me) => {
                if(me.y + me.spritesheet.cellSize/2 < App.pet.y) {
                    me.removeObject();
                    App.pet.opacity = 1;
                    App.pet.stopScriptedState();
                    App.pet.setState('shocked');
                }
            }
        })

        await App.pet.triggerScriptedState('idle', 3100, false, true); // idling at the top

        App.pet.y = 0;
        reviverNpc.setState('shocked');

        const reviveBackgroundObject = new Object2d({
            img: 'resources/img/misc/light_rays_02.png',
            x: '50%', y: '50%', z: App.constants.ACTIVE_PET_Z - 0.01,
            opacity: 1,
            composite: 'difference',
            onDraw: (me) => {
                me.rotation += 0.01 * App.deltaTime;
                me.x = '50%'; me.y = '50%';
                me.opacity -= 0.0004 * App.deltaTime;
                if(me.opacity < 0) me.removeObject();
            }
        })

        await App.pet.triggerScriptedState('angry', 3500, false, true, false,
            () => {
                App.pet.y = lerp(App.pet.y, 90, 0.00065 * App.deltaTime);
            }
        )

        reviverNpc.setState('cheering');

        // App.pet.y = '100%';
        App.pet.opacity = 1;
        // doppelGanger.removeObject();
        App.pet.playUncomfortableAnimation(() => {
            reviverNpc.removeObject();
            App.setScene(App.scene.home);
            App.toggleGameplayControls(true);
            App.displayConfirm(`<b>${App.petDefinition.name} has been revived!</b> <br><br> please take better care of them from now on since you won't be able to revive them again!`, [
                {
                    name: 'ok',
                    onclick:() => {}
                }
            ])
        });
    }
    static async goToCurrentRabbitHole(isStarting) {
        if(isStarting) { // starting animation
            App.pet.stopMove();
            App.pet.x = '50%';
            App.toggleGameplayControls(false);


            const ufoObject = new Object2d({
                image: App.preloadedResources['resources/img/misc/ufo_02.png'],
                x: 0, y: 0, z: App.constants.ACTIVE_PET_Z + 1,
                onDraw: (me) => {
                    if(App.pet.y > 50) return;
                    me.y = lerp(me.y, -50, 0.0005 * App.deltaTime)
                }
            });
            const ufoBeamObject = new Object2d({
                image: App.preloadedResources['resources/img/misc/ufo_01.png'],
                y: -120,
                x: 0,
                parent: ufoObject,
                onDraw: (me) => {
                    me.y = (App.pet.y) - 70;
                }
            });

            await App.pet.triggerScriptedState('shocked', 2000, false, true, 
                // onEnd
                () => {
                    App.pet.y = '100%';
                    App.pet.x = -999;
                    ufoObject.removeObject();
                },
                // driver
                () => {
                    App.pet.y = lerp(App.pet.y, -100, 0.0005 * App.deltaTime);
                }
            )
        }

        const {current_rabbit_hole: currentRabbitHole} = App.pet.stats;

        const outOverlay = new Object2d({
            img: 'resources/img/misc/out_overlay_01.png',
            x: 0, y: 0, z: 10,
        });

        const onEndFn = (isInterrupted) => {
            setTimeout(() => {
                App.pet.x = '50%';
                App.pet.stopMove();
            })

            const rabbitHoleDefinition = App.definitions.rabbit_hole_activities.find(activity => activity.name === App.pet.stats.current_rabbit_hole.name);

            if(!isInterrupted){
                App.displayConfirm(`Homeworld Getaway activity <b>"${App.pet.stats.current_rabbit_hole.name}"</b> has ended and ${App.petDefinition.name} is back home!`, [
                    {
                        name: 'ok',
                        onclick: () => {}
                    }
                ])
                rabbitHoleDefinition?.onEnd?.();
                // randomly increase skill points
                App.pet.stats.current_expression += clamp(random(-2, 3), 0, 3);
                App.pet.stats.current_logic += clamp(random(-2, 3), 0, 3);
                App.pet.stats.current_endurance += clamp(random(-2, 3), 0, 3);
            }

            App.pet.stats.current_rabbit_hole.name = false;
            App.toggleGameplayControls(true);
            outOverlay.removeObject();
            App.setScene(App.scene.home);
        }

        const driverFn = () => {
            const remainingTime = currentRabbitHole.endTime - Date.now();
            if(remainingTime <= 0){
                onEndFn();
                App.pet.stopScriptedState();
                return true;
            }
            App.pet.x = -99;
        }

        if(!isStarting){
            const isAlreadyEnded = driverFn();
            if(isAlreadyEnded) return;
        }

        App.toggleGameplayControls(false, () => {
            App.displayConfirm(`
                <div style="font-size: x-small;" class="solid-surface-stylized b-radius-10">
                    <i  class="fa-solid fa-clock" style="margin-right: 2px;"></i>
                    <span>${currentRabbitHole.name}</span>
                </div>
                ${App.petDefinition.name} will be back <b>${moment(currentRabbitHole.endTime).fromNow()}</b>
                `, [
                {
                    name: 'end early',
                    onclick: () => {
                        onEndFn(true);
                        App.pet.stopScriptedState();
                    },
                },
                {
                    name: 'close',
                    class: 'back-btn',
                    onclick: () => {}
                }
            ])
        });

        App.pet.triggerScriptedState('idle', App.INF, false, true, null, driverFn)
        App.pet.stopMove();
        App.pet.targetX = -999;
    }
    static async goToFortuneTeller(otherPetDef){
        App.toggleGameplayControls(false);
        App.setScene(App.scene.fortune_teller);

        let evolutions = App.petDefinition.getPossibleEvolutions(false, true);

        if(otherPetDef){
            evolutions = [PetDefinition.getOffspringSprite(App.petDefinition, otherPetDef)];
            App.pet.showThought(App.constants.WANT_TYPES.playdate, otherPetDef);
        }

        const petsToReveal = evolutions?.map((sprite, index) => {
            const pet = new Pet(
                new PetDefinition({
                    sprite,
                }),
                {
                    x: '50%',
                    y: '55%',
                    z: App.constants.BACKGROUND_Z - 1,
                    opacity: 0,
                    castShadow: false,
                }
            );
            if(evolutions.length > 1){
                for(let i = 0; i < 3; i++){
                    new Object2d({
                        img: 'resources/img/misc/star_01.png',
                        x: `${40 + (i * 10)}%`,
                        y: `6%`,
                        opacity: 1,
                        scale: 0.4,
                        parent: pet,
                        rating: index,
                        onDraw: (me) => {
                            const fullOpacity = i <= index;
                            me.opacity = fullOpacity ? me.parent.opacity : me.parent.opacity * 0.25;
                        }
                    });
                }
            }

            pet.triggerScriptedState('idle', App.INF, 0, true);

            return pet;
        })

        const fadeInAndOut = (pet) => {
            let target = 1;
            setTimeout(() => target = 0, 4000);
            pet.onDraw = (me) => {
                me.opacity = lerp(me.opacity, target, 0.0025 * App.deltaTime);
                Object2d.animations.bob(me, 0.005, 0.1);
            }
        }

        App.pet.stopMove();
        App.pet.x = -30;
        App.pet.targetX = 50;
        App.pet.triggerScriptedState('moving', 3000, null, true, () => {
            App.pet.x = '20%';
            App.pet.inverted = true;
            App.pet.triggerScriptedState('idle', 2000, null, true, () => {
                const delayBetweenReveals = 6000;
                const maxWaitTime = petsToReveal.length * delayBetweenReveals;
                App.pet.triggerScriptedState('shocked', maxWaitTime, null, true, () => {
                    App.pet.playCheeringAnimation(() => {
                        petsToReveal?.forEach(p => p?.removeObject());
                        App.setScene(App.scene.home);
                        App.toggleGameplayControls(true);
                        App.handlers.open_fortune_teller();
                    });
                });
                petsToReveal?.forEach((p, i) => {
                    setTimeout(() => fadeInAndOut(p), i * delayBetweenReveals);
                });

            });
        });

        App.sendAnalytics('visit_fortune_teller');
    }
    static async useItem(item){
        App.closeAllDisplays();

        if(App.pet.stats.is_misbehaving){
            App.pet.x = '50%';
            App.pet.playAngryAnimation();
            return;
        }
        
        const itemObject = new Object2d({
            img: App.constants.ITEM_SPRITESHEET,
            spritesheet: {
                ...App.constants.ITEM_SPRITESHEET_DIMENSIONS,
                cellNumber: item.sprite,
            },
            x: '55%', y: '47%', z: App.constants.ACTIVE_ITEM_Z
        });

        Missions.done(Missions.TYPES.play_item);


        App.toggleGameplayControls(false);

        const interruptFn = () => {
            App.pet.stopScriptedState();
        }
        App.toggleGameplayControls(false, (item.interruptable ? interruptFn : false))

        App.petDefinition.checkWant(App.pet.stats.current_want.item == item.name, App.constants.WANT_TYPES.item);

        if(item.handler){
            return item.handler(App.pet, item, itemObject);
        }

        App.pet.stopMove();
        App.pet.x = randomFromArray(['50%', '25%', '75%']);
        App.pet.y = '92%';
        App.pet.inverted = true;
        App.pet.staticShadow = true;
        App.pet.triggerScriptedState('cheering', item.interaction_time || 10000, false, true, () => {  
            App.drawer.removeObject(itemObject);

            App.pet.stats.current_fun += item.fun_replenish || 0;
            App.pet.stats.current_sleep += item.sleep_replenish || 0;
            App.pet.stats.current_expression += item.expression_increase || 0;
            App.pet.stats.current_logic += item.logic_increase || 0;
            App.pet.stats.current_endurance += item.endurance_increase || 0;

            App.pet.playCheeringAnimation();

            App.reloadScene(); // to reset pet pos
            
            App.toggleGameplayControls(true);

            item.onEnd?.();
        }, Pet.scriptedEventDrivers.playingWithItem.bind({pet: App.pet, item: item, itemObject}))
    }
    static async goOnDate(otherPetDef = App.getRandomPetDef(), onFailEnd){
        App.closeAllDisplays();
        App.toggleGameplayControls(false);
        App.setScene(App.scene.beach);
        const otherPet = new Pet(otherPetDef);

        // moving in
        otherPet.x = '70%';
        otherPet.targetX = 0;
        otherPet.triggerScriptedState('moving', 2000, false, true);
        App.pet.x = '100%';
        App.pet.targetX = 50;
        await App.pet.triggerScriptedState('moving', 2000, false, true);

        // date
        App.pet.x = '70%';
        otherPet.x = '30%';
        otherPet.inverted = true;
        otherPet.triggerScriptedState('eating', 8000, false, true);
        await App.pet.triggerScriptedState('eating', 8000, false, true);
        
        // conclusion
        const end = () => {
            App.pet.stopScriptedState();
            otherPet.removeObject();
            App.setScene(App.scene.home);
            App.toggleGameplayControls(true);
        }
        const determineBehavior = (pet, enjoyment) => {
            if(enjoyment){
                pet.showThought('thought_heart')
                pet.triggerScriptedState('blush', App.INF, false, true);
                App.playSound('resources/sounds/task_complete_02.ogg', true)
            } else {
                pet.showThought('thought_heart_broken')
                pet.triggerScriptedState('idle_side_uncomfortable', App.INF, false, true);
                pet.inverted = !pet.inverted;
                setTimeout(() => App.playSound('resources/sounds/task_fail_01.ogg', true))
            }
        }
        const petOverall = (App.pet.stats.current_fun + App.pet.stats.current_cleanliness + App.pet.stats.current_health + random(0, 100)) / 4;
        const otherEnjoyment = random(30, 85) <= petOverall;
        const petEnjoyment = otherEnjoyment ? !!random(0, 6) : random(0, 1); // just to make it more common for both parties to not like each other
        determineBehavior(App.pet, petEnjoyment);
        determineBehavior(otherPet, otherEnjoyment);
        
        setTimeout(() => {
            if(!petEnjoyment || !otherEnjoyment){
                let text = '';
                if (!otherEnjoyment && !petEnjoyment) {
                    text = `Oh no! ${App.petDefinition.name} and ${otherPetDef.name} didn't really hit it off!`;
                } else if (!otherEnjoyment && petEnjoyment) {
                    text = `${otherPetDef.name} didn't quite connect with ${App.petDefinition.name}!`;
                } else {
                    text = `${App.petDefinition.name} didn't quite connect with ${otherPetDef.name}!`;
                }
                return App.displayPopup(text, 5000, () => {
                    end();
                    onFailEnd?.();
                    App.pet.stats.current_fun -= 35;
                    App.pet.playUncomfortableAnimation();
                });
            }

            App.pet.stats.current_fun += 40;
            App.displayConfirm(`${App.petDefinition.name} and ${otherPetDef.name} had a wonderful time together! <br><br> Do you want to propose to ${otherPetDef.name}?`, [
                {
                    name: 'propose',
                    onclick: () => {
                        App.displayConfirm(`${App.petDefinition.name} and <div>${otherPetDef.getCSprite()} ${otherPetDef.name}</div> will get married and you'll receive their egg, are you sure?`, [
                            {
                                name: 'yes',
                                onclick: () => {
                                    end();
                                    Activities.wedding(otherPetDef);
                                }
                            },
                            {
                                name: 'cancel',
                                class: 'back-btn',
                                onclick: () => {
                                    App.definitions.achievements.not_propose_on_date_x_times.advance();
                                    end();
                                },
                            }
                        ])
                    },
                },
                {
                    name: 'cancel',
                    class: 'back-btn',
                    onclick: end
                }
            ])
        }, 3000);
    }
    static goToInnerGarden(){
        Activities.task_handleLeavingAnimals();
        
        App.pet.stopScriptedState();
        App.pet.x = '100%';
        App.pet.targetX = 50;
        App.setScene(App.scene.garden_inner);
        
        const displayPlantsList = ({
            onPlantClick, 
            filterFn = () => true, 
            additionalStartOptions = [],
        }) => {
            const allPlantsList = App.plants
                .filter(filterFn)
                .map((currentPlant, currentPlantIndex) => {
                    const plantNameText = `<span style="${currentPlant.isDead ? 'color: red': ''}"> ${currentPlant.name} </span>`
                    return {
                        name: `<span class="icon ${currentPlant.isDead ? 'opacity-half' : ''}">${currentPlant.getCSprite()}</span> ${plantNameText}`,
                        onclick: () => onPlantClick(currentPlant, currentPlantIndex)
                    }
                })
            return App.displayList([...additionalStartOptions, ...allPlantsList]);
        }

        const displayMainList = () => {
            const mainList =  App.displayList([
                {
                    name: '<i class="icon fa-solid fa-plus icon"></i> plant',
                    _disable: App.plants.length === App.constants.MAX_PLANTS,
                    onclick: () => {
                        const onSelectSeed = (plantName) => {
                            if (App.plants.length !== App.constants.MAX_PLANTS) {
                                const plant = new Plant({ name: plantName });
                                App.plants.push(plant);
                                App.handleGardenPlantsSpawn(true);
                                Missions.done(Missions.TYPES.plant_in_garden);
                                Activities.task_floatingObjects(10, ['resources/img/misc/add_green_01.png']);
                                App.sendAnalytics('plant', plantName);
                                return true;
                            }
                            return false;
                        }

                        App.handlers.open_seed_list(false, null, onSelectSeed);
                    }
                },
                {
                    name: `stats`,
                    _disable: !App.plants.length,
                    onclick: () => {
                        return displayPlantsList({
                            onPlantClick: (plant) => {
                                App.handlers.open_plant_stats(plant);
                                return true;
                            },
                        })
                    },
                },
                {
                    name: 'water',
                    _disable: !App.plants.some(p => !p.isDead),
                    onclick: async () => {
                        App.closeAllDisplays();
                        const wateringCan = new Object2d({
                            img: 'resources/img/misc/watering_can_01.png',
                            z: 100,
                        })
                        const previousController = App.getGameplayControlsState().onclick;
                        App.toggleGameplayControls(false);
                        for(let i = 0; i < App.plants.length; i++){
                            const plant = App.plants[i];
                            // if(plant.isWatered || plant.isDead) continue;
                            if(plant.isDead) continue;

                            wateringCan.x = plant.position.x + 8;
                            wateringCan.y = plant.position.y;
                            await App.wait(500);
                            plant.water();
                            Missions.done(Missions.TYPES.water_crop);
                        }
                        wateringCan.removeObject();
                        App.pet.stats.current_expression += 0.5;
                        App.toggleGameplayControls(false, previousController);
                    }
                },
                {
                    name: 'harvest',
                    _disable: !App.plants.some(p => p.age === Plant.AGE.grown),
                    onclick: () => {
                        const displayHarvestables = () => {
                            if(!App.plants.some(p => p.age === Plant.AGE.grown)) return;

                            const list = displayPlantsList({
                                onPlantClick: (plant, plantIndex) => {
                                    App.plants.splice(plantIndex, 1); // removing plant
                                    App.handleGardenPlantsSpawn(true);
                                    Activities.task_floatingObjects(10, ['resources/img/misc/tick_green_01.png']);

                                    let amount = random(3, 5);
                                    if(App.isGameplayBuffActive('doubleHarvest')) amount += random(3, 5);

                                    App.addNumToObject(App.pet.inventory.harvests, plant.name, amount);
                                    App.displayConfirm(`
                                            <div>${plant.getCSprite()}</div>
                                            <div>${plant.name}</div>
                                            <div>(x${amount})</div>
                                        `, [
                                        {
                                            name: 'ok',
                                            onclick: () => {
                                                UI.clearLastClicked();
                                                mainList.close();
                                                list.close();
                                                displayMainList();
                                                displayHarvestables();
                                            }
                                        }
                                    ])
                                    App.sendAnalytics('harvest', plant.name);
                                    App.pet.stats.current_logic += 0.25;
                                    return true;
                                },
                                filterFn: (plant) => plant.age === Plant.AGE.grown
                            })
                        }
                        displayHarvestables();
                        return true;
                    }
                },
                {
                    name: 'remove',
                    _disable: !App.plants.length || App.plants.every(p => p.age === Plant.AGE.grown),
                    onclick: () => {
                        displayPlantsList({
                            additionalStartOptions: App.plants.some(p => p.isDead) ? [
                                {
                                    name: '<span style="color: red;"><i class="icon fa-solid fa-skull icon"></i> Dead ones</span>',
                                    onclick: () => {
                                        return App.displayConfirm(`Are you sure you want to remove all dead plants?`, [
                                            {
                                                name: 'yes',
                                                onclick: () => {
                                                    while(true){
                                                        const deadPlantIndex = App.plants.findIndex(p => p.isDead);
                                                        if(deadPlantIndex === -1) break;
                                                        App.plants.splice(deadPlantIndex, 1);
                                                    }
                                                    App.handleGardenPlantsSpawn(true);
                                                    App.closeAllDisplays();
                                                    Activities.task_floatingObjects(10, ['resources/img/misc/remove_red_01.png']);
                                                }
                                            },
                                            {
                                                name: 'no',
                                                class: 'back-btn',
                                                onclick: () => {}
                                            },
                                        ])
                                    }
                                },
                                // {type: 'separator',}
                            ] : [],
                            onPlantClick: (plant, plantIndex) => {
                                return App.displayConfirm(`Are you sure you want to remove <b>${plant.name} (${Plant.AGE_LABELS[plant.age]})</b>?`, [
                                    {
                                        name: 'yes',
                                        onclick: () => {
                                            App.plants.splice(plantIndex, 1); // removing plant
                                            App.handleGardenPlantsSpawn(true);
                                            App.closeAllDisplays();
                                            Activities.task_floatingObjects(10, ['resources/img/misc/remove_red_01.png']);
                                        }
                                    },
                                    {
                                        name: 'no',
                                        class: 'back-btn',
                                        onclick: () => {}
                                    },
                                ])
                            },
                            filterFn: (plant) => plant.age !== Plant.AGE.grown
                        })
                        return true;
                    }
                },
                {
                    name: 'inventory',
                    onclick: () => {
                        return App.displayList([
                            {
                                name: `
                                <div class="flex-between flex-wrap" style="row-gap: 4px">
                                    ${App.getHarvestInventoryUI()}
                                </div>
                                `,
                                type: 'text',
                            },
                        ]);
                    }
                },
                {
                    name: `active buffs`,
                    onclick: () => App.handlers.open_active_buffs('garden'),
                },
                {
                    name: '<i class="icon fa-solid fa-home"></i> go inside',
                    class: 'back-btn',
                    onclick: () => {
                        App.setScene(App.scene.home);
                        App.toggleGameplayControls(true);
                        App.pet.stopScriptedState();
                        App.pet.x = '0%';
                        App.pet.targetX = 50;
                    }
                },
                // {
                //     name: '<i class="icon fa-solid fa-arrow-left icon"></i> backyard',
                //     class: 'back-btn',
                //     onclick: () => {
                //         Activities.goToGarden();
                //     }
                // }
            ]);

            return mainList;
        }

        App.toggleGameplayControls(false, displayMainList)
    }
    static goToGarden(){
        const openChooseNameDialog = (animalDef, onEndFn) => {
            return App.displayPrompt(`Choose a name for ${animalDef.getFullCSprite()}:`, [
                {
                    name: 'set',
                    onclick: (text) => {
                        animalDef.name = text;
                        onEndFn?.();
                        App.displayPopup(`Name set to ${animalDef.name}!`);
                    }
                },
                {
                    name: 'cancel',
                    class: 'back-btn',
                    onclick: () => {}
                }
            ], animalDef.name)
        }

        const getNextAttractMs = (fromMs = App.animals.nextAttractMs) => {
            return (fromMs || Date.now()) + App.constants.ONE_HOUR * random(2, 8);
        }
        const resetTreat = () => {
            App.animals.treat = null;
            App.animals.treatBiteCount = 0;
        }
        const checkForArrivedAnimal = () => {
            if(!App.animals.treat) return;
            if(App.animals.nextAttractMs > Date.now()) return;

            App.animals.treatBiteCount ++;
            App.animals.nextAttractMs = getNextAttractMs();

            if(!random(0, 2)){
                resetTreat();
                const newAnimal = new AnimalDefinition({
                    name: getRandomName(false, true),
                    sprite: randomFromArray(ANIMAL_CHARACTERS)
                });
                App.animals.list.push(newAnimal);
                App.displayPopup(`A new animal ${newAnimal.getFullCSprite()} has chosen your backyard as their new home. Take good care of them!`, 3000, () => openChooseNameDialog(newAnimal));
                App.pet.stats.current_expression += 2;
                App.sendAnalytics('animal_arrived');
            } else if(App.animals.treatBiteCount > 2) {
                resetTreat();
                App.pet.stats.current_endurance += 3;
                App.displayConfirm(`The food you placed out earlier is gone.<br><br>Unfortunately, its visitor chose not to stay this time, maybe you'll meet them next time!`, [
                    {
                        name: 'ok',
                        onclick: () => {}
                    }
                ]);
            }
        }

        // handle new animal arriving
        if(App.animals.treat){
            const timeDelta = Date.now() - App.animals.nextAttractMs;
            const repeatTimes = Math.ceil(timeDelta / (App.constants.ONE_HOUR * 2));
            for(let i = 0; i < clamp(repeatTimes, 0, 10); i++){
                checkForArrivedAnimal();
            }
        }

        // handle animals leaving
        Activities.task_handleLeavingAnimals();

        App.pet.stopScriptedState();
        App.setScene(App.scene.garden);
        App.pet.x = '100%';
        App.pet.targetX = 50;

        App.toggleGameplayControls(false, () => {
            return App.displayList([
                {
                    _ignore: true,
                    name: 'Garden',
                    onclick: () => {
                        Activities.goToInnerGarden();
                    }
                },
                {
                    name: 'Animals',
                    onclick: () => {
                        return App.displayList([
                            ...App.animals.list.map(animalDef => ({
                                name: `${animalDef.getFullCSprite()}${animalDef.name}`,
                                onclick: () => {
                                    return App.displayList([
                                        {
                                            type: 'text',
                                            name: `
                                                Happiness:
                                                ${App.createProgressbar(animalDef.stats.current_happiness).node.outerHTML}
                                            `,
                                        },
                                        {
                                            name: 'feed',
                                            onclick: () => {
                                                const onUseFn = (selectedFood) => {
                                                    App.closeAllDisplays();
                                                    animalDef.feed(selectedFood.hunger_replenish * 3);

                                                    const startTime = App.time;
                                                    const spawnedAnimal = App.spawnedAnimals.find(a => a.animalDefinition === animalDef);
                                                    const foodObject = new Object2d({
                                                        parent: spawnedAnimal,
                                                        image: App.preloadedResources[App.constants.FOOD_SPRITESHEET],
                                                        spritesheet: {
                                                            ...App.constants.FOOD_SPRITESHEET_DIMENSIONS,
                                                            cellNumber: selectedFood.sprite
                                                        },
                                                        scale: 1,
                                                        x: spawnedAnimal.x + spawnedAnimal.spritesheet.cellSize,
                                                        y: spawnedAnimal.y - spawnedAnimal.spritesheet.cellSize,
                                                        onDraw: (me) => {
                                                            App.pet.setLocalZBasedOnSelf(me);
                                                        },
                                                    })
                                                    spawnedAnimal.stopMove();
                                                    spawnedAnimal.inverted = true;
                                                    spawnedAnimal.triggerScriptedState('eating', App.INF, false, true, 
                                                        () => {
                                                            foodObject.removeObject();
                                                            spawnedAnimal.playCheeringAnimation(null, true);
                                                        },
                                                        () => {
                                                            const elapsedTime = App.time - startTime;
                                                            const spriteOffset = Math.floor(elapsedTime / 1500);
                                                            foodObject.spritesheet.cellNumber = selectedFood.sprite + clamp(spriteOffset, 0, 2);
                                                            // foodObject.scale = 1 - (spriteOffset * 0.2);
                                                            if(spriteOffset > 2) spawnedAnimal.stopScriptedState();
                                                        }
                                                    );
                                                    Missions.done(Missions.TYPES.feed_animal);
                                                    return true;
                                                }
                                                return App.handlers.open_food_list({buyMode: false, filterType: 'food', useMode: onUseFn, age: PetDefinition.LIFE_STAGE.adult});
                                            }
                                        },
                                        {
                                            name: 'play',
                                            onclick: () => {
                                                App.closeAllDisplays();
                                                animalDef.increaseHappiness(random(2, 5));
                                                const spawnedAnimal = App.spawnedAnimals.find(a => a.animalDefinition === animalDef);
                                                App.pet.stopScriptedState();
                                                spawnedAnimal.stopScriptedState();
                                                spawnedAnimal.interactWith(App.pet, {animation: 'cheering', length: 5000});
                                                Missions.done(Missions.TYPES.play_with_animal);
                                            }
                                        },
                                        {
                                            type: 'text',
                                            name: App.getGameplayBuffUI(animalDef.getBuff()),
                                        },
                                        {
                                            name: 'rename',
                                            onclick: () => openChooseNameDialog(animalDef, () => App.closeAllDisplays())
                                        },
                                        {
                                            name: `<span style="color: red;">Release</span>`,
                                            onclick: () => {
                                                return App.displayConfirm(`Are you sure you want release ${animalDef.name} back into the wild?`, [
                                                    {
                                                        name: 'yes',
                                                        onclick: async () => {
                                                            App.closeAllDisplays();

                                                            const previousController = App.getGameplayControlsState().onclick;
                                                            App.toggleGameplayControls(false);
                                                            App.pet.stopMove();
                                                            App.pet.inverted = false;
                                                            App.pet.x = '75%';
                                                            App.pet.triggerScriptedState('uncomfortable', App.INF, false, true);
                                                            const spawnedAnimal = App.spawnedAnimals.find(a => a.animalDefinition === animalDef);
                                                            spawnedAnimal.stopMove();
                                                            spawnedAnimal.x = '50%';
                                                            spawnedAnimal.y = '100%';
                                                            spawnedAnimal.targetX = -100;
                                                            await spawnedAnimal.triggerScriptedState('moving', 5000, false, true);
                                                            App.toggleGameplayControls(false, previousController);
                                                            App.pet.stopScriptedState();

                                                            App.displayPopup(`${animalDef.name} has been released back into the wild.`, 4000);
                                                            App.animals.list.splice(
                                                                App.animals.list.indexOf(animalDef),
                                                                1
                                                            );
                                                            App.reloadScene(true);
                                                        }
                                                    },
                                                    {
                                                        name: 'no',
                                                        class: 'back-btn',
                                                        onclick: () => {}
                                                    }
                                                ])
                                            }
                                        }
                                    ])
                                }
                            })),
                            {
                                _disable: App.animals.list.length >= App.constants.MAX_ANIMALS,
                                name: '<i class="fa-solid fa-plus icon"></i> Attract Animal',
                                onclick: () => {
                                    return App.displayList([
                                        {
                                            name: App.animals.treat ? 'Replace food' : 'Place food',
                                            onclick: () => {
                                                const onUseFn = (selectedFood) => {
                                                    App.closeAllDisplays();
                                                    App.animals.treat = selectedFood.sprite;
                                                    App.animals.treatBiteCount = 0;
                                                    App.animals.nextAttractMs = getNextAttractMs(Date.now());
                                                    App.reloadScene(true);
                                                    App.displayPopup("The food has been placed!<br><br>Check back in a few hours to see if you've gotten a visitor!", 4000);
                                                    return true;
                                                }
                                                return App.handlers.open_food_list({buyMode: false, filterType: 'food', useMode: onUseFn, age: PetDefinition.LIFE_STAGE.adult});
                                            }
                                        },
                                        {
                                            type: 'info',
                                            name: `Placing food out may attract new animals!`
                                        }
                                    ])
                                }
                            },
                        ])
                    }
                },
                {
                    name: `active buffs`,
                    onclick: App.handlers.open_active_buffs,
                },
                {
                    name: '<i class="icon fa-solid fa-home"></i> go inside',
                    class: 'back-btn',
                    onclick: () => {
                        App.setScene(App.scene.home);
                        App.toggleGameplayControls(true);
                        App.pet.stopScriptedState();
                        App.pet.x = '0%';
                        App.pet.targetX = 50;
                    }
                }
            ])
        })
    }
    static getMail({onEndFn = App.handlers.show_newspaper, noSceneSwitch} = {}){
        App.pet.stopMove();
        App.toggleGameplayControls(false);
        if(!noSceneSwitch) App.setScene(App.scene.garden, false, { noPetBowl: true });
        App.pet.x = '78%';
        App.pet.inverted = false;
        App.pet.triggerScriptedState('idle_side', App.INF, false, true);
        const mailManDef = new PetDefinition({
            sprite: NPC_CHARACTERS[1],
            name: 'Nazotchi'
        });
        const mailMan = new Pet(mailManDef, {
            x: '0%',
            y: App.scene.garden.petY,
            targetX: 50,
            onDraw: (me) => App.pet.setLocalZBasedOnSelf(me),
        });
        const payload = () => {
            mailMan.removeObject();
            onEndFn();
            App.pet.stopScriptedState();
            App.toggleGameplayControls(true);
            App.setScene(App.scene.home);
            App.pet.x = '50%';
        }
        mailMan.triggerScriptedState('moving', 2500, null, true, () => {
            mailMan.stopMove();
            mailMan.playCheeringAnimation(payload, true);
            App.pet.playCheeringAnimation();
        });
    }
    static onlineHubTransition(onEndFn){
        Missions.done(Missions.TYPES.visit_online_hub);
        App.pet.stopMove();
        App.toggleGameplayControls(false);
        App.pet.x = '50%';
        setTimeout(() => App.playSound('resources/sounds/online_hub_transition_01.ogg', true));
        const fadeOverlay = new Object2d({
            img: 'resources/img/misc/cyberpunk_overlay_01.png',
            x: 0, y: 0, z: 555, opacity: 0, direction: true,
            onDraw: (me) => {
                Object2d.animations.flip(me, 1000);
                if(me.direction) me.opacity += 0.00025* App.deltaTime;
                else me.opacity -= 0.001 * App.deltaTime;
                me.opacity = clamp(me.opacity, 0, 2);
                if(!me.direction && me.opacity == 0) me.removeObject();
            }
        })
        const lightRays = new Object2d({
            parent: fadeOverlay,
            img: 'resources/img/misc/light_rays_02.png',
            z: 556, opacity: 0, x: '50%', y: '50%', composite: 'overlay',
            onDraw: (me) => {
                me.opacity = fadeOverlay.opacity * 3;
                me.rotation += 0.01 * App.deltaTime;
                me.x = '50%'; me.y = '50%';
            }
        })

        App.pet.triggerScriptedState('shocked', 4000, false, true, () => {
            App.pet.targetY = undefined;
            onEndFn(fadeOverlay);
        });
        App.pet.targetY = 50;
    }
    static async goToOnlineHub(){
        const {hasUploadedPetDef, randomPetDefs} = App.temp.online;
        const INTERACTION_LIKES = {
            outgoing: hasUploadedPetDef.interactionOutgoingLikes ?? 2,
            receiving: hasUploadedPetDef.interactionReceivingLikes ?? 1,
        }
        const addInteraction = (def, skipApi) => {
            if(!skipApi) App.apiService.addInteraction(def.ownerId);
            def.interactions = (def.interactions ?? 0) + INTERACTION_LIKES.outgoing;
            hasUploadedPetDef.interactions = (hasUploadedPetDef.interactions ?? 0) + INTERACTION_LIKES.receiving;
        }
        
        App.setScene(App.scene.online_hub);

        App.pet.stopMove();
        App.pet.x = '50%';

        let npcY = 60;
        const otherPlayersPets = randomPetDefs.slice(0, 7).map((def, i) => {
            if(i && i % 2 == 0) npcY += 10;
            const p = new Pet(def, {
                x: `${random(0, 100)}%`,
                y: `${npcY}%`,
                z: 4 + (i * 0.15),
                opacity: 1,
            });
            p.stats.wander_max = 3;
            return p;
        });

        if(hasUploadedPetDef.status){
            App.apiService.addPetDef();
        }

        // handlers
        const despawnAllPets = () => {
            otherPlayersPets.forEach(p => p?.removeObject?.());
        }
        const handleHangout = (def) => {
            App.closeAllDisplays();
            App.toggleGameplayControls(false);
            despawnAllPets();
            addInteraction(def);
            Missions.done(Missions.TYPES.online_interact);
            Activities.invitePlaydate(def, App.scene.online_hub, () => {
                App.displayConfirm(`Do you want to add ${def.getCSprite()} ${def.name} to your friends list?`, [
                    {
                        name: 'yes',
                        onclick: () => {
                            App.closeAllDisplays();
                            const addedFriend = App.petDefinition.addFriend(def, 1);
                            if (addedFriend) {
                                App.displayPopup(`${def.getCSprite()} ${def.name} has been added to the friends list!`, 3000);
                                addInteraction(def);
                            } else {
                                App.displayPopup(`You are already friends with ${def.name}`, 3000);
                            }
                            return false;
                        }
                    },
                    {
                        name: 'no',
                        class: 'back-btn',
                        onclick: () => { }
                    },
                ])
                setTimeout(() => Activities.goToOnlineHub());
            })
        }
        const handleDate = (def) => {
            return App.displayConfirm(`Do you want to go on a date with <div>${def.getCSprite()} ${def.name}</div>?`, [
                {
                    name: 'yes',
                    onclick: () => {
                        despawnAllPets();
                        addInteraction(def);
                        Activities.goOnDate(def, Activities.goToOnlineHub);
                    }
                },
                {
                    name: 'cancel',
                    class: 'back-btn',
                    onclick: () => {}
                }
            ])
        }
        const handleInteract = () => {
            const petInteractions = otherPlayersPets.map(pet => {
                const def = pet.petDefinition;
                return {
                    name: `${def.getCSprite()} ${def.name}`,
                    onclick: () => {
                        return App.displayList([
                            {
                                name: `
                                <div style="
                                    display: flex;
                                    justify-content: space-between;
                                    flex-wrap: wrap;   
                                    align-items: center;                                     
                                ">
                                    <div>
                                        <i class="fa-solid fa-user-circle"></i> ${def.owner}
                                    </div>
                                    <div>
                                        <i class="fa-solid fa-thumbs-up"></i> ${def.interactions}
                                    </div>
                                </div>
                                `,
                                type: 'text',
                                solid: true,
                            },
                            {
                                name: 'hang out',
                                onclick: () => handleHangout(def)
                            },
                            {
                                _disable: App.petDefinition.lifeStage < PetDefinition.LIFE_STAGE.adult || def.lifeStage < PetDefinition.LIFE_STAGE.adult,
                                name: `go on date`,
                                onclick: () => handleDate(def)
                            },
                        ])
                    }
                }
            })
            return App.displayList([
                ...petInteractions,
                {
                    name: `
                        Every time you interact with another pet you'll receive 
                        <i class="fa-solid fa-thumbs-up"></i> ${INTERACTION_LIKES.receiving} 
                        and they'll receive
                        <i class="fa-solid fa-thumbs-up"></i> ${INTERACTION_LIKES.outgoing} 
                    `,
                    type: 'info',
                },
            ])
        }
        const handleUploadCharacter = () => {
            return App.displayConfirm(`Do you want to upload ${App.petDefinition.name} to HUBCHI so that other players can see and interact with them?`, [
                {
                    name: 'yes',
                    onclick: async () => {
                        const popup = App.displayPopup('Uploading...', App.INF);
                        const {status} = await App.apiService.addPetDef();
                        popup.close();
                        App.closeAllDisplays();
                        hasUploadedPetDef.status = status;
                        App.displayPopup('Success!');
                    }
                },
                {
                    name: 'no',
                    class: 'back-btn',
                    onclick: () => {}
                },
            ])
        }
        const handleSyncCharacter = () => {
            return App.displayPopup('Syncing is now done automatically when entering Hubchi, this option will be removed later.', 4000);

            const confirm = App.displayConfirm(`Do you want to update your HUBCHI persona to be in sync with ${App.petDefinition.name}'s latest appearance?`, [
                {
                    name: 'yes',
                    onclick: async () => {
                        // confirm.close();
                        // const popup = App.displayPopup('Syncing...', App.INF);
                        // const {status} = await App.apiService.addPetDef();
                        // popup.close();
                        // App.displayPopup(status ? 'Success!' : 'Error!');
                        return false;
                    }
                },
                {
                    name: 'no',
                    class: 'back-btn',
                    onclick: () => {}
                },
            ])
            return true;
        }
        const handleReturnHome = () => {
            return App.displayConfirm(`Are you sure you want to return home?`, [
                {
                    name: 'yes',
                    onclick: async () => {
                        App.closeAllDisplays();
                        otherPlayersPets.forEach(p => p?.removeObject?.());
                        Activities.onlineHubTransition((fadeOverlay) => {
                            App.setScene(App.scene.home);
                            fadeOverlay.direction = false;
                            setTimeout(() => {
                                App.pet.playCheeringAnimation(() => App.toggleGameplayControls(true));
                            }, 500);
                        });
                    }
                },
                {
                    name: 'no',
                    class: 'back-btn',
                    onclick: () => {}
                },
            ])
        }
        const handleFriendSearch = () => App.handlers.open_hubchi_search((def) => addInteraction(def, true));
        
        const handleRewardStore = () => {
            const showItem = (image, name, description, unlockLikesReq, unlockKey) => {
                const isUnlocked = App.getRecord(unlockKey);
                const confirm = App.displayConfirm(
                    `
                        <img style="max-width: 128px" src="${image}"></img>
                        <br>
                        <b>${name}</b>
                        <br>
                        <span>${description}</span>
                    `,
                    [
                        {
                            _disable: isUnlocked,
                            // name: !isUnlocked ? 'unlock' : 'reward collected',
                            name: !isUnlocked ? `unlock <div style="margin-left: auto"><i class="fa-solid fa-thumbs-up"></i> ${unlockLikesReq} </div>` : 'reward collected',
                            onclick: unlockKey 
                            ? () => {
                                if((App.temp.online?.hasUploadedPetDef?.interactions || 0) < unlockLikesReq){
                                    return App.displayPopup(`You don't have enough interactions to unlock ${name}.`)
                                }
                                App.addRecord(unlockKey, 1, true);
                                App.displayPopup(`<b>${name}</b> unlocked!`)
                                App.sendAnalytics('unlocked_hubchi_reward_item', name);
                            } : undefined
                        },
                        {
                            name: 'close',
                            class: 'back-btn',
                            onclick: () => {}
                        }
                    ]
                )
                return confirm;
            }
        
            const createEntryButton = (icon, name, item, onClick) => {
                /* let badge = ''
                if(!App.getRecord(item.unlockKey)){
                    if(App.temp.online?.hasUploadedPetDef?.interactions >= item.unlockLikes){
                        badge = App.getBadge('★');
                    }
                } else badge = App.getBadge('<i class="fa-solid fa-check"></i>', 'gray'); */
                return {
                    name: `<img class="icon" src="${icon}"></img> ${name} ${item.isNew ? App.getBadge('new!') : ''}`,
                    onclick: onClick,
                    isNew: item.isNew,
                }
            }
        
            // const accessories = App.definitions.accessories.filter(e => e.onlineShopAccessible);
            const accessories = Object.keys(App.definitions.accessories)
                .filter(e =>
                    App.definitions.accessories[e].onlineShopAccessible
                )
                .map(name => {
                    const item = App.definitions.accessories[name];
                    const icon = item.icon || item.image;
                    return createEntryButton(icon, name, item, () => showItem(icon, name, 'accessory', item.unlockLikes, item.unlockKey))
                })
        
            const backgrounds = Object.keys(App.definitions.room_background)
                .filter(e =>
                    App.definitions.room_background[e].onlineShopAccessible
                )
                .map(name => {
                    const item = App.definitions.room_background[name];
                    const icon = item.image;
                    return createEntryButton(icon, name, item, () => showItem(icon, name, 'background', item.unlockLikes, item.unlockKey))
                })
        
            const shells = Object.keys(App.definitions.shell_background)
                .filter(e =>
                    App.definitions.shell_background[e].onlineShopAccessible
                )
                .map(key => {
                    const item = App.definitions.shell_background[key];
                    const icon = item.image;
                    return createEntryButton(icon, item.name, item, () => showItem(icon, item.name, 'shell design', item.unlockLikes, item.unlockKey))
                })
        
            const finalList = [
                ...accessories,
                ...backgrounds,
                ...shells,
            ].sort((a, b) => b.isNew - a.isNew);
        
            return App.displayList(finalList)
        }

        App.toggleGameplayControls(false, () => {
            if(!hasUploadedPetDef.status){
                return App.displayList([
                    {
                        type: 'text',
                        name: `
                            Upload your character to get access to hubchi!
                        `,
                    },
                    {
                        name: 'Upload character',
                        onclick: handleUploadCharacter
                    },
                    {
                        name: '<i class="icon fa-solid fa-home"></i> return home',
                        onclick: handleReturnHome
                    },
                    {
                        name: `Hubchi is an online hub for players to interact with each other and win rewards!`,
                        type: 'info'
                    },
                ])
            }

            return App.displayList([
                {
                    type: 'text',
                    solid: true,
                    name: `
                        <div style="
                            display: flex;
                            justify-content: space-between;
                            flex-wrap: wrap;
                            align-items: center;
                            width: 100%;
                        ">
                            <div style="
                                display: flex;
                                align-items: center;                        
                            ">
                                ${App.petDefinition.getCSprite()} You
                            </div>
                            <div>
                                <i class="icon fa-solid fa-thumbs-up"></i> ${hasUploadedPetDef.interactions ?? 0}
                            </div>
                        </div>
                    `,
                },
                {
                    name: 'interact',
                    onclick: handleInteract
                },
                {
                    _ignore: true,
                    name: 'sync character',
                    onclick: handleSyncCharacter,
                },
                {
                    name: `rewards store`,
                    onclick: handleRewardStore,
                },
                {
                    name: `add friend`,
                    onclick: handleFriendSearch,
                },
                {
                    name: '<i class="icon fa-solid fa-home"></i> return home',
                    class: 'back-btn',
                    onclick: handleReturnHome
                },
            ])
        })
    }
    static encounter(spawnInMiddle){
        const despawnTime = App.time + (App.constants.ONE_SECOND * random(15, 30));
        const def = new PetDefinition({
            sprite: NPC_CHARACTERS[0],
            name: '-_-',
            accessories: App.pet.stats.is_revived_once ? ['demon wings'] : [],
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
            x: spawnInMiddle ? '50%' : -50,
            castShadow: false,
            z: App.constants.ACTIVE_PET_Z + 1,
            isDespawning: false,
            onDraw: (me) => {
                if(me.isDespawning){
                    me.opacity -= 0.001 * App.deltaTime;
                    if(me.opacity < 0) me.removeObject()
                }

                if(App.pet.stats.is_revived_once){
                    me.isDespawning = App.time > despawnTime;
                    return;
                }

                me.isDespawning = !App.pet.stats.is_sleeping;
            }
        }); 
        return true;
    }
    static goToVacation(vacationFn){
        App.closeAllDisplays();
        App.toggleGameplayControls(false);
        App.pet.stopMove();
        App.pet.triggerScriptedState('idle', App.INF, 0, true, null);
        Activities.task_foam(
            () => {
                vacationFn();
            },
        )
    }
    static seaVacation(){
        App.pet.stats.is_at_vacation = true;
        App.setScene(App.scene.seaVacation);

        const backgroundMusic = App.playAdvancedSound({
            loop: true, 
            src: 'resources/sounds/vacation_track_01.ogg'
        });

        const end = () => {
            App.toggleGameplayControls(false);
            backgroundMusic.stop();
            Activities.task_foam(() => {
                App.toggleGameplayControls(true);
                App.pet.stats.is_at_vacation = false;
                App.pet.stopScriptedState();
                App.setScene(App.scene.home);
                App.pet.playCheeringAnimation();
                App.save();
            })
            
            // feed all animals before ending
            App.animals?.list?.forEach(a => {
                a.feed?.(100);
                a.lastStatsUpdate = Date.now();
            });
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
    static async cookingGame({
        stirringSpeed = 0.001,
        skipCamera, 
        resultFoodName,
    } = {}){
        App.closeAllDisplays();
        App.pet.triggerScriptedState('idle', App.INF, 0, false);
        App.sendAnalytics('cooking_game', resultFoodName || '');
        Missions.done(Missions.TYPES.cook);
        App.pet.stats.current_expression += 1.5;
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

        let failChance = resultFoodName ? 3 : 25;
        let currentTargetImgIndex = 0;
        App.toggleGameplayControls(false, () => {
            if(currentTargetImgIndex < starObjects.length && !skipCamera){
                App.useWebcam((imgData) => {
                    if((!imgData || imgData == -1)){
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
                            randomFoodName = resultFoodName || randomFromArray(Object.keys(App.definitions.food));
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
                                    const amount = resultFoodName ? random(1, 3) : 1;
                                    App.displayPopup(`${App.petDefinition.name} <br>made x${amount}<br> <b>${randomFoodName}</b>!`, 3000, () => {
                                        end();
                                        App.pet.playCheeringAnimation();
                                        App.pet.stats.current_fun += random(10, 25);
                                        App.addNumToObject(App.pet.inventory.food, randomFoodName, amount);
                                        if(skipCamera) App.definitions.achievements.harvest_cook_x_times.advance();
                                        else App.definitions.achievements.camera_cook_x_times.advance();
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
    static async getDressed(middleFn, onEndFn, cheer){
        App.closeAllDisplays();
        App.toggleGameplayControls(false);

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
        App.pet.playCheeringAnimationIfTrue(cheer, () => {
            App.pet.stats.current_expression += 2;
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
        App.pet.stats.current_discipline += random(1, 2);
        App.toggleGameplayControls(false, () => {
            App.definitions.achievements.pat_x_times.advance();
            Missions.done(Missions.TYPES.pat);
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
            App.reloadScene();
            App.toggleGameplayControls(true);
            App.pet.shadowOffset = 0;
            App.pet.scale = 1;
            App.pet.playCheeringAnimation();
            App.pet.stats.current_expression += 1;
            App.pet.stats.current_endurance += 1;
            App.pet.stats.current_logic += 1;
        });
    }
    static standWork(){
        App.closeAllDisplays();
        App.setScene(App.scene.stand);
        App.definitions.achievements.work_x_times.advance();

        const backgroundMusic = App.playAdvancedSound({
            loop: true, 
            src: 'resources/sounds/work_track_01.ogg'
        });

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
            backgroundMusic.stop();
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
            App.pet.stats.current_discipline += random(0, 5);
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
    }
    static goToClinic(onEndFn){
        App.toggleGameplayControls(false);
        Missions.done(Missions.TYPES.visit_doctor);

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
                    
                    const onEnd = () => {
                        App.setScene(App.scene.home);
                        App.toggleGameplayControls(true);
                        onEndFn?.();
                        App.pet.stats.current_endurance += 1;
                    }

                    if(state == 'very sick' || state == 'sick'){
                        App.pet.triggerScriptedState('shocked', 2000, false, true, () => {
                            App.displayPopup(`${App.pet.petDefinition.name} is ${state}`, 5000, () => App.pet.x = '50%');
                            onEnd();
                        })
                    } else {
                        App.pet.triggerScriptedState('cheering_with_icon', 2000, false, true, () => {
                            App.displayPopup(`${App.pet.petDefinition.name} is ${state}`, 5000, () => App.pet.x = '50%');
                            onEnd();
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

        task_visit_doctor();
    }
    static bathe(){
        App.closeAllDisplays();
        App.setScene(App.scene.bathroom);

        if(App.pet.stats.is_misbehaving){
            App.toggleGameplayControls(false);
            App.pet.playRefuseAnimation(() => {
                App.setScene(App.scene.home);
                App.toggleGameplayControls(true);
            });
            return;
        }

        Missions.done(Missions.TYPES.use_bath);
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
                    Object2d.animations.pulseScale(me, foamSpeed, 0.01);
                }
            })
            foams.push(foam);

            if(foams.length >= 10){
                foams.forEach(f => f.removeObject());
                App.toggleGameplayControls(false);
                App.pet.stopScriptedState();
            }

            App.pet.stats.current_cleanliness += 25;
            App.pet.stats.current_discipline += random(1, 3);
            App.playSound(`resources/sounds/ui_click_03.ogg`, true);
        });

        const bathClippedObject = new Object2d({
            img: App.scene.bathroom.image,
            x: 0, y: 0, z: 19,
            clip: [
                [38, 51],
                [38, 68],
                [81, 68],
                [81, 51],
            ]
        })

        App.pet.stopMove();
        App.pet.x = '64%';
        App.pet.y = '64%';
        App.pet.triggerScriptedState('idle', App.INF, 0, true, () => {
            App.pet.x = '50%';
            App.pet.y = '100%';
            bathClippedObject.removeObject();
            App.pet.playCheeringAnimation(() => {
                App.setScene(App.scene.home);
                App.toggleGameplayControls(true);
            });
        });
    }
    static poop(force){
        App.closeAllDisplays();
        App.setScene(App.scene.bathroom);
        App.toggleGameplayControls(false);
        
        if(!force && App.pet.stats.current_bladder > App.pet.stats.max_bladder / 2){ // more than half
            App.pet.playRefuseAnimation(() => {
                App.setScene(App.scene.home);
                App.toggleGameplayControls(true);
            });
            return;
        }

        Missions.done(Missions.TYPES.use_toilet);
        App.definitions.achievements.use_toilet_x_times.advance();

        App.pet.needsToiletOverlay.hidden = false;
        App.pet.stats.current_bladder = App.pet.stats.max_bladder;
        App.pet.stats.current_logic += 2;
        App.pet.stats.current_discipline += random(2, 10);
        if(App.petDefinition.lifeStage <= PetDefinition.LIFE_STAGE.child && !force) {
            // make pet potty trained if used toilet more than 2 to 5 times and is baby/child
            if(++App.pet.stats.used_toilet > random(2, 5)){
                App.pet.stats.is_potty_trained = true;
            }
        }
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
    static wedding(otherPetDef = App.getRandomPetDef()){
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

        const heartParticleSpawner = setInterval(() => Activities.task_floatingHearts(), 500);
        const heartSpawner = setInterval(() => {
            new Object2d({
                img: 'resources/img/misc/wedding_heart_01.png',
                x: 0, y: 0, scale: 0, opacity: 0.95,
                composite: 'color-burn',
                onDraw: (me) => {
                    me.scale += 0.00115 * App.deltaTime;
                    me.opacity -= 0.0005 * App.deltaTime;
                    if(me.opacity <= 0) me.removeObject();
                }
            })
        }, 1000);

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

                let parentA = App.petDefinition,
                    parentB = otherPetDef;

                App.petDefinition = App.getPetDefFromParents(parentA, parentB);

                App.pet.stopMove();

                App.setScene(App.scene.home);

                App.pet = App.createActivePet(App.petDefinition);

                clearInterval(heartParticleSpawner);
                clearInterval(heartSpawner);
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

        App.pet = App.createActivePet(App.petDefinition);
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
            otherPetDefs.push(App.getRandomPetDef(App.petDefinition.lifeStage));
        }

        const otherPets = otherPetDefs.slice(0, 3).map(def => new Pet(def));
        
        const table = new Object2d({
            img: 'resources/img/misc/table_01.png',
            x: 28,
            y: 68,
            z: App.constants.ACTIVE_PET_Z - 0.1
        });
        const cake = new Object2d({
            img: 'resources/img/misc/cake_01.png',
            x: 39,
            y: 58,
            z: App.constants.ACTIVE_PET_Z - 0.1
        });

        otherPets.forEach((pet, i) => {
            pet.stopMove();
            pet.targetX = 20;
            pet.x = -10 * i;
            switch(i){
                case 0:
                    pet.targetX = 50;
                    pet.targetY = 65;
                    break;
                case 1:
                    pet.targetX = 12;
                    pet.targetY = 65;
                    // pet.z = App.constants.ACTIVE_PET_Z - 0.05;
                    break;
                case 2:
                    pet.targetX = 5;
                    pet.targetY = 85;
                    pet.z = App.constants.ACTIVE_PET_Z - 0.05;
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

                    App.sendAnalytics('age_up', App.petDefinition.lifeStage);
                });
            });
        });
    }
    static redecorRoom(callbackFn){
        App.toggleGameplayControls(false);
        App.definitions.achievements.redecor_x_times.advance();
        App.pet.stats.current_expression += 1;

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
                App.setScene(App.currentScene, true);
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
                callbackFn?.();
            });
        }

        task_otherPetMoveIn();
    }
    static inviteGiveGift(otherPetDef){
        App.setScene(App.scene.home);
        App.toggleGameplayControls(false);
        let otherPet = new Pet(otherPetDef);
        App.definitions.achievements.give_gifts_x_times.advance();
        Missions.done(Missions.TYPES.gift);

        const wantedFriendDef = App.petDefinition.friends[App.pet.stats.current_want.item];
        App.petDefinition.checkWant(otherPetDef == wantedFriendDef, App.constants.WANT_TYPES.playdate)

        otherPet.stopMove();
        otherPet.x = '100%';
        App.pet.stopMove();
        App.pet.x = 10;

        const gift = new Object2d({
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
            // gift.y += 10;
            otherPet.triggerScriptedState('moving', App.INF, false, true, null, () => {
                gift.x = otherPet.x + 10;
            });
            otherPet.targetX = 120;
            App.pet.inverted = true;
            App.pet.triggerScriptedState('blush', 3000, null, true, () => {
                otherPet.stopScriptedState();
                App.pet.x = '50%';
                App.pet.stats.current_fun += 55;
                App.pet.stats.current_expression += 2;
                App.pet.stats.current_logic += 0.5;
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
        
        const backgroundMusic = App.playAdvancedSound({
            loop: true, 
            src: 'resources/sounds/work_track_01.ogg'
        });

        const dynamicBackground = new Object2d({
            img: 'resources/img/background/house/office_01.png',
            x: 0, y: 0,
            spritesheet: {
                cellSize: App.drawer.bounds.width,
                cellNumber: 2,
                rows: 1,
                columns: 3
            },
            onDraw: (me) => Object2d.animations.cycleThroughFrames(me, 250, true),
        })

        App.toggleGameplayControls(false, () => {
            App.pet.stopScriptedState();
        });


        App.pet.stopMove();
        App.pet.inverted = true;
        App.pet.x = '53%';
        App.pet.y = '78%';
        const startTime = Date.now();
        App.pet.triggerScriptedState('eating', 200000, false, true, () => {
            backgroundMusic.stop();
            dynamicBackground.removeObject();
            let elapsedTime = Math.round((Date.now() - startTime) / 1000);
            Activities.task_endWork(elapsedTime, Math.round(elapsedTime / 2.5));
        }, (me) => {
            if(random(0, 50)) return;
            me.setState( randomFromArray(['eating', 'sitting']) );
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
    static goToWalkwayMall(){
        App.toggleGameplayControls(false, () => {
            App.pet.stopScriptedState();
        });
        App.setScene(App.scene.walkway);
        Missions.done(Missions.TYPES.visit_mall);

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
        Missions.done(Missions.TYPES.visit_market);

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
    static invitePlaydate(otherPetDef, scene, onEndFn){
        App.setScene(scene ?? App.scene.home);
        App.toggleGameplayControls(false);
        otherPetDef.increaseFriendship(8);
        let otherPet = new Pet(otherPetDef);
        Missions.done(Missions.TYPES.playdate);

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
                App.pet.stats.current_fun += 30;
                switch(random(0, 2)){
                    case 0: App.pet.stats.current_expression += 2; break;
                    case 1: App.pet.stats.current_endurance += 2; break;
                    case 2: App.pet.stats.current_logic += 2; break;
                }
                App.pet.statsManager();
                App.drawer.removeObject(otherPet);
                App.pet.playCheeringAnimationIfTrue(App.pet.hasMoodlet('amused'), () => {
                    onEndFn?.();
                    App.toggleGameplayControls(true);
                    App.setScene(App.scene.home);
                });
            });
        }

        task_otherPetMoveIn();
    }
    static goToPark(otherPetDef, onEndFn){
        if(!otherPetDef){
            if(random(1, 100) <= 60){
                otherPetDef = App.getRandomPetDef(App.petDefinition.lifeStage);
                Missions.done(Missions.TYPES.find_park_friend);
            }
        } else {
            const wantedFriendDef = App.petDefinition.friends[App.pet.stats.current_want.item];
            App.petDefinition.checkWant(otherPetDef == wantedFriendDef, App.constants.WANT_TYPES.playdate)
        }
        App.pet.x = '50%';
        App.setScene(App.scene.park);
        App.toggleGameplayControls(false, () => App.pet.stopScriptedState());
        App.pet.speedOverride = 0.025;

        let otherPet;
        if(otherPetDef){
            otherPet = new Pet(otherPetDef, {
                x: '75%', speedOverride: random(15, 35) * 0.001,
            });
            otherPet.triggerScriptedState('playing', 10000, null, true, false, Pet.scriptedEventDrivers.playing.bind({pet: otherPet}));

            otherPet.nextRandomTargetSelect = 0;
            App.petDefinition.addFriend(otherPetDef, 1);
            otherPetDef.increaseFriendship();
        }
        
        const onEnd = () => {
            App.toggleGameplayControls(false);
            App.pet.x = '50%';
            App.pet.stats.current_fun += 15;
            App.pet.stats.current_endurance += 0.5;
            App.pet.statsManager();
            App.pet.playCheeringAnimationIfTrue(App.pet.hasMoodlet('amused'), () => {
                App.setScene(App.scene.home);
                App.toggleGameplayControls(true);
                onEndFn?.();
            });
            if(otherPet) App.drawer.removeObject(otherPet);
            App.pet.speedOverride = false;
        }

        App.pet.triggerScriptedState('playing', 10000, null, true, onEnd, Pet.scriptedEventDrivers.playing.bind({pet: App.pet}));
    }


    // games
    static async dogWashingGame(){
        App.closeAllDisplays();
        App.petDefinition.checkWant(true, App.constants.WANT_TYPES.minigame);
        App.sendAnalytics('minigame_dog_washing');
        App.setScene(App.scene.animalBathroom);
        App.toggleGameplayControls(false);
        App.pet.stopMove();
        App.pet.x = '35%';
        App.pet.y = '82%';
        App.pet.inverted = true;
        App.pet.triggerScriptedState('idle_side', App.INF, null, true);
        let remainingTime = 10;
        let score = 0;

        // ui
        const buttonSizePx = 64;

        const screen = App.displayEmpty();
        screen.style.background = 'transparent';
        screen.innerHTML = `
            <div class="mini-game-ui flex align-center justify-between">
                <div class="flex align-center">
                    <i style="margin-right: 4px;" class="fa-solid fa-stopwatch icon"></i>
                    <div id="timeRemaining">
                        <span class="opacity-half">${remainingTime}</span>
                    </div>
                </div>
                <div class="flex align-center">
                    <i style="margin-right: 4px;" class="fa-solid fa-hands-wash icon"></i>
                    <div id="score">${score}</div>
                </div>
            </div>
            <button style="width: ${buttonSizePx}px; height: ${buttonSizePx}px" class="dog-washing-button">
                <i class="fa-solid fa-hands-wash fa-2x"></i>
            </button>
        `;
        const washActionButton = screen.querySelector('.dog-washing-button');
        const repositionAction = () => {
            const bounds = {
                width: washActionButton.parentElement.clientWidth - buttonSizePx - 2,
                height: washActionButton.parentElement.clientHeight - buttonSizePx - 2
            }
            const position = {
                x: random(0, bounds.width),
                y: random(0, bounds.height),
            }
            washActionButton.style.top = `${position.x}px`;
            washActionButton.style.left = `${position.y}px`;
        }
        repositionAction();

        const onEndFn = () => {
            screen.close();
            animal.removeObject();
            App.pet.y = '100%';
            const moneyWon = Math.floor(score * 1.7);
            const hasWon = score > 18;
            if(hasWon){
                App.definitions.achievements.perfect_minigame_petgroom_win_x_times.advance();
            }
            Activities.task_winMoneyFromArcade({
                amount: moneyWon,
                hasWon: hasWon,
                happiness: score * 1.2,
            })
        }

        let timerFn;

        const animal = new Animal(App.getRandomAnimalDef('dog'));
        animal.triggerScriptedState('sitting', App.INF, null, true);
        animal.y = '82%';
        animal.x = '65%';
        const advanceProgress = () => {
            if(!timerFn){
                timerFn = setInterval(() => {
                    remainingTime--;
                    if(remainingTime <= 0){
                        remainingTime = 0;
                        clearInterval(timerFn);
                        onEndFn();
                        return;
                    }
                    screen.querySelector('#timeRemaining').textContent = remainingTime;
                }, 1000);
                screen.querySelector('#timeRemaining').textContent = remainingTime;
            }

            const foam = new Object2d({
                img: 'resources/img/misc/foam_single.png',
                x: (animal.x - 6) + random(-4, 4), 
                y: (animal.y - 18) + random(-4, 4), 
                scale: random(5, 10) * 0.1, opacity: 1, z: 10,
                onDraw: (me) => {
                    Object2d.animations.flip(me);
                    Object2d.animations.bob(me);
                    Object2d.animations.pulseScale(me, 0.1, 0.01);
                    me.scale -= 0.0005 * App.deltaTime;
                    me.opacity -= 0.0005 * App.deltaTime;
                    if(me.opacity <= 0) me.removeObject();
                }
            })
            score++;
            screen.querySelector('#score').textContent = score;
        }

        washActionButton.onclick = () => {
            repositionAction();
            advanceProgress();
        }
    }
    static async plantMatchingGame(){
        App.petDefinition.checkWant(true, App.constants.WANT_TYPES.minigame);
        App.sendAnalytics('minigame_plant_matching');

        const getRandomPlant = () => 
            randomFromArray(Object.keys(App.definitions.plant))
        const appendNonRepeatedPlant = (list = []) => {
            let newPlant;
            while(true){
                newPlant = getRandomPlant();
                if(!list.includes(newPlant)){
                    break;
                }
            }
            const newList = [...list, newPlant];
            return newList;
        }
        const getListOfNonRepeatedPlants = (list = [], length = 4) => {
            let newList = [...list];
            for(let i = 0; i < length; i++){
                newList = appendNonRepeatedPlant(newList);
            }
            return newList;
        }


        App.closeAllDisplays();
        App.setScene(App.scene.arcade);
        App.toggleGameplayControls(false);
        App.pet.stopMove();
        App.pet.x = '50%';
        App.pet.triggerScriptedState('idle', App.INF, null, true);
        
        // main list
        const targetList = getListOfNonRepeatedPlants([], 4);
        const selectionLists = targetList.map(item => {
            return shuffleArray(getListOfNonRepeatedPlants([item], 3));
        })

        const mainListUI = App.display2xGrid(targetList.map((name, index) => ({
            name: `
                ${Plant.getCSprite(name, Plant.AGE.grown, 'x2 blink')}
                <span class="absolute-fullscreen m">${index + 1}</span>
            `,
            class: 'disabled',
        })))

        await App.wait(4000);
        mainListUI.close();

        App.displayPopup(`Wait...`, 1000);
        await App.wait(1000);
        App.displayPopup('Go!', 1000);
        await App.wait(1000);

        const userSelectedList = [];
        const advanceProgress = async (name) => {
            userSelectedList.push(name);
            const correctChoices = userSelectedList.reduce((sum, current, currentIndex) => checkIndex(current, currentIndex) ? sum + 1 : sum, 0);

            const latestIndex = userSelectedList.length - 1;
            const isCorrect = checkIndex(name, latestIndex);

            if(isCorrect) setTimeout(() => App.playSound(`resources/sounds/ui_click_03.ogg`, true));

            App.displayPopup( isCorrect ? `Correct ${App.getIcon('check')}` : `Incorrect ${App.getIcon('times')}`, 1000 );
            await App.wait(1000);

            if(userSelectedList.length === targetList.length){
                App.displayPopup(`${correctChoices}/${targetList.length}`, 3000);
                await App.wait(2000);
                App.closeAllDisplays();

                if(correctChoices === targetList.length){
                    App.definitions.achievements.perfect_minigame_cropmatch_win_x_times.advance();
                }

                const moneyWon = Math.max((correctChoices - 1) * 25, 0);
                Activities.task_winMoneyFromArcade({
                    amount: moneyWon,
                    happiness: moneyWon / 5,
                    hasWon: Boolean(moneyWon)
                })
            }
        }
        const checkIndex = (name, index) => targetList[index] === name;

        selectionLists
            .slice()
            .reverse()
            .forEach((list, index) => {
                const currentList = App.display2xGrid(
                    list.map((name) => ({
                        name: Plant.getCSprite(name, Plant.AGE.grown, 'x2'),
                        onclick: () => {
                            advanceProgress(name);
                        }
                    }))
                )
                
                const counterElement = UI.create({
                    componentType: 'div',
                    className: 'absolute-fullscreen pointer-events-none flex-container',
                    parent: currentList,
                    children: [
                        {
                            textContent: Math.abs((index + 1) - targetList.length) + 1,
                            className: 'surface-stylized inner-padding'
                        }
                    ]
                })
            })
        
    }
    static barTimingGame(){
        App.closeAllDisplays();
        App.toggleGameplayControls(false);
        App.petDefinition.checkWant(true, App.constants.WANT_TYPES.minigame);
        App.sendAnalytics('minigame_bar_timing');
        App.setScene(App.scene.arcade_game01);

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
            cursorCurrentPos += cursorSpeed * App.deltaTime;
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

            if(round === 3){
                setTimeout(() => {
                    screen.close();
                    App.onDraw = null;
                    if(roundsWin === 3){
                        App.definitions.achievements.perfect_minigame_rodrush_win_x_times.advance();
                    }
                    Activities.task_winMoneyFromArcade({
                        amount: moneyWon,
                        happiness: roundsWin * 10,
                        hasWon: roundsWin >= 2
                    })
                }, 500);
            } else {
                setTimeout(() => {
                    reset(0.15);
                    cursorSpeed = round === 1 ? 0.27 : 0.37;
                }, 500);
            }
        }
    }
    static fallingStuffGame(){
        App.closeAllDisplays();
        App.setScene(App.scene.park);
        App.toggleGameplayControls(false);
        App.petDefinition.checkWant(true, App.constants.WANT_TYPES.minigame);
        App.sendAnalytics('minigame_falling_stuff');
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
                    const isCurrentFaulty = random(0, 3) == 1;
                    const projectileObject = new Object2d({
                        parent: spawnerObject,
                        img: isCurrentFaulty ? 'resources/img/misc/falling_poop.png' : 'resources/img/misc/heart_particle_01.png',
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
                                score(isCurrentFaulty);
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
                <div class="flex-container mini-game-ui">
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
            if(moneyWon >= App.definitions.achievements.perfect_minigame_catch_win_x_gold.required){
                App.definitions.achievements.perfect_minigame_catch_win_x_gold.advance();
            }
            Activities.task_winMoneyFromArcade({
                amount: moneyWon,
                hasWon: moneyWon > 30,
                happiness: moneyWon / 6,
            })
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
        App.sendAnalytics('minigame_mimic');

        const opponentPetDef = new PetDefinition({
            name: 'park_game_npc',
            sprite: 'resources/img/character/chara_175b.png',
        });

        const opponentPet = new Pet(opponentPetDef, {x: '70%'});
        
        let totalRounds = 3, playedRounds = 0, roundsWon = 0;

        const reset = () => {
            if(playedRounds >= totalRounds){
                opponentPet.removeObject();
                App.setScene(App.scene.arcade_game01);
                const moneyWon = roundsWon * random(20, 30);
                if(roundsWon === totalRounds){
                    App.definitions.achievements.perfect_minigame_mimic_win_x_times.advance();
                }
                Activities.task_winMoneyFromArcade({
                    amount: moneyWon,
                    happiness: roundsWon * 15,
                    hasWon: roundsWon !== 0,
                })
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
    static parkRngGame(){
        /* unused */
        App.closeAllDisplays();
        App.setScene(App.scene.park);
        App.toggleGameplayControls(false);
        App.petDefinition.checkWant(true, App.constants.WANT_TYPES.minigame);
        App.sendAnalytics('minigame_park_rng');

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

    // school
    static async school_ExpressionGame({onEndFn, maxRounds = 3} = {}){
        App.closeAllDisplays();
        App.setScene(App.scene.music_classroom);
        App.pet.stopMove();
        App.pet.triggerScriptedState('idle', App.INF, 0, true);
        App.sendAnalytics('school_minigame_expression');

        App.pet.x = '50%';
        App.pet.y = '36%';

        const screen = UI.empty();
        document.querySelector('.screen-wrapper').appendChild(screen);
        screen.innerHTML = `
        <div class="flex flex-dir-col justify-between height-100p width-full" style="position: absolute; top: 0; left: 0;">
            <div class="mini-game-ui flex align-center justify-between">
                <div class="flex align-center">
                    <i style="margin-right: 4px;" class="fa-solid fa-stopwatch icon"></i>
                    <div id="round">
                        <span class="opacity-half">${0}</span>
                    </div>
                </div>
                <div class="flex align-center">
                    <i style="margin-right: 4px;" class="fa-solid fa-star icon"></i>
                    <div id="score">${0}</div>
                </div>
            </div>
            <div class="simon-says pointer-events-none">
                <div id="green" class="simon-says-button"></div>
                <div id="red" class="simon-says-button"></div>
                <div id="yellow" class="simon-says-button"></div>
                <div id="blue" class="simon-says-button"></div>
                <div class="simon-says-indicator"></div>
            </div>
        </div>
        `;

        let playerInputBuffer = [];
        let round = 0, wonRounds = 0;

        const container = screen.querySelector('.simon-says');
        const buttons = screen.querySelectorAll('#green, #red, #yellow, #blue');
        const [green, red, yellow, blue] = buttons;
        buttons.forEach((button, index) => {
            button.playSound = () => App.playSound(`resources/sounds/note_${index + 1}.mp3`, true);
            button.onclick = () => {
                setTimeout(() => button.playSound());
                playerInputBuffer.push(button);
            }
        })

        const updateUI = () => {
            screen.querySelector('#round').textContent = `(${Math.max(round, 1)}/${maxRounds})`;
            screen.querySelector('#score').textContent = wonRounds;
        }
        updateUI();

        const endFn = () => {
            screen.remove();
            App.pet.y = '100%';
            onEndFn?.(wonRounds);
            Activities.task_winSkillPointFromSchool({
                amount: wonRounds,
                hasWon: wonRounds >= 2,
                icon: App.getIcon('special:expression'),
            })
        }

        const initSequence = async (turns = 3) => {
            round++;
            updateUI();
            container.classList.add('pointer-events-none');
            const sequence = new Array(turns).fill(null).map(() => randomFromArray([...buttons]));
            playerInputBuffer = [];

            for(let button of sequence){
                button.classList.add('active');
                button.playSound();
                await App.wait(500);
                button.classList.remove('active');
                await App.wait(500);
            }

            container.classList.remove('pointer-events-none');
            const hasWon = await new Promise(resolve => {
                const interval = setInterval(() => {
                    if(!playerInputBuffer.length) return;
                    const playerInputLastIndex = playerInputBuffer.length - 1;
                    if(playerInputBuffer.at(playerInputLastIndex) !== sequence.at(playerInputLastIndex)){
                        resolve(false);
                        clearInterval(interval);
                    } else if(playerInputBuffer.length === sequence.length){
                        resolve(true);
                        clearInterval(interval);
                    }
                }, 16)
            })
            container.classList.add('pointer-events-none');
            if(hasWon) {
                container.classList.add('win');
                wonRounds++;
                updateUI();
            }
            else container.classList.add('lose');
            setTimeout(() => {
                if(round < maxRounds){
                    container.classList.remove('win');
                    container.classList.remove('lose');
                }
                setTimeout(() => {
                    if(round < maxRounds) initSequence(turns + 1);
                    else endFn();
                }, 1000);
            }, 1000)
        }

        setTimeout(() => {
            initSequence();
        }, 1000)
    }
    static async school_ExpressionGameX2(){
        App.closeAllDisplays();
        App.setScene(App.scene.music_classroom);
        App.pet.stopMove();
        App.pet.triggerScriptedState('idle', App.INF, 0, true);

        let lastSpawnTime = 0;
        

        App.toggleGameplayControls(false, () => {});

        const otherPet = new Pet(App.getRandomPetDef(App.petDefinition.lifeStage));
        otherPet.triggerScriptedState('idle', App.INF, 0, true);

        const spawnNoteBlocks = (x = '25%') => {
            const mainPetBoundingBox = App.pet.getBoundingBox();
            const height = random(6, 32);
            new Object2d({
                solidColor: {
                    r: 255,
                    g: 0,
                    b: 150
                },
                width: 6,
                height,
                z: App.constants.ACTIVE_PET_Z - 0.1,
                x,
                y: App.drawer.bounds.height + height,
                onDraw: (me) => {
                    if(typeof me.y === 'string') return;
                    me.y -= 0.1 * App.deltaTime;
                    if(me.y < -height){
                        me.removeObject();
                        return
                    }

                    const blockTop = me.y;
                    const petBottom = mainPetBoundingBox.y + mainPetBoundingBox.height;

                    if (blockTop <= petBottom) {
                        const overlap = petBottom - blockTop;
                        if(App.mouse.isDown){
                            me.solidColor = { r: 0, g: 255, b: 55 };
                        } else {
                            me.solidColor = { r: 255, g: 0, b: 0 };
                        }
                        me.height = Math.max(0, me.height - overlap);
                        me.y += overlap;
                    }
                }
            })
        }

        const driverFn = App.registerOnDrawEvent(() => {
            if(App.time > lastSpawnTime + 800){
                lastSpawnTime = App.time;
                spawnNoteBlocks(randomFromArray(['25%', '75%']));
            }
            App.pet.setState(App.mouse.isDown ? 'jumping' : 'idle');
        })

        // positions
        App.pet.x = '25%';
        App.pet.y = '36%';
        otherPet.x = '75%';
        otherPet.y = '36%';
    }
    static async school_ExpressionGameX({onEndFn} = {}){
        App.closeAllDisplays();
        App.setScene(App.scene.classroom);
        App.pet.x = '75%';
        App.pet.y = '100%';
        App.pet.triggerScriptedState('idle', App.INF, 0, true);
        App.toggleGameplayControls(false);

        let timeLeft = 30, currentScore = 0;

        const screen = UI.empty();
        document.querySelector('.screen-wrapper').appendChild(screen);
        screen.innerHTML = `
        <div class="flex flex-dir-col justify-between height-100p width-full" style="position: absolute; top: 0; left: 0;">
            <div class="mini-game-ui flex align-center justify-between">
                <div class="flex align-center">
                    <i style="margin-right: 4px;" class="fa-solid fa-stopwatch icon"></i>
                    <div id="time-left">
                        <span class="opacity-half">${timeLeft}</span>
                    </div>
                </div>
                <div class="flex align-center">
                    <div id="score">${currentScore}</div>
                </div>
            </div>
            <div class="mix-colors-container">
                <button id="reset" class="generic-btn stylized justify-center">
                    <div class="color" style="background: white;"></div>
                </button>
                <button id="red" class="generic-btn stylized justify-center">
                    <div class="color" style="background: red;"></div>
                </button>
                <button id="yellow" class="generic-btn stylized justify-center">
                    <div class="color" style="background: yellow;"></div>
                </button>
                <button id="blue" class="generic-btn stylized justify-center">
                    <div class="color" style="background: blue;"></div>
                </button>
            </div>
        </div>
        `;

        const playerColorTaps = {
            red: 0,
            yellow: 0,
            blue: 0
        }
        const COLORS = {
            red:   { r: 255, g: 0,   b: 0   },
            blue:  { r: 0,   g: 0,   b: 255 },
            yellow:{ r: 255, g: 255, b: 0   }
        };
        const mixColors = (taps) => {
            let total = taps.red + taps.blue + taps.yellow;
            if (total === 0) return { r: 255, g: 255, b: 255 }; // default black

            let r = (
                COLORS.red.r * taps.red +
                COLORS.blue.r * taps.blue +
                COLORS.yellow.r * taps.yellow
            ) / total;

            let g = (
                COLORS.red.g * taps.red +
                COLORS.blue.g * taps.blue +
                COLORS.yellow.g * taps.yellow
            ) / total;

            let b = (
                COLORS.red.b * taps.red +
                COLORS.blue.b * taps.blue +
                COLORS.yellow.b * taps.yellow
            ) / total;

            return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
        }
        const getColorDistance = (c1, c2) => {
            return Math.sqrt(
                Math.pow(c1.r - c2.r, 2) +
                Math.pow(c1.g - c2.g, 2) +
                Math.pow(c1.b - c2.b, 2)
            );
        }

        const targetPainting = new Object2d({
            solidColor: {
            r: random(0, 255),
            g: random(0, 255),
            b: random(0, 255)
        },
            width: 24,
            height: 24,
            x: '25%',
            y: '50%',
        })
        const playerPainting = new Object2d({
            solidColor: {
                r: 255,
                g: 255,
                b: 255,
            },
            width: 24,
            height: 24,
            x: '75%',
            y: '50%',
            onDraw: (me) => {
                me.solidColor = mixColors(playerColorTaps);
                // console.log(playerColorTaps, me.solidColor)
            }
        })

        const uiUpdateInterval = setInterval(() => {
            screen.querySelector('#score').textContent = getColorDistance(playerPainting.solidColor, targetPainting.solidColor).toFixed(1);
        }, 100)

        const [resetButton, redButton, yellowButton, blueButton] = screen.querySelectorAll('#reset, #red, #yellow, #blue');
        redButton.onclick = () => playerColorTaps.red ++;
        yellowButton.onclick = () => playerColorTaps.yellow ++;
        blueButton.onclick = () => playerColorTaps.blue ++;
        resetButton.onclick = () => {
            playerColorTaps.red = 0;
            playerColorTaps.yellow = 0;
            playerColorTaps.blue = 0;
        }
    }
    static async school_EnduranceGame({onEndFn} = {}){
        App.closeAllDisplays();
        App.setScene(App.scene.classroom);
        App.pet.stopMove();
        App.pet.x = '50%';
        App.pet.y = '100%';
        App.pet.triggerScriptedState('idle', App.INF, 0, true);
        App.sendAnalytics('school_minigame_endurance');

        let jumpingRope;
        let currentScore = 0, canScore = false, timeLeft = 10, firstJump = false;

        const screen = UI.empty();
        document.querySelector('.screen-wrapper').appendChild(screen);
        screen.innerHTML = `
        <div class="width-full pointer-events-none" style="position: absolute; bottom: 0; left: 0;">
            <div class="mini-game-ui flex align-center justify-between">
                <div class="flex align-center">
                    <i style="margin-right: 4px;" class="fa-solid fa-stopwatch icon"></i>
                    <div id="time-left">
                        <span class="opacity-half">${timeLeft}</span>
                    </div>
                </div>
                <div class="flex align-center">
                    <div id="score">${currentScore}</div>
                </div>
            </div>
        </div>
        `;

        const checkProgress = (isScoring) => {
            if(isScoring){
                firstJump = true;
                if(canScore){
                    currentScore++;
                    setTimeout(() => App.playSound('resources/sounds/ui_click_03.ogg', true));
                    updateUI();
                }
            }
            if(timeLeft <= 0){
                App.toggleGameplayControls(false);
                jumpingRope?.removeObject();
                screen.remove();
                App.pet.stopScriptedState();
                App.pet.y = '100%';
                const points = clamp(Math.floor(currentScore / 3), 0, 3);
                onEndFn?.(points);
                Activities.task_winSkillPointFromSchool({
                    amount: points,
                    hasWon: points > 1,
                    icon: App.getIcon('special:endurance'),
                })
            }
        }

        jumpingRope = new Object2d({
            img: 'resources/img/misc/jumping_rope_01.png',
            x: 0, y: 0, z: App.pet.z + 0.1,
            spritesheet: {
                cellSize: App.drawer.bounds.width,
                cellNumber: 1,
                rows: 1,
                columns: 4
            },
            onDraw: (me) => {
                const speed = 135;
                const previousAnimFrame = me.spritesheet.cellNumber;
                Object2d.animations.cycleThroughFrames(me, speed, true);
                const currentAnimFrame = me.spritesheet.cellNumber;
                if(currentAnimFrame === 1){
                    me.z = App.constants.ACTIVE_PET_Z + 0.1;
                } else if(currentAnimFrame >= me.spritesheet.rows * me.spritesheet.columns){
                    me.z = App.constants.ACTIVE_PET_Z - 0.1;
                }

                if(previousAnimFrame !== currentAnimFrame && currentAnimFrame === 3 && me.z > App.pet.z){
                    App.pet.setState('jumping');
                    App.pet.filter = 'brightness(1.2)';
                    canScore = true;
                    setTimeout(() => {
                        App.pet.filter = '';
                        canScore = false;
                        if(!jumpingRope || jumpingRope.isRemoved) return;
                        App.pet.setState('idle');
                    }, speed);
                }
            }
        })

        const updateUI = () => {
            screen.querySelector('#time-left').textContent = timeLeft;
            screen.querySelector('#score').textContent = currentScore;
        }

        let timerFn = setInterval(() => {
            if(!firstJump) return;
            timeLeft -= 1;
            if(timeLeft <= 0) {
                clearInterval(timerFn);
                checkProgress()
            }
            updateUI();
        }, 1000);

        App.toggleGameplayControls(false, () => {
            App.pet.z = App.constants.ACTIVE_PET_Z + 0.2;
            checkProgress(true);
            App.pet.jump(0.28, false, () => {
                App.pet.triggerScriptedState('idle', App.INF, 0, true)
                App.pet.z = App.constants.ACTIVE_PET_Z;
            })
        })
    }
    static async school_CardShuffleGame({
        activeCards = 2, 
        maxCards = 12, 
        onEndFn, 
        swapDelay = 400, 
        maxSwaps,
        maxAttempts = 4,
        skillIcon,
    } = {}){
        App.sendAnalytics(`school_minigame_shuffle${skillIcon}`);
        App.pet.triggerScriptedState('idle', App.INF, null, true);
        const screen = App.displayEmpty();
        screen.innerHTML = `
        <div class="height-100p school-logic-container">
            <div class="mini-game-ui flex hidden">
                <span id="counter">0</span>
                <span>/${maxAttempts}</span>
            </div>
            <div class="cards-container">

            </div>
        </div>
        `;

        const cardsContainer = screen.querySelector('.cards-container');
        const miniGameUI = screen.querySelector('.mini-game-ui');
        const counter = screen.querySelector('.mini-game-ui #counter');

        let cards;
        let totalTurnedCards = 0, correctCards = 0;
        const handleCardSelect = (card) => {
            if(!card.classList.contains('turning')) return; // already turned
            totalTurnedCards++;
            card.classList.remove('turning');
            if(card.isTarget){
                correctCards++;
            }
            App.playSound(card.isTarget ? 'resources/sounds/ui_click_03.ogg' : 'resources/sounds/ui_click_01.ogg', true);
            
            const animationDelay = 350;
            counter.textContent = totalTurnedCards;

            cardsContainer.classList.add('disabled');
            setTimeout(() => {
                cardsContainer.classList.remove('disabled');
            }, animationDelay);
            setTimeout(() => {
                if(correctCards === activeCards){
                    screen.close();
                    onEndFn?.(3);
                    Activities.task_winSkillPointFromSchool({
                        amount: 3,
                        hasWon: true,
                        icon: App.getIcon(skillIcon),
                    })
                } else if(totalTurnedCards >= maxAttempts){
                    miniGameUI.classList.add('hidden');
                    cardsContainer.classList.add('disabled');
                    cards.forEach(card => card.classList.remove('turning'))
                    setTimeout(() => {
                        screen.close();
                        onEndFn?.(0);
                        Activities.task_winSkillPointFromSchool({
                            amount: 0,
                            hasWon: false,
                            icon: App.getIcon(skillIcon),
                        })
                    }, 2000);
                }
            }, animationDelay);
        }

        let swappedIndex = 2;
        const swapCards = (a, b) => {
            const aLeft = a.style.left;
            const aTop = a.style.top;

            const bLeft = b.style.left;
            const bTop = b.style.top;

            a.style.left = bLeft;
            a.style.top = bTop;
            b.style.left = aLeft;
            b.style.top = aTop;

            a.style.zIndex = swappedIndex;
            b.style.zIndex = ++swappedIndex;

            App.playSound('resources/sounds/ui_click_04.ogg', true);
        }
        const generateCards = (activeAmount, maxAmount) => {
            const randomPositions = new Array(maxAmount)
                .fill(null)
                .map((_, i) => ( {index: i, weight: Math.random()} ))
                .sort((a, b) => a.weight - b.weight)
                .map(item => item.index)
                .slice(0, activeAmount);
            const cards = [];
            for(let i = 0; i < maxAmount; i++){
                const isTarget = randomPositions.includes(i);
                const card = UI.ce({
                    componentType: 'div',
                    className: 'card flex flex-center disabled',
                    parent: cardsContainer,
                    innerHTML: isTarget ? App.getIcon('star', true) : `<span class="opacity-third">${App.getIcon('poop', true)}</span>`,
                    isTarget,
                    onclick: () => {
                        handleCardSelect(card);
                    }
                })
                const maxCols = 4;
                const gap = 10;
                const col = i % maxCols;
                const row = Math.floor(i / maxCols);
                card.style.position = 'absolute';
                card.style.top = `${-100 * (col + 1)}px`;
                setTimeout(() => card.style.top = `${6 + row * (card.clientHeight + gap)}px`);
                card.style.left = `${8 + col * (card.clientWidth + gap)}px`;
                cards.push(card);
            }
            return cards;
        }
        cards = generateCards(activeCards, maxCards);
        await App.wait(3000);
        for(let i = 0; i < cards.length; i++){
            await App.wait(150);
            const card = cards.at(i);
            card.classList.add('turning')
        }
        await App.wait(1000);

        // swapping
        const scrambledCards = shuffleArray([
            ...shuffleArray(cards).slice(0, maxSwaps ?? cards.length/1.5), 
            cards.find(c => c.isTarget)
        ]);
        for(let i = 0; i < scrambledCards.length; i++){
            const card = scrambledCards.at(i);
            let target;
            while(true){
                target = randomFromArray(scrambledCards);
                if(target !== card) break;
            }
            await App.wait(swapDelay);
            swapCards(card, target);
        }
        await App.wait(500);
        cards.forEach(card => card.classList.remove('disabled'))
        miniGameUI.classList.remove('hidden');
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
        let clampedMoneyMade = clamp(moneyMade, 0, 400);
        App.displayPopup(`${App.petDefinition.name} worked for ${elapsedTime} seconds`, 2500, () => {
            if(elapsedTime > 10){
                App.pet.stats.gold += clampedMoneyMade;
            } else clampedMoneyMade = 0;
            App.pet.stats.current_fun -= elapsedTime / 3.5;
            App.pet.stats.current_expression -= 0.5;
            App.pet.stats.current_logic += 3;
            App.displayConfirm(`${App.petDefinition.name} made $${clampedMoneyMade}`, [
                {
                    name: 'ok',
                    onclick: () => {
                        App.setScene(App.scene.home);
                        App.handlers.open_works_list();
                    }
                }
            ]);
        });
        App.toggleGameplayControls(true);
    }
    static task_floatingHearts(num){
        Activities.task_floatingObjects(num, [
            'resources/img/misc/heart_particle_01.png',
            'resources/img/misc/heart_particle_02.png',
        ])
    }
    static task_floatingObjects(num, textures, yRange = [105, 115]){
        if(!num) num = random(1, 4);
        for(let i = 0; i < num; i++){
            let floatSpeed = random(4, 5) * 0.01, 
                swayFloat = 0, 
                swaySpeed = random(2, 20) * 0.001;
            const floatingObject = new Object2d({
                img: randomFromArray(textures),
                z: randomFromArray([0, 100]), 
                x: `${random(0, 100)}%`, 
                y: `${random(yRange[0], yRange[1])}%`
            });
            floatingObject.onDraw = (me) => {
                if(isNaN(me.y)) return;

                me.y -= floatSpeed * App.deltaTime;

                swayFloat += swaySpeed * App.deltaTime;
                me.x += Math.sin(swayFloat) * 2;
                if(me.y < -16) me.removeObject();
            }
        }
    }
    static task_nonSwayingFloatingObjects(num, textures, yRange = [105, 115]){
        if(!num) num = random(1, 4);
        for(let i = 0; i < num; i++){
            const xPosition = ((i / num) * 100) + random(-2, 7);
            let floatSpeed = random(5, 6) * 0.01;
            const floatingObject = new Object2d({
                img: randomFromArray(textures),
                z: randomFromArray([0, 100]), 
                x: `${xPosition}%`, 
                y: `${random(yRange[0], yRange[1])}%`
            });
            floatingObject.onDraw = (me) => {
                if(isNaN(me.y)) return;
                me.y -= floatSpeed * App.deltaTime;
                if(me.y < -16) me.removeObject();
            }
        }
    }
    static task_handleLeavingAnimals(){
        App.animals.list?.forEach(a => a?.handleStatsUpdate?.());
        const leavingAnimals = App.animals.list.filter(a => a.stats.current_happiness <= 0);
        if(leavingAnimals.length){
            App.displayList([
                {
                    name: `
                        these animals left because they were neglected:
                        <br><br>
                        ${leavingAnimals.map(animalDef => (`
                            <span style="color: red;">
                                ${animalDef.getFullCSprite()}${animalDef.name}    
                            </span>
                        `)).join('<br>')}
                    `,
                    type: 'text',
                },
                {
                    name: "When animals lose all happiness, they leave. Take better care of them!",
                    type: 'info',
                }
            ], null, 'neglect!');
            leavingAnimals.forEach(a => {
                App.animals.list.splice(App.animals.list.indexOf(a), 1);
            })
            App.pet.stats.current_fun -= 100;
            App.pet.stats.current_expression -= 2;
        }
    }
    static async task_winSkillPointFromSchool({
            amount = 0, 
            hasWon, 
            npc = 'resources/img/character/chara_175b.png',
            icon,
        } = {}){
        App.closeAllDisplays();
        App.setScene(App.scene.classroom);
        App.toggleGameplayControls(false);
        App.pet.staticShadow = false;

        if(hasWon) Missions.done(Missions.TYPES.earn_school_points);

        const petMain = new TimelineDirector(App.pet);
        const petClerk = new TimelineDirector(new Pet(new PetDefinition({
            name: 'prize giver',
            sprite: npc,
        })));

        petMain.setPosition({x: '75%'});
        petMain.setState('idle')
        petClerk.setPosition({x: '25%'});
        petClerk.setState('idle')
        await TimelineDirector.wait(500);
        const messageBubble = App.displayMessageBubble(`<span class="outlined-icon">${icon}</span>+${amount}`);
        await petMain.bob({maxCycles: 1, animation: 'shocked'});
        if(hasWon){
            setTimeout(() => App.pet.playSound('resources/sounds/cheer_success.ogg', true));
            petMain.setState('cheering_with_icon');
            petClerk.setState('cheering');
        } else {
            setTimeout(() => App.pet.playSound('resources/sounds/task_fail_01.ogg', true));
            petMain.setState('uncomfortable');
            petClerk.setState('mild_uncomfortable');
            App.pet.stats.current_discipline -= random(2, 6);
        }
        await TimelineDirector.wait(3000);

        petMain.release();
        petClerk.remove();

        App.setScene(App.scene.home);
        App.toggleGameplayControls(true);
        UI.clearLastClicked();
        messageBubble.close();
        App.handlers.open_school_activity_list();
    }
    static async task_winMoneyFromArcade({
            amount = 0, 
            happiness, 
            hasWon, 
            npc = 'resources/img/character/chara_175b.png'
        }){
        const moneyBag = new Object2d({
            img: 'resources/img/misc/money_bag_01.png',
            x: '50%', y: '0%', width: 24, height: 24,
            opacity: amount ? 1 : 0,
            targetY: 67,
            onDraw: (me) => me.moveToTarget(0.025),
        })

        App.toggleGameplayControls(false);
        App.pet.staticShadow = false;

        App.pet.stats.gold += amount;
        App.pet.stats.current_fun += happiness ?? (amount / 5);
        if(hasWon) Missions.done(Missions.TYPES.win_game);

        const petMain = new TimelineDirector(App.pet);
        const petClerk = new TimelineDirector(new Pet(new PetDefinition({
            name: 'prize giver',
            sprite: npc,
        })));

        petMain.setPosition({x: '75%'});
        petMain.setState('idle')
        petClerk.setPosition({x: '25%'});
        petClerk.setState('idle')
        await TimelineDirector.wait(1600);
        const messageBubble = App.displayMessageBubble(`$${amount}`);
        await petMain.bob({maxCycles: 1, animation: 'shocked'});
        if(hasWon){
            setTimeout(() => App.pet.playSound('resources/sounds/cheer_success.ogg', true));
            petMain.setState('cheering_with_icon');
            petClerk.setState('cheering');
        } else {
            setTimeout(() => App.pet.playSound('resources/sounds/task_fail_01.ogg', true));
            petMain.setState('uncomfortable');
            petClerk.setState('mild_uncomfortable');
            App.pet.stats.current_discipline -= random(2, 8);
        }
        await TimelineDirector.wait(3000);

        moneyBag.removeObject();
        petMain.release();
        petClerk.remove();

        App.setScene(App.scene.home);
        App.toggleGameplayControls(true);
        UI.clearLastClicked();
        messageBubble.close();
        App.handlers.open_game_list();
    }
}


// timeline animation director
class TimelineDirector {
    registeredDrawEvents = [];
    constructor(actor){
        this.actor = actor;
        this.actor.triggerScriptedState('idle', App.INF, false, true);
        this.actor.stopMove();
    }
    moveTo = ({x, y, speed = 0.15, endState = 'idle'}) => {
        return new Promise(resolve => {
            if(!this.actor) return resolve();

            this.actor.scriptedEventDriverFn = (me) => {
                me.setState(me.isMoving ? 'moving' : endState)
                if(!me.isMoving) {
                    me.speedOverride = false;
                    resolve();
                    me.scriptedEventDriverFn = false;
                }
            };
            if(typeof x === 'string'){
                const percent = parseFloat(x);
                x = App.drawer.getRelativePositionX(percent) - (this.getSize() / 2);
            }
            this.actor.targetX = x;
            this.actor.targetY = y;
            this.actor.speedOverride = speed;
        })
    }
    setPosition = ({x, y}) => {
        if(!this.actor) return;
        if(x) this.actor.x = x;
        if(y) this.actor.y = y;
    }
    setState = (state) => this.actor?.setState?.(state);
    lookAt = (direction) => this.actor && (this.actor.inverted = direction);
    release = () => {
        this.actor.stopScriptedState();
        this.actor = false;
        this.registeredDrawEvents.forEach(e => App.unregisterOnDrawEvent(e));
    }
    remove = () => this.actor?.removeObject();
    getPosition = (axis) => {
        if(axis === 'y') return this.actor?.y;
        return this.actor?.x;
    }
    getSize = () => this.actor?.spritesheet.cellSize;
    bob = ({
        speed = 0.011, 
        strength = 5, 
        maxCycles = 3, 
        animation = 'cheering', 
        landAnimation,
        sound
    } = {}) => {
        if(!landAnimation) landAnimation = animation;
        return new Promise(resolve => {
            if(!this.actor) return resolve();

            const defaultY = this.actor.y;
            const actor = this.actor;

            let animationFloat = 0, 
            currentCycles = 0, 
            cycleCounted = false;

            const drawEvent = App.registerOnDrawEvent(() => {
                if(!actor) App.unregisterOnDrawEvent(drawEvent);

                animationFloat += speed * App.deltaTime;
                const finalAnimationFloat = clamp(Math.sin(animationFloat), 0, 999);
                if(finalAnimationFloat > 0) {
                    cycleCounted = false;
                    actor.setState(animation);
                } else {
                    if(!cycleCounted) {
                        cycleCounted = true;
                        currentCycles++;
                        if(sound) App.playSound(sound, true);
                    }
                    actor.setState(landAnimation);
                    if(currentCycles >= maxCycles){
                        actor.y = defaultY;
                        App.unregisterOnDrawEvent(drawEvent);
                        resolve();
                    }
                }
                actor.y = defaultY - (finalAnimationFloat * strength);
            })

            this.registeredDrawEvents.push(drawEvent);
        })
    }
    think = (...args) => this.actor?.showThought(...args);
    
    static wait = (...args) => App.wait(...args);
}