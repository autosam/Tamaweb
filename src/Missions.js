const Missions = {
    current: [],
    currentPts: 0,
    currentStep: 0,
    refreshTime: 0,
    MAX_STEPS: 4,
    TYPES: {
        food: 'food',
        pat: 'pat',
        gift: 'gift',
        cook: 'cook',
        win_game: 'win_game',
        online_interact: 'online_interact',
        buy_food: 'buy_food',
        playdate: 'playdate',
        check_social_post: 'check_social_post',
        find_park_friend: 'find_park_friend',
        use_bath: 'use_bath',
        use_toilet: 'use_toilet',
        clean_room: 'clean_room',
        visit_doctor: 'visit_doctor',
        fulfill_want: 'fulfill_want',
        play_item: 'play_item',
        visit_online_hub: 'visit_online_hub',
        visit_mall: 'visit_mall',
        visit_market: 'visit_market',
        plant_in_garden: 'plant_in_garden',
        water_crop: 'water_crop',
        play_with_animal: 'play_with_animal',
        feed_animal: 'feed_animal',
        order_food: 'order_food',
        earn_school_points: 'earn_school_points',
    },
    TYPE_DESCRIPTIONS: {
        food: 'Eat food',
        pat: 'Pat your pet',
        gift: 'Give gift to a friend',
        cook: 'Cook',
        win_game: 'Win at the game center',
        online_interact: 'Interact with online players',
        buy_food: 'Buy food or snacks',
        playdate: 'Invite a friend over',
        check_social_post: 'Check social media posts',
        find_park_friend: 'Find a park friend',
        use_bath: 'Bathe your pet',
        use_toilet: 'Use the toilet',
        clean_room: 'Clean the room',
        visit_doctor: 'Visit the doctor',
        fulfill_want: "Fulfill your pet's want",
        play_item: 'Play with an item',
        visit_online_hub: 'Visit Hubchi',
        visit_mall: 'Visit the mall',
        visit_market: 'Visit the market',
        plant_in_garden: 'Plant something in the garden',
        water_crop: 'Water your garden plant',
        play_with_animal: 'Play with your pet animal',
        feed_animal: 'Feed your pet animal',
        order_food: 'Order something on Snapmeal',
        earn_school_points: 'Earn points at school',
    },
    init: function(data){
        if(data?.current) this.current = data?.current;
        if(data?.currentPts) this.currentPts = data?.currentPts;
        if(data?.currentStep) this.currentStep = data?.currentStep;
        if(data?.refreshTime) this.refreshTime = data?.refreshTime;

        if(this.refreshTime < Date.now()){
            this.refresh();
        }
    },
    done: function(type, attribute0) {
        if(!this.current?.length) return;

        const activeMission = this.current.find(m => m.type === type);
        if(!activeMission) return;

        activeMission.counter += attribute0 ?? 1;

        if(activeMission.counter >= activeMission.targetCount){
            activeMission.counter = activeMission.targetCount;
            activeMission.isDone = true;
        }
    },
    refresh: function(){
        const oneDayInMs = 1000 * 60 * 60 * 24;

        this.current = [];
        this.currentStep = 0;
        if(!this.refreshTime) this.refreshTime = Date.now() + oneDayInMs;
        else while(this.refreshTime < Date.now()) { // resets in 24hrs
            this.refreshTime += oneDayInMs;
        }
        
        for(let i = 0; i < 8; i++){
            let type;
            while(!type || this.current.find(m => m.type === type)){
                type = randomFromArray(Object.keys(Missions.TYPES));
            }

            const mission = {
                type,
                counter: 0,
                targetCount: random(1, 3),
                pts: 25,
            }

            mission.description = `${Missions.TYPE_DESCRIPTIONS[mission.type]} ${mission.targetCount} ${mission.targetCount === 1 ? 'time' : 'times'}.`
            
            this.current.push(mission);
        }
        console.log(this.current);
    },
    openRewardsMenu: function(){
        const defs = App.definitions;
        App.sendAnalytics('opened_mission_rewards', Missions.currentPts);
        const foodPool = Object.keys(defs.food)
        .filter(key => defs.food[key].price > 0)
        .map(key => { 
            return {
                name: key,
                icon: App.getFoodCSprite(defs.food[key].sprite),
                count: [1, 4],
                type: 'consumable',
                onClaim: (amt) => {
                    App.addNumToObject(App.pet.inventory.food, key, amt || 1);
                }
            } 
        });
        const itemsPool = Object.keys(defs.item)
        .map(key => { 
            return {
                name: key,
                icon: App.getItemCSprite(defs.item[key].sprite),
                count: [1, 1],
                type: 'item',
                onClaim: () => {
                    App.addNumToObject(App.pet.inventory.item, key, 1);
                }
            } 
        });
        const accessoriesPool = Object.keys(defs.accessories)
        .filter(key => App.definitions.accessories[key].price !== -1)
        .map(key => { 
            return {
                name: key,
                icon: App.getAccessoryCSprite(key),
                count: [1, 1],
                type: 'accessory',
                onClaim: () => {
                    App.pet.inventory.accessory[key] = true;
                }
            } 
        });
        const exclusivePotionsPool = Object.keys(defs.food)
        .filter(key => {
            const item = defs.food[key];
            return item.type === 'med' && item.unbuyable;
        })
        .map(key => { 
            return {
                name: key,
                icon: App.getFoodCSprite(defs.food[key].sprite),
                count: [1, 1],
                type: 'consumable',
                onClaim: (amt) => {
                    App.addNumToObject(App.pet.inventory.food, key, amt || 1);
                }
            } 
        });
        const goldPullDef = {
            name: 'gold',
            icon: '<div class="gold-circle">$</div>',
            count: [1, 25],
            type: '',
            onClaim: (amt) => {
                App.pet.stats.gold += amt || 50;
            }
        }
        const pullFromPool = (pool, isGoldPull) => {
            const randomPull = isGoldPull ? goldPullDef : randomFromArray(pool);
            const [min, max] = randomPull.count;
            let count = random(min, max) * (isGoldPull ? 5 : 1);
            if(App.isDuringChristmas()) count *= 2;
            randomPull.onClaim?.(count);
            setTimeout(() => App.playSound('resources/sounds/task_complete_02.ogg', true), 450)
            App.displayPopup(`
                <div class="pulse">
                    ${randomPull.icon}
                </div>
                <b>${randomPull.name}</b>
                <br>
                <span>x${count}</span>
                <br>
                <span>${randomPull.type}</span>
                ${
                    App.isDuringChristmas() ?
                    App.getBadge('doubled!') : ''
                }
            `, 5000, null, true);
        }

        const chests = [
            {
                name: 'Standard Chest',
                price: 75,
                info: `
                    <div>
                        <div> gold++++ </div>
                        <div> food+++ </div>
                        <div> items+ </div>
                        <div> accessories+ </div>
                    </div>
                `,
                onClaim: () => {
                    const pool = [
                        ...foodPool,
                        ...foodPool,
                        ...foodPool,
                        ...foodPool,
                        ...itemsPool,
                        ...accessoriesPool,
                    ]
                    pullFromPool(pool, random(0, 1));
                }
            },
            {
                name: 'Uncommon Chest',
                price: 125,
                info: `
                    <div>
                        <div> food+ </div>
                        <div> items+ </div>
                        <div> accessories+ </div>
                    </div>
                `,
                onClaim: () => {
                    const pool = [
                        ...foodPool,
                        ...itemsPool,
                        ...accessoriesPool,
                    ]
                    pullFromPool(pool, false);
                }
            },
            {
                name: 'Exclusive Potions',
                price: 100,
                info: `
                    <div>
                        <div> gold++++ </div>
                        <div> ${App.getIcon('flask')}expression skill+ </div>
                        <div> ${App.getIcon('flask')}logic skill+ </div>
                        <div> ${App.getIcon('flask')}endurance skill+ </div>
                        <div> ${App.getIcon('flask')}neglect+ </div>
                        <div> ${App.getIcon('flask')}well behaving+ </div>
                        <div> ${App.getIcon('flask')}misbehaving+ </div>
                        <div> ${App.getIcon('flask')}fulfillment+ </div>
                        <div> ${App.getIcon('flask')}aging up+ </div>
                        <div> ${App.getIcon('flask')}nothingness+ </div>
                    </div>
                `,
                isNew: false,
                onClaim: () => {
                    const pool = [
                        ...exclusivePotionsPool
                    ]
                    pullFromPool(pool, random(0, 3));
                }
            },
        ]
        const list = App.displayList([
            {
                _ignore: !App.isDuringChristmas(),
                name: `<small class="flex flex-gap-1 flex-dir-row align-center">
                    <img src="resources/img/misc/xmas_tree_01.png"></img>
                    Double rewards during the xmas event!
                    ${App.getBadge('active!', 'neutral')}
                </small>`,
                type: 'text'
            },
            ...chests.map(chest => {
                return {
                    name: 
                        '<div class="pointer-events-none">'
                        + `<div><small>${App.getIcon('coins', true)} <span>${chest.price}</span></small></div>`
                        + chest.name 
                        + `<br><small class="inline-list">${chest.info}</small>`
                        + (chest.isNew ? App.getBadge('New!') : '')
                        + '</div>',
                    _disable: chest.price > Missions.currentPts,
                    class: 'large',
                    onclick: () => {
                        App.displayConfirm(`Open the <br> <b>${chest.name}</b> <br> for <br> ${App.getIcon('coins') + chest.price}?`, [
                            {
                                name: `yes`,
                                onclick: () => {
                                    chest.onClaim();
                                    Missions.currentPts -= chest.price;
                                    document.querySelector('#mission-pts').textContent = Missions.currentPts;
                                    list.close();
                                    Missions.openRewardsMenu();
                                    App.sendAnalytics('opened_mission_chest', chest.name);
                                }
                            },
                            {
                                name: 'no',
                                class: 'back-btn',
                                onclick: () => {}
                            }
                        ])
                        return true;
                    }
                }
            }),
            {
                name: `The + symbol represents the drop chance for each entry. The more + symbols, the higher the chance of that item dropping.`,
                type: 'info'
            },
        ], null, 'Rewards');
        return list;
    },
    hasUnclaimedRewards: function(){
        return this.current.filter(m => m.isDone && !m.isClaimed).length;
    },
    openMenu: function(){
        if(!this.current?.length) return;

        const SHOW_REWARDS_BADGE = false;

        const list = App.displayList([
            {
                name: `
                    <span>
                        ${App.getIcon('coins', true)}
                        <span id="mission-pts">
                            ${this.currentPts}
                        </span>
                    </span>
                    <button onclick="Missions.openRewardsMenu()" class="generic-btn stylized">
                        ${App.getIcon('shopping-bag', true)}
                        ${SHOW_REWARDS_BADGE ? App.getBadge('!') : ''}
                    </button>
                `,
                type: 'text',
                solid: true,
                class: 'flex-between align-center'
            },
            {
                _mount: (me) => me.innerHTML = App.createStepper(this.MAX_STEPS, Missions.currentStep).node.outerHTML,
                name: '',
                type: 'empty',
                style: 'padding: 0 10px; margin: 5px 0 10px 0',
                id: 'missions-stepper',
            },
            ...this.current
            .filter(m => !m.isClaimed)
            .sort((a, b) => !!b.isDone - !!a.isDone)
            .map(m => {
                const title = Missions.TYPE_DESCRIPTIONS[m.type];
                return {
                    _disable: !m.isDone,
                    name: `
                        <div 
                        style="max-width: 100%; align-items: center;" 
                        class="flex-between width-full pointer-events-none"
                        >

                        <span class="overflow-hidden" style="margin-right: 10px">
                            <div style="width: fit-content" class="${title.length > 10 ? 'marquee' : ''}">
                                ${title}
                            </div>
                        </span>

                        <span style="padding: 2px; margin: 0" class="solidd-surface-stylized b-radius-10">
                            ${m.counter}/${m.targetCount}
                        </span>
                        </div>
                    `,
                    onclick: (btn) => {
                        btn?.remove();
                        m.isClaimed = true;
                        App.sendAnalytics('mission_done', m.type);
                        setTimeout(() => App.playSound('resources/sounds/ui_click_03.ogg', true))
                        if(Missions.currentStep < Missions.MAX_STEPS){
                            Missions.currentPts += m.pts;
                            Missions.currentStep ++;
                            list.querySelector('#mission-pts').textContent = Missions.currentPts;
                            list.querySelector('#missions-stepper')?._mount?.();
                        }
                        return true;
                    }
                }
            }),
            {
                name: `refreshes ${moment(Missions.refreshTime).fromNow()}`,
                type: 'info'
            },
        ], null, 'Missions')

        return list;
    }
}