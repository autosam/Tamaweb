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
    },
    TYPE_DESCRIPTIONS: {
        food: 'Eat food',
        pat: 'Pat your pet',
        gift: 'Give gift to a friend',
        cook: 'Cook',
        win_game: 'Win a game center game',
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
    },
    init: function(data){
        if(data?.current) this.current = data?.current;
        if(data?.currentPts) this.currentPts = data?.currentPts;
        if(data?.currentStep) this.currentStep = data?.currentStep;
        if(data?.refreshTime) this.refreshTime = data?.refreshTime;

        if(this.refreshTime < Date.now()){
            this.refresh();
        }
        this.openMenu();
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
        this.current = [];
        this.currentStep = 0;
        this.refreshTime = (this.refreshTime || Date.now()) + (1000 * 60 * 60 * 24); // resets in 24hrs
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
        App.sendAnalytics('opened_mission_rewards', Missions.currentPts);
        return App.displayList([
            {
                name: `Ghostboy skin`,
                price: '200',
                onclick: () => {

                }
            }
        ], null, 'Rewards')
    },
    openMenu: function(){
        if(!this.current?.length) return;

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
                        class="flex-between width-full"
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
                name: `<small>
                    <i class="fa-solid fa-info-circle"></i>
                    refreshes ${moment(Missions.refreshTime).fromNow()}
                </small>`,
                type: 'text'
            },
        ], null, 'Missions')

        return list;
    }
}