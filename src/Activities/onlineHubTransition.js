import { App } from "@tamaweb/App";
import { Missions } from "@tamaweb/Missions";
import { Object2d } from "@tamaweb/Object2d";
import { clamp } from "@tamaweb/Utils";

export function onlineHubTransition(onEndFn) {
  Missions.done(Missions.TYPES.visit_online_hub);
  App.pet.stopMove();
  App.toggleGameplayControls(false);
  App.pet.x = "50%";
  setTimeout(() =>
    App.playSound("resources/sounds/online_hub_transition_01.ogg", true),
  );
  const fadeOverlay = new Object2d({
    img: "resources/img/misc/cyberpunk_overlay_01.png",
    x: 0,
    y: 0,
    z: 555,
    opacity: 0,
    direction: true,
    onDraw: (me) => {
      Object2d.animations.flip(me, 1000);
      if (me.direction) me.opacity += 0.00025 * App.deltaTime;
      else me.opacity -= 0.001 * App.deltaTime;
      me.opacity = clamp(me.opacity, 0, 2);
      if (!me.direction && me.opacity == 0) me.removeObject();
    },
  });
  const lightRays = new Object2d({
    parent: fadeOverlay,
    img: "resources/img/misc/light_rays_02.png",
    z: 556,
    opacity: 0,
    x: "50%",
    y: "50%",
    composite: "overlay",
    onDraw: (me) => {
      me.opacity = fadeOverlay.opacity * 3;
      me.rotation += 0.01 * App.deltaTime;
      me.x = "50%";
      me.y = "50%";
    },
  });

  App.pet.triggerScriptedState("shocked", 4000, false, true, () => {
    App.pet.targetY = undefined;
    onEndFn(fadeOverlay);
  });
  App.pet.targetY = 50;
}
