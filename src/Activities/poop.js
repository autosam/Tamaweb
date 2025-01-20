import { App } from "@tamaweb/App";
import { Definitions } from "@tamaweb/Definitions";
import { Missions } from "@tamaweb/Missions";

export function poop() {
  // todo: add automatic pooping and poop training symbols to player

  App.closeAllDisplays();
  App.setScene(App.scene.bathroom);
  App.toggleGameplayControls(false);
  Missions.done(Missions.TYPES.use_toilet);

  if (App.pet.stats.current_bladder > App.pet.stats.max_bladder / 2) {
    // more than half
    App.pet.playRefuseAnimation(() => {
      App.setScene(App.scene.home);
      App.toggleGameplayControls(true);
    });
    return;
  }

  Definitions.achievements.use_toilet_x_times.advance();

  App.pet.needsToiletOverlay.hidden = false;
  App.pet.stats.current_bladder = App.pet.stats.max_bladder;
  App.pet.stopMove();
  App.pet.x = "21%";
  App.pet.y = "85%";
  App.pet.inverted = true;
  App.pet.triggerScriptedState("sitting", 5000, 0, true, () => {
    App.pet.x = "50%";
    App.pet.y = "100%";
    App.pet.playCheeringAnimation(() => {
      App.setScene(App.scene.home);
      App.toggleGameplayControls(true);
    });
  });
}
