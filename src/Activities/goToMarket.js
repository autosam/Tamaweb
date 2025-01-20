import { App } from "@tamaweb/App";
import { Missions } from "@tamaweb/Missions";
import { Pet } from "@tamaweb/Pet";

export function goToMarket() {
  App.toggleGameplayControls(false, () => {
    App.pet.stopScriptedState();
  });
  App.setScene(App.scene.market);
  Missions.done(Missions.TYPES.visit_market);

  let randomNpcs = new Array(2).fill(undefined).map((item, i) => {
    let petDef = App.getRandomPetDef(2);
    let npcPet = new Pet(petDef);

    if (i == 1) npcPet.x = 30;
    else {
      npcPet.x = 0;
      npcPet.inverted = true;
    }

    npcPet.stopMove();
    npcPet.triggerScriptedState("eating", App.INF, null, true);

    return npcPet;
  });

  App.pet.triggerScriptedState(
    "moving",
    2500,
    null,
    true,
    () => {
      App.setScene(App.scene.home);
      App.handlers.open_market_menu();
      App.toggleGameplayControls(true);

      randomNpcs.forEach((npc) => npc.removeObject());
    },
    Pet.scriptedEventDrivers.movingIn.bind({ pet: App.pet }),
  );
}
