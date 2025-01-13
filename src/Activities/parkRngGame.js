import { App } from "../App";
import { Pet } from "../Pet";
import { PetDefinition } from "../PetDefinition";

export function parkRngGame() {
  App.closeAllDisplays();
  App.setScene(App.scene.park);
  App.toggleGameplayControls(false);
  App.petDefinition.checkWant(true, App.constants.WANT_TYPES.minigame);

  // const randomPetRef = App.getRandomPetDef();
  const randomPetRef = new PetDefinition({
    name: "park_game_npc",
    sprite: "resources/img/character/chara_175b.png",
  });
  const randomPet = new Pet(randomPetRef);
  randomPet.stopMove();
  randomPet.triggerScriptedState("eating", 5000, null, true);
  randomPet.x = 20;
  randomPet.inverted = true;

  App.pet.x = 80 - App.pet.spritesheet.cellSize;
  App.pet.inverted = false;
  App.pet.stopMove();
  App.pet.triggerScriptedState("eating", 5000, null, true, () => {
    App.drawer.removeObject(randomPet);
    App.pet.x = "50%";
    if (Math.random() > 0.5) {
      // win
      let winningGold = 25;
      App.pet.stats.gold += winningGold;
      App.pet.stats.current_fun += 35;
      App.pet.playCheeringAnimation(() => {
        App.displayPopup(`${App.petDefinition.name} won $${winningGold}`);
        App.toggleGameplayControls(true);
        App.setScene(App.scene.home);
        App.handlers.open_game_list();
      });
    } else {
      App.pet.playAngryAnimation(() => {
        App.displayPopup(`${App.petDefinition.name} lost!`);
        App.pet.stats.current_fun -= 15;
        App.toggleGameplayControls(true);
        App.setScene(App.scene.home);
        App.handlers.open_game_list();
      });
    }
  });

  return false;
}
