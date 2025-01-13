import { App } from "../App";
import { Definitions } from "../Definitions";
import { Object2d } from "../Object2d";
import { Pet } from "../Pet";
import { random, randomFromArray } from "../Utils";
import { task_endWork } from "./task_endWork";

export function standWork() {
  App.closeAllDisplays();
  App.setScene(App.scene.stand);
  Definitions.achievements.work_x_times.advance();
  let totalMoneyMade = 0;

  let standObject = new Object2d({
    img: "resources/img/misc/stand_01_booth.png",
    x: 0,
    y: 0,
    z: 19,
  });

  App.toggleGameplayControls(false, () => {
    App.pet.stopScriptedState();
  });

  function spawnCustomer() {
    const standDuration = random(2000, 5000);

    const badAnimations = ["angry"];
    const midAnimations = ["uncomfortable", "shocked"];
    const goodAnimations = ["eating", "cheering"];

    let possibleAnimations = [
      ...goodAnimations,
      ...midAnimations,
      ...badAnimations,
    ];

    const negativeMoodlets =
      App.pet.hasMoodlet("hungry") +
      App.pet.hasMoodlet("bored") +
      App.pet.hasMoodlet("sick") +
      App.pet.hasMoodlet("sleepy");
    if (negativeMoodlets && negativeMoodlets <= 2)
      possibleAnimations = [...midAnimations, ...goodAnimations];
    else if (negativeMoodlets && negativeMoodlets <= 4)
      possibleAnimations = [...badAnimations, ...midAnimations];
    else possibleAnimations = [...goodAnimations];

    const currentAnimation = randomFromArray(possibleAnimations);

    switch (currentAnimation) {
      case "eating":
      case "cheering":
        totalMoneyMade += random(8, 12);
        break;
      case "shocked":
      case "uncomfortable":
        totalMoneyMade += random(3, 5);
        break;
      case "angry":
        totalMoneyMade += 2;
        break;
    }

    let otherPet = new Pet(App.getRandomPetDef(random(1, 2)));
    otherPet.stopMove();
    otherPet.x = -32;
    otherPet.y = "100%";
    otherPet.z = 20;
    otherPet.inverted = true;
    otherPet.targetX = 8;
    App.pet.setState("idle_side");
    otherPet.triggerScriptedState("moving", 4000, 0, true, () => {
      otherPet.stopMove();
      otherPet.x = 8;
      App.pet.setState("eating");
      otherPet.triggerScriptedState(
        currentAnimation,
        standDuration,
        0,
        true,
        () => {
          otherPet.targetX = -100;
          App.pet.setState("idle");
          App.playSound("resources/sounds/task_complete.ogg", true);
          otherPet.triggerScriptedState("moving", 5000, 0, true, () => {
            otherPet.removeObject();
          });
        }
      );
    });

    return otherPet;
  }

  App.pet.stopMove();
  App.pet.x = "68%";
  App.pet.y = "70%";
  App.pet.inverted = false;
  let startTime = Date.now();
  let nextCustomerSpawnTime = Date.now() + random(0, 8000);
  let currentCustomer;
  App.pet.triggerScriptedState(
    "idle",
    200000,
    0,
    true,
    () => {
      standObject.removeObject();
      let elapsedTime = Math.round((Date.now() - startTime) / 1000);
      task_endWork(elapsedTime, totalMoneyMade);
      currentCustomer?.removeObject();
    },
    () => {
      // Object2d.animations.bob(App.pet, 0.01, 0.05);
      if (Date.now() > nextCustomerSpawnTime) {
        nextCustomerSpawnTime = Date.now() + random(8000, 45000);
        currentCustomer = spawnCustomer();
      }
    }
  );
}
