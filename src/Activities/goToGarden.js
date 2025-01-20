import { App } from "@tamaweb/App";

export function goToGarden() {
  App.pet.stopScriptedState();
  App.setScene(App.scene.garden);
  App.pet.x = "100%";
  App.pet.targetX = 50;
  App.toggleGameplayControls(false, () => {
    return App.displayList([
      {
        name: "<small> coming soon... </small>",
        type: "text",
      },
      {
        name: '<i class="icon fa-solid fa-home"></i> go inside',
        onclick: () => {
          App.setScene(App.scene.home);
          App.toggleGameplayControls(true);
          App.pet.stopScriptedState();
          App.pet.x = "0%";
          App.pet.targetX = 50;
        },
      },
    ]);
  });
}
