import { App } from "../App";
import { Definitions } from "../Definitions";
import { Pet } from "../Pet";
import { PetDefinition } from "../PetDefinition";
import { task_foam } from "./task_foam";

export function redecorRoom() {
  App.setScene(App.scene.home);
  App.toggleGameplayControls(false);
  let otherPetDef = new PetDefinition({
    sprite: "resources/img/character/chara_290b.png",
  });
  let otherPet = new Pet(otherPetDef);
  Definitions.achievements.redecor_x_times.advance();

  otherPet.stopMove();
  otherPet.x = "100%";
  App.pet.stopMove();
  App.pet.x = 10;

  function task_otherPetMoveIn() {
    otherPet.triggerScriptedState("moving", App.INF, null, true);
    otherPet.targetX = 80 - otherPet.spritesheet.cellSize;
    App.pet.triggerScriptedState("idle", 3000, null, true, () => {
      otherPet.stopScriptedState();
      task_redecor();
    });
  }

  function task_redecor() {
    otherPet.x = 80 - otherPet.spritesheet.cellSize;
    otherPet.stopMove();
    App.pet.stopMove();

    task_foam(
      () => {
        App.setScene(App.scene.home);
        App.pet.x = 10;
      },
      () => {
        App.pet.stopScriptedState();
      }
    );

    otherPet.triggerScriptedState("idle", App.INF);
    App.pet.triggerScriptedState("idle", App.INF, null, true, () => {
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
      App.pet.stats.current_fun += 55;
      App.pet.statsManager();
      App.pet.playCheeringAnimationIfTrue(App.pet.hasMoodlet("amused"), () =>
        App.setScene(App.scene.home)
      );
      App.drawer.removeObject(otherPet);
      App.toggleGameplayControls(true);
    });
  }

  task_otherPetMoveIn();
}
