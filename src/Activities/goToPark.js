import { App } from "../App";
import { Missions } from "../Missions";
import { Pet } from "../Pet";
import { random } from "../Utils";

export function goToPark(otherPetDef) {
  if (!otherPetDef) {
    if (random(1, 100) <= 60) {
      otherPetDef = App.getRandomPetDef(App.petDefinition.lifeStage);
      Missions.done(Missions.TYPES.find_park_friend);
    }
  } else {
    const wantedFriendDef =
      App.petDefinition.friends[App.pet.stats.current_want.item];
    App.petDefinition.checkWant(
      otherPetDef == wantedFriendDef,
      App.constants.WANT_TYPES.playdate,
    );
  }
  App.setScene(App.scene.park);
  App.toggleGameplayControls(false);

  let otherPet;
  if (otherPetDef) {
    otherPet = new Pet(otherPetDef);
    otherPet.nextRandomTargetSelect = 0;
    App.petDefinition.addFriend(otherPetDef, 1);
    otherPetDef.increaseFriendship();
  }
  App.pet.triggerScriptedState(
    "playing",
    10000,
    null,
    true,
    () => {
      App.pet.x = "50%";
      App.pet.stats.current_fun += 40;
      App.pet.statsManager();
      App.pet.playCheeringAnimationIfTrue(App.pet.hasMoodlet("amused"), () =>
        App.setScene(App.scene.home),
      );
      if (otherPet) App.drawer.removeObject(otherPet);
      App.toggleGameplayControls(true);
    },
    Pet.scriptedEventDrivers.playing.bind({ pet: App.pet }),
  );
}
