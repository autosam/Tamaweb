import { App } from "../App";

export function task_endWork(elapsedTime, moneyMade) {
  App.displayPopup(
    `${App.petDefinition.name} worked for ${elapsedTime} seconds`,
    2500,
    () => {
      if (elapsedTime > 10) {
        App.pet.stats.gold += moneyMade;
      } else moneyMade = 0;
      App.pet.stats.current_fun -= elapsedTime / 3.5;
      App.displayConfirm(`${App.petDefinition.name} made $${moneyMade}`, [
        {
          name: "ok",
          onclick: () => {
            App.setScene(App.scene.home);
          },
        },
      ]);
    },
  );
  App.toggleGameplayControls(true);
}
