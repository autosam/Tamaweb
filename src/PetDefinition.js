class PetDefinition {
    // sprite data
    spritesheet = {
        cellNumber: 0,
        cellSize: 32,
        rows: 4,
        columns: 4,
    };

    // metadata
    birthday = new Date();
    lastBirthday = new Date();
    animations = {
        idle: {
            start: 1,
            end: 2,
            frameTime: 500
        },
        idle_side: {
            start: 9,
            end: 10,
            frameTime: 500
        },
        idle_uncomfortable: {
            start: 4,
            end: 5,
            frameTime: 500,
        },
        idle_side_uncomfortable: {
            start: 12,
            end: 13,
            frameTime: 1000,
        },
        moving: {
            start: 10,
            end: 12,
            frameTime: 100,
            // sound: {
            //     file: 'walk_01.ogg',
            //     interval: 2,
            // },
        },
        sitting: {
            start: 14,
            end: 15,
            frameTime: 300
        },
        uncomfortable: {
            start: 4,
            end: 6,
            frameTime: 500,
            sound: {
                file: 'sad.ogg',
                interval: 2,
            },
        },
        angry: {
            start: 6,
            end: 7,
            frameTime: 500,
            sound: {
                file: 'angry.ogg',
                interval: 2,
            },
        },
        eating: {
            start: 14,
            end: 16,
            frameTime: 250,
            sound: {
                file: 'eat.ogg',
                interval: 2,
            },
        },
        shocked: {
            start: 7,
            end: 8,
            frameTime: 250,
        },
        blush: {
            start: 8,
            end: 9,
            frameTime: 250,
        },
        cheering: {
            start: 2,
            end: 4,
            frameTime: 250,
            sound: {
                file: 'cheer.ogg',
                interval: 2,
            },
        },
        cheering_with_icon: {
            start: 2,
            end: 4,
            frameTime: 250,
            // sound: {
            //     file: 'cheer.ogg',
            //     interval: 2,
            // },
            objects: [
                {
                    img: 'resources/img/misc/happy_icon.png',
                    x: 10, y: 10,
                    interval: 2,
                }
            ]
        },
        jumping: {
            start: 2,
            end: 3,
            frameTime: 250,
        },
        refuse: {
            start: 4,
            end: 7,
            frameTime: 300,
            sound: {
                file: 'refuse.ogg',
                interval: 2,
            },
        },
        sleeping: {
            start: 16,
            end: 17,
            frameTime: 1000,
        },
        kissing: {
            start: 12,
            end: 14,
            frameTime: 250,
        },
        battle: {
            start: 1,
            end: 3,
            frameTime: 350 + Math.random() * 250,
        }
    }
    stats = {
        speed: 0.01,
        // hunger
        max_hunger: 100,
        hunger_satisfaction: 80, // note: when reaching this they won't want anymore food
        hunger_min_desire: 40, // note: when below this number they desire it
        hunger_depletion_rate: 0.0145,
        activity_hunger_depletion: 0.5,
        // sleep
        max_sleep: 100,
        sleep_satisfaction: 70,
        sleep_min_desire: 20,
        sleep_depletion_rate: 0.0034,
        sleep_replenish_rate: 0.1,
        light_sleepiness: 0.01,
        activity_sleep_depletion: 0.3,
        // fun
        max_fun: 100,
        fun_min_desire: 35,
        fun_satisfaction: 70,
        fun_depletion_rate: 0.0235,
        // bladder
        max_bladder: 100,
        bladder_depletion_rate: 0.015,
        // health
        max_health: 100,
        health_depletion_mult: 0.5, // from 0 to 1, 0 means immune to all health risks
        health_depletion_rate: 0.0055,
        // cleanliness
        max_cleanliness: 100,
        cleanliness_depletion_mult: 20,
        cleanliness_depletion_rate: 0.0115,
        // death ticker
        max_death_tick: 100, // ~ 54 hours
        baby_max_death_tick: 44, // ~ 24 hours
        teen_max_death_tick: 74, // ~ 40 hours
        death_tick_rate: 0.000289,
        // wander (sec)
        wander_min: 1.5,
        wander_max: 8,

        // current
        current_hunger: 40 || 80,
        current_sleep: 70,
        current_fun: 10,
        current_bladder: 10,
        current_health: 90,
        current_cleanliness: 50,
        current_death_tick: 100,

        // gold
        gold: 15,

        // other stats
        is_sleeping: false,
        has_poop_out: false,
        is_egg: false,
        is_player_family: false,
        is_at_parents: false,
        is_dead: false,
        is_at_vacation: false,
        current_want: {
            type: null,
            item: null,
            appearTime: null,
            pendingFulfilled: null,
            next_refresh_ms: new Date().getTime() + random(5000, 30000),
        }
    }
    friends = [];
    family = [];
    deceasedPredecessors = [];
    inventory = {
        food: {
            'bread': 1,
            'slice of pizza': 3,
        },
        item: { },
        accessory: { },
    }
    accessories = [];

    constructor(config) {
        if(config){
            Object.assign(this, config);
        }

        this.prepareSprite();
    }

    getSpritesheetDefinition(){
        this.spritesheet = this.spritesheetDefinitions[this.lifeStage + ''];
    }
    
    serializables = [
        'name', 
        'stats', 
        'inventory', 
        'friends', 
        'family', 
        'sprite', 
        'birthday', 
        'lastBirthday', 
        'accessories',
        'deceasedPredecessors',
    ];
    serializeStats(noStringify){
        let s = {};
        this.serializables.forEach(serializable => {
            if(serializable === 'stats'){
                s['stats'] = { // todo: for testing, might want to revert
                    gold: this.stats.gold,
                    current_bladder: this.stats.current_bladder,
                    current_fun: this.stats.current_fun,
                    current_hunger: this.stats.current_hunger,
                    current_sleep: this.stats.current_sleep,
                    current_health: this.stats.current_health,
                    current_cleanliness: this.stats.current_cleanliness,
                    current_death_tick: this.stats.current_death_tick,
                    has_poop_out: this.stats.has_poop_out,
                    is_sleeping: this.stats.is_sleeping,
                    is_egg: this.stats.is_egg,
                    is_player_family: this.stats.is_player_family,
                    player_friendship: this.stats.player_friendship,
                    is_at_parents: this.stats.is_at_parents,
                    is_at_vacation: this.stats.is_at_vacation,
                    is_dead: this.stats.is_dead,
                    current_want: this.stats.current_want,
                }
                return;
            }
            if(serializable === 'friends'){
                s['friends'] = this.friends.map(friendDef => {
                    return friendDef.serializeStats(true);
                })
                return;
            }
            s[serializable] = this[serializable];
        });

        if(noStringify) return s;
        return JSON.stringify(s);
    }
    loadStats(json){
        this.serializables.forEach(serializable => {
            if(!json[serializable]) return;

            // if(serializable == 'lastBirthday' || serializable == 'birthday'){
            //     return;
            // }

            if(typeof json[serializable] === 'object'){
                Object.assign(this[serializable], json[serializable]);
            } else {
                this[serializable] = json[serializable];
            }
        });

        // changing psuedo pet defs to real ones
        if(this.friends.length) {
            this.friends = this.friends.map(friend => {
                let def = new PetDefinition().loadStats(friend);
                def.friends = [];
                return def;
            });
        }

        this.prepareSprite();

        return this;
    }
    setStats(stats){
        Object.assign(this.stats, stats);
        return this;
    }
    maxStats(){
        this.stats.current_hunger = 100;
        this.stats.current_fun = 100;
        this.stats.current_sleep = 100;
        this.stats.current_health = 100;
        this.stats.current_bladder = 100;
        this.stats.current_cleanliness = 100;
        this.stats.current_death_tick = 100;
        this.stats.has_poop_out = false;
        this.stats.is_dead = false;
    }

    loadAccessories(accessories){
        if(accessories) this.accessories = accessories;
        return this;
    }

    increaseFriendship(value){
        if(!value) value = random(5, 10);

        if(!this.stats.player_friendship) this.stats.player_friendship = value;
        else this.stats.player_friendship += value;

        this.stats.player_friendship = clamp(this.stats.player_friendship, 1, 100);
    }

    getFriendship(){
        if(!this.stats.player_friendship)
            this.increaseFriendship(random(2, 8));
        return this.stats.player_friendship;
    }

    getLifeStage(){
        return PetDefinition._getLifeStage(this.sprite);
    }

    getLifeStageLabel(){
        let age = 'baby';
        switch(App.petDefinition.getLifeStage()){
            case 1: age = 'teen'; break;
            case 2: age = 'adult'; break;
        }
        return age;
    }

    prepareSprite(){
        this.lifeStage = this.getLifeStage();
        this.getSpritesheetDefinition();  
    }

    getNextBirthdayDate(){
        let m = moment(this.lastBirthday).utc();
        switch(this.lifeStage){
            case 0:
                return m.add(App.constants.MANUAL_AGE_HOURS_BABY, 'hours');
            case 1:
                return m.add(App.constants.MANUAL_AGE_HOURS_TEEN, 'hours');
        }
        return false;
    }

    getNextAutomaticBirthdayDate(){
        let m = moment(this.birthday).utc();
        switch(this.lifeStage){
            case 0:
                return m.add(App.constants.AUTO_AGE_HOURS_BABY, 'hours');
            case 1:
                return m.add(App.constants.AUTO_AGE_HOURS_TEEN, 'hours');
        }
        return false;
    }

    ageUp(isNpc){
        /* let charName = this.sprite.slice(this.sprite.lastIndexOf('/') + 1);
        let seed = charName.replace(/\D+/g, '');
        seed += '854621';

        const careRating =  (this.stats.current_hunger +
                            this.stats.current_fun +
                            this.stats.current_health + 
                            this.stats.current_sleep) / 4;

        // seed += this.stats.current_hunger >= (this.stats.max_hunger / 2) ? 1 : 2;
        // seed += this.stats.current_health >= (this.stats.max_health / 2) ? 1 : 2;
        // seed += this.stats.current_fun >= (this.stats.max_fun / 2) ? 1 : 2;
        // seed += this.stats.current_sleep >= (this.stats.max_sleep / 2) ? 1 : 2;
        // seed += this.stats.has_poop_out ? 1 : 2;
        if(careRating > 80) seed += 861;
        else if(careRating > 40) seed += 53;
        else seed += 7;
        
        if(isNpc) seed = random(1, 99999999999);
        
        pRandom.seed = Number(seed) + 987321654;

        switch(this.getLifeStage()){
            case 0:
                this.sprite = pRandomFromArray(PET_TEEN_CHARACTERS);
                break;
            case 1:
                this.sprite = pRandomFromArray(PET_ADULT_CHARACTERS);
                break;
            default: return false;
        } */

        let careRating =  (this.stats.current_hunger +
            this.stats.current_fun +
            this.stats.current_sleep) / 3;

        if(isNpc) careRating = random(0, 100);

        let possibleEvolutions = GROWTH_CHART[this.sprite];

        switch(this.lifeStage){
            case 0:
                let targetEvolutions;
                if(careRating > 50) targetEvolutions = possibleEvolutions.slice(4, 8); // high care
                else targetEvolutions = possibleEvolutions.slice(0, 4); // low care
                this.sprite = randomFromArray(targetEvolutions);
                break;
            case 1:
                if(careRating > 80) this.sprite = possibleEvolutions[2]; // high care
                else if(careRating > 40) this.sprite = possibleEvolutions[1]; // medium care
                else this.sprite = possibleEvolutions[0]; // low care
                break;
            case 2: return;
        }

        this.lastBirthday = new Date();
        this.prepareSprite();

        this.friends.forEach(friendDef => {
            if(friendDef.ageUp) friendDef.ageUp(true);
        })

        return true;
    }

    addFriend(friendDef, friendship){
        if(this.friends.indexOf(friendDef) === -1){ // checking friends list
            let friendDefS = friendDef.name + friendDef.sprite;
            let haveMatchingDef = this.friends.some(activeFriendDef => {
                let activeFriendDefS = activeFriendDef.name + activeFriendDef.sprite;
                if(activeFriendDefS == friendDefS) return true;
                return false;
            });
            if(!haveMatchingDef){ // new friend
                this.friends.push(friendDef);
                friendDef.increaseFriendship(friendship);
                return true;
            } else { // not new friend
                return false;
            }
        }

        return false;
    }

    getCSprite(){
        return PetDefinition.generateCSprite(this.sprite);
    }

    getFullCSprite(){
        return PetDefinition.generateFullCSprite(this.sprite);
    }

    getParents(){
        if(!this.friends.length) return false;

        let parents = this.friends.filter(friendDef => friendDef.stats.is_player_family);
        if(!parents.length) return false;
        
        return parents;
    }

    refreshWant(currentTry = 1, existingCurrentCategory){
        if(currentTry > 48) return;

        const {current_want} = this.stats;

        if(current_want.type){ // has unfulfilled want
            this.clearWant(false);
        }

        const possibleCategories = [
            'food',
            'snack',
            'playdate',
            'item',
            'minigame',
            // 'park',
            // 'redecor',
            // 'accessory',
        ]

        if(App.pet.hasMoodlet('hungry')){
            possibleCategories.push('hungry', 'hungry', 'hungry');
        }

        const currentCategory = /* 'minigame' ||  */existingCurrentCategory || randomFromArray(possibleCategories);

        switch(currentCategory){
            case "food": // item is food name
                const wantedFood = randomFromArray(Object.keys(App.definitions.food));
                if(
                    !App.definitions.food[wantedFood].age.includes(this.lifeStage) 
                    || ['med', 'treat'].includes(App.definitions.food[wantedFood].type)
                ) return this.refreshWant(++currentTry, currentCategory);
                current_want.type = App.constants.WANT_TYPES.food;
                current_want.item = wantedFood;
                break;
            case "snack": // item is food name
                const wantedSnack = randomFromArray(Object.keys(App.definitions.food));
                if(
                    !App.definitions.food[wantedSnack].age.includes(this.lifeStage) 
                    || !['treat'].includes(App.definitions.food[wantedSnack].type)
                ) return this.refreshWant(++currentTry, currentCategory);
                current_want.type = App.constants.WANT_TYPES.food;
                current_want.item = wantedSnack;
                break;
            case "playdate": // item is friend index
                if(!this.friends.length) return this.refreshWant(++currentTry);
                const wantedFriendIndex = random(0, this.friends.length - 1);
                current_want.type = App.constants.WANT_TYPES.playdate;
                current_want.item = wantedFriendIndex;
                break;
            case "item": // item is item name
                const wantedItem = randomFromArray(Object.keys(App.definitions.item));
                current_want.type = App.constants.WANT_TYPES.item;
                current_want.item = wantedItem;
                break;
            case "minigame": // item is not used
                current_want.type = App.constants.WANT_TYPES.minigame;
                current_want.item = true;
                break;
        }

        current_want.appearTime = App.fullTime;
        current_want.next_refresh_ms = App.fullTime += (1000 * 60 * random(30, 60)); // 30-60 min
    }
    clearWant(fulfilled){
        const {current_want} = this.stats;
        console.log('WANT CLEARED', {fulfilled, current_want});
        current_want.type = null;
        current_want.item = null;
        current_want.appearTime = null;
        current_want.pendingFulfilled = fulfilled;

        if(fulfilled){
            this.stats.current_fun += random(30, 50);
        }
    }
    checkWant(condition, type){
        if(!condition || type !== this.stats.current_want.type) return false;

        this.clearWant(true);
        return true;
    }

    spritesheetDefinitions = {
        '0': { // baby
            cellNumber: 1,
            cellSize: 16,
            rows: 4,
            columns: 4,
            offsetY: 8,
        },
        '1': { // teen
            cellNumber: 1,
            cellSize: 24,
            rows: 4,
            columns: 4,
            offsetY: 4,    
        },
        '2': { // adult
            cellNumber: 1,
            cellSize: 32,
            rows: 4,
            columns: 4,
        }
    }

    static generateCSprite(sprite, noMargin){
        const margin = noMargin ? 0 : 10;
        const lifeStage = PetDefinition._getLifeStage(sprite);
        if(lifeStage == 0) return `<c-sprite width="16" height="16" index="0" src="${sprite}" pos-x="0" pos-y="0" style="margin-right: ${margin}px;"></c-sprite>`;
        if(lifeStage == 1) return `<c-sprite width="16" height="16" index="0" src="${sprite}" pos-x="4" pos-y="4" style="margin-right: ${margin}px;"></c-sprite>`;
        return `<c-sprite width="20" height="20" index="0" src="${sprite}" pos-x="6" pos-y="4" style="margin-right: ${margin}px;"></c-sprite>`;
    }

    static generateFullCSprite(sprite){
        const lifeStage = PetDefinition._getLifeStage(sprite);
        if(lifeStage == 0) return `<c-sprite width="16" height="16" index="0" src="${sprite}" pos-x="0" pos-y="0"></c-sprite>`;
        if(lifeStage == 1) return `<c-sprite width="24" height="24" index="0" src="${sprite}" pos-x="0" pos-y="0"></c-sprite>`;
        return `<c-sprite width="32" height="32" index="0" src="${sprite}" pos-x="0" pos-y="0"></c-sprite>`;
    }

    static _getLifeStage(sprite){
        if(PET_BABY_CHARACTERS.some(char => char === sprite)) return 0;
        else if(PET_TEEN_CHARACTERS.some(char => char === sprite)) return 1;
        return 2;
    }
}