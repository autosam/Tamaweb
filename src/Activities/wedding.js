import { App } from "@tamaweb/App";
import { Definitions } from "@tamaweb/Definitions";
import { Object2d } from "@tamaweb/Object2d";
import { Pet } from "@tamaweb/Pet";
import { task_foam } from "./task_foam";

export function wedding(otherPetDef) {
  App.closeAllDisplays();
  App.setScene(App.scene.wedding);
  App.toggleGameplayControls(false);
  App.petDefinition.maxStats();

  Definitions.achievements.marry_x_times.advance();

  const otherPet = new Pet(otherPetDef);

  try {
    App.sendAnalytics(
      "wedding",
      JSON.stringify({
        a: App.petDefinition.sprite,
        b: otherPetDef.sprite,
      })
    );
  } catch (e) {}

  const overlay = new Object2d({
    img: "resources/img/background/house/wedding_overlay.png",
    x: 0,
    y: 0,
    z: 99,
  });

  App.pet.stopMove();
  otherPet.stopMove();

  otherPet.x = "33%";
  App.pet.x = "67%";

  App.pet.y = 0;
  otherPet.y = 0;

  App.pet.targetY = 56;
  otherPet.targetY = 56;

  otherPet.inverted = true;
  App.pet.inverted = false;

  otherPet.triggerScriptedState("blush", App.INF, 0, true);
  App.pet.triggerScriptedState("blush", App.INF, 0, true);

  setTimeout(() => {
    App.playSound("resources/sounds/wedding_song_01.ogg", true);
  });

  setTimeout(() => {
    otherPet.triggerScriptedState("idle_side", App.INF, 0, true);
    App.pet.triggerScriptedState("idle_side", App.INF, 0, true);
  }, 8000);

  setTimeout(() => {
    otherPet.triggerScriptedState("kissing", App.INF, 0, true);
    App.pet.triggerScriptedState("kissing", App.INF, 0, true);
  }, 12380);

  setTimeout(() => {
    task_foam(
      () => {
        App.pet.removeObject();
        otherPet.removeObject();
        overlay.removeObject();

        let parentA = App.petDefinition,
          parentB = otherPetDef;

        App.petDefinition = App.getPetDefFromParents(parentA, parentB);

        App.pet.stopMove();

        App.setScene(App.scene.home);

        App.pet = App.createActivePet(App.petDefinition);
      },
      () => {
        App.toggleGameplayControls(true);

        App.handlers.show_set_pet_name_dialog();
      }
    );
  }, 18000);
}
