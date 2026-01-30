App.definitions = (() => {
    const _ls = PetDefinition.LIFE_STAGE;
    return  {
        /* ICONS */
        icons: {
            "gold": {
                icon: "sack-dollar",
                color: "orange"
            },
            "expression": {
                icon: "wand-magic-sparkles",
                color: "pink"
            },
            "logic": {
                icon: "brain",
                color: "lightblue"
            },
            "endurance": {
                icon: "dumbbell",
                color: "lime"
            },
            "food": {
                icon: "drumstick-bite",
                color: "orange"
            },
            "sleep": {
                icon: "moon",
                color: "white"
            },
            "fun": {
                icon: "smile",
                color: "#b8ff0d"
            },
            "discipline": {
                icon: "scale-balanced",
                color: "#ffb1ee"
            },
        },
        /* THEMES */
        themes: [
            'default', 
            'pardis', 
            'sunset', 
            'uni', 
            'color lavender',
            'color pink',
            'color azure',
            'color gray',
            'color red', 
            'color blue',
            'color green',
            'color purple',
            'color black',
            'color slateblue',
        ],
        /* MAIN MENU */
        main_menu: [
            {
                id: 'stats',
                name: '<i class="fa-solid fa-dashboard"></i>',
                onclick: () => {
                    App.handlers.open_stats_menu();
                }
            },
            {
                id: 'feeding',
                name: '<i class="fa-solid fa-cutlery"></i>',
                onclick: () => {
                    App.handlers.open_feeding_menu();
                }
            },
            {
                id: 'bath',
                name: '<i class="fa-solid fa-bath"></i>',
                onclick: () => {
                    // App.handlers.clean();
                    App.handlers.open_bathroom_menu();
                }
            },
            {
                id: 'care',
                name: `<i class="fa-solid fa-house-chimney-user"></i>`,
                onclick: () => {
                    App.handlers.open_care_menu();
                }
            },
            {
                id: 'activity',
                name: '<i class="fa-solid fa-door-open"></i>',
                onclick: () => {
                    App.handlers.open_activity_list();
                }
            },
            {
                id: 'stuff',
                name: '<i class="fa-solid fa-box-open"></i>',
                onclick: () => {
                    App.handlers.open_stuff_menu();
                }
            },
            {
                id: 'phone',
                name: '<i class="fa-solid fa-mobile-alt"></i>',
                onclick: () => {
                    App.handlers.open_phone();
                }
            },
            {
                id: 'settings',
                name: `<i class="fa-solid fa-gear"></i>`,
                onclick: () => {
                    App.handlers.open_settings();
                }
            },
        ],

        /* OUTDOOR ACTIVITIES */
        outside_activities: [
            {
                name: "Home",
                image: 'resources/img/misc/activity_building_home.png',
                onEnter: () => App.handlers.go_to_home(),
                isHome: true,
            },
            {
                name: "Mall",
                image: 'resources/img/misc/activity_building_mall.png',
                onEnter: () => Activities.goToMall(),
            },
            {
                name: "Market",
                image: 'resources/img/misc/activity_building_market.png',
                onEnter: () => Activities.goToMarket(),
            },
            {
                name: `Game Center`,
                image: 'resources/img/misc/activity_building_arcade.png',
                onEnter: () => Activities.goToArcade(),
            },
            {
                isDisabled: () => App.petDefinition.lifeStage <= PetDefinition.LIFE_STAGE.child,
                name: 'Homeworld Getaways',
                image: 'resources/img/misc/activity_building_homeworld_getaway.png',
                onEnter: () => App.handlers.open_rabbitholes_list(),
            },
            {
                name: 'Fortune Teller',
                image: 'resources/img/misc/activity_building_fortune_teller.png',
                onEnter: () => App.handlers.open_fortune_teller(),
            },
            {
                name: 'Park',
                image: 'resources/img/misc/activity_building_park.png',
                onEnter: () => App.handlers.go_to_park(),
            },
            {
                isDisabled: () => !(App.petDefinition.lifeStage >= PetDefinition.LIFE_STAGE.child && App.petDefinition.lifeStage <= PetDefinition.LIFE_STAGE.teen),
                name: `School`,
                image: 'resources/img/misc/activity_building_school.png',
                onEnter: () => App.handlers.go_to_school(),
            },
            {
                name: "Hospital",
                image: 'resources/img/misc/activity_building_hospital.png',
                onEnter: () => App.handlers.go_to_clinic(),
            },
            {
                name: `Restaurant`,
                image: 'resources/img/misc/activity_building_restaurant.png',
                onEnter: () => Activities.goToRestaurant(),
            },
            {
                isDisabled: () => App.petDefinition.lifeStage < PetDefinition.LIFE_STAGE.adult,
                name: 'Work',
                image: 'resources/img/misc/activity_building_work.png',
                onEnter: () => App.handlers.open_works_list(),
            },
            {
                name: `Underworld Entrance`,
                image: 'resources/img/misc/activity_building_underworld.png',
                onEnter: () => Activities.goToUnderworldEntrance(),
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
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "pizza": {
                sprite: 515,
                hunger_replenish: 40,
                fun_replenish: 5,
                health_replenish: -5,
                price: 10,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "hamburger": {
                sprite: 2,
                hunger_replenish: 40,
                fun_replenish: 10,
                health_replenish: -15,
                price: 15,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "heart beef": {
                sprite: 881,
                hunger_replenish: 30,
                fun_replenish: 5,
                health_replenish: -5,
                price: 8,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "crab dish": {
                sprite: 456,
                hunger_replenish: 50,
                fun_replenish: 5,
                health_replenish: 10,
                price: 20,
                age: [_ls.adult, _ls.elder],
            },
            "paster": {
                sprite: 734,
                hunger_replenish: 25,
                fun_replenish: 0,
                health_replenish: 0,
                price: 10,
                age: [_ls.teen, _ls.adult, _ls.elder],
            },
            "king burger": {
                sprite: 710,
                hunger_replenish: 100,
                fun_replenish: 50,
                health_replenish: -40,
                price: 40,
                age: [_ls.adult, _ls.elder],
            },
            "sushi": {
                sprite: 605,
                hunger_replenish: 15,
                fun_replenish: 10,
                health_replenish: 5,
                price: 12,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "sushi set": {
                sprite: 169,
                hunger_replenish: 40,
                fun_replenish: 10,
                health_replenish: 20,
                price: 30,
                age: [_ls.adult, _ls.elder],
            },
            "sunny savory soup": {
                sprite: 584,
                hunger_replenish: 25,
                fun_replenish: 0,
                health_replenish: 25,
                price: 15,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "crabstew": {
                sprite: 635,
                hunger_replenish: 25,
                fun_replenish: 0,
                health_replenish: 30,
                price: 20,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "spicy dragon pot": {
                sprite: 719,
                hunger_replenish: 30,
                fun_replenish: 0,
                health_replenish: 10,
                price: 20,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "fish dish": {
                sprite: 575,
                hunger_replenish: 35,
                fun_replenish: 5,
                health_replenish: 20,
                price: 22,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "forest fungi stew": {
                sprite: 638,
                hunger_replenish: 10,
                fun_replenish: 0,
                health_replenish: 20,
                price: 7,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "star nuggies": {
                sprite: 707,
                hunger_replenish: 15,
                fun_replenish: 10,
                health_replenish: 0,
                price: 8,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "tacos": {
                sprite: 767,
                hunger_replenish: 20,
                fun_replenish: 5,
                health_replenish: 0,
                price: 10,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "sambooseh": {
                sprite: 860,
                hunger_replenish: 10,
                fun_replenish: 0,
                health_replenish: 0,
                price: 5,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "pie": {
                sprite: 518,
                hunger_replenish: 15,
                fun_replenish: 0,
                health_replenish: 0,
                price: 10,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "lasagna": {
                sprite: 797,
                hunger_replenish: 20,
                fun_replenish: 10,
                health_replenish: -5,
                price: 20,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "red bowol": {
                sprite: 611,
                hunger_replenish: 30,
                fun_replenish: 5,
                health_replenish: 2,
                price: 25,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "noodles": {
                sprite: 557,
                hunger_replenish: 18,
                fun_replenish: 2,
                health_replenish: 0,
                price: 15,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "drumstick": {
                sprite: 460,
                hunger_replenish: 20,
                fun_replenish: 2,
                health_replenish: 4,
                price: 10,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "veggiesoup": {
                sprite: 463,
                hunger_replenish: 23,
                fun_replenish: -15,
                health_replenish: 10,
                price: 12,
            },
            "cheese n breakfast": {
                sprite: 364,
                hunger_replenish: 25,
                fun_replenish: 5,
                health_replenish: 10,
                price: 13,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "breadrolls": {
                sprite: 554,
                hunger_replenish: 20,
                fun_replenish: 5,
                health_replenish: 2,
                price: 20,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "sweetbread": {
                sprite: 713,
                hunger_replenish: 15,
                fun_replenish: 0,
                health_replenish: 10,
                price: 10,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "meatballs": {
                sprite: 951,
                hunger_replenish: 30,
                fun_replenish: 0,
                health_replenish: 0,
                price: 15,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "xiao long bao": {
                sprite: 602,
                hunger_replenish: 10,
                fun_replenish: 0,
                health_replenish: 5,
                price: 7,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "spaghetti": {
                sprite: 219,
                hunger_replenish: 30,
                fun_replenish: 3,
                health_replenish: 0,
                price: 5,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "telesushi": {
                sprite: 163,
                hunger_replenish: 45,
                fun_replenish: 5,
                health_replenish: 15,
                price: 25,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "s-special dish": {
                sprite: 506,
                hunger_replenish: 28,
                fun_replenish: 0,
                health_replenish: 10,
                price: 20,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "bunny burger": {
                sprite: 770,
                hunger_replenish: 30,
                fun_replenish: 10,
                health_replenish: 5,
                price: 25,
                cookableOnly: true,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
                isNew: false,
            },
            "pancakes": {
                sprite: 806,
                hunger_replenish: 25,
                fun_replenish: 2,
                health_replenish: 2,
                price: 15,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
                isNew: false,
            },
            "dumplings": {
                sprite: 764,
                hunger_replenish: 25,
                fun_replenish: 2,
                health_replenish: 2,
                price: 15,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
                isNew: true,
            },
            "mushroom soup": {
                sprite: 779,
                hunger_replenish: 15,
                fun_replenish: 5,
                health_replenish: 5,
                price: 17,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
                isNew: true,
            },

            // cookable only
            "sky bread": {
                sprite: 142,
                hunger_replenish: 30,
                sleep_replenish: 50,
                price: 15,
                cookableOnly: true,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "veggie burger": {
                sprite: 213,
                hunger_replenish: 50,
                fun_replenish: 5,
                health_replenish: 15,
                price: 15,
                cookableOnly: true,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "puzzlewich": {
                sprite: 175,
                hunger_replenish: 20,
                fun_replenish: 50,
                price: 15,
                cookableOnly: true,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "lunchbox": {
                sprite: 186,
                hunger_replenish: 50,
                health_replenish: 10,
                price: 10,
                cookableOnly: true,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "veggies roll": {
                sprite: 192,
                hunger_replenish: 15,
                health_replenish: 20,
                sleep_replenish: 50,
                price: 18,
                cookableOnly: true,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "veggies basket": {
                sprite: 195,
                hunger_replenish: 15,
                health_replenish: 50,
                price: 10,
                cookableOnly: true,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "veggies stew": {
                sprite: 222,
                hunger_replenish: 50,
                health_replenish: 20,
                price: 12,
                cookableOnly: true,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "stir veggies": {
                sprite: 533,
                hunger_replenish: 50,
                health_replenish: 20,
                price: 12,
                cookableOnly: true,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "melodywich": {
                sprite: 668,
                hunger_replenish: 20,
                fun_replenish: 50,
                price: 12,
                cookableOnly: true,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "veggies curry": {
                sprite: 536,
                hunger_replenish: 50,
                fun_replenish: 10,
                price: 10,
                cookableOnly: true,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "potato soup": {
                sprite: 599,
                hunger_replenish: 50,
                price: 8,
                cookableOnly: true,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "rice ball": {
                sprite: 800,
                hunger_replenish: 15,
                sleep_replenish: 50,
                price: 15,
                cookableOnly: true,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "hot pot": {
                sprite: 596,
                hunger_replenish: 50,
                fun_replenish: 5,
                price: 12,
                cookableOnly: true,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "lovely salad": {
                sprite: 276,
                hunger_replenish: 15,
                fun_replenish: 50,
                price: 10,
                cookableOnly: true,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "fresh salad": {
                sprite: 323,
                hunger_replenish: 50,
                health_replenish: 20,
                price: 15,
                cookableOnly: true,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "vegetables cut": {
                sprite: 617,
                hunger_replenish: 10,
                sleep_replenish: 50,
                price: 15,
                cookableOnly: true,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "roasted sweet potatoes": {
                sprite: 945,
                hunger_replenish: 100,
                price: 20,
                cookableOnly: true,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
            "sweet rainbow": {
                sprite: 803,
                hunger_replenish: 10,
                fun_replenish: 80,
                price: 20,
                cookableOnly: true,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
            },
    
    
            // treats
            "koluche": {
                sprite: 1030,
                hunger_replenish: 25,
                fun_replenish: 5,
                health_replenish: 5,
                price: 8,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
                type: 'treat',
            },
            "jelly": {
                sprite: 1013,
                hunger_replenish: 8,
                fun_replenish: 20,
                health_replenish: 0,
                price: 10,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
                type: 'treat',
            },
            "chocolate pie": {
                sprite: 1010,
                hunger_replenish: 10,
                fun_replenish: 8,
                health_replenish: 0,
                price: 8,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
                type: 'treat',
            },
            "lollipop": {
                sprite: 1033,
                hunger_replenish: 5,
                fun_replenish: 35,
                health_replenish: 0,
                price: 5,
                type: 'treat',
            },
            "vanilla icecream": {
                sprite: 1024,
                hunger_replenish: 10,
                fun_replenish: 30,
                health_replenish: 0,
                price: 10,
                type: 'treat',
            },
            "strawberry icecream": {
                sprite: 902,
                hunger_replenish: 10,
                fun_replenish: 30,
                health_replenish: 0,
                price: 10,
                type: 'treat',
            },
            "scoped icecream": {
                sprite: 1007,
                hunger_replenish: 15,
                fun_replenish: 30,
                health_replenish: 0,
                price: 12,
                type: 'treat',
            },
            "snacks and bits": {
                sprite: 1001,
                hunger_replenish: 15,
                fun_replenish: 20,
                health_replenish: 0,
                price: 15,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
                type: 'treat',
            },
            "lemonade": {
                sprite: 971,
                hunger_replenish: 5,
                fun_replenish: 25,
                health_replenish: 0,
                price: 10,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
                type: 'treat',
            },
            "cupcake": {
                sprite: 974,
                hunger_replenish: 15,
                fun_replenish: 30,
                health_replenish: 0,
                price: 10,
                type: 'treat',
            },
            "cappuccino": {
                sprite: 878,
                hunger_replenish: 2,
                fun_replenish: 25,
                health_replenish: 0,
                price: 7,
                age: [_ls.teen, _ls.adult, _ls.elder],
                type: 'treat',
            },
            "strawberry donut": {
                sprite: 954,
                hunger_replenish: 10,
                fun_replenish: 15,
                health_replenish: 0,
                price: 5,
                type: 'treat',
            },
            "choco cake slice": {
                sprite: 998,
                hunger_replenish: 10,
                fun_replenish: 10,
                health_replenish: 0,
                price: 5,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
                type: 'treat',
            },
            "cotton candy": {
                sprite: 995,
                hunger_replenish: 15,
                fun_replenish: 25,
                health_replenish: 0,
                price: 12,
                type: 'treat',
            },
            "cream icepack": {
                sprite: 488,
                hunger_replenish: 10,
                fun_replenish: 25,
                health_replenish: 0,
                price: 10,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
                type: 'treat',
            },
            "bunny mooko": {
                sprite: 450,
                hunger_replenish: 20,
                fun_replenish: 30,
                health_replenish: 0,
                price: 14,
                type: 'treat',
            },
            "paloodeh": {
                sprite: 378,
                hunger_replenish: 5,
                fun_replenish: 25,
                health_replenish: 0,
                price: 8,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
                type: 'treat',
            },
            "toasted marshmallows": {
                sprite: 937,
                hunger_replenish: 5,
                fun_replenish: 20,
                health_replenish: 0,
                price: 5,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
                type: 'treat',
                isNew: false,
            },
            "watermelon": {
                sprite: 948,
                hunger_replenish: 15,
                fun_replenish: 20,
                health_replenish: 5,
                price: 10,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
                type: 'treat',
                isNew: false,
            },
            "orange juice": {
                sprite: 905,
                hunger_replenish: 5,
                fun_replenish: 15,
                health_replenish: 5,
                price: 5,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
                type: 'treat',
                isNew: false,
            },
            "snackfin": {
                sprite: 839,
                hunger_replenish: 5,
                fun_replenish: 15,
                health_replenish: 0,
                price: 5,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
                type: 'treat',
                isNew: false,
            },
            "banana": {
                sprite: 960,
                hunger_replenish: 20,
                fun_replenish: 5,
                health_replenish: 5,
                price: 8,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
                type: 'treat',
                isNew: false,
            },
            "nuts": {
                sprite: 920,
                hunger_replenish: 5,
                fun_replenish: 2,
                health_replenish: 2,
                price: 2,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
                type: 'treat',
                isNew: false,
            },
            "santa cake": {
                sprite: 848,
                hunger_replenish: 20,
                fun_replenish: 10,
                health_replenish: 1,
                price: 15,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
                type: 'treat',
                isNew: false,
            },
            "kuchice": {
                sprite: 890,
                hunger_replenish: 5,
                fun_replenish: 20,
                health_replenish: -2,
                price: 8,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
                type: 'treat',
                isNew: false,
            },
            "spookandy": {
                sprite: 17,
                hunger_replenish: 2,
                fun_replenish: 1,
                health_replenish: -1,
                price: 2,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
                type: 'treat',
                isNew: false,
                unbuyable: true,
            },
            "strawberry pie": {
                sprite: 773,
                hunger_replenish: 10,
                fun_replenish: 15,
                health_replenish: 3,
                price: 10,
                type: 'treat',
                isNew: true,
            },
            "rainbow cake": {
                sprite: 453,
                hunger_replenish: 15,
                fun_replenish: 15,
                health_replenish: -2,
                price: 15,
                type: 'treat',
                isNew: true,
            },
    
    
            // groc
            /* "broccoli": {
                sprite: 632,
                hunger_replenish: 15,
                fun_replenish: 0,
                health_replenish: 10,
                price: 3,
                age: [__ls.teen, __ls.adult, __ls.elder],
            }, */
    
    
    
            // other
            "milk": {
                sprite: 1036,
                hunger_replenish: 50,
                fun_replenish: 10,
                price: 0, // makes it always available
                age: [_ls.baby],
                nonCraftable: true,
            },
            "medicine": {
                sprite: 1050,
                hunger_replenish: 0,
                fun_replenish: -20,
                health_replenish: 999,
                price: 20,
                type: 'med',
            },
            "sleep replacement": {
                sprite: 1050,
                hunger_replenish: -25,
                fun_replenish: -20,
                sleep_replenish: 999,
                price: 120,
                type: 'med',
                nonCraftable: true,
            },
            "expression skill potion": {
                sprite: 1053,
                expression_increase: 40,
                price: 250,
                type: 'med',
                unbuyable: true,
                isNew: false,
                nonCraftable: true,
            },
            "logic skill potion": {
                sprite: 1053,
                logic_increase: 40,
                price: 250,
                type: 'med',
                unbuyable: true,
                isNew: false,
                nonCraftable: true,
            },
            "endurance skill potion": {
                sprite: 1053,
                endurance_increase: 40,
                price: 250,
                type: 'med',
                unbuyable: true,
                isNew: false,
                nonCraftable: true,
            },
            "potion of neglect": {
                sprite: 1053,
                hunger_replenish: -999,
                fun_replenish: -999,
                sleep_replenish: -999,
                health_replenish: -999,
                price: 2,
                type: 'med',
                unbuyable: true,
                isNew: false,
                nonCraftable: true,
            },
            "potion of well behaving": {
                sprite: 1053,
                discipline_increase: 30,
                price: 500,
                type: 'med',
                unbuyable: true,
                isNew: false,
                nonCraftable: true,
            },
            "potion of misbehaving": {
                sprite: 1053,
                discipline_increase: -30,
                price: 2,
                type: 'med',
                unbuyable: true,
                isNew: false,
                nonCraftable: true,
            },
            "potion of fulfillment": {
                sprite: 1053,
                hunger_replenish: 999,
                fun_replenish: 999,
                sleep_replenish: 999,
                health_replenish: 999,
                price: 500,
                type: 'med',
                unbuyable: true,
                isNew: false,
                nonCraftable: true,
            },
            "potion of aging up": {
                sprite: 1053,
                price: 250,
                type: 'med',
                unbuyable: true,
                isNew: false,
                nonCraftable: true,
                payload: () => {
                    App.toggleGameplayControls(false);
                    App.pet.triggerScriptedState('cheering', 10000, 0, true);
                    Activities.task_foam(() => {
                        App.pet.ageUp();
                        App.pet.x = '50%';
                        App.pet.y = 60;
                        App.pet.stopMove();
                        App.pet.triggerScriptedState('blush', 3000, 0, true, () => {
                            App.setScene(App.scene.home);
                            App.toggleGameplayControls(true);
                            App.pet.playCheeringAnimation();
                        });
                        App.sendAnalytics('age_up_potion', App.petDefinition.lifeStage);
                    });
                },
            },
            "potion of nothingness": {
                sprite: 1053,
                price: 2,
                type: 'med',
                unbuyable: true,
                isNew: false,
                nonCraftable: true,
            },
            "life essence": {
                sprite: 1059,
                price: 500,
                type: 'med',
                unbuyable: true,
                isNew: false,
                nonCraftable: true,
                payload: () => {
                    const wasGhost = App.petDefinition.stats.is_ghost;

                    App.toggleGameplayControls(false);
                    App.pet.triggerScriptedState('cheering', 10000, 0, true);
                    App.pet.stopMove();
                    Activities.task_foam(() => {
                        App.pet.removeObject();
                        App.petDefinition.stats.is_ghost = false;
                        App.pet = App.createActivePet(App.petDefinition);
                        App.pet.triggerScriptedState('shocked', 10000, 0, true);
                        App.pet.stopMove();
                        App.pet.x = '50%';
                        App.pet.y = 60;
                        App.pet.triggerScriptedState('blush', 3000, 0, true, () => {
                        App.setScene(App.scene.home);
                        App.pet.playCheeringAnimationIfTrue(wasGhost, () => {
                            App.toggleGameplayControls(true);
                            if(wasGhost){
                                    App.displayPopup(`${App.petDefinition.name} is no longer an immortal!`);
                            } else {
                                    App.displayPopup(`Nothing happened!`);
                                }
                            });
                        });
                        App.sendAnalytics('potion life essence');
                    });
                }
            }
        },
    
        /* ITEMS */
        item: {
            "rattle": {
                sprite: 8,
                fun_replenish: 15,
                price: 50,
                interaction_time: 8100,
                age: [_ls.baby, _ls.child],
                logic_increase: 1,
            },
            "grimoire": {
                sprite: 9,
                fun_replenish: 12,
                price: 200,
                interaction_time: 8000,
                interruptable: false,
                age: [_ls.teen, _ls.adult, _ls.elder],
                endurance_increase: 1,
            },
            "bear": {
                sprite: 10,
                fun_replenish: 20,
                price: 180,
                interaction_time: 10000,
                interruptable: true,
                expression_increase: 1,
            },
            "skate": {
                sprite: 11,
                fun_replenish: 25,
                price: 250,
                interaction_time: 30000,
                interruptable: true,
                isNew: false,
                onEnd: () => App.setScene(App.scene.home),
                age: [_ls.teen, _ls.adult, _ls.elder],
                endurance_increase: 1.5,
            },
            "foxy": {
                sprite: 1,
                fun_replenish: 15,
                price: 50,
                interaction_time: 12000,
                interruptable: true,
                expression_increase: 0.5,
            },
            "dumble": {
                sprite: 2,
                fun_replenish: 10,
                price: 100,
                age: [_ls.teen, _ls.adult],
                endurance_increase: 2,
            },
            "music player": {
                sprite: 3,
                fun_replenish: 15,
                price: 65,
                expression_increase: 1.5,
            },
            "ball": {
                sprite: 4,
                fun_replenish: 20,
                price: 35,
                interaction_time: 100000,
                interruptable: true,
                endurance_increase: 0.75,
            },
            "smartphone": {
                sprite: 5,
                fun_replenish: 30,
                price: 350,
                interaction_time: 100000,
                interruptable: true,
                age: [_ls.teen, _ls.adult, _ls.elder],
                logic_increase: 2,
            },
            "magazine": {
                sprite: 6,
                fun_replenish: 10,
                price: 20,
                interaction_time: 60000,
                interruptable: true,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
                logic_increase: 1.5,
            },
            "microphone": {
                sprite: 7,
                fun_replenish: 15,
                price: 75,
                interaction_time: 60000,
                interruptable: true,
                expression_increase: 1.5,
            },
            "rubicube": {
                sprite: 12,
                fun_replenish: 15,
                price: 150,
                interaction_time: 30000,
                interruptable: true,
                isNew: false,
                logic_increase: 1.5,
            },
            "fidget spinner": {
                sprite: 13,
                fun_replenish: 20,
                price: 250,
                interaction_time: 30000,
                interruptable: true,
                isNew: false,
                age: [_ls.child, _ls.teen, _ls.adult, _ls.elder],
                expression_increase: 0.3,
            },
            "retroboy": {
                sprite: 14,
                fun_replenish: 35,
                price: 350,
                interaction_time: 30000,
                interruptable: true,
                isNew: false,
                logic_increase: 0.4,
                expression_increase: 0.5,
            },
            "robotty": {
                sprite: 15,
                fun_replenish: 28,
                price: 300,
                interaction_time: 15000,
                interruptable: true,
                isNew: false,
                logic_increase: 0.75,
            },
        },
    
        /* GARDENING PLANTS */
        plant: {
            // wateredDuration: minutes
            "cabbage": {
                sprite: 29,
                price: 5,
            },
            "tomato": {
                sprite: 33,
                price: 5,
            },
            "lettuce": {
                sprite: 37,
                price: 5,
            },
            "carrot": {
                sprite: 41,
                price: 5,
            },
            "potato": {
                sprite: 45,
                price: 5,
            },
            "sweet potato": {
                sprite: 49,
                price: 5,
            },
            "watermelon": {
                sprite: 53,
                price: 8,
            },
            "peach": {
                sprite: 57,
                price: 5,
                // wateredDuration: 0.5,
            },
            // inedibles
            "bamboo": {
                sprite: 77,
                price: 10,
                inedible: true,
            },
            // tulips
            "purple tulip": {
                sprite: 1,
                price: 5,
                inedible: true,
            },
            "cyan tulip": {
                sprite: 5,
                price: 5,
                inedible: true,
            },
            "blue tulip": {
                sprite: 9,
                price: 5,
                inedible: true,
            },
            "green tulip": {
                sprite: 13,
                price: 5,
                inedible: true,
            },
            "yellow tulip": {
                sprite: 17,
                price: 5,
                inedible: true,
            },
            "orange tulip": {
                sprite: 21,
                price: 5,
                inedible: true,
            },
            "red tulip": {
                sprite: 25,
                price: 5,
                inedible: true,
            },
            // rocky ores
            "tetrocana": {
                sprite: 61,
                price: 15,
                inedible: true,
            },
            "lucrios": {
                sprite: 65,
                price: 15,
                inedible: true,
            },
            "hephasto": {
                sprite: 69,
                price: 15,
                inedible: true,
            },
            "kilmari": {
                sprite: 73,
                price: 15,
                inedible: true,
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
            "monster": {
                image: 'resources/img/background/house/08.png',
                price: 450,
                isNew: false,
            },
            "forest": {
                icon: 'resources/img/background/outside/09_icon.png',
                image: 'resources/img/background/outside/09.png',
                price: 450,
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
            "car city": {
                image: 'resources/img/background/house/cc_06.png',
                price: 0,
                isNew: false,
                onlineShopAccessible: true,
                unlockLikes: 100,
                unlockKey: 'bg_car_city',
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
            "gothic": {
                image: 'resources/img/background/house/cc_03.png',
                price: 300,
                isNew: false,
            },
            "arcade": {
                image: 'resources/img/background/house/cc_05.png',
                price: 200,
                isNew: false,
            },
            "valentine": {
                image: 'resources/img/background/house/cc_04.png',
                price: 350,
                isNew: false,
            },
            "mush-room": {
                image: 'resources/img/background/house/cc_08.png',
                price: 350,
                isNew: false,
            },
            "vintage orange": {
                image: 'resources/img/background/house/cc_07.png',
                price: 250,
                isNew: false,
            },
            "pumpkin": {
                image: 'resources/img/background/house/cc_09.png',
                price: 350,
                isNew: false,
            },

            // craftables
            "collage": {
                image: 'resources/img/background/house/c_01.png',
                price: 350,
                isCraftable: true,
                craftingRecipe: ['red tulip', 'blue tulip', 'green tulip'],
            },

            // bathrooms
            "plain": {
                image: 'resources/img/background/house/bathroom_01.png',
                price: 100,
                isNew: false,
                type: 'bathroom',
            },
            "nautical": {
                image: 'resources/img/background/house/bathroom_cc_01.png',
                price: 350,
                isNew: false,
                type: 'bathroom',
            },

            // kitchen
            "bites": {
                image: 'resources/img/background/house/kitchen_03.png',
                price: 100,
                isNew: false,
                type: 'kitchen',
            },
            "vintage": {
                image: 'resources/img/background/house/kitchen_02.png',
                price: 100,
                isNew: false,
                type: 'kitchen',
            },
            "octopus": {
                image: 'resources/img/background/house/kitchen_cc_01.png',
                price: 350,
                isNew: false,
                type: 'kitchen',
            },
            "mush-kitchen": {
                image: 'resources/img/background/house/kitchen_cc_02.png',
                price: 350,
                isNew: false,
                type: 'kitchen',
            },
        },
    
        /* ROOM PLACEABLE FURNITURE */
        furniture: [
            // mushroom set
            {
                name: 'Mushroom Couch',
                image: 'resources/img/furniture/mushroom_couch.png',
                id: "mushroom_couch",
                price: 200,
                isNew: false,
            },
            {
                name: 'Mushroom Pot',
                image: 'resources/img/furniture/mushroom_pot.png',
                id: "mushroom_pot",
                price: 150,
                isNew: false,
            },
            {
                name: 'Mushroom Lamp',
                image: 'resources/img/furniture/mushroom_lamp.png',
                id: "mushroom_lamp",
                price: 200,
            },

            // vintage orange set
            {
                name: 'Vintage Couch',
                image: 'resources/img/furniture/vintage_couch.png',
                id: "vintage_couch",
                price: 200,
                isNew: false,
            },
            {
                name: 'Vintage Cabinet',
                image: 'resources/img/furniture/vintage_cabinet.png',
                id: "vintage_cabinet",
                price: 150,
                isNew: false,
            },
            {
                name: 'Vintage Plant',
                image: 'resources/img/furniture/vintage_plant.png',
                id: "vintage_plant",
                price: 150,
                isNew: false,
            },

            // valentine set
            {
                name: 'Valentine Bear',
                image: 'resources/img/furniture/bear_valentine.png',
                id: "bear_valentine",
                price: 200,
                isNew: false,
            },
            {
                name: 'Valentine Heart',
                image: 'resources/img/furniture/broken_heart_valentine.png',
                id: "broken_heart_valentine",
                price: 160,
                isNew: false,
            },
            {
                name: 'Valentine Cake',
                image: 'resources/img/furniture/cake_valentine.png',
                id: "cake_valentine",
                price: 120,
                isNew: false,
            },
            {
                name: 'Valentine Gift',
                image: 'resources/img/furniture/gift_valentine.png',
                id: "gift_valentine",
                price: 120,
                isNew: false,
            },
            {
                name: 'Valentine Chair',
                image: 'resources/img/furniture/chair_valentine.png',
                id: "chair_valentine",
                price: 150,
                isNew: false,
            },
    
            // gothic set
            {
                name: 'Gothic Bookcase',
                image: 'resources/img/furniture/bookcase_gothic.png',
                id: "bookcase_gothic",
                price: 150,
            },
            {
                name: 'Gothic Chair',
                image: 'resources/img/furniture/chair_gothic.png',
                id: "chair_gothic",
                price: 150,
            },
            {
                name: 'Gothic Doll',
                image: 'resources/img/furniture/doll_gothic.png',
                id: "doll_gothic",
                price: 120,
            },
            {
                name: 'Gothic Vase',
                image: 'resources/img/furniture/vase_gothic.png',
                id: "vase_gothic",
                price: 120,
            },
            {
                name: 'Gothic Statue',
                image: 'resources/img/furniture/statue_gothic.png',
                id: "statue_gothic",
                price: 150,
            },
    
            // arcade
            {
                name: 'Arcade Machines',
                image: 'resources/img/furniture/arcade_machines.png',
                id: "arcade_machines",
                price: 120,
            },
            {
                name: 'Claw Machine',
                image: 'resources/img/furniture/arcade_machine.png',
                id: "claw_machine",
                price: 120,
            },
            {
                name: 'Race Car Mini Bed',
                image: 'resources/img/furniture/race_car_minibed.png',
                id: "race_car_minibed",
                price: 120,
            },
            {
                name: 'Arcade Sofa',
                image: 'resources/img/furniture/sofa_arcade.png',
                id: "sofa_arcade",
                price: 120,
            },
    
            {
                name: 'CLR bookshelf',
                image: 'resources/img/furniture/bookcase_colorful.png',
                id: "bookcase_colorful",
                price: 120,
            },
            {
                name: 'Pink Sofa',
                image: 'resources/img/furniture/sofa_pink.png',
                id: "sofa_pink",
                price: 150,
            },
    
            {
                name: 'Wooden bookshelf',
                image: 'resources/img/furniture/bookcase_wooden.png',
                id: "bookcase_wooden",
                price: 100,
            },
            {
                name: 'Woodleather Sofa',
                image: 'resources/img/furniture/sofa_woodleather.png',
                id: "sofa_woodleather",
                price: 120,
            },
    
            {
                name: 'Peachy Pot',
                image: 'resources/img/furniture/pot_peachy.png',
                id: "pot_peachy",
                price: 80,
            },
            {
                name: 'Peachy Sofa',
                image: 'resources/img/furniture/sofa_peachy.png',
                id: "sofa_peachy",
                price: 150,
            },
    
            {
                name: 'Blue Stand',
                image: 'resources/img/furniture/stand_blue.png',
                id: "stand_blue",
                price: 80,
            },
            {
                name: 'Blue Sofa',
                image: 'resources/img/furniture/sofa_blue.png',
                id: "sofa_blue",
                price: 80,
            },
    
            {
                name: 'Lite Stand',
                image: 'resources/img/furniture/stand_rainbow.png',
                id: "stand_rainbow",
                price: 120,
            },
            {
                name: 'Lite Sofa',
                image: 'resources/img/furniture/sofa_rainbow.png',
                id: "sofa_rainbow",
                price: 120,
            },
            {
                name: 'Astra Sofa',
                image: 'resources/img/furniture/sofa_astra.png',
                id: "sofa_astra",
                price: 120,
            },
            {
                name: 'Astra Cactus',
                image: 'resources/img/furniture/pot_astra.png',
                id: "pot_astra",
                price: 120,
            },

            {
                name: 'Big Pumpkin',
                image: 'resources/img/furniture/big_pumpkin.png',
                id: "big_pumpkin",
                price: 100,
                isNew: false,
            },
            {
                name: 'Small Pumpkin',
                image: 'resources/img/furniture/small_pumpkin.png',
                id: "small_pumpkin",
                price: 100,
                isNew: false,
            },
            {
                name: 'Spooky Tree',
                image: 'resources/img/furniture/spooky_tree.png',
                id: "spooky_tree",
                price: 50,
                isNew: false,
            },
    
            // misc
            {
                name: 'Pink Pillow Pile',
                image: 'resources/img/furniture/pink_pillow.png',
                id: "pink_pillow",
                price: 150,
            },
            {
                name: 'Girl Doll',
                image: 'resources/img/furniture/doll_girl.png',
                id: "doll_girl",
                price: 200,
            },
            {
                name: 'Dog Box',
                image: 'resources/img/furniture/dog_box.png',
                id: "dog_box",
                price: 200,
            },
            {
                name: 'Ret TV',
                image: 'resources/img/furniture/tv_01.png',
                id: "tv_01",
                price: 300,
            },
            {
                name: 'Orange Chair',
                image: 'resources/img/furniture/chair_orange.png',
                id: "chair_orange",
                price: 200,
            },
            {
                name: 'Sty Table',
                image: 'resources/img/furniture/table_01.png',
                id: "table_01",
                price: 250,
            },
            {
                name: 'Pink Fan',
                image: 'resources/img/furniture/fan.png',
                id: "pink_fan",
                price: 120,
            },
            {
                name: 'CC Cabinet',
                image: 'resources/img/furniture/cabinet_01.png',
                id: "cabinet_01",
                price: 120,
            },
            {
                name: 'CC Plant',
                image: 'resources/img/furniture/plant_01.png',
                id: "plant_01",
                price: 100,
            },
            {
                name: 'Seafloor Sofa',
                image: 'resources/img/furniture/seafloor_sofa.png',
                id: "seafloor_sofa",
                price: 120,
            },
            {
                name: 'Clood Sofa',
                image: 'resources/img/furniture/sofa_clood.png',
                id: "sofa_clood",
                price: 120,
            },
            {
                name: 'Futura Sofa',
                image: 'resources/img/furniture/sofa_futura.png',
                id: "sofa_futura",
                price: 120,
            },
    
            // craftables
            {
                name: 'Bird Stand',
                image: 'resources/img/furniture/bird_stand.png',
                id: 'bird_stand',
                isCraftable: true,
                craftingRecipe: ['kilmari', 'blue tulip', 'bamboo'],
            },
            {
                name: 'Collage Bucket',
                image: 'resources/img/furniture/bucket_collage.png',
                id: 'bucket_collage',
                isCraftable: true,
                craftingRecipe: ['cyan tulip', 'tetrocana', 'hephasto'],
            },
            {
                name: 'Sun Lamp',
                image: 'resources/img/furniture/lamp_sun.png',
                id: 'lamp_sun',
                isCraftable: true,
                craftingRecipe: ['bamboo', 'lucrios', 'yellow tulip'],
                onDraw: (me) => {
                    me.setImg(
                        !App.darkOverlay.isVisible
                            ? 'resources/img/furniture/lamp_sun.png'
                            : 'resources/img/furniture/lamp_sun_off.png'
                    );
                }
            },
            {
                name: 'Cloud Sofa',
                image: 'resources/img/furniture/sofa_cloud.png',
                id: 'sofa_cloud',
                isCraftable: true,
                craftingRecipe: ['orange tulip', 'bamboo', 'purple tulip'],
            },
            {
                name: 'City Couch',
                image: 'resources/img/furniture/couch_city.png',
                id: "couch_city",
                isCraftable: true,
                isNew: false,
                craftingRecipe: ['tetrocana', 'orange tulip', 'lucrios'],
            },
            {
                name: 'City Toy Car',
                image: 'resources/img/furniture/city_toy_car.png',
                id: "city_toy_car",
                isCraftable: true,
                isNew: false,
                craftingRecipe: ['lucrios', 'tetrocana', 'yellow tulip'],
            },
            {
                name: 'City Plant',
                image: 'resources/img/furniture/plant_city.png',
                id: "plant_city",
                isCraftable: true,
                isNew: false,
                craftingRecipe: ['green tulip', 'hephasto', 'bamboo'],
            },
        ],
    
        /* SHELL BACKGROUNDS */
        shell_background: [
            {
                image: 'resources/img/ui/shell_background_13.png',
                isNew: false,
                isDefault: true,
            },
            {
                image: 'resources/img/ui/shell_background_17.png',
                isNew: false,
            },
            {
                image: 'resources/img/ui/shell_background_18.png',
                isNew: false,
            },
            {
                image: 'resources/img/ui/shell_background_20.png',
                isNew: false,
            },
            {
                image: 'resources/img/ui/shell_background_19.png',
                isNew: false,
            },
            {
                image: 'resources/img/ui/shell_background_21.png',
                isNew: false,
            },
            {
                image: 'resources/img/ui/shell_background_16.png',
                isNew: false,
            },
            {
                image: 'resources/img/ui/shell_background_07.png',
                isNew: false,
            },
            {
                image: 'resources/img/ui/shell_background_12.png',
                isNew: false,
            },
            {
                image: 'resources/img/ui/shell_background_14.png',
                isNew: false,
            },
            {
                image: 'resources/img/ui/shell_background_15.png',
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
            /* {
                image: 'resources/img/ui/shell_background_02.png',
            }, */
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
            {
                image: 'resources/img/ui/shell_background_cloof_01.png',
                name: 'cloofy',
                isNew: false,
                onlineShopAccessible: true,
                unlockLikes: 30,
                unlockKey: 'unlock_cloof_shell_bg',
            },
        ],

        /* BACKGROUND PATTERNS */
        background_pattern: [
            {
                name: 'Snowy Stars',
                image: 'resources/img/ui/bg_pattern_01.png',
                isNew: false,
            },
            {
                name: 'Shells',
                image: 'resources/img/ui/bg_pattern_02.png',
                isNew: false,
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
                createFn: function (parent) {
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
                            if (App.lastTime > me.targetPosition.nextChangeMs) {
                                me.targetPosition.nextChangeMs = App.lastTime + random(250, 2000);
                                const followsParent = random(0, 1);
                                if (followsParent && !isNaN(parent.x) && !isNaN(parent.y)) {
                                    me.targetPosition.x = parent.x;
                                    me.targetPosition.y = parent.y - 40;
                                } else {
                                    me.targetPosition.x = random(10, 90);
                                    me.targetPosition.y = random(-10, 50);
                                }
                                if (!random(0, 2)) {
                                    me.movementMultDirection = -1 * me.movementMultDirection;
                                }
                                // me.movementMultDirection = followsParent ? 1 : -1;
                            }
    
    
                            if (me.lastScene != App.currentScene) {
                                me.lastScene = App.currentScene;
                                me.currentPosition.y = -40;
                            }
                            if (!App.isCompanionAllowed()) {
                                me.x = -100;
                                me.y = -100;
                                return;
                            }
    
                            me.animationFloat += (0.005 * App.deltaTime) % App.PI2;
                            me.bodyAnimationFloat += (0.0025 * App.deltaTime) % App.PI2;
                            me.currentPosition.x = lerp(me.currentPosition.x, me.targetPosition.x, 0.0005 * App.deltaTime);
                            me.x = me.currentPosition.x;
                            me.currentPosition.y = lerp(me.currentPosition.y, me.targetPosition.y, 0.0005 * App.deltaTime);
                            me.y = me.currentPosition.y + Math.sin(me.animationFloat);
    
                            const xDiff = Math.abs(me.currentPosition.x - me.targetPosition.x);
                            const yDiff = Math.abs(me.currentPosition.y - me.targetPosition.y);
                            me.targetMovementMult = Math.max((xDiff + yDiff) * 0.1, 1);
                            me.movementMult = lerp(me.movementMult, me.targetMovementMult * me.movementMultDirection, 0.01 * App.deltaTime);
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
    
                        switch (i) {
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
                    for (let i = 0; i < 4; i++) {
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
                        switch (i) {
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
                    for (let i = 0; i < 4; i++) {
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
                createFn: function (parent) {
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
    
                            if (!App.isCompanionAllowed()) {
                                me.x = -100;
                                me.y = -100;
                                return;
                            }
                        }
                    })
    
                    return cloof;
                }
            },
            'pumpkin': {
                image: 'resources/img/accessory/pumpkin_01.png',
                front: true,
                price: 150,
                isNew: false,
            },
            // gothic
            'demon wings': {
                image: 'resources/img/accessory/demon_wings_01.png',
                front: false,
                price: 350,
                isNew: false,
            },
            'fork': {
                image: 'resources/img/accessory/fork_01.png',
                front: true,
                price: 250,
                isNew: false,
            },
            'gothic hat': {
                image: 'resources/img/accessory/gothic_hat_01.png',
                front: true,
                price: 350,
                isNew: false,
            },
            // end gothic
            'cupid wings': {
                icon: 'resources/img/accessory/cupid_wings_01_icon.png',
                image: 'resources/img/accessory/cupid_wings_01.png',
                front: false,
                price: 350,
                isNew: false,
            },
            'purple headphones': {
                image: 'resources/img/accessory/purple_headphones_01.png',
                front: true,
                price: 300,
                isNew: false,
            },
            // valentine
            'bear hat': {
                image: 'resources/img/accessory/bear_hat_01.png',
                front: true,
                price: 400,
                isNew: false,
            },
            'bunny balloon': {
                image: 'resources/img/accessory/bunny_balloon_01.png',
                front: true,
                price: 350,
                isNew: false,
            },
            // rainbow
            'rainbow': {
                image: 'resources/img/accessory/rainbow_01.png',
                front: false,
                isCraftable: true,
                craftingRecipe: ['red tulip', 'cyan tulip', 'yellow tulip'],
            },
            'rainbow hat': {
                image: 'resources/img/accessory/rainbow_hat_01.png',
                front: true,
                isCraftable: true,
                craftingRecipe: ['blue tulip', 'purple tulip', 'green tulip'],
            },
            'bouquet': {
                image: 'resources/img/accessory/bouquet_01.png',
                front: true,
                isCraftable: true,
                craftingRecipe: ['red tulip', 'purple tulip', 'yellow tulip'],
            },
            // reviver
            'reviver hood': {
                image: 'resources/img/accessory/reviver_hood_01.png',
                front: true,
                price: -1, // makes it not buyable
            },
            // angel / devil
            'angel halo': {
                image: 'resources/img/accessory/angel_halo_01.png',
                front: true,
                price: -1,
            },
            'demon horns': {
                image: 'resources/img/accessory/demon_horns_01.png',
                front: true,
                price: -1,
            },
            'angel wings': {
                image: 'resources/img/accessory/angel_wings_01.png',
                front: false,
                price: -1,
                onDraw: (overlay) => {
                    const flapSpeed = overlay?.parent?.stats?.is_sleeping ? 0.0045 : 0.009; 
                    if(!overlay._flappingMotion) overlay._flappingMotion = 0;
                    overlay._flappingMotion += flapSpeed * App.deltaTime * Math.sinh(overlay.parent._ghostAnimationFloat - (Math.PI/2));
                    if(overlay._flappingMotion > App.PI2) overlay._flappingMotion = 0;
                    overlay.rotation = Math.sin(overlay._flappingMotion) * 6;
                },
            },
            'monster wings': {
                image: 'resources/img/accessory/demon_wings_02.png',
                front: false,
                price: -1,
                onDraw: (overlay) => {
                    const flapSpeed = overlay?.parent?.stats?.is_sleeping ? 0.0045 : 0.02; 
                    if(!overlay._flappingMotion) overlay._flappingMotion = 0;
                    overlay._flappingMotion += flapSpeed * App.deltaTime;
                    if(overlay._flappingMotion > App.PI2) overlay._flappingMotion = 0;
                    overlay.rotation = Math.sin(overlay._flappingMotion) * 6;
                },
            },
            // underworld shop
            'cone cap': {
                image: 'resources/img/accessory/cone_cap_01.png',
                front: true,
                price: 250,
                isNew: false,
                accessShop: 'devilsTown',
            },
            'dd head': {
                image: 'resources/img/accessory/deer_head_01.png',
                front: true,
                price: 250,
                isNew: false,
                accessShop: 'devilsTown',
            },
            'tilted fedora': {
                image: 'resources/img/accessory/fedora_01.png',
                front: true,
                price: 200,
                isNew: false,
                accessShop: 'devilsTown',
            },
            'kings crown': {
                image: 'resources/img/accessory/kings_crown_01.png',
                front: true,
                price: 350,
                isNew: false,
                accessShop: 'devilsTown',
            },
            'kings rod': {
                image: 'resources/img/accessory/kings_rod.png',
                front: true,
                price: 300,
                isNew: false,
                accessShop: 'devilsTown',
            },
            'monster hands': {
                image: 'resources/img/accessory/monster_hands_01.png',
                front: false,
                price: 400,
                isNew: false,
                accessShop: 'devilsTown',
            },
            'woodland headdress': {
                image: 'resources/img/accessory/woodland_headdress_01.png',
                front: true,
                price: 350,
                isNew: false,
                accessShop: 'devilsTown',
            },
            'tv head': {
                image: 'resources/img/accessory/tv_head_01.png',
                front: true,
                price: 350,
                isNew: false,
                accessShop: 'devilsTown',
            },
            'santa hat': {
                image: 'resources/img/accessory/santa_hat_01.png',
                front: true,
                price: 350,
                isNew: false,
                accessShop: 'none',
            },
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
            harvest_cook_x_times: {
                name: 'Farm-to-table Chef',
                description: `Successfully cook 10 food items using harvests!`,
                checkProgress: () => App.getRecord('harvestable_cooked_x_times') >= 10,
                advance: (amount) => App.addRecord('harvestable_cooked_x_times', amount),
                getReward: () => {
                    const [rewardFoodName, rewardFoodInfo] = shuffleArray(Object.entries(App.definitions.food))
                        .find( ([_, info]) => info.cookableOnly );
                    App.pet.stats.gold += 200;
                    App.addNumToObject(App.pet.inventory.food, rewardFoodName, 10);
                    App.displayPopup(`You've received $200 and <br>${App.getFoodCSprite(rewardFoodInfo.sprite)}<br> <b>${rewardFoodName}</b> <small>x5</small>`);
                }
            },
            camera_cook_x_times: {
                name: 'Camera Chef',
                description: `Successfully cook 10 food items using the camera!`,
                checkProgress: () => App.getRecord('camera_cooked_x_times') >= 10,
                advance: (amount) => App.addRecord('camera_cooked_x_times', amount),
                getReward: () => {
                    const [rewardFoodName, rewardFoodInfo] = shuffleArray(Object.entries(App.definitions.food))
                        .find( ([_, info]) => info.cookableOnly );
                    App.pet.stats.gold += 200;
                    App.addNumToObject(App.pet.inventory.food, rewardFoodName, 5);
                    App.displayPopup(`You've received $200 and <br>${App.getFoodCSprite(rewardFoodInfo.sprite)}<br> <b>${rewardFoodName}</b> <small>x5</small>`);
                }
            },
            reach_max_skill_expression: {
                name: 'Expressive',
                description: `Reach max expression skill!`,
                checkProgress: () => {
                    if(App.pet?.stats?.current_expression >= 100){
                        App.addRecord('reach_max_expression', 1, true)
                    }
                    return App.getRecord('reach_max_expression') >= 1;
                },
                advance: () => null,
                getReward: () => {
                    App.pet.stats.gold += 500;
                    App.displayPopup(`You've received $500!`);
                }
            },
            reach_max_skill_logic: {
                name: 'Thinker',
                description: `Reach max logic skill!`,
                checkProgress: () => {
                    if(App.pet?.stats?.current_logic >= 100){
                        App.addRecord('reach_max_logic', 1, true)
                    }
                    return App.getRecord('reach_max_logic') >= 1;
                },
                advance: () => null,
                getReward: () => {
                    App.pet.stats.gold += 500;
                    App.displayPopup(`You've received $500!`);
                }
            },
            reach_max_skill_endurance: {
                name: 'Resilient',
                description: `Reach max endurance skill!`,
                checkProgress: () => {
                    if(App.pet?.stats?.current_endurance >= 100){
                        App.addRecord('reach_max_endurance', 1, true)
                    }
                    return App.getRecord('reach_max_endurance') >= 1;
                },
                advance: () => null,
                getReward: () => {
                    App.pet.stats.gold += 500;
                    App.displayPopup(`You've received $500!`);
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
            perfect_minigame_cropmatch_win_x_times: {
                name: 'Memory Maestro',
                description: 'Win with perfect score in Crop Match game 10 times!',
                checkProgress: () => App.getRecord('times_perfected_cropmatch_minigame') >= 10,
                advance: (amount) => App.addRecord('times_perfected_cropmatch_minigame', amount),
                getReward: () => {
                    App.pet.stats.gold += 500;
                    App.displayPopup(`You've received $500!`);
                }
            },
            perfect_minigame_petgroom_win_x_times: {
                name: 'Master of the Fluff',
                description: 'Win with perfect score in Pet Grooming game 10 times!',
                checkProgress: () => App.getRecord('times_perfected_petgroom_minigame') >= 10,
                advance: (amount) => App.addRecord('times_perfected_petgroom_minigame', amount),
                getReward: () => {
                    App.pet.stats.gold += 200;
                    App.displayPopup(`You've received $200!`);
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
                    "The future looks sunny and full of joy for our favorite reader! Keep smiling, good things are coming.",
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
                    "Officials have recognized an extraordinary individual for their courage and kindness, congratulations to you!",
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
                    "Our newsroom agrees, you’re doing incredible things and deserve the spotlight. Shine on!",
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
                    "We see it, the way you keep moving forward, even when it’s hard. That strength is something to be proud of.",
                ],
                [
                    "Front Page Story: You Are Loved More Than You Know!",
                    "Sometimes it’s easy to forget, but you are deeply valued and appreciated by those around you. Don’t ever doubt it.",
                ],
                [
                    "Breaking Update: You’re Learning and Growing Every Day!",
                    "Every challenge you face is shaping you into someone even more incredible. Trust the process, you’re doing great.",
                ],
                [
                    "Special Report: Your Kind Heart Makes Life Better!",
                    "In a world that needs more love, your compassion is a gift that changes lives. Never underestimate its power.",
                ],
                [
                    "Top Story: You’re So Much Stronger Than You Feel Right Now!",
                    "It’s okay to have tough days, but remember, your resilience has carried you through so much already. Keep believing in yourself.",
                ],
                [
                    "Daily Reminder: You Deserve the Good Things Coming Your Way!",
                    "The kindness you’ve shown and the love you’ve shared are coming back to you. Be ready to receive them, you’ve earned it.",
                ],
                [
                    "Breaking Alert: Your Voice Matters and So Do You!",
                    "The way you think, feel, and express yourself makes the world richer. Your presence is a gift that can’t be replaced.",
                ],
                [
                    "Personal Feature: You’re Exactly Where You Need to Be!",
                    "Life isn’t a race, and every step you take is part of your unique story. You’re on the right path, trust yourself.",
                ],
                [
                    "Headline Scoop: You Have a Light That Guides Others!",
                    "Even when you don’t see it, your kindness and warmth inspire those around you. Keep shining, it’s beautiful.",
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
                ['#onthatgrind', 2, "resources/img/background/house/office_01.png", {
                    cellSize: 96, // App.drawer.bounds.width
                    cellNumber: 2,
                    rows: 1,
                    columns: 3
                }],
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
        },
    
        /* RABBIT HOLE ACTIVITIES */
        rabbit_hole_activities: [
            {
                name: 'Go to movies',
                duration: App.constants.ONE_HOUR * 0.75,
                onEnd: () => {
                    App.pet.stats.current_fun += 100;
                    App.pet.stats.current_hunger += 25;
                    App.petDefinition.adjustCare(true);
                }
            },
            {
                name: 'Visit library',
                duration: App.constants.ONE_HOUR * 0.25,
                withAnother: true,
                onEnd: () => {
                    App.pet.stats.current_fun += 50;
                }
            },
            {
                name: 'Go to restaurant',
                duration: App.constants.ONE_HOUR * 0.75,
                onEnd: () => {
                    App.pet.stats.current_fun += 25;
                    App.pet.stats.current_hunger += 100;
                    App.pet.stats.current_sleep -= 25;
                }
            },
            {
                name: 'Go to coffee shop',
                duration: App.constants.ONE_HOUR * 0.35,
                onEnd: () => {
                    App.pet.stats.current_fun += 35;
                    App.pet.stats.current_hunger += 30;
                    App.pet.stats.current_sleep -= 40;
                }
            },
            {
                name: 'Visit museum',
                duration: App.constants.ONE_HOUR * 1,
                onEnd: () => {
                    App.pet.stats.current_fun += 100;
                    App.pet.stats.current_hunger += 30;
                    App.pet.stats.current_sleep -= 10;
                    App.petDefinition.adjustCare(true);
                }
            },
            {
                name: 'Visit food festival',
                duration: App.constants.ONE_HOUR * 1,
                onEnd: () => {
                    App.pet.stats.current_fun += random(-50, 50);
                    App.pet.stats.current_hunger += 70;
                    App.pet.stats.current_sleep -= 25;
                }
            },
            {
                name: 'Attend concert',
                duration: App.constants.ONE_HOUR * 1.5,
                onEnd: () => {
                    App.pet.stats.current_fun += 100;
                    App.pet.stats.current_hunger += 40;
                    App.pet.stats.current_sleep -= 50;
                    App.petDefinition.adjustCare(true);
                }
            },
            {
                name: 'Visit theme park',
                duration: App.constants.ONE_HOUR * 2,
                onEnd: () => {
                    App.pet.stats.current_fun += 100;
                    App.pet.stats.current_hunger += 60;
                    App.pet.stats.current_sleep -= 75;
                    App.petDefinition.adjustCare(true);
                }
            },
            {
                name: 'Relax in nebula spa',
                duration: App.constants.ONE_HOUR * 0.5,
                onEnd: () => {
                    App.pet.stats.current_fun += 35;
                    App.pet.stats.current_hunger += 10;
                    App.pet.stats.current_sleep += 50;
                    App.pet.stats.current_health += 50;
                    App.petDefinition.adjustCare(true);
                }
            },
            {
                name: 'Explore alien forest',
                duration: App.constants.ONE_HOUR * 0.32,
                onEnd: () => {
                    App.pet.stats.current_fun += 30;
                    App.pet.stats.current_health += 20;
                }
            },
            {
                name: 'Go to starlight disco',
                duration: App.constants.ONE_HOUR * 1.5,
                isNew: false,
                onEnd: () => {
                    App.pet.stats.current_fun += 90;
                    App.pet.stats.current_hunger += 25;
                    App.pet.stats.current_sleep -= 50;
                }
            },
        ],

        /* GAMEPLAY BUFFS */
        gameplay_buffs: {
            // garden buffs
            doubleHarvest: {
                key: 'doubleHarvest',
                name: '+ Harvests',
                description: 'Increases the amount of harvests in the garden.',
                type: 'garden',
            },
            increasedWateredDuration: {
                key: 'increasedWateredDuration',
                name: '+ Wet Duration',
                description: 'Increases the amount the plants stay hydrated by 3 hours.',
                type: 'garden',
            },
            longerDeathDuration: {
                key: 'longerDeathDuration',
                name: '+ Health Duration',
                description: 'Increases the time before the plants start dying without water by 8 hours.',
                type: 'garden',
            },
            // alwaysWatered: {
            //     key: 'alwaysWatered',
            //     name: '∞ Infinite Water',
            //     description: 'Plants stay watered infinitely.',
            //     type: 'garden',
            // },
            shorterGrowthDelay: {
                key: 'shorterGrowthDelay',
                name: '+ Growth',
                description: 'Makes plants grow faster.',
                type: 'garden',
            },
        }
    }
})()