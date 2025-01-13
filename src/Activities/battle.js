import { App } from "../App";
import { Object2d } from "../Object2d";
import { Pet } from "../Pet";

export function battle(otherPetDef) {
  App.setScene(App.scene.battle);

  if (!otherPetDef)
    otherPetDef = App.getRandomPetDef(App.petDefinition.lifeStage);

  let otherPet = new Pet(otherPetDef);
  otherPet.stopMove();
  otherPet.x = "75%";
  otherPet.y = "40%";
  otherPet.inverted = false;
  otherPet.triggerScriptedState(
    "battle",
    App.INF,
    0,
    true,
    () => {
      otherPet.removeObject();
    },
    () => {
      Object2d.animations.bob(otherPet, 0.01, 0.1);
    },
  );

  App.pet.stopMove();
  App.pet.x = "25%";
  App.pet.y = "90%";
  App.pet.inverted = true;
  App.pet.triggerScriptedState(
    "battle",
    App.INF,
    0,
    true,
    () => {
      // end
    },
    () => {
      Object2d.animations.bob(App.pet, 0.01, 0.12);
    },
  );

  App.toggleGameplayControls(false, () => {});
}
