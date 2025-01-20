import { App } from "@tamaweb/App";
import { Missions } from "@tamaweb/Missions";
import { Pet } from "@tamaweb/Pet";

export function invitePlaydate(otherPetDef, scene, onEndFn) {
  App.setScene(scene ?? App.scene.home);
  App.toggleGameplayControls(false);
  otherPetDef.increaseFriendship(8);
  let otherPet = new Pet(otherPetDef);
  Missions.done(Missions.TYPES.playdate);

  const wantedFriendDef =
    App.petDefinition.friends[App.pet.stats.current_want.item];
  App.petDefinition.checkWant(
    otherPetDef == wantedFriendDef,
    App.constants.WANT_TYPES.playdate,
  );

  otherPet.stopMove();
  otherPet.x = "100%";
  App.pet.stopMove();
  App.pet.x = 20;

  function task_otherPetMoveIn() {
    otherPet.triggerScriptedState("moving", App.INF, null, true);
    otherPet.targetX = 80 - otherPet.spritesheet.cellSize;
    App.pet.triggerScriptedState("idle", 3000, null, true, () => {
      otherPet.stopScriptedState();
      task_playing();
    });
  }

  function task_playing() {
    otherPet.x = 80 - otherPet.spritesheet.cellSize;
    App.pet.x = 20;

    otherPet.stopMove();
    App.pet.stopMove();

    otherPet.triggerScriptedState("cheering", App.INF);
    App.pet.triggerScriptedState("cheering", 5000, null, true, () => {
      otherPet.stopScriptedState();
      task_otherPetMoveOut();
    });
  }

  function task_otherPetMoveOut() {
    otherPet.triggerScriptedState("moving", App.INF);
    otherPet.targetX = 120;
    App.pet.inverted = true;
    App.pet.triggerScriptedState(
      "idle_side_uncomfortable",
      3000,
      null,
      true,
      () => {
        otherPet.stopScriptedState();
        App.pet.x = "50%";
        App.pet.stats.current_fun += 30;
        App.pet.statsManager();
        App.drawer.removeObject(otherPet);
        App.pet.playCheeringAnimationIfTrue(
          App.pet.hasMoodlet("amused"),
          () => {
            if (onEndFn) return onEndFn();
            App.toggleGameplayControls(true);
            App.setScene(App.scene.home);
          },
        );
      },
    );
  }

  task_otherPetMoveIn();
}
