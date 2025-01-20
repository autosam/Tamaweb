import { App } from "@tamaweb/App";
import { Pet } from "@tamaweb/Pet";
import { PetDefinition } from "@tamaweb/PetDefinition";

export function inviteDoctorVisit() {
  App.setScene(App.scene.home);
  App.toggleGameplayControls(false);
  let otherPetDef = new PetDefinition({
    sprite: "resources/img/character/chara_291b.png",
  });
  let otherPet = new Pet(otherPetDef);

  otherPet.stopMove();
  otherPet.x = "100%";
  App.pet.stopMove();
  App.pet.x = 20;

  function task_otherPetMoveIn() {
    otherPet.triggerScriptedState("moving", App.INF, null, true);
    otherPet.targetX = 80 - otherPet.spritesheet.cellSize;
    App.pet.triggerScriptedState("idle", 3000, null, true, () => {
      otherPet.stopScriptedState();
      task_visiting();
    });
  }

  function task_visiting() {
    otherPet.x = 80 - otherPet.spritesheet.cellSize;
    App.pet.x = 20;

    otherPet.stopMove();
    App.pet.stopMove();

    App.pet.inverted = true;

    otherPet.triggerScriptedState("eating", App.INF);
    App.pet.triggerScriptedState("eating", 8000, null, true, () => {
      otherPet.stopScriptedState();
      task_otherPetMoveOut();
    });
  }

  function task_otherPetMoveOut() {
    otherPet.triggerScriptedState("moving", App.INF);
    otherPet.targetX = 120;
    App.pet.inverted = true;
    App.pet.triggerScriptedState("idle_side", 3000, null, true, () => {
      otherPet.stopScriptedState();
      App.pet.x = "50%";
      // App.pet.playCheeringAnimationIfTrue(App.pet.hasMoodlet('amused'), () => App.setScene(App.scene.home));

      let health = App.pet.stats.current_health;

      let state = "very healthy";
      if (health <= App.pet.stats.max_health * 0.2) state = "very sick";
      else if (health <= App.pet.stats.max_health * 0.45) state = "sick";
      else if (health <= App.pet.stats.max_health * 0.75) state = "healthy";

      if (state == "very sick" || state == "sick") {
        App.pet.triggerScriptedState("shocked", 2000, false, true, () => {
          App.displayPopup(`${App.pet.petDefinition.name} is ${state}`, 5000);
        });
      } else {
        App.pet.triggerScriptedState("cheering", 2000, false, true, () => {
          App.displayPopup(`${App.pet.petDefinition.name} is ${state}`, 5000);
        });
      }

      App.drawer.removeObject(otherPet);
      App.toggleGameplayControls(true);
    });
  }

  task_otherPetMoveIn();
}
