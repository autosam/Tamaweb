import { App } from "../App";
import { Missions } from "../Missions";
import { Object2d } from "../Object2d";
import { random } from "../Utils";

export function bathe() {
  App.closeAllDisplays();
  App.setScene(App.scene.bathroom);
  Missions.done(Missions.TYPES.use_bath);
  let foams = [];
  App.toggleGameplayControls(false, () => {
    App.pet.inverted = !App.pet.inverted;
    let flipTime = random(200, 300);

    let foamSpeed = random(5, 13) * 0.001;
    let foamStr = random(1, 4) * 0.1;
    let foam = new Object2d({
      img: "resources/img/misc/foam_single.png",
      x: 50 + random(-15, 15) + Math.random(),
      y: 42 + random(-2, 2) + Math.random(),
      z: 20,
      onDraw: (me) => {
        Object2d.animations.flip(me, flipTime);
        Object2d.animations.bob(me, foamSpeed, foamStr);
      },
    });
    foams.push(foam);

    if (foams.length >= 10) {
      foams.forEach((f) => f.removeObject());
      App.toggleGameplayControls(false);
      App.pet.stopScriptedState();
    }

    App.pet.stats.current_cleanliness += 25;
    App.playSound(`resources/sounds/ui_click_03.ogg`, true);
  });

  let bathObject = new Object2d({
    img: "resources/img/misc/bathroom_01_bath.png",
    x: 0,
    y: 0,
    z: 19,
  });

  App.pet.stopMove();
  App.pet.x = "64%";
  App.pet.y = "64%";
  App.pet.triggerScriptedState("idle", App.INF, 0, true, () => {
    App.pet.x = "50%";
    App.pet.y = "100%";
    bathObject.removeObject();
    App.pet.playCheeringAnimation(() => {
      App.setScene(App.scene.home);
      App.toggleGameplayControls(true);
    });
  });
}
