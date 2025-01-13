import { App } from "../App";
import { Missions } from "../Missions";

export function goToClinic() {
  App.toggleGameplayControls(false);
  Missions.done(Missions.TYPES.visit_doctor);

  function task_visit_doctor() {
    App.setScene(App.scene.hospitalInterior);
    App.pet.stopMove();
    App.pet.x = -30;
    App.pet.targetX = 50;
    App.pet.triggerScriptedState("moving", 4000, null, true, () => {
      App.displayPopup(`<b>Dr. Banzo:</b><br>let's see...`, 3500);
      App.pet.x = "20%";
      // App.toggleGameplayControls(true);
      App.pet.inverted = true;
      App.pet.triggerScriptedState("idle_side", 4100, null, true, () => {
        let health = App.pet.stats.current_health;

        let state = "very healthy";
        if (health <= App.pet.stats.max_health * 0.2) state = "very sick";
        else if (health <= App.pet.stats.max_health * 0.45) state = "sick";
        else if (health <= App.pet.stats.max_health * 0.75) state = "healthy";

        if (state == "very sick" || state == "sick") {
          App.pet.triggerScriptedState("shocked", 2000, false, true, () => {
            App.displayPopup(
              `${App.pet.petDefinition.name} is ${state}`,
              5000,
              () => (App.pet.x = "50%"),
            );
            App.setScene(App.scene.home);
            App.toggleGameplayControls(true);
          });
        } else {
          App.pet.triggerScriptedState(
            "cheering_with_icon",
            2000,
            false,
            true,
            () => {
              App.displayPopup(
                `${App.pet.petDefinition.name} is ${state}`,
                5000,
                () => (App.pet.x = "50%"),
              );
              App.setScene(App.scene.home);
              App.toggleGameplayControls(true);
            },
          );
        }
      });
    });
  }

  function task_goto_hospital() {
    App.setScene(App.scene.hospitalExterior);
    App.pet.stopMove();
    App.pet.x = "50%";
    App.pet.y = 130;
    App.pet.targetY = 80;
    App.pet.triggerScriptedState("moving", 2500, 0, true, () => {
      App.pet.stopMove();
      task_visit_doctor();
    });
  }

  task_goto_hospital();
}
