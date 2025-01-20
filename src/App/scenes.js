import { App } from "@tamaweb/App";
import { Object2d } from "@tamaweb/Object2d";
import { Pet } from "@tamaweb/Pet";
import { Scene } from "@tamaweb/Scene";
import { random, randomFromArray } from "@tamaweb/Utils";

export const scene = {
  home: new Scene({
    image: "resources/img/background/house/02.png",
    petX: "50%",
    petY: "100%",
    onLoad: function () {
      App.poop.absHidden = false;
      App.pet.staticShadow = false;

      if (random(0, 10) == 0) {
        App.pet.showCurrentWant();
      }

      if (App.isDuringChristmas()) {
        this.christmasTree = new Object2d({
          img: "resources/img/misc/xmas_tree_01.png",
          x: 60,
          y: 12,
          z: App.constants.CHRISTMAS_TREE_Z,
        });
      }
    },
    onUnload: function () {
      App.poop.absHidden = true;
      App.pet.staticShadow = true;
      this.christmasTree?.removeObject();
    },
  }),
  kitchen: new Scene({
    image: "resources/img/background/house/kitchen_03.png",
    foodsX: "50%",
    foodsY: 44,
    petX: "75%",
    petY: "81%",
    noShadows: true,
    onLoad: () => {
      App.pet.staticShadow = false;
    },
    onUnload: () => {
      App.pet.staticShadow = true;
    },
  }),
  park: new Scene({
    image: "resources/img/background/outside/park_02.png",
  }),
  mallWalkway: new Scene({
    image: "resources/img/background/outside/mall_walkway.png",
  }),
  walkway: new Scene({
    image: "resources/img/background/outside/walkway_01.png",
  }),
  office: new Scene({
    image: "resources/img/background/house/office_01.png",
  }),
  wedding: new Scene({
    petX: "50%",
    petY: "100%",
    image: "resources/img/background/house/wedding_01.png",
    noShadows: true,
  }),
  arcade: new Scene({
    image: "resources/img/background/house/arcade_01.png",
  }),
  arcade_game01: new Scene({
    image: "resources/img/background/house/arcade_02.png",
  }),
  market: new Scene({
    image: "resources/img/background/outside/market_01.png",
  }),
  bathroom: new Scene({
    image: "resources/img/background/house/bathroom_01.png",
  }),
  hospitalExterior: new Scene({
    image: "resources/img/background/outside/hospital_01.png",
  }),
  hospitalInterior: new Scene({
    image: "resources/img/background/house/clinic_01.png",
    onLoad: () => {
      this.drSprite = new Object2d({
        image: App.preloadedResources["resources/img/misc/dr_sprite.png"],
        x: "80%",
        y: "77%",
        inverted: true,
      });
    },
    onUnload: () => {
      this.drSprite?.removeObject();
    },
  }),
  parentsHome: new Scene({
    image: "resources/img/background/house/parents_house_01.png",
    onLoad: () => {
      let parentDefs = App.petDefinition.getParents();
      // this.parents = parentDefs.map(parent => {
      //     let p = new Pet(parent);
      //         p.y = 65;
      //     return p;
      // });

      this.parent = new Pet(randomFromArray(parentDefs), {
        y: 65,
        z: 4,
      });
    },
    onUnload: () => {
      // this.parents.forEach(parent => parent.removeObject());
      this.parent?.removeObject();
    },
  }),
  seaVacation: new Scene({
    image: "resources/img/background/outside/vacation_sea_l_01.png",
    onLoad: () => {
      this.seaCreatureObject = new Object2d({
        img: "resources/img/background/outside/vacation_sea_l_02.png",
        x: 0,
        y: 15,
        z: 7,
        bobFloat: 0,
        onDraw: (me) => {
          Object2d.animations.bob(me, 0.001, 0.04);
        },
      });

      this.boatObject = new Object2d({
        img: "resources/img/background/outside/vacation_sea_l_03.png",
        x: 0,
        y: 0,
        z: 6,
        bobFloat: 1,
      });

      this.overlay = new Object2d({
        img: "resources/img/misc/picture_overlay_01.png",
        x: 0,
        y: 0,
        z: 1000,
      });
    },
    onUnload: () => {
      this.seaCreatureObject.removeObject();
      this.boatObject.removeObject();
      this.overlay.removeObject();
    },
  }),
  graveyard: new Scene({
    image: "resources/img/background/outside/graveyard_01.png",
    noShadows: true,
  }),
  battle: new Scene({
    image: "resources/img/background/house/battle_01.png",
    noShadows: true,
  }),
  stand: new Scene({
    image: "resources/img/background/outside/stand_01.png",
  }),
  online_hub: new Scene({
    noShadows: true,
    image: "resources/img/background/house/online_hub_01.png",
    onLoad: () => {
      this.lightRays = new Object2d({
        img: "resources/img/misc/light_rays_02.png",
        opacity: 0.6,
        x: "50%",
        y: "50%",
        composite: "overlay",
        onDraw: (me) => {
          me.rotation -= 0.005 * App.deltaTime;
        },
      });
      this.platform = new Object2d({
        img: "resources/img/misc/online_hub_01_front.png",
        x: 0,
        y: 0,
      });
    },
    onUnload: () => {
      this.platform.removeObject();
      this.lightRays.removeObject();
    },
  }),
  garden: new Scene({
    image: "resources/img/background/outside/garden_01.png",
    petY: "95%",
    shadowOffset: -5,
    onLoad: () => {
      App.pet.staticShadow = false;
    },
    onUnload: () => {
      App.pet.staticShadow = true;
    },
  }),
  beach: new Scene({
    image: "resources/img/background/house/beach_01.png",
  }),
};
