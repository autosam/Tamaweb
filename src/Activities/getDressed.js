import { App } from "../App";
import { Object2d } from "../Object2d";

export async function getDressed(middleFn, onEndFn, cheer) {
  App.closeAllDisplays();
  App.toggleGameplayControls(false);

  let curtainTargetElevation = 16,
    step = 0;
  const curtainObject = new Object2d({
    img: "resources/img/misc/dresser_curtain_01.png",
    x: 0,
    y: -100,
    z: 9,
    onDraw: (curtain) => {
      // curtain.y = lerp(curtain.y, curtainTargetElevation, 0.001 * App.deltaTime);
      curtain.targetY = curtainTargetElevation;
      curtain.moveToTarget(0.03);
      Object2d.animations.bob(curtain, 0.01, 1);
    },
  });

  App.pet.stopMove();
  App.pet.x = "50%";
  await App.pet.triggerScriptedState("idle", 4000, 0, true);
  if (middleFn) middleFn();
  curtainTargetElevation = -100;
  await App.pet.triggerScriptedState("idle", 2000, 0, true);
  curtainObject.removeObject();
  App.pet.playCheeringAnimationIfTrue(cheer, () => {
    App.toggleGameplayControls(true);
    onEndFn();
  });
}
