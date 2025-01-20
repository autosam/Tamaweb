import { App } from "@tamaweb/App";
import { Pet } from "@tamaweb/Pet";

export function goToArcade() {
  App.toggleGameplayControls(false, () => {
    App.pet.stopScriptedState();
  });
  App.setScene(App.scene.arcade);

  let randomNpcs = new Array(2).fill(undefined).map((item, i) => {
    let petDef = App.getRandomPetDef(1);
    let npcPet = new Pet(petDef);

    if (i == 1) npcPet.x = 15;
    else npcPet.x = 0;

    npcPet.stopMove();
    npcPet.triggerScriptedState("cheering", App.INF, null, true);

    return npcPet;
  });

  App.pet.triggerScriptedState(
    "moving",
    2500,
    null,
    true,
    () => {
      App.setScene(App.scene.home);
      App.handlers.open_game_list();
      App.toggleGameplayControls(true);

      randomNpcs.forEach((npc) => npc.removeObject());
    },
    Pet.scriptedEventDrivers.movingIn.bind({ pet: App.pet }),
  );
}
