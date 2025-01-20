import { App } from "@tamaweb/App";
import { Definitions } from "@tamaweb/Definitions";
import { UI } from "@tamaweb/UiHelper";

export function applySettings() {
  const graphicsWrapper = document.querySelector(".graphics-wrapper");

  // background
  document.body.style.backgroundColor = this.settings.backgroundColor;
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  metaThemeColor?.setAttribute("content", this.settings.backgroundColor);
  document.querySelector(".loading-text").style.background =
    this.settings.backgroundColor;

  // screen size
  graphicsWrapper.style.transform = `scale(${this.settings.screenSize})`;
  document.querySelector(".dom-shell").style.transform =
    `scale(${this.settings.screenSize})`;

  // shell
  const domShell = document.querySelector(".dom-shell");
  domShell.style.display = App.settings.displayShell ? "" : "none";
  domShell.className = `dom-shell shell-shape-${this.settings.shellShape}`;
  document.querySelector(".shell-btn.main").style.display = App.settings
    .displayShellButtons
    ? ""
    : "none";
  document.querySelector(".shell-btn.right").style.display = App.settings
    .displayShellButtons
    ? ""
    : "none";
  document.querySelector(".shell-btn.left").style.display = App.settings
    .displayShellButtons
    ? ""
    : "none";

  // classic main menu layout
  let classicMainMenuContainer = document.querySelector(
    ".classic-main-menu__container"
  );
  classicMainMenuContainer?.remove();
  graphicsWrapper.classList.remove("classic-main-menu");
  if (App.settings.classicMainMenuUI) {
    graphicsWrapper.classList.add("classic-main-menu");
    classicMainMenuContainer = UI.create({
      componentType: "div",
      className: "classic-main-menu__container",
      parent: graphicsWrapper,
      parentInsertBefore: true,
      children: Definitions.main_menu.map((def) => {
        return {
          className: "classic-main-menu__item click-sound",
          innerHTML: def.name,
          onclick: def.onclick,
        };
      }),
    });

    if (!App.temp.defaultHomeSceneConfig) {
      App.temp.defaultHomeSceneConfig = {
        petY: App.scene.home.petY,
        shadowOffset: App.scene.home.shadowOffset,
      };
    }

    App.scene.home.petY = "90%";
    App.scene.home.shadowOffset = -10;
  } else {
    if (App.temp.defaultHomeSceneConfig) {
      App.scene.home.petY = App.temp.defaultHomeSceneConfig.petY;
      App.scene.home.shadowOffset =
        App.temp.defaultHomeSceneConfig.shadowOffset;
    }
  }
  if (App.currentScene) {
    App.setScene(App.currentScene);
  }
}
