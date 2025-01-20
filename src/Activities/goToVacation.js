import { App } from "@tamaweb/App";
import { task_foam } from "./task_foam";

export function goToVacation(vacationFn) {
  App.closeAllDisplays();
  App.toggleGameplayControls(false);
  App.pet.stopMove();
  App.pet.triggerScriptedState("idle", App.INF, 0, true, null);
  task_foam(() => {
    vacationFn();
  });
}
