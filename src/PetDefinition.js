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
        talking: {
            start: 10,
            end: 11,
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
        mild_uncomfortable: {
            start: 4,
            end: 5,
            frameTime: 500,
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
            sound: {
                file: 'shock.ogg',
                interval: 0, // plays once
            },
        },
        blush: {
            start: 8,
            end: 9,
            frameTime: 250,
            sound: {
                file: 'blush.ogg',
                interval: 0, // plays once
            },
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
                    x: 10, y: 10, z: 8,
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
        },
        open_mouth: {
            start: 3,
            end: 4,
            frameTime: 250,
        }
    }
    stats = {
        speed: 0.01,
        // hunger
        max_hunger: 100,
        hunger_satisfaction: 85, // note: when reaching this they won't want anymore food
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
        child_max_death_tick: 60, // ~ ?? hours
        teen_max_death_tick: 74, // ~ 40 hours
        death_tick_rate: 0.000289,
        // care
        max_care: 3,
        // wander (sec)
        wander_min: 0.5,
        wander_max: 4,
        
        // discipline
        max_discipline: 100,
        discipline_depletion_rate: 0.00009, // 154 hours
        is_misbehaving: false,
        last_time_praise_given: 0,
        last_time_misbehave_attempted: Date.now(),

        // current
        current_hunger: 40 || 80,
        current_sleep: 70,
        current_fun: 10,
        current_bladder: 10,
        current_health: 90,
        current_cleanliness: 50,
        current_death_tick: 100,
        current_care: 1,
        current_discipline: random(5, 20),

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
        },
        should_care_increase: true,
        used_toilet: 0,
        is_potty_trained: false,
        current_rabbit_hole: {
            name: false,
            endTime: false,
        },
        is_revived_once: false,
        is_ghost: false,
        last_eaten: [],

        // skill points
        current_expression: 0,
        current_logic: 0,
        current_endurance: 0,

        // school class visits
        schoolClassesToday: 0,
        lastSchoolClassLimitReset: Date.now(),
        has_received_school_invite: false,

        // gender
        gender: randomFromArray(App.constants.GENDERS),
    }
    friends = [];
    family = [];
    deceasedPredecessors = [];
    inventory = {
        food: {
            'bread': 10,
            'pizza': 2,
            'paster': 2,
            'lollipop': 3,
            'cupcake': 3,
            'medicine': 2,
        },
        item: { 'rattle': 1 },
        accessory: {},
        harvests: {}, seeds: {}, misc: {},
    }
    accessories = [];

    constructor(config) {
        if(config){
            Object.assign(this, config);
        }

        this.prepareSprite();
    }

    getSpritesheetDefinition(){
        if(this.spritesheet) {
            this.spritesheet = {
                ...this.spritesheet
            }
        }
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
        'spriteSkin',
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
                    current_care: this.stats.current_care,
                    should_care_increase: this.stats.should_care_increase,
                    used_toilet: this.stats.used_toilet,
                    is_potty_trained: this.stats.is_potty_trained,
                    current_rabbit_hole: this.stats.current_rabbit_hole,
                    is_revived_once: this.stats.is_revived_once,
                    last_eaten: this.stats.last_eaten,
                    schoolClassesToday: this.stats.schoolClassesToday,
                    lastSchoolClassLimitReset: this.stats.lastSchoolClassLimitReset,
                    has_received_school_invite: this.stats.has_received_school_invite,
                    current_expression: this.stats.current_expression,
                    current_logic: this.stats.current_logic,
                    current_endurance: this.stats.current_endurance,
                    current_discipline: this.stats.current_discipline,
                    last_time_praise_given: this.stats.last_time_praise_given,
                    last_time_misbehave_attempted: this.stats.last_time_misbehave_attempted,
                    is_misbehaving: this.stats.is_misbehaving,
                    has_received_school_invite: this.stats.has_received_school_invite,
                    gender: this.stats.gender,
                    is_ghost: this.stats.is_ghost,
                }
                return;
            }

            switch(serializable){
                case "friends":
                    s['friends'] = this.friends.map(friendDef => {
                        const minimizedPetDef = App.minimalizePetDef(friendDef.serializeStats(true));
                        return {
                            ...minimizedPetDef, 
                            stats: {
                                ...minimizedPetDef.stats,
                                player_friendship: friendDef.stats.player_friendship,
                                is_player_family: friendDef.stats.is_player_family,
                                is_ghost: friendDef.stats.is_ghost,
                            }
                        };
                    })
                    return;
                case "birthday":
                case "lastBirthday":
                    s[serializable] = new Date(this[serializable]).getTime();
                    return;
            }
            s[serializable] = this[serializable];
        });

        return s;
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
        this.stats.is_misbehaving = false;
        this.stats.current_discipline = 100;
        this.stats.current_care = 3;
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
        return PetDefinition.getLifeStage(this.sprite);
    }

    getLifeStageLabel(){
        let age;
        switch(this.getLifeStage()){
            case PetDefinition.LIFE_STAGE.baby: age = 'baby'; break;
            case PetDefinition.LIFE_STAGE.child: age = 'child'; break;
            case PetDefinition.LIFE_STAGE.teen: age = 'teen'; break;
            case PetDefinition.LIFE_STAGE.elder: age = 'elder'; break;
            default: age = 'adult';
        }
        return age;
    }

    prepareSprite(){
        this.lifeStage = this.getLifeStage();
        this.getSpritesheetDefinition();  
    }

    getNextBirthdayDate(){
        let m = moment(this.lastBirthday);
        switch(this.lifeStage){
            case PetDefinition.LIFE_STAGE.baby:
                return m.add(App.constants.MANUAL_AGE_HOURS_BABY, 'hours');
            case PetDefinition.LIFE_STAGE.child:
                return m.add(App.constants.MANUAL_AGE_HOURS_CHILD, 'hours');
            case PetDefinition.LIFE_STAGE.teen:
                return m.add(App.constants.MANUAL_AGE_HOURS_TEEN, 'hours');
            case PetDefinition.LIFE_STAGE.adult:
                return m.add(App.constants.MANUAL_AGE_HOURS_ADULT, 'hours');
        }
        return false;
    }

    getNextAutomaticBirthdayDate(){
        let m = moment(this.birthday);
        switch(this.lifeStage){
            case PetDefinition.LIFE_STAGE.baby:
                return m.add(App.constants.AUTO_AGE_HOURS_BABY, 'hours');
            case PetDefinition.LIFE_STAGE.child:
                return m.add(App.constants.AUTO_AGE_HOURS_CHILD, 'hours');
            case PetDefinition.LIFE_STAGE.teen:
                return m.add(App.constants.AUTO_AGE_HOURS_TEEN, 'hours');
            case PetDefinition.LIFE_STAGE.adult:
                return m.add(App.constants.AUTO_AGE_HOURS_ADULT, 'hours');
        }
        return false;
    }

    ageUp(isNpc){
        const evolutions = this.getPossibleEvolutions(isNpc);
        if(!evolutions) return false;

        this.sprite = randomFromArray(evolutions);

        this.lastBirthday = new Date();
        this.prepareSprite();

        this.friends?.forEach(friendDef => {
            if(friendDef.ageUp) friendDef.ageUp(true);
        })

        return true;
    }

    getPossibleEvolutions(isNpc, all){
        const { bounds, ratings } = App.constants.SKILL_EVOLUTION_EFFECTIVENESS;
 
        const careRating = !isNpc ? this.stats.current_care : random(1, 3);
        let possibleEvolutions = GROWTH_CHART[this.sprite];
        if(!possibleEvolutions){
            possibleEvolutions = GROWTH_CHART[randomFromArray(Object.keys(GROWTH_CHART))]
        }

        if(all) return possibleEvolutions;

        const skills =  {
            endurance: this.stats.current_endurance,
            logic: this.stats.current_logic,
            expression: this.stats.current_expression,
        }
        const topSkill = Object.entries(skills).reduce((best, [key, value]) => {
        if (value <= bounds) return best;
        return !best || value > best[1] ? [key, value] : best;
        }, null)?.[0];

        let finalRating = careRating;
        if(careRating > 1 && App.settings.skillsAffectingEvolution){
            const topSkillRating = ratings[topSkill];
            if(topSkillRating) finalRating = topSkillRating;
        }

        switch(this.lifeStage){
            case PetDefinition.LIFE_STAGE.adult:
                if(
                    isNpc && 
                    App.petDefinition?.getLifeStage() !== PetDefinition.LIFE_STAGE.elder
                ) return false;
                return [possibleEvolutions[0]];
            case PetDefinition.LIFE_STAGE.baby:
            case PetDefinition.LIFE_STAGE.child:
            case PetDefinition.LIFE_STAGE.teen:
                switch(finalRating){
                    case 1: return [possibleEvolutions[0]]; // low care, endurance skill
                    case 3: return [possibleEvolutions[2]]; // high care, expression skill
                    default: return [possibleEvolutions[1]]; // default medium care, logic skill
                }
            default: return false;
        }
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

    getCSprite(noMargin){
        const className = PetDefinition.getSpriteClassName(this);
        return PetDefinition.generateCSprite(this.sprite, noMargin, className);
    }

    getFullCSprite(){
        const className = PetDefinition.getSpriteClassName(this);
        return PetDefinition.generateFullCSprite(this.sprite, null, className);
    }

    getParents(){
        if(!this.friends.length) return false;

        let parents = this.friends.filter(friendDef => friendDef.stats.is_player_family);
        if(!parents.length) return false;
        
        return parents;
    }

    refreshWant(currentTry = 1, existingCurrentCategory, forced){
        if(currentTry > 48 && !forced) {
            console.error('Failed to pick a want:', {existingCurrentCategory, forced})
            return;
        }

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
                const wantedFoodDef = App.definitions.food[wantedFood];
                if(
                    ('age' in wantedFoodDef 
                    && !wantedFoodDef.age.includes(this.lifeStage) )
                    || ['med', 'treat'].includes(wantedFoodDef.type)
                ) return this.refreshWant(++currentTry, currentCategory);
                current_want.type = App.constants.WANT_TYPES.food;
                current_want.item = wantedFood;
                break;
            case "snack": // item is food name
                const wantedSnack = randomFromArray(Object.keys(App.definitions.food));
                const wantedSnackDef = App.definitions.food[wantedSnack];
                if(
                    ('age' in wantedSnackDef 
                    && !wantedSnackDef.age.includes(this.lifeStage) )
                    || !['treat'].includes(wantedSnackDef.type)
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
                const appropriateItems = Object.keys(App.definitions.item)
                    .map(itemName => ({name: itemName, ...App.definitions.item[itemName]}))
                    .filter(item => !item.age || item.age?.includes(App.petDefinition.lifeStage))
                    .map(item => item.name)
                const wantedItem = randomFromArray(appropriateItems);
                current_want.type = App.constants.WANT_TYPES.item;
                current_want.item = wantedItem;
                break;
            case "minigame": // item is not used
                current_want.type = App.constants.WANT_TYPES.minigame;
                current_want.item = true;
                break;
        }

        current_want.appearTime = App.fullTime;
        current_want.next_refresh_ms = App.fullTime += (1000 * 60 * random(20, 60)); // 30-60 min
    }
    clearWant(fulfilled){
        const {current_want} = this.stats;
        console.log('want cleared', {fulfilled});
        current_want.type = null;
        current_want.item = null;
        current_want.appearTime = null;
        current_want.pendingFulfilled = fulfilled;

        if(fulfilled){
            this.stats.current_fun += random(30, 50);
            this.stats.current_discipline += random(3, 6);
            this.adjustCare(true);
            Missions.done(Missions.TYPES.fulfill_want);
        } else {
            if(!random(0, 4)) this.adjustCare(false);
        }
    }
    checkWant(condition, type){
        if(!condition || type !== this.stats.current_want.type) return false;

        this.clearWant(true);
        return true;
    }
    getWantName(){
        switch(this.stats.current_want.type){
            case App.constants.WANT_TYPES.item:
            case App.constants.WANT_TYPES.food:
                return this.stats.current_want.item;
            case App.constants.WANT_TYPES.playdate:             
                return this.friends?.at(this.stats.current_want.item)?.name || "Friend";
            case App.constants.WANT_TYPES.minigame:
                return "Game Center";
        }
        return "Unknown";
    }
    adjustCare(add){
        if(add) this.stats.current_care += 1;
        else this.stats.current_care -= 1;
        this.stats.current_care = clamp(this.stats.current_care, 1, this.stats.max_care);
    }
    getCharHash(){
        const sprite = this.sprite.split('/').at(-1) || this.sprite;
        return hashCode(sprite);
    }

    spritesheetDefinitions = {
        [PetDefinition.LIFE_STAGE.baby]: { // baby
            cellNumber: 1,
            cellSize: 16,
            rows: 4,
            columns: 4,
            offsetY: 8,
        },
        [PetDefinition.LIFE_STAGE.child]: { // child
            cellNumber: 1,
            cellSize: 24,
            rows: 4,
            columns: 4,
            offsetY: 4,
        },
        [PetDefinition.LIFE_STAGE.teen]: { // teen
            cellNumber: 1,
            cellSize: 24,
            rows: 4,
            columns: 4,
            offsetY: 4,
        },
        [PetDefinition.LIFE_STAGE.adult]: { // adult
            cellNumber: 1,
            cellSize: 32,
            rows: 4,
            columns: 4,
            offsetY: 0,
        },
        [PetDefinition.LIFE_STAGE.elder]: { // elder
            cellNumber: 1,
            cellSize: 32,
            rows: 4,
            columns: 4,
            offsetY: 0,
        }
    }

    static generateCSprite(sprite, noMargin, className){
        const margin = noMargin ? 0 : 10;
        const lifeStage = PetDefinition.getLifeStage(sprite);
        switch(lifeStage){
            case PetDefinition.LIFE_STAGE.baby:
                return `<c-sprite class="${className}" width="16" height="16" index="0" src="${sprite}" pos-x="0" pos-y="0" style="margin-right: ${margin}px;"></c-sprite>`;
            case PetDefinition.LIFE_STAGE.child:
            case PetDefinition.LIFE_STAGE.teen:
                return `<c-sprite class="${className}" width="16" height="16" index="0" src="${sprite}" pos-x="4" pos-y="4" style="margin-right: ${margin}px;"></c-sprite>`;
            default:
                return `<c-sprite class="${className}" width="20" height="20" index="0" src="${sprite}" pos-x="6" pos-y="4" style="margin-right: ${margin}px;"></c-sprite>`;
        }
    }

    static generateFullCSprite(sprite, noMargin, className){
        const lifeStage = PetDefinition.getLifeStage(sprite);

        switch(lifeStage){
            case PetDefinition.LIFE_STAGE.baby:
                return `<c-sprite class="${className}" width="16" height="16" index="0" src="${sprite}" pos-x="0" pos-y="0"></c-sprite>`;
            case PetDefinition.LIFE_STAGE.child:
            case PetDefinition.LIFE_STAGE.teen:
                return `<c-sprite class="${className}" width="24" height="24" index="0" src="${sprite}" pos-x="0" pos-y="0"></c-sprite>`;
            default:
                return `<c-sprite class="${className}" width="32" height="32" index="0" src="${sprite}" pos-x="0" pos-y="0"></c-sprite>`;
        }
    }

    static getLifeStage(sprite){
        if(PET_BABY_CHARACTERS.some(char => char === sprite)) return PetDefinition.LIFE_STAGE.baby;
        else if(PET_TEEN_CHARACTERS.some(char => char === sprite)) return PetDefinition.LIFE_STAGE.teen;
        else if(PET_CHILD_CHARACTERS.some(char => char === sprite)) return PetDefinition.LIFE_STAGE.child;
        else if(PET_ELDER_CHARACTERS.some(char => char === sprite)) return PetDefinition.LIFE_STAGE.elder;
        return PetDefinition.LIFE_STAGE.adult;
    }

    static getCharCode(sprite){
        return sprite.replace(/\D+/g, '');
    }

    static getOffspringSprite(petA, petB, spritesArray = PET_BABY_CHARACTERS){
        const seed = (petA.getCharHash() + petB.getCharHash());
        pRandom.save();
        pRandom.seed = seed;
        const sprite = pRandomFromArray(spritesArray) || spritesArray[0];
        pRandom.load();
        return sprite;
    }

    static getSpriteClassName(petDef){
        if(!petDef?.stats?.is_ghost) return '';

        if(petDef.stats.is_ghost === PetDefinition.GHOST_TYPE.angel) 
            return 'ghost angel';

        return 'ghost devil';
    }

    static LIFE_STAGE = {
        baby: 0,
        child: 0.5,
        teen: 1,
        adult: 2,
        elder: 3,
    }

    static GHOST_TYPE = {
        angel: 1,
        devil: 2,
    }
}