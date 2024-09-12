App.definitions = {
    main_menu: [
        {
            name: '<i class="fa-solid fa-line-chart"></i>',
            name: '<i class="fa-solid fa-dashboard"></i>',
            onclick: () => {
                App.handlers.open_stats_menu();
            }
        },
        {
            name: '<i class="fa-solid fa-cutlery"></i>',
            onclick: () => {
                App.handlers.open_feeding_menu();
            }
        },
        {
            name: '<i class="fa-solid fa-bath"></i>',
            onclick: () => {
                // App.handlers.clean();
                App.handlers.open_bathroom_menu();
            }
        },
        {
            name: `<i class="fa-solid fa-house-chimney-user"></i>`,
            onclick: () => {
                App.handlers.open_care_menu();
            }
        },
        {
            name: '<i class="fa-solid fa-door-open"></i>',
            onclick: () => {
                App.handlers.open_activity_list();
            }
        },
        {
            name: '<i class="fa-solid fa-box-open"></i>',
            onclick: () => {
                App.handlers.open_stuff_menu();
            }
        },
        {
            name: '<i class="fa-solid fa-mobile-alt"></i>',
            onclick: () => {
                App.handlers.open_phone();
            }
        },
        {
            name: `<i class="fa-solid fa-gear"></i>`,
            onclick: () => {
                App.handlers.open_settings();
            }
        },
    ],
    food: {
        // foods
        "bread": {
            sprite: 542,
            hunger_replenish: 15,
            fun_replenish: 0,
            health_replenish: 2,
            price: 2,
            age: [1, 2],
        },
        "pizza": {
            sprite: 515,
            hunger_replenish: 40,
            fun_replenish: 5,
            health_replenish: -5,
            price: 10,
            age: [1, 2],
        },
        "hamburger": {
            sprite: 2,
            hunger_replenish: 40,
            fun_replenish: 10,
            health_replenish: -15,
            price: 15,
            age: [1, 2],
        },
        "heart beef": {
            sprite: 881,
            hunger_replenish: 30,
            fun_replenish: 5,
            health_replenish: -5,
            price: 8,
            age: [1, 2],
        },
        "crab dish": {
            sprite: 456,
            hunger_replenish: 50,
            fun_replenish: 5,
            health_replenish: 10,
            price: 20,
            age: [2],
        },
        "paster": {
            sprite: 734,
            hunger_replenish: 25,
            fun_replenish: 0,
            health_replenish: 0,
            price: 8,
            age: [1, 2],
        },
        "king burger": {
            sprite: 710,
            hunger_replenish: 100,
            fun_replenish: 50,
            health_replenish: -40,
            price: 40,
            age: [2],
        },
        "sushi": {
            sprite: 605,
            hunger_replenish: 15,
            fun_replenish: 10,
            health_replenish: 5,
            price: 12,
            age: [1, 2],
        },
        "sushi set": {
            sprite: 169,
            hunger_replenish: 40,
            fun_replenish: 10,
            health_replenish: 20,
            price: 30,
            age: [2],
        },
        "sunny savory soup": {
            sprite: 584,
            hunger_replenish: 25,
            fun_replenish: 0,
            health_replenish: 25,
            price: 15,
            age: [1, 2],
        },
        "crabstew": {
            sprite: 635,
            hunger_replenish: 25,
            fun_replenish: 0,
            health_replenish: 30,
            price: 20,
            age: [1, 2],
        },
        "spicy dragon pot": {
            sprite: 719,
            hunger_replenish: 30,
            fun_replenish: 0,
            health_replenish: 10,
            price: 20,
            age: [1, 2],
        },
        "fish dish": {
            sprite: 575,
            hunger_replenish: 35,
            fun_replenish: 5,
            health_replenish: 20,
            price: 22,
            age: [1, 2],
        },
        "forest fungi stew": {
            sprite: 638,
            hunger_replenish: 10,
            fun_replenish: 0,
            health_replenish: 20,
            price: 7,
            age: [1, 2],
        },
        "star nuggies": {
            sprite: 707,
            hunger_replenish: 15,
            fun_replenish: 10,
            health_replenish: 0,
            price: 8,
            age: [1, 2],
        },
        "tacos": {
            sprite: 767,
            hunger_replenish: 20,
            fun_replenish: 5,
            health_replenish: 0,
            price: 10,
            age: [1, 2],
        },
        "sambooseh": {
            sprite: 860,
            hunger_replenish: 10,
            fun_replenish: 0,
            health_replenish: 0,
            price: 5,
            age: [1, 2],
        },
        "pie": {
            sprite: 518,
            hunger_replenish: 15,
            fun_replenish: 0,
            health_replenish: 0,
            price: 10,
            age: [1, 2],
        },
        "lasagna": {
            sprite: 797,
            hunger_replenish: 20,
            fun_replenish: 10,
            health_replenish: -5,
            price: 20,
            age: [1, 2],
        },
        "red bowol": {
            sprite: 611,
            hunger_replenish: 30,
            fun_replenish: 5,
            health_replenish: 2,
            price: 25,
            age: [1, 2],
        },
        "noodles": {
            sprite: 557,
            hunger_replenish: 18,
            fun_replenish: 2,
            health_replenish: 0,
            price: 15,
            age: [1, 2],
        },
        "drumstick": {
            sprite: 460,
            hunger_replenish: 20,
            fun_replenish: 2,
            health_replenish: 4,
            price: 10,
            age: [1, 2],
        },
        "veggiesoup": {
            sprite: 463,
            hunger_replenish: 23,
            fun_replenish: -15,
            health_replenish: 10,
            price: 12,
            age: [0, 1, 2],
        },
        "cheese n breakfast": {
            sprite: 364,
            hunger_replenish: 25,
            fun_replenish: 5,
            health_replenish: 10,
            price: 13,
            age: [1, 2],
        },
        "breadrolls": {
            sprite: 554,
            hunger_replenish: 20,
            fun_replenish: 5,
            health_replenish: 2,
            price: 20,
            age: [1, 2],
        },
        "sweetbread": {
            sprite: 713,
            hunger_replenish: 15,
            fun_replenish: 0,
            health_replenish: 10,
            price: 10,
            age: [1, 2],
        },
        "meatballs": {
            sprite: 951,
            hunger_replenish: 30,
            fun_replenish: 0,
            health_replenish: 0,
            price: 15,
            age: [1, 2],
        },
        "xiao long bao": {
            sprite: 602,
            hunger_replenish: 10,
            fun_replenish: 0,
            health_replenish: 5,
            price: 7,
            age: [1, 2],
        },
        "spaghetti": {
            sprite: 219,
            hunger_replenish: 30,
            fun_replenish: 3,
            health_replenish: 0,
            price: 5,
            age: [1, 2],
        },
        "telesushi": {
            sprite: 163,
            hunger_replenish: 45,
            fun_replenish: 5,
            health_replenish: 15,
            price: 25,
            age: [1, 2],
        },
        "s-special dish": {
            sprite: 506,
            hunger_replenish: 28,
            fun_replenish: 0,
            health_replenish: 10,
            price: 20,
            age: [1, 2],
        },

    
        // treats
        "koluche": {
            sprite: 1030,
            hunger_replenish: 25,
            fun_replenish: 5,
            health_replenish: 5,
            price: 8,
            age: [1, 2],
            type: 'treat',
        },
        "jelly": {
            sprite: 1013,
            hunger_replenish: 8,
            fun_replenish: 20,
            health_replenish: 0,
            price: 10,
            age: [1, 2],
            type: 'treat',
        },
        "chocolate pie": {
            sprite: 1010,
            hunger_replenish: 10,
            fun_replenish: 8,
            health_replenish: 0,
            price: 8,
            age: [1, 2],
            type: 'treat',
        },
        "lollipop": {
            sprite: 1033,
            hunger_replenish: 5,
            fun_replenish: 35,
            health_replenish: 0,
            price: 5,
            age: [0, 1, 2],
            type: 'treat',
        },
        "vanilla icecream": {
            sprite: 1024,
            hunger_replenish: 10,
            fun_replenish: 30,
            health_replenish: 0,
            price: 10,
            age: [0, 1, 2],
            type: 'treat',
        },
        "strawberry icecream": {
            sprite: 902,
            hunger_replenish: 10,
            fun_replenish: 30,
            health_replenish: 0,
            price: 10,
            age: [0, 1, 2],
            type: 'treat',
        },
        "scoped icecream": {
            sprite: 1007,
            hunger_replenish: 15,
            fun_replenish: 30,
            health_replenish: 0,
            price: 12,
            age: [0, 1, 2],
            type: 'treat',
        },
        "snacks and bits": {
            sprite: 1001,
            hunger_replenish: 15,
            fun_replenish: 20,
            health_replenish: 0,
            price: 15,
            age: [1, 2],
            type: 'treat',
        },
        "lemonade": {
            sprite: 971,
            hunger_replenish: 5,
            fun_replenish: 25,
            health_replenish: 0,
            price: 10,
            age: [1, 2],
            type: 'treat',
        },
        "cupcake": {
            sprite: 974,
            hunger_replenish: 15,
            fun_replenish: 30,
            health_replenish: 0,
            price: 10,
            age: [0, 1, 2],
            type: 'treat',
        },
        "cappuccino": {
            sprite: 878,
            hunger_replenish: 2,
            fun_replenish: 25,
            health_replenish: 0,
            price: 7,
            age: [1, 2],
            type: 'treat',
        },
        "strawberry donut": {
            sprite: 954,
            hunger_replenish: 10,
            fun_replenish: 15,
            health_replenish: 0,
            price: 5,
            age: [0, 1, 2],
            type: 'treat',
        },
        "choco cake slice": {
            sprite: 998,
            hunger_replenish: 10,
            fun_replenish: 10,
            health_replenish: 0,
            price: 5,
            age: [1, 2],
            type: 'treat',
        },
        "cotton candy": {
            sprite: 995,
            hunger_replenish: 15,
            fun_replenish: 25,
            health_replenish: 0,
            price: 12,
            age: [0, 1, 2],
            type: 'treat',
        },
        "cream icepack": {
            sprite: 488,
            hunger_replenish: 10,
            fun_replenish: 25,
            health_replenish: 0,
            price: 10,
            age: [1, 2],
            type: 'treat',
        },
        "bunny mooko": {
            sprite: 450,
            hunger_replenish: 20,
            fun_replenish: 30,
            health_replenish: 0,
            price: 14,
            age: [0, 1, 2],
            type: 'treat',
        },
        "paloodeh": {
            sprite: 378,
            hunger_replenish: 5,
            fun_replenish: 25,
            health_replenish: 0,
            price: 8,
            age: [1, 2],
            type: 'treat',
        },



        // groc
        /* "broccoli": {
            sprite: 632,
            hunger_replenish: 15,
            fun_replenish: 0,
            health_replenish: 10,
            price: 3,
            age: [1, 2],
        }, */



        // other
        "milk": {
            sprite: 1036,
            hunger_replenish: 50,
            fun_replenish: 10,
            price: 0,
            age: [0],
        },
        "medicine": {
            sprite: 1050,
            hunger_replenish: 0,
            fun_replenish: -20,
            health_replenish: 999,
            price: 20,
            type: 'med',
            age: [0, 1, 2],
        },
    },
    item: {
        "foxy": {
            sprite: 1,
            fun_replenish: 20,
            price: 50,
            interaction_time: 12000,
            interruptable: true,
        },
        "dumble": {
            sprite: 2,
            fun_replenish: 10,
            price: 100
        },
        "music player": {
            sprite: 3,
            fun_replenish: 20,
            price: 65
        },
        "ball": {
            sprite: 4,
            fun_replenish: 30,
            price: 35,
            interaction_time: 100000,
            interruptable: true,
        },
        "smartphone": {
            sprite: 5,
            fun_replenish: 80,
            price: 350,
            interaction_time: 100000,
            interruptable: true,
        },
        "magazine": {
            sprite: 6,
            fun_replenish: 10,
            price: 20,
            interaction_time: 60000,
            interruptable: true,
        },
        "microphone": {
            sprite: 7,
            fun_replenish: 20,
            price: 75,
            interaction_time: 60000,
            interruptable: true,
        },
    },
    room_background: {
        "blue": {
            image: 'resources/img/background/house/02.png',
            price: 200,
            isNew: false,
        },
        "peachy": {
            image: 'resources/img/background/house/03.png',
            price: 250,
            isNew: false,
        },
        "princess": {
            image: 'resources/img/background/house/04.png',
            price: 350,
            isNew: false,
        },
        "futura": {
            image: 'resources/img/background/house/05.png',
            price: 200,
            isNew: false,
        },
        "rainbow": {
            image: 'resources/img/background/house/06.png',
            price: 250,
            isNew: false,
        },
        "wooden": {
            image: 'resources/img/background/house/07.png',
            price: 350,
            isNew: false,
        },
    },
    shell_background: [
        {
            image: 'resources/img/ui/shell_background_07.png',
            isNew: false,
        },
        {
            image: 'resources/img/ui/shell_background_08.png',
            isNew: false,
        },
        {
            image: 'resources/img/ui/shell_background_09.png',
            isNew: false,
        },
        {
            image: 'resources/img/ui/shell_background_10.png',
            isNew: false,
        },
        {
            image: 'resources/img/ui/shell_background_11.png',
            isNew: false,
        },
        {
            image: 'resources/img/ui/shell_background_02.png',
        },
        {
            image: 'resources/img/ui/shell_background_01.png',
        },
        {
            image: 'resources/img/ui/shell_background_03.png',
        },
        {
            image: 'resources/img/ui/shell_background_04.png',
        },
        {
            image: 'resources/img/ui/shell_background_05.png',
        },
        {
            image: 'resources/img/ui/shell_background_06.png',
        },
    ],
    accessories: {
        "crown": {
            image: 'resources/img/accessory/crown_01.png',
            front: true,
            price: 250,
        },
        'wings': {
            image: 'resources/img/accessory/wings_01.png',
            front: false,
            price: 350,
        },
        'witch hat': {
            image: 'resources/img/accessory/witch_hat_01.png',
            front: true,
            price: 300,
        },
        'frooties': {
            image: 'resources/img/accessory/frooties_01.png',
            front: false,
            price: 200,
        },
        'secretary': {
            icon: 'resources/img/accessory/secretary_01_icon.png',
            image_sprite: 'resources/img/accessory/secretary_01.png',
            front: false,
            price: 500,
            isNew: true,
            createFn: function(parent){
                const Z = parent.z - 0.1 || 4.9;
                const spritesheet = {
                    cellSize: 12,
                    rows: 5,
                    columns: 4,
                }
                const secretary = new Object2d({
                    parent: parent,
                    x: -100, y: -100,
                    animationFloat: 0,
                    bodyAnimationFloat: 0,
                    movementMult: -10,
                    targetMovementMult: 1,
                    movementMultDirection: 1,
                    lastScene: App.currentScene,
                    allowedRooms: [
                        App.scene.home, 
                        App.scene.bathroom, 
                        App.scene.kitchen,
                        App.scene.graveyard,
                        App.scene.parentsHome
                    ],
                    currentPosition: {
                        x: 0, y: 0,
                    },
                    targetPosition: {
                        x: 0, y: 0, nextChangeMs: 0,
                    },
                    onDraw: (me) => {
                        if(App.lastTime > me.targetPosition.nextChangeMs){
                            me.targetPosition.nextChangeMs = App.lastTime + random(250, 2000);
                            const followsParent = random(0, 1);
                            if(followsParent && !isNaN(parent.x) && !isNaN(parent.y)){
                                me.targetPosition.x = parent.x;
                                me.targetPosition.y = parent.y - 40;
                            } else {
                                me.targetPosition.x = random(10, 90);
                                me.targetPosition.y = random(-10, 50);
                            }
                            if(!random(0, 2)){
                                me.movementMultDirection = -1 * me.movementMultDirection;
                            }
                            // me.movementMultDirection = followsParent ? 1 : -1;
                        }

                        
                        if(me.lastScene != App.currentScene){
                            me.lastScene = App.currentScene;
                            me.currentPosition.y = -40;
                        }

                        if(!me.allowedRooms.includes(App.currentScene)){
                            me.x = -100;
                            me.y = -100;
                            return;
                        }

                        me.animationFloat += (0.005 * App.nDeltaTime) % App.PI2;
                        me.bodyAnimationFloat += (0.0025 * App.nDeltaTime) % App.PI2;
                        me.currentPosition.x = lerp(me.currentPosition.x, me.targetPosition.x, 0.0005 * App.nDeltaTime);
                        me.x = me.currentPosition.x;
                        me.currentPosition.y = lerp(me.currentPosition.y, me.targetPosition.y, 0.0005 * App.nDeltaTime);
                        me.y = me.currentPosition.y + Math.sin(me.animationFloat);

                        const xDiff = Math.abs(me.currentPosition.x - me.targetPosition.x);
                        const yDiff = Math.abs(me.currentPosition.y - me.targetPosition.y);
                        me.targetMovementMult = Math.max((xDiff + yDiff) * 0.1, 1);
                        me.movementMult = lerp(me.movementMult, me.targetMovementMult * me.movementMultDirection, 0.01 * App.nDeltaTime);
                    }
                })

                /* body */
                const handleBody = (me, i) => {
                    const spread = 6 + (secretary.movementMult * 0.5);
                    const basePosition = {
                        x: me.parent.x,
                        y: me.parent.y
                    }
                    const localPosition = {
                        x: 0, y: 0,
                    }

                    switch(i){
                        case (0):
                            localPosition.x = -spread;
                            localPosition.y = -spread;

                            break;
                        case (1):
                            localPosition.x = -spread;
                            localPosition.y = spread;
                            me.rotation = 180;
                            me.inverted = true;
                            break;
                        case (2):
                            localPosition.x = spread;
                            localPosition.y = -spread;
                            me.inverted = true;
                            break;
                        case (3):
                            localPosition.x = spread;
                            localPosition.y = spread;
                            me.rotation = 180;
                            break;
                    }

                    localPosition.y += Math.sin(secretary.bodyAnimationFloat + i) * 0.55;
                    localPosition.y += Math.sin(secretary.bodyAnimationFloat + i) * 0.55;

                    // me.rotation = i * 90;

                    me.x = localPosition.x + basePosition.x;
                    me.y = localPosition.y + basePosition.y;
                }
                for(let i = 0; i < 4; i++){
                    new Object2d({
                        parent: secretary,
                        img: App.checkResourceOverride(this.image_sprite),
                        x: 0, y: 0, z: Z,
                        animationFloat: 0,
                        spritesheet: {
                            ...spritesheet, cellNumber: 1,
                        },
                        onDraw: (me) => handleBody(me, i),
                        // composite: "darken"
                    })
                }

                /* body */
                const handleArrows = (me, i) => {
                    const spread = 13 + secretary.movementMult;
                    const basePosition = {
                        x: me.parent.x,
                        y: me.parent.y
                    }
                    const localPosition = {
                        x: 0, y: 0
                    }

                    const offsetMult = 10, strength = 0.8 + (-secretary.movementMult * 0.25);
                    switch(i){
                        case (0):
                            localPosition.x = -spread;
                            localPosition.y = -spread;
                            me.inverted = true;
                            localPosition.x += Math.sin(secretary.animationFloat - i * offsetMult) * strength;
                            localPosition.y += Math.sin(secretary.animationFloat - i * offsetMult) * strength;
                            break;
                        case (1):
                            localPosition.x = -spread;
                            localPosition.y = spread;
                            me.inverted = true;
                            me.rotation = -90;
                            localPosition.x += Math.sin(secretary.animationFloat - i * offsetMult) * strength;
                            localPosition.y -= Math.sin(secretary.animationFloat - i * offsetMult) * strength;
                            break;
                        case (2):
                            localPosition.x = spread;
                            localPosition.y = -spread;
                            localPosition.x -= Math.sin(secretary.animationFloat - i * offsetMult) * strength;
                            localPosition.y += Math.sin(secretary.animationFloat - i * offsetMult) * strength;
                            break;
                        case (3):
                            localPosition.x = spread;
                            localPosition.y = spread;
                            me.rotation = 90;
                            localPosition.x -= Math.sin(secretary.animationFloat - i * offsetMult) * strength;
                            localPosition.y -= Math.sin(secretary.animationFloat - i * offsetMult) * strength;
                            break;
                    }

                    localPosition.y += Math.sin(secretary.bodyAnimationFloat + i) * 0.55;
                    localPosition.y += Math.sin(secretary.bodyAnimationFloat + i) * 0.55;

                    me.x = localPosition.x + basePosition.x;
                    me.y = localPosition.y + basePosition.y;
                }
                for(let i = 0; i < 4; i++){
                    new Object2d({
                        parent: secretary,
                        img: App.checkResourceOverride(this.image_sprite),
                        x: 0, y: 0, z: Z,
                        spritesheet: {
                            ...spritesheet, cellNumber: 3,
                        },
                        onDraw: (me) => handleArrows(me, i),
                        // composite: "darken"
                    })
                }

                /* head */
                new Object2d({
                    parent: secretary,
                    img: App.checkResourceOverride(this.image_sprite),
                    x: 0, y: 0, z: Z,
                    spritesheet: {
                        ...spritesheet, cellNumber: 2,
                    },
                    onDraw: (me) => {
                        me.x = me.parent.x;
                        me.y = me.parent.y;
                        me.rotation = Math.sin(secretary.bodyAnimationFloat) * 45 * secretary.movementMult;
                    },
                    // composite: "darken"
                })

                /* light */
                new Object2d({
                    parent: secretary,
                    img: App.checkResourceOverride(this.image_sprite),
                    x: 0, y: 0, z: Z - 0.1,
                    spritesheet: {
                        ...spritesheet, cellNumber: 4,
                    },
                    onDraw: (me) => {
                        me.x = me.parent.x;
                        me.y = me.parent.y;
                        // me.rotation = Math.sin(secretary.bodyAnimationFloat) * 45 * secretary.movementMult;
                        me.scale = 1.3 + Math.abs(Math.sin(secretary.animationFloat) * 0.1);
                        me.opacity = Math.abs(Math.sin(secretary.bodyAnimationFloat) * 0.3);
                    },
                    composite: "lighten",
                    opacity: 0.1,
                })

                return secretary;
            }
        },
    },
    achievements: {
        pat_x_times: {
            name: 'Pat! Pat! Pat!',
            description: 'Pet your buddy 100 times!',
            checkProgress: () => App.getRecord('times_patted') >= 100,
            advance: (amount) => App.addRecord('times_patted', amount),
            getReward: () => {
                App.pet.stats.gold += 150;
                App.displayPopup(`You've received $150!`);
            }
        },
        use_toilet_x_times: {
            name: 'Toilet Master',
            description: 'Have your pets go to the toilet 5 times',
            checkProgress: () => App.getRecord('times_used_toilet') >= 5,
            advance: (amount) => App.addRecord('times_used_toilet', amount),
            getReward: () => {
                App.pet.stats.gold += 150;
                App.displayPopup(`You've received $150!`);
            }
        },
        marry_x_times: {
            name: 'Serial Marrier',
            description: 'Marry off your pets 5 times',
            checkProgress: () => App.getRecord('times_married') >= 5,
            advance: (amount) => App.addRecord('times_married', amount),
            getReward: () => {
                App.pet.stats.gold += 1000;
                App.displayPopup(`You've received $1000!`);
            }
        },
        birthday_x_times: {
            name: 'Happy Birthday!',
            description: 'Age up your pet',
            checkProgress: () => App.getRecord('times_had_birthday') >= 1,
            advance: (amount) => App.addRecord('times_had_birthday', amount),
            getReward: () => {
                App.pet.stats.gold += 150;
                App.displayPopup(`You've received $150!`);
            }
        },
        redecor_x_times: {
            name: 'Interior Designer',
            description: 'Redecor your room',
            checkProgress: () => App.getRecord('times_redecorated_background') >= 1,
            advance: (amount) => App.addRecord('times_redecorated_background', amount),
            getReward: () => {
                App.pet.stats.gold += 100;
                App.displayPopup(`You've received $100!`);
            }
        },
        give_gifts_x_times: {
            name: 'Giftspreader',
            description: 'Give 5 gifts to your friends',
            checkProgress: () => App.getRecord('times_gave_gift') >= 5,
            advance: (amount) => App.addRecord('times_gave_gift', amount),
            getReward: () => {
                App.pet.stats.gold += 500;
                App.displayPopup(`You've received $500!`);
            }
        },
        work_x_times: {
            name: 'Workaholic',
            description: 'Work for 10 shifts',
            checkProgress: () => App.getRecord('times_worked') >= 10,
            advance: (amount) => App.addRecord('times_worked', amount),
            getReward: () => {
                App.pet.stats.gold += 350;
                App.displayPopup(`You've received $350!`);
            }
        },
        go_to_vacation_x_times: {
            name: 'Sightsee-er',
            description: 'Take a vacation!',
            checkProgress: () => App.getRecord('times_went_on_vacation') >= 1,
            advance: (amount) => App.addRecord('times_went_on_vacation', amount),
            getReward: () => {
                App.pet.stats.gold += 150;
                App.displayPopup(`You've received $150!`);
            }  
        },

        // minigames
        perfect_minigame_rodrush_win_x_times: {
            name: 'Rod Rush Pro',
            description: 'Win with perfect score in Rod Rush game 10 times',
            checkProgress: () => App.getRecord('times_perfected_rodrush_minigame') >= 10,
            advance: (amount) => App.addRecord('times_perfected_rodrush_minigame', amount),
            getReward: () => {
                App.pet.stats.gold += 500;
                App.displayPopup(`You've received $500!`);
            }
        },
        perfect_minigame_catch_win_x_gold: {
            name: 'Money Catcher',
            description: 'Win $125 in single game of Catch!',
            required: 125,
            checkProgress: () => App.getRecord('won_x_gold_in_catch_minigame') >= 1,
            advance: () => App.addRecord('won_x_gold_in_catch_minigame', 1),
            getReward: () => {
                App.pet.stats.gold += 400;
                App.displayPopup(`You've received $400!`);
            }
        },
        perfect_minigame_mimic_win_x_times: {
            name: 'Perfect Imitator',
            description: 'Win with perfect score in Mimic game 10 times!',
            checkProgress: () => App.getRecord('times_perfected_mimic_minigame') >= 10,
            advance: (amount) => App.addRecord('times_perfected_mimic_minigame', amount),
            getReward: () => {
                App.pet.stats.gold += 500;
                App.displayPopup(`You've received $500!`);
            }
        },
    }
}