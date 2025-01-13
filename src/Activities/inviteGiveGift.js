import { App } from "../App";
import { Definitions } from "../Definitions";
import { Missions } from "../Missions";
import { Object2d } from "../Object2d";
import { Pet } from "../Pet";

export function inviteGiveGift(otherPetDef) {
  App.setScene(App.scene.home);
  App.toggleGameplayControls(false);
  let otherPet = new Pet(otherPetDef);
  Definitions.achievements.give_gifts_x_times.advance();
  Missions.done(Missions.TYPES.gift);

  const wantedFriendDef =
    App.petDefinition.friends[App.pet.stats.current_want.item];
  App.petDefinition.checkWant(
    otherPetDef == wantedFriendDef,
    App.constants.WANT_TYPES.playdate,
  );

  otherPet.stopMove();
  otherPet.x = "100%";
  App.pet.stopMove();
  App.pet.x = 10;

  let gift = new Object2d({
    img: "resources/img/misc/gift.png",
    x: "50%",
    y: "80%",
  });

  function task_otherPetMoveIn() {
    otherPet.triggerScriptedState("moving", App.INF, null, true);
    otherPet.targetX = 90 - otherPet.spritesheet.cellSize;
    App.pet.inverted = true;
    App.pet.triggerScriptedState("idle_side", 2500, null, true, () => {
      otherPet.stopScriptedState();
      task_gift();
    });
  }

  function task_gift() {
    otherPet.x = 90 - otherPet.spritesheet.cellSize;
    App.pet.x = 10;

    otherPet.stopMove();
    App.pet.stopMove();

    otherPet.triggerScriptedState("cheering", App.INF);
    App.pet.triggerScriptedState("cheering", 3000, null, true, () => {
      // App.drawer.removeObject(gift);
      otherPet.stopScriptedState();
      task_otherPetMoveOut();
    });
  }

  function task_otherPetMoveOut() {
    gift.y += 10;
    otherPet.triggerScriptedState("moving", App.INF, false, true, null, () => {
      gift.x = otherPet.x + 10;
    });
    otherPet.targetX = 120;
    App.pet.inverted = true;
    App.pet.triggerScriptedState("blush", 3000, null, true, () => {
      otherPet.stopScriptedState();
      App.pet.x = "50%";
      App.pet.stats.current_fun += 55;
      App.pet.statsManager();
      App.pet.playCheeringAnimationIfTrue(App.pet.hasMoodlet("amused"), () =>
        App.setScene(App.scene.home),
      );
      App.drawer.removeObject(otherPet);
      App.drawer.removeObject(gift);
      App.toggleGameplayControls(true);
    });
  }

  task_otherPetMoveIn();
}
