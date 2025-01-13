export const Definitions = {
    /* MAIN MENU */
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

    /* FOOD AND SNACKS */
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
        "sleep replacement": {
            sprite: 1050,
            hunger_replenish: -25,
            fun_replenish: -20,
            sleep_replenish: 999,
            price: 120,
            type: 'med',
            age: [0, 1, 2],
            isNew: false,
        },
    },

    /* ITEMS */
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

    /* ROOM BACKGROUNDS */
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
            price: 300,
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
            price: 300,
            isNew: false,
        },
        "silky retreat": {
            image: 'resources/img/background/house/ex_01.png',
            price: 0,
            isNew: false,
            onlineShopAccessible: true,
            unlockLikes: 80,
            unlockKey: 'bg_silky_retreat',
        },
        "silky (sky)": {
            image: 'resources/img/background/house/ex_01_fs.png',
            price: 0,
            isNew: false,
            onlineShopAccessible: true,
            unlockLikes: 80,
            unlockKey: 'bg_silky_retreat_sky',
        },
        "astra": {
            image: 'resources/img/background/house/cc_01.png',
            price: 250,
            isNew: false,
        },
        "seafloor": {
            image: 'resources/img/background/house/cc_02.png',
            price: 300,
            isNew: false,
        },
    },

    /* SHELL BACKGROUNDS */
    shell_background: [
        // default shell bg will be the first one here
        {
            image: 'resources/img/ui/shell_background_cloof_01.png',
            name: 'cloofy',
            isNew: false,
            onlineShopAccessible: true,
            unlockLikes: 30,
            unlockKey: 'unlock_cloof_shell_bg',
        },
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

    /* ACCESSORIES */
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
            isNew: false,
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
                        if(!App.isCompanionAllowed()){
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
        'mini band': {
            icon: 'resources/img/accessory/mini_band_01_icon.png',
            image: 'resources/img/accessory/mini_band_01.png',
            front: true,
            price: 200,
            isNew: false,
        },
        'cloof': {
            icon: 'resources/img/accessory/cloof_01.png',
            image_sprite: 'resources/img/accessory/cloof_01.png',
            front: false,
            price: 0,
            isNew: false,
            onlineShopAccessible: true,
            unlockLikes: 50,
            unlockKey: 'unlock_cloof',
            createFn: function(parent){
                const Z = parent.z - 0.0001 || 4.9;
                const spritesheet = {
                    cellSize: 12,
                    rows: 5,
                    columns: 4,
                }
                const cloof = new Object2d({
                    img: 'resources/img/accessory/cloof_01.png',
                    parent: parent,
                    x: 0, y: -999,
                    animationFloatX: 0,
                    animationFloatY: Math.PI,
                    currentPosition: {
                        x: 0, y: 0,
                    },
                    targetPosition: {
                        x: 0, y: 0, nextChangeMs: 0,
                    },
                    onDraw: (me) => {
                        me.animationFloatX = (me.animationFloatX + 0.0035 * App.deltaTime) % App.PI2;
                        me.animationFloatY = (me.animationFloatY + 0.0025 * App.deltaTime) % App.PI2;
                        const additionalMotionX = Math.sin(me.animationFloatX) * 2;
                        const additionalMotionY = Math.sin(me.animationFloatY) * 3;
                        me.x = parent.x + additionalMotionX;
                        me.y = parent.y - 40 - (App.pet.spritesheet.offsetY ?? 0) + additionalMotionY;

                        if(!App.isCompanionAllowed()){
                            me.x = -100;
                            me.y = -100;
                            return;
                        }
                    }
                })

                return cloof;
            }
        }
    },

    /* ACHIEVEMENTS */
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
        not_propose_on_date_x_times: {
            name: 'Heartbreaker',
            description: `Go on successful dates but don't propose!`,
            checkProgress: () => App.getRecord('times_not_proposed') >= 10,
            advance: (amount) => App.addRecord('times_not_proposed', amount),
            getReward: () => {
                App.pet.stats.gold += 300;
                App.displayPopup(`You've received $300!`);
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
    },

    /* MAIL */
    mail: {
        affirmations: [
            [
                "Breaking News: Local Hero Spreads Happiness with Every Step!",
                "Our sources confirm that someone very special (hint: it’s you!) is making the world a better place just by being themselves.",
            ],
            [
                "Forecast: Bright Days Ahead!",
                "The future looks sunny and full of joy for our favorite reader! Keep smiling—good things are coming.",
            ],
            [
                "Exclusive Interview: Experts Agree - You’re Doing Great!",
                "According to experts, small steps lead to big success, and you’re right on track!",
            ],
            [
                "Front Page Scoop: You’re Stronger Than You Think!",
                "Recent studies reveal that strength and courage shine brightly in our favorite reader. Keep going!",
            ],
            [
                "Community Spotlight: Heart of Gold Found Right Here!",
                "In a heartwarming story, we’ve discovered a true gem (that’s you!) spreading kindness everywhere!",
            ],
            [
                "Public Notice: Bravery and Kindness Recognized!",
                "Officials have recognized an extraordinary individual for their courage and kindness—congratulations to you!",
            ],
            [
                "Daily Boost: You’re the Reason Today is Special!",
                "Thanks to your warmth and cheer, today is officially better! Spread those good vibes!",
            ],
            [
                "Good News Today: Happiness Found in Every Small Moment!",
                "Joy is all around, and it’s all thanks to our reader’s incredible attitude. Keep shining!",
            ],
            [
                "You Heard it Here First: Your Journey is Full of Promise!",
                "With every step, you’re creating an amazing story. Stay tuned for more greatness!",
            ],
            [
                "Breaking Headlines: Best Version of You Making Waves!",
                "Readers report sightings of you achieving amazing things! The community is cheering you on!",
            ],
            [
                "Breaking News: Kindness Levels at an All-Time High!",
                "Reports indicate that your actions are filling the world with kindness and positivity. Keep it up!",
            ],
            [
                "Headline Update: Confidence Soars Across the Region!",
                "Sources confirm that your hard work and self-belief are inspiring everyone around you!",
            ],
            [
                "Special Report: You’re the Star of Today’s Story!",
                "Our newsroom agrees—you’re doing incredible things and deserve the spotlight. Shine on!",
            ],
            [
                "Public Announcement: You Make Every Day Better!",
                "Official declarations state that your presence brightens even the dullest moments. Thank you for being you!",
            ],
            [
                "Extra! Extra! You’re Loved More Than Words Can Say!",
                "Breaking hearts in the best way, your compassion and care are unmatched. The world is lucky to have you!",
            ],
            [
                "Front Page: Happiness Found in Your Smile!",
                "Eyewitness accounts reveal that your smile can turn any frown upside down. Keep spreading joy!",
            ],
            [
                "Breaking Alert: Big Achievements Ahead!",
                "Insiders predict that your dedication and effort will lead to amazing accomplishments. Stay on course!",
            ],
            [
                "Daily Highlight: You’re a True Inspiration!",
                "Community leaders have nominated you as a shining example of resilience and hope. Congratulations!",
            ],
            [
                "Forecast: You’re Destined for Greatness!",
                "The stars align, pointing to a future filled with happiness and success for you. Keep going!",
            ],
            [
                "Latest Buzz: You’re the Talk of the Town!",
                "Everyone’s raving about your kindness, courage, and charm. Keep making waves!",
            ],
            [
                "Breaking News: A Bright Future Awaits You!",
                "Top analysts predict that your hard work and positivity are paving the way for wonderful things ahead.",
            ],
            [
                "Spotlight: Your Actions Make the World Shine!",
                "Reports confirm that your efforts bring light and love to everyone around you. Keep shining!",
            ],
            [
                "Breaking News: You Are Enough, Just As You Are!",
                "In a world that can feel overwhelming, your courage to be yourself is truly inspiring. Thank you for being you.",
            ],
            [
                "Headline Spotlight: Your Efforts Matter More Than You Realize!",
                "Even the smallest things you do make a difference. You’re creating ripples of kindness and hope everywhere you go.",
            ],
            [
                "Exclusive Feature: Your Strength is Quietly Changing the World!",
                "We see it—the way you keep moving forward, even when it’s hard. That strength is something to be proud of.",
            ],
            [
                "Front Page Story: You Are Loved More Than You Know!",
                "Sometimes it’s easy to forget, but you are deeply valued and appreciated by those around you. Don’t ever doubt it.",
            ],
            [
                "Breaking Update: You’re Learning and Growing Every Day!",
                "Every challenge you face is shaping you into someone even more incredible. Trust the process—you’re doing great.",
            ],
            [
                "Special Report: Your Kind Heart Makes Life Better!",
                "In a world that needs more love, your compassion is a gift that changes lives. Never underestimate its power.",
            ],
            [
                "Top Story: You’re So Much Stronger Than You Feel Right Now!",
                "It’s okay to have tough days, but remember—your resilience has carried you through so much already. Keep believing in yourself.",
            ],
            [
                "Daily Reminder: You Deserve the Good Things Coming Your Way!",
                "The kindness you’ve shown and the love you’ve shared are coming back to you. Be ready to receive them—you’ve earned it.",
            ],
            [
                "Breaking Alert: Your Voice Matters and So Do You!",
                "The way you think, feel, and express yourself makes the world richer. Your presence is a gift that can’t be replaced.",
            ],
            [
                "Personal Feature: You’re Exactly Where You Need to Be!",
                "Life isn’t a race, and every step you take is part of your unique story. You’re on the right path—trust yourself.",
            ],
            [
                "Headline Scoop: You Have a Light That Guides Others!",
                "Even when you don’t see it, your kindness and warmth inspire those around you. Keep shining—it’s beautiful.",
            ],
            [
                "Forecast: Healing and Happiness Are On the Horizon!",
                "Take it one day at a time. The tough moments are only temporary, and better days are just around the corner.",
            ],
        ],
        news: [
            [
                "Breaking News: The Sunflower Festival is in Full Bloom!",
                "Local critters are buzzing with excitement as fields of sunflowers paint the horizon golden. Perfect for a picnic today!",
            ],
            [
                "Local Hero: Sparky the Squirrel Finds Missing Acorn Stash!",
                "After a week-long search, Sparky proudly declared the missing acorns found. 'I knew they were in the flower pot!' he said.",
            ],
            [
                "Weather Update: Slight Chance of Marshmallow Showers!",
                "Residents are advised to carry cocoa mugs just in case. Experts say it’ll be the sweetest storm of the season.",
            ],
            [
                "Community Spotlight: Mr. Whiskers Wins Pie-Eating Contest!",
                "In a record-breaking feat, Mr. Whiskers devoured 12 strawberry pies. 'I just couldn’t stop!' he shared, covered in crumbs.",
            ],
            [
                "Exclusive: The Glowbugs Host a Nightly Light Show!",
                "Every evening this week, the glowbugs will illuminate the skies with dazzling patterns. Don’t forget to look up!",
            ],
            [
                "Breaking: A New Bakery Opens in Muffin Meadow!",
                "Locals are raving about the honeyberry tarts and freshly baked cinnamon buns. Free samples available all week!",
            ],
            [
                "Headline: Baby Ducks Take Their First Swim!",
                "A group of adorable ducklings paddled across Lilypad Lake today, cheered on by their proud parents. Quack-tastic!",
            ],
            [
                "Public Alert: The Rainbow Bridge Appeared Overnight!",
                "Adventurers report that the rare rainbow bridge is back, connecting Blossom Woods to Starry Hills for a limited time.",
            ],
            [
                "Daily Scoop: Fluffy the Cloud Found in Fun Shapes!",
                "Residents spotted Fluffy resembling a bunny, a heart, and even a teacup. The cloud promises more surprises tomorrow.",
            ],
            [
                "Special Report: Berry Harvest Bigger Than Ever!",
                "Farmers report record-breaking yields of blueberries and raspberries this season. Get your baskets ready for a berry bonanza!",
            ],
            [
                "Top Story: Fuzzy Caterpillar Parade Marches Through Town!",
                "Dozens of fuzzy caterpillars lined up for a parade, waving tiny flags and wiggling with joy. Adorable chaos ensued.",
            ],
            [
                "Exclusive: Moonlight Sparkles Seen in Crystal Cavern!",
                "Night owls exploring Crystal Cavern were treated to a rare light show as moonlight danced on the glittering walls.",
            ],
            [
                "Alert: Bunny Burrow Cafe Hosts Tea Party Today!",
                "A charming tea party featuring carrot cake and dandelion tea is happening at Bunny Burrow Cafe. All critters invited!",
            ],
            [
                "Forecast: Shooting Stars Expected Tonight!",
                "Skywatchers are in for a treat as dozens of shooting stars light up the skies. Make your wishes ready!",
            ],
        ]        
    },

    /* TWEETS */
    tweets: {
        generic: [
            ['Found a crumb, feels like a feast! #TinyTreats', 1, "resources/img/background/house/kitchen_02.png"],
            ['#vibing', 1, null],
            ['#sunny', 1, "resources/img/background/house/beach_01.png"],
            ['Leaf boat ride! Best day ever. #LeafBoat', 2, null],
            ['Nap in a matchbox bed. So cozy! #SmallDreams', 16, "resources/img/background/sky/night.png"],
            ['Danced in a raindrop, got soaked! #RaindropDance', 8, "resources/img/background/sky/rain_01.png"],
            ['Whispered a wish to a dandelion. #Wishes', 10, null],
            ['Tried lifting a pebble, felt strong! #TinyStrength', 1, "resources/img/background/outside/park_02.png"],
            ['Stargazing tonight. Wishes everywhere! #StarrySky', 1, "resources/img/background/sky/night.png"],
            ['A butterfly landed on me! #ButterflyFriends', 2, "resources/img/background/outside/garden_01.png"],
            ['Dewdrop crystal ball. Big adventures ahead! #DewdropVisions', 7, null],
            ['Lost in a grass maze. Tall blades everywhere! #GrassAdventures', 1, "resources/img/background/outside/garden_01.png"],
            ['Shared a berry with an ant. #BerryFeast', 8, "resources/img/background/outside/garden_01.png"],
            ['Woooow!', 7, "resources/img/background/house/online_hub_01.png"],
            ['#Hubchi', 2, "resources/img/background/house/online_hub_01.png"],
            ['Played hide and seek with parents! #TinyGames', 2, "resources/img/background/house/parents_house_01.png"],
            ['Leaf fell on me. Guess I’m a tree now! #TreeLife', 8, "resources/img/background/outside/park_02.png"],
            ['#onthatgrind', 14, "resources/img/background/house/office_01.png"],
            ['Market day! #shopping', 10, "resources/img/background/outside/market_01.png"],
            ['Prices too high! #whatisthis', 7, "resources/img/background/outside/market_01.png"],
            ['Looking for a cute #headband!', 8, "resources/img/background/outside/market_01.png"],
            ['Lost again! Done with gaming. #hategaming', 6, "resources/img/background/house/arcade_01.png"],
            ['I’m just better! #gaming', 2, "resources/img/background/house/arcade_01.png"],
            ['Won again! #ilovegaming', 2, "resources/img/background/house/arcade_01.png"],
            ['Chasing rainbows today! #ColorChase', 1, "resources/img/background/outside/garden_01.png"],
            ['Found a ladybug! So lucky. #LuckyDay', 2, null],
            ['Tiny picnic in the grass. Life is good! #TinyPicnic', 8, "resources/img/background/outside/park_02.png"],
            ['Jumping puddles! Let’s get wet. #PuddleJump', 10, "resources/img/background/sky/rain_01.png"],
            ['The sky’s full of clouds. So dreamy. #CloudyDay', 1, "resources/img/background/sky/afternoon.png"],
            ['Met a squirrel today. Best friends now! #SquirrelSquad', 7, "resources/img/background/outside/park_02.png"],
            ['Feeling a bit sick!', 4, "resources/img/background/outside/hospital_01.png"],
            ['Checkout my stand!', 2, "resources/img/background/outside/stand_01.png"],
            ['I’m a leaf warrior! #LeafBattle', 1, "resources/img/background/outside/park_02.png"],
            ['Discovered a secret path in the woods. #MysteryTrail', 7, "resources/img/background/outside/park_02.png"],
            ['Feeling like a cloud. Soft and fluffy. #CloudVibes', 8, "resources/img/background/sky/afternoon.png"]
        ]
    }
}