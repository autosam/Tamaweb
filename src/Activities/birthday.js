import { App } from "@tamaweb/App";
import { Definitions } from "@tamaweb/Definitions";
import { Object2d } from "@tamaweb/Object2d";
import { Pet } from "@tamaweb/Pet";
import { PetDefinition } from "@tamaweb/PetDefinition";
import { randomFromArray } from "@tamaweb/Utils";
import { task_foam } from "./task_foam";

export function birthday() {
  App.setScene(App.scene.home);
  App.toggleGameplayControls(false);
  App.pet.stats.has_poop_out = false;
  App.pet.stats.current_bladder = 100;
  Definitions.achievements.birthday_x_times.advance();

  let otherPetDefs = [...App.petDefinition.friends]
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value); // shuffling friends array
  for (let i = 0; i < 3; i++) {
    let def = new PetDefinition({
      sprite: randomFromArray(PET_TEEN_CHARACTERS),
    });
    otherPetDefs.push(def);
  }

  let otherPets = [];
  otherPetDefs.slice(0, 3).forEach((def) => {
    let pet = new Pet(def);
    otherPets.push(pet);
  });

  const table = new Object2d({
    img: "resources/img/misc/table_01.png",
    x: 28,
    y: 68,
  });
  const cake = new Object2d({
    img: "resources/img/misc/cake_01.png",
    x: 39,
    y: 58,
  });

  otherPets.forEach((pet, i) => {
    pet.stopMove();
    pet.targetX = 20;
    pet.x = -10 * i;
    switch (i) {
      case 0:
        pet.targetX = 30;
        pet.targetY = 65;
        break;
      case 1:
        pet.targetX = 15;
        pet.targetY = 75;
        break;
      case 2:
        pet.targetX = 5;
        pet.targetY = 85;
        break;
    }
    pet.triggerScriptedState("moving", App.INF, 0, true, null, (pet) => {
      if (!pet.isMoving) {
        pet.setState("cheering");
      }
    });
  });

  App.pet.x = "80%";
  App.pet.stopMove();
  App.pet.inverted = false;
  App.pet.triggerScriptedState("idle_side", 3000, 0, true, () => {
    App.playSound("resources/sounds/birthday_song_01.ogg", true);
    App.pet.triggerScriptedState("cheering", 13000, 0, true, () => {
      App.pet.triggerScriptedState("cheering", 10000, 0, true);
      task_foam(() => {
        otherPets.forEach((pet) => pet.removeObject());
        table.removeObject();
        cake.removeObject();

        App.pet.ageUp();
        App.pet.x = "50%";
        App.pet.y = 60;
        App.pet.stopMove();

        App.pet.triggerScriptedState("blush", 3000, 0, true, () => {
          App.setScene(App.scene.home);
          App.toggleGameplayControls(true);
          App.pet.playCheeringAnimation();
        });

        App.sendAnalytics("age_up", App.petDefinition.lifeStage);
      });
    });
  });
}
