import { App } from "../App";
import { Object2d } from "../Object2d";
import { lerp } from "../Utils";

export function playEggUfoAnimation(callback) {
  if (!App.pet.eggObject) return;

  App.toggleGameplayControls(false);

  let egg = App.pet.eggObject;
  egg.y = -40;

  let stage = 0;

  this.ufoObject = new Object2d({
    image: App.preloadedResources["resources/img/misc/ufo_01.png"],
    y: -120,
    x: 0,
  });

  let drawEvent = () => {
    egg.y = lerp(egg.y, 72, 0.0008 * App.deltaTime);

    if (stage == 0) {
      this.ufoObject.y = lerp(this.ufoObject.y, 0, 0.007 * App.deltaTime);
      if (egg.y >= 65) stage = 1;
    } else {
      this.ufoObject.y = lerp(this.ufoObject.y, -120, 0.001 * App.deltaTime);
      if (this.ufoObject.y <= -110) stage = 2;
    }

    if (stage == 2) {
      App.toggleGameplayControls(true);
      if (callback) callback();
      this.ufoObject.removeObject();
      App.unregisterOnDrawEvent(drawEvent);
    }
  };

  App.registerOnDrawEvent(drawEvent);
}
