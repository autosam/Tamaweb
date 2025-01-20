import { App } from "@tamaweb/App";
import { Definitions } from "@tamaweb/Definitions";
import { Object2d } from "@tamaweb/Object2d";
import { task_endWork } from "./task_endWork";

export function officeWork() {
  App.closeAllDisplays();
  App.setScene(App.scene.office);
  Definitions.achievements.work_x_times.advance();

  App.toggleGameplayControls(false, () => {
    App.pet.stopScriptedState();
  });

  let laptop = new Object2d({
    img: "resources/img/misc/laptop.png",
    x: "70%",
    y: "50%",
  });
  laptop.x = "70%";
  laptop.y = "50%";
  App.pet.stopMove();
  App.pet.inverted = true;
  App.pet.x = "50%";
  App.pet.y = "60%";
  let startTime = Date.now();
  App.pet.triggerScriptedState("eating", 200000, false, true, () => {
    laptop.removeObject();
    let elapsedTime = Math.round((Date.now() - startTime) / 1000);
    task_endWork(elapsedTime, Math.round(elapsedTime / 2.5));
  });
}
