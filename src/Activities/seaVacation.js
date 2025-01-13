import { App } from "../App";
import { Pet } from "../Pet";
import { task_foam } from "./task_foam";

export function seaVacation() {
  App.pet.stats.is_at_vacation = true;
  App.save();
  App.setScene(App.scene.seaVacation);

  const end = () => {
    App.toggleGameplayControls(false);
    task_foam(() => {
      App.toggleGameplayControls(true);
      App.pet.stats.is_at_vacation = false;
      App.pet.stopScriptedState();
      App.setScene(App.scene.home);
      App.pet.playCheeringAnimation();
      App.save();
    });
  };

  App.pet.triggerScriptedState(
    "idle",
    App.INF,
    0,
    true,
    null,
    Pet.scriptedEventDrivers.playingWithItem.bind({ pet: App.pet })
  );

  setTimeout(() => {
    App.pet.x = "65%";
    App.pet.y = "67%";
    App.pet.stopMove();
  });

  App.toggleGameplayControls(false, () => {
    App.displayConfirm(
      `Are you sure you want to end ${App.petDefinition.name}'s vacation?`,
      [
        {
          name: "yes",
          onclick: end,
        },
        {
          name: "no",
          class: "back-btn",
          onclick: () => {},
        },
      ]
    );
  });
}
