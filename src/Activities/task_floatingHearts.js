import { App } from "../App";
import { Object2d } from "../Object2d";
import { random, randomFromArray } from "../Utils";

export function task_floatingHearts(num) {
  if (!num) num = random(1, 4);
  for (let i = 0; i < num; i++) {
    let floatSpeed = random(4, 5) * 0.01,
      swayFloat = 0,
      swaySpeed = random(2, 20) * 0.001;
    const heartObject = new Object2d({
      img: `resources/img/misc/heart_particle_0${random(1, 2)}.png`,
      z: randomFromArray([0, 100]),
      x: `${random(0, 100)}%`,
      y: `${random(105, 115)}%`,
    });
    heartObject.onDraw = (me) => {
      if (isNaN(me.y)) return;

      me.y -= floatSpeed * App.deltaTime;

      swayFloat += swaySpeed * App.deltaTime;
      me.x += Math.sin(swayFloat) * 2;
      if (me.y < -16) me.removeObject();
    };
  }
}
