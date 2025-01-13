import { App } from "../App";

export function stayAtParents(end) {
  App.sendAnalytics("stay_at_parents");

  if (end) {
    App.toggleGameplayControls(true);
    App.setScene(App.scene.home);
    App.pet.playCheeringAnimation();
    App.pet.stats.is_at_parents = false;
    App.save();
    return;
  }

  App.toggleGameplayControls(false, () => {
    App.displayConfirm(
      `Pickup ${App.petDefinition.name} from their parents house?`,
      [
        {
          name: "yes",
          onclick: () => {
            stayAtParents(true); // ending
          },
        },
        {
          name: "no",
          class: "back-btn",
          onclick: () => {},
        },
      ]
    );
  });

  App.setScene(App.scene.parentsHome);

  App.pet.stats.is_at_parents = true;
  App.save();
}
