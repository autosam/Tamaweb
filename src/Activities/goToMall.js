import { App } from "../App";
import { Missions } from "../Missions";

export function goToMall() {
  App.toggleGameplayControls(false, () => {
    App.pet.stopScriptedState();
  });
  App.setScene(App.scene.walkway);
  Missions.done(Missions.TYPES.visit_mall);

  App.pet.x = "100%";
  App.pet.y = "74%";

  App.pet.targetX = -20;

  App.pet.triggerScriptedState("moving", 3000, null, true, () => {
    App.setScene(App.scene.home);
    App.handlers.open_mall_activity_list();
    App.toggleGameplayControls(true);
  });

  // App.pet.triggerScriptedState('moving', 1000, null, true, () => {
  //     App.setScene(App.scene.home);
  //     App.handlers.open_mall_activity_list();
  //     App.toggleGameplayControls(true);
  // }, Pet.scriptedEventDrivers.movingOut.bind({pet: App.pet}));
}
