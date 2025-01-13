import { App } from "../App";
import { Definitions } from "../Definitions";
import { Missions } from "../Missions";
import { random } from "../Utils";
import { task_floatingHearts } from "./task_floatingHearts";

export async function pet() {
  App.sendAnalytics("petting");
  let idleTimer = null,
    closeTimer = null,
    y = App.pet.y;
  App.pet.stopMove();
  App.pet.x = "50%";
  App.pet.targetY = 132;
  App.pet.shadowOffset = 999;
  App.toggleGameplayControls(false);
  await App.pet.triggerScriptedState("cheering", 1000, null, true);
  App.pet.scale = 2;
  App.pet.targetY = 50;
  await App.pet.triggerScriptedState("cheering", 1000, null, true);
  App.pet.scale = 3;
  App.pet.targetY = 60;
  App.toggleGameplayControls(false, () => {
    Definitions.achievements.pat_x_times.advance();
    Missions.done(Missions.TYPES.pat);
    App.pet.setState("blush");
    App.pet.stats.current_fun += random(1, 4) * 0.1;
    if (idleTimer) clearTimeout(idleTimer);
    if (closeTimer) clearTimeout(closeTimer);
    App.playSound("resources/sounds/cute.ogg", true);
    task_floatingHearts();
    idleTimer = setTimeout(() => {
      App.pet.setState("idle");
      closeTimer = setTimeout(() => App.pet.stopScriptedState(), 5000);
      idleTimer = null;
    }, 250);
  });
  await App.pet.triggerScriptedState("idle", App.INF, null, true, () => {
    // App.pet.y = y;
    // App.pet.x = '50%';
    App.setScene(App.currentScene);
    App.toggleGameplayControls(true);
    App.pet.shadowOffset = 0;
    App.pet.scale = 1;
    App.pet.playCheeringAnimation();
  });
}
