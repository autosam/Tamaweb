const Missions={current:[],currentPts:0,currentStep:0,refreshTime:0,MAX_STEPS:4,TYPES:{food:"food",pat:"pat",gift:"gift",cook:"cook",win_game:"win_game",online_interact:"online_interact",buy_food:"buy_food",playdate:"playdate",check_social_post:"check_social_post",find_park_friend:"find_park_friend",use_bath:"use_bath",use_toilet:"use_toilet",clean_room:"clean_room",visit_doctor:"visit_doctor",fulfill_want:"fulfill_want",play_item:"play_item",visit_online_hub:"visit_online_hub",visit_mall:"visit_mall",visit_market:"visit_market",plant_in_garden:"plant_in_garden",water_crop:"water_crop"},TYPE_DESCRIPTIONS:{food:"Eat food",pat:"Pat your pet",gift:"Give gift to a friend",cook:"Cook",win_game:"Win a game center game",online_interact:"Interact with online players",buy_food:"Buy food or snacks",playdate:"Invite a friend over",check_social_post:"Check social media posts",find_park_friend:"Find a park friend",use_bath:"Bathe your pet",use_toilet:"Use the toilet",clean_room:"Clean the room",visit_doctor:"Visit the doctor",fulfill_want:"Fulfill your pet's want",play_item:"Play with an item",visit_online_hub:"Visit Hubchi",visit_mall:"Visit the mall",visit_market:"Visit the market",plant_in_garden:"Plant something in the garden",water_crop:"Water your garden plant"},init:function(data){data?.current&&(this.current=data?.current),data?.currentPts&&(this.currentPts=data?.currentPts),data?.currentStep&&(this.currentStep=data?.currentStep),data?.refreshTime&&(this.refreshTime=data?.refreshTime),this.refreshTime<Date.now()&&this.refresh()},done:function(type,attribute0){if(!this.current?.length)return;const activeMission=this.current.find((m=>m.type===type));activeMission&&(activeMission.counter+=attribute0??1,activeMission.counter>=activeMission.targetCount&&(activeMission.counter=activeMission.targetCount,activeMission.isDone=!0))},refresh:function(){if(this.current=[],this.currentStep=0,this.refreshTime)for(;this.refreshTime<Date.now();)this.refreshTime+=864e5;else this.refreshTime=Date.now()+864e5;for(let i=0;i<8;i++){let type;for(;!type||this.current.find((m=>m.type===type));)type=randomFromArray(Object.keys(Missions.TYPES));const mission={type:type,counter:0,targetCount:random(1,3),pts:25};mission.description=`${Missions.TYPE_DESCRIPTIONS[mission.type]} ${mission.targetCount} ${1===mission.targetCount?"time":"times"}.`,this.current.push(mission)}console.log(this.current)},openRewardsMenu:function(){const defs=App.definitions;App.sendAnalytics("opened_mission_rewards",Missions.currentPts);const foodPool=Object.keys(defs.food).filter((key=>defs.food[key].price)).map((key=>({name:key,icon:App.getFoodCSprite(defs.food[key].sprite),count:[1,4],type:"consumable",onClaim:amt=>{App.addNumToObject(App.pet.inventory.food,key,amt||1)}}))),itemsPool=Object.keys(defs.item).map((key=>({name:key,icon:App.getItemCSprite(defs.item[key].sprite),count:[1,1],type:"item",onClaim:()=>{App.addNumToObject(App.pet.inventory.item,key,1)}}))),accessoriesPool=Object.keys(defs.accessories).map((key=>({name:key,icon:App.getAccessoryCSprite(key),count:[1,1],type:"accessory",onClaim:()=>{App.pet.inventory.accessory[key]=!0}}))),goldPullDef={name:"gold",icon:'<div class="gold-circle">$</div>',count:[6,35],type:"",onClaim:amt=>{App.pet.stats.gold+=amt||50}},pullFromPool=(pool,isGoldPull)=>{const randomPull=isGoldPull?goldPullDef:randomFromArray(pool),[min,max]=randomPull.count;let count=random(min,max)*(isGoldPull?5:1);App.isDuringChristmas()&&(count*=2),randomPull.onClaim?.(count),App.displayPopup(`\n                <div class="pulse">\n                    ${randomPull.icon}\n                </div>\n                <b>${randomPull.name}</b>\n                <br>\n                <span>x${count}</span>\n                <br>\n                <span>${randomPull.type}</span>\n                ${App.isDuringChristmas()?App.getBadge("doubled!"):""}\n            `,5e3,null,!0)},chests=[{name:"Standard Chest",price:75,info:"\n                    <div>\n                        <div> gold++++ </div>\n                        <div> food+++ </div>\n                        <div> items+ </div>\n                        <div> accessories+ </div>\n                    </div>\n                ",onClaim:()=>{const pool=[...foodPool,...foodPool,...foodPool,...foodPool,...itemsPool,...accessoriesPool];pullFromPool(pool,random(0,1))}},{name:"Uncommon Chest",price:125,info:"\n                    <div>\n                        <div> food+ </div>\n                        <div> items+ </div>\n                        <div> accessories+ </div>\n                    </div>\n                ",onClaim:()=>{const pool=[...foodPool,...itemsPool,...accessoriesPool];pullFromPool(pool,!1)}}],list=App.displayList([{_ignore:!App.isDuringChristmas(),name:`<small class="flex flex-gap-1 flex-dir-row align-center">\n                    <img src="resources/img/misc/xmas_tree_01.png"></img>\n                    Double rewards during the xmas event!\n                    ${App.getBadge("active!","neutral")}\n                </small>`,type:"text"},...chests.map((chest=>({name:chest.name+`<br><small class="inline-list">${chest.info}<small>`+App.getBadge(`${App.getIcon("coins",!0)} <span style="margin-left: 3px">${chest.price}</span>`),_disable:chest.price>Missions.currentPts,class:"large",onclick:()=>(App.displayConfirm(`Open the <br> <b>${chest.name}</b> <br> for <br> ${App.getIcon("coins")+chest.price}?`,[{name:"yes",onclick:()=>{chest.onClaim(),Missions.currentPts-=chest.price,document.querySelector("#mission-pts").textContent=Missions.currentPts,list.close(),Missions.openRewardsMenu(),App.sendAnalytics("opened_mission_chest",chest.name)}},{name:"no",class:"back-btn",onclick:()=>{}}]),!0)}))),{name:"The + symbol represents the drop chance for each entry. The more + symbols, the higher the chance of that item dropping.",type:"info"}],null,"Rewards");return list},hasUnclaimedRewards:function(){return this.current.filter((m=>m.isDone&&!m.isClaimed)).length},openMenu:function(){if(!this.current?.length)return;const list=App.displayList([{name:`\n                    <span>\n                        ${App.getIcon("coins",!0)}\n                        <span id="mission-pts">\n                            ${this.currentPts}\n                        </span>\n                    </span>\n                    <button onclick="Missions.openRewardsMenu()" class="generic-btn stylized">\n                        ${App.getIcon("shopping-bag",!0)}\n                    </button>\n                `,type:"text",solid:!0,class:"flex-between align-center"},{_mount:me=>me.innerHTML=App.createStepper(this.MAX_STEPS,Missions.currentStep).node.outerHTML,name:"",type:"empty",style:"padding: 0 10px; margin: 5px 0 10px 0",id:"missions-stepper"},...this.current.filter((m=>!m.isClaimed)).sort(((a,b)=>!!b.isDone-!!a.isDone)).map((m=>{const title=Missions.TYPE_DESCRIPTIONS[m.type];return{_disable:!m.isDone,name:`\n                        <div \n                        style="max-width: 100%; align-items: center;" \n                        class="flex-between width-full"\n                        >\n\n                        <span class="overflow-hidden" style="margin-right: 10px">\n                            <div style="width: fit-content" class="${title.length>10?"marquee":""}">\n                                ${title}\n                            </div>\n                        </span>\n\n                        <span style="padding: 2px; margin: 0" class="solidd-surface-stylized b-radius-10">\n                            ${m.counter}/${m.targetCount}\n                        </span>\n                        </div>\n                    `,onclick:btn=>(btn?.remove(),m.isClaimed=!0,App.sendAnalytics("mission_done",m.type),Missions.currentStep<Missions.MAX_STEPS&&(Missions.currentPts+=m.pts,Missions.currentStep++,list.querySelector("#mission-pts").textContent=Missions.currentPts,list.querySelector("#missions-stepper")?._mount?.()),!0)}})),{name:`refreshes ${moment(Missions.refreshTime).fromNow()}`,type:"info"}],null,"Missions");return list}};