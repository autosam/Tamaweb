import { playEggUfoAnimation, stayAtParents, seaVacation } from "@Activities";
import { App } from "App";
import { Drawer } from "Drawer";
import moment from "libs/moment";
import { Missions } from "Missions";
import { Object2d } from "Object2d";
import { PetDefinition } from "PetDefinition";
import { UI } from "UiHelper";
import { getRandomName, randomFromArray } from "Utils";
import { VERSION } from "Version";

export async function init() {
  // init
  App.initSound();
  App.drawer = new Drawer(document.querySelector(".graphics-canvas"));
  Object2d.setDrawer(App.drawer);

  // check for platforms
  if (location.host.indexOf("itch") !== -1) App.isOnItch = true;
  if (navigator?.userAgent == "electron-client") App.isOnElectronClient = true;

  // load data
  let loadedData = App.load();
  console.log({ loadedData });

  // shell background
  App.setShellBackground(loadedData.shellBackground);

  // mods
  App.loadMods(loadedData.mods);

  // handle settings
  if (loadedData.settings) {
    Object.assign(App.settings, loadedData.settings);
  }
  App.applySettings();

  // handle preloading
  let forPreload = [
    ...SPRITES,
    ...PET_ADULT_CHARACTERS,
    ...PET_TEEN_CHARACTERS,
    ...PET_BABY_CHARACTERS,
    ...NPC_CHARACTERS,
  ];
  App.preloadedResources = {};
  const preloadedResources = await App.preloadImages(forPreload);
  preloadedResources.forEach((resource, i) => {
    // let name = forPreload[i].slice(forPreload[i].lastIndexOf('/') + 1);
    const name = forPreload[i];
    App.preloadedResources[name] = resource;
  });

  // creating game objects
  App.background = new Object2d({
    image: null,
    x: 0,
    y: 0,
    width: 96,
    height: 96,
    z: -10,
  });
  // App.foodsSpritesheet = new Object2d({
  //     image: App.preloadedResources["resources/img/item/foods.png"],
  //     x: 10, y: 10,
  //     spritesheet: {
  //         cellNumber: 11,
  //         cellSize: 16,
  //         rows: 4,
  //         columns: 4,
  //     },
  //     hidden: true,
  // })
  App.foods = new Object2d({
    image: App.preloadedResources[App.constants.FOOD_SPRITESHEET],
    x: 10,
    y: 10,
    width: 12,
    height: 12,
    scale: 24,
    spritesheet: {
      cellNumber: 2,
      cellSize: 24,
      rows: 33,
      columns: 33,
    },
    hidden: true,
  });
  App.uiFood = document.createElement("c-sprite");
  App.uiFood.setAttribute("width", 24);
  App.uiFood.setAttribute("height", 24);
  App.uiFood.setAttribute("index", 0);
  App.uiFood.setAttribute("src", App.constants.FOOD_SPRITESHEET);
  App.uiFood.setAttribute("class", "ui-food");
  App.uiFood.style.visibility = "hidden";
  document.querySelector(".graphics-wrapper").appendChild(App.uiFood);

  App.darkOverlay = new Object2d({
    img: "resources/img/background/house/dark_overlay.png",
    hidden: true,
    z: 10,
    opacity: 0.85,
    composite: "source-atop",
  });
  App.poop = new Object2d({
    image: App.preloadedResources["resources/img/misc/poop.png"],
    x: "80%",
    y: "80%",
    z: App.constants.POOP_Z,
    hidden: true,
    onDraw: (me) => {
      Object2d.animations.flip(me, 300);
    },
  });
  App.sky = new Object2d({
    image: App.preloadedResources["resources/img/background/sky/night.png"],
    x: 0,
    y: 0,
    z: 99999,
    composite: "destination-over",
    // absHidden: true
  });
  App.skyOverlay = new Object2d({
    image:
      App.preloadedResources["resources/img/background/sky/night_overlay.png"],
    x: 0,
    y: 0,
    z: 999,
    composite: "source-atop",
    opacity: 1,
  });
  App.skyWeather = new Object2d({
    image: App.preloadedResources["resources/img/background/sky/rain_01.png"],
    x: 0,
    y: 0,
    z: 999.1,
    composite: "xor",
    // hidden: true,
    onDraw: (me) => {
      Object2d.animations.flip(me, 200);
    },
  });
  App.petDefinition = new PetDefinition({
    name: getRandomName(),
    sprite: randomFromArray(PET_BABY_CHARACTERS),
  })
    .setStats({ is_egg: true })
    .loadStats(loadedData.pet)
    .loadAccessories(loadedData.accessories);

  // check automatic age up
  if (App.settings.automaticAging) {
    while (
      moment().utc().isAfter(App.petDefinition.getNextAutomaticBirthdayDate())
    ) {
      App.petDefinition.ageUp();
      App.sendAnalytics("auto_age_up", App.petDefinition.lifeStage);
    }
  }

  // put pet to sleep on start if is sleeping hour
  if (!App.petDefinition.stats.is_sleeping && !App.isTester()) {
    App.petDefinition.stats.is_sleeping =
      App.isSleepHour() && !loadedData.pet?.stats?.is_egg;
  }

  App.pet = App.createActivePet(App.petDefinition, {
    state: "",
  });

  if (!loadedData.pet || !Object.keys(loadedData.pet).length) {
    // first time
    setTimeout(() => {
      playEggUfoAnimation(() => App.handlers.show_set_pet_name_dialog());
    }, 100);
  }
  App.setScene(App.scene.home);
  App.applySky();

  // simulating offline progression
  if (loadedData.lastTime) {
    let elapsedTime = Date.now() - loadedData.lastTime;

    if (App.ENV !== "dev") App.pet.simulateOfflineProgression(elapsedTime);

    let awaySeconds = Math.round(elapsedTime / 1000);
    let awayMinutes = Math.round(awaySeconds / 60);
    let awayHours = Math.round(awayMinutes / 60);
    // console.log({awayHours, awayMinutes, awaySeconds})

    let message;
    if (awaySeconds < 60) message = `${awaySeconds} seconds`;
    else if (awayMinutes < 60) message = `${awayMinutes} minutes`;
    else message = `${awayHours} hours`;

    App.awayTime = message;

    if (awaySeconds > 2 && App.ENV !== "dev") {
      App.displayConfirm(
        `Welcome back!\n<b>${App.petDefinition.name}</b> missed you in those <b>${message}</b> you were away`,
        [
          {
            name: "ok",
            onclick: () => {},
          },
        ]
      );
    }
  }

  // check if at daycare
  if (App.pet.stats.is_at_parents) {
    stayAtParents();
  }

  // check if at vacation
  if (App.pet.stats.is_at_vacation) {
    seaVacation();
  }

  // entries
  window.onload = function () {
    const analyticsData = {
      session_id: App.sessionId,
      play_time_mins: (Math.round(App.playTime) / 1000 / 60).toFixed(2),
      away: App.awayTime || -1,
      sprite: App.petDefinition.sprite,
      is_egg: App.pet.stats.is_egg,
      gold: App.pet.stats.gold,
      ver: VERSION,
    };
    App.sendAnalytics("login", JSON.stringify(analyticsData));

    // update(0);
    App.targetFps = 60;
    App.fpsInterval = 1000 / App.targetFps;
    App.fpsLastTime = Date.now();
    App.fpsStartTime = App.fpsLastTime;
    App.onFrameUpdate(0);
  };
  window.onbeforeunload = function () {
    const analyticsData = {
      session_id: App.sessionId,
      hunger: Math.round(App.pet.stats.current_hunger),
      fun: Math.round(App.pet.stats.current_fun),
      health: Math.round(App.pet.stats.current_health),
      sleep: Math.round(App.pet.stats.current_sleep),
      bladder: Math.round(App.pet.stats.current_bladder),
      is_egg: App.pet.stats.is_egg,
      has_poop_out: App.pet.stats.has_poop_out,
      is_sleeping: App.pet.stats.is_sleeping,
    };
    App.sendAnalytics("logout", JSON.stringify(analyticsData));

    App.save();
  };

  // touch / mouse pos on canvas
  App.registerInputUpdates();

  /* // routing
        const historyIndex = window.history.length;
        window.history.pushState(null, null, window.top.location.pathname + window.top.location.search);
        window.addEventListener('popstate', (e) => {
            const activeDisplay = [...document.querySelectorAll('.root .display')].at(-1);
            const backAction = activeDisplay?.querySelector('.back-btn, .cancel-btn, .back-sound');
            console.log(e);
            if(backAction){
                backAction.click();
                window.history.pushState(null, null, window.top.location.pathname + window.top.location.search);
                e.preventDefault();
            }
        }); */

  // in-game events
  if (loadedData.eventsHistory && !Array.isArray(loadedData.eventsHistory)) {
    App.gameEventsHistory = loadedData.eventsHistory;
  }
  App.handleInGameEvents();

  // load room customizations
  App.applyRoomCustomizations(loadedData.roomCustomizations);

  // records
  App.records = loadedData.records;

  // random encounters
  App.runRandomEncounters();

  // missions
  Missions.init(loadedData.missions);

  // saver
  setInterval(() => {
    App.save(true);
  }, 5000);

  // hide loading
  setTimeout(() => {
    UI.fadeOut(document.querySelector(".loading-text"));
  });
}
