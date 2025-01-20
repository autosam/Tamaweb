import { App } from "@tamaweb/App";
import { Object2d } from "@tamaweb/Object2d";

export function task_foam(middleFn, endFn) {
  let foam = new Object2d({
    img: "resources/img/misc/foam_01.png",
    x: 0,
    y: 0,
    z: 1001,
    onDraw: (me) => {
      Object2d.animations.flip(me, 400);
    },
  });

  setTimeout(() => {
    foam.setImg("resources/img/misc/foam_02.png");
  }, 500);

  setTimeout(() => {
    foam.setImg("resources/img/misc/foam_03.png");
  }, 1000);

  setTimeout(() => {
    foam.setImg("resources/img/misc/foam_04.png");
  }, 1500);

  setTimeout(() => {
    if (middleFn) middleFn();
  }, 2000);

  setTimeout(() => {
    foam.setImg("resources/img/misc/foam_03.png");
  }, 3000);
  setTimeout(() => {
    foam.setImg("resources/img/misc/foam_02.png");
  }, 3500);
  setTimeout(() => {
    foam.setImg("resources/img/misc/foam_01.png");
  }, 4000);

  setTimeout(() => {
    App.drawer.removeObject(foam);
  }, 4500);

  setTimeout(() => {
    if (endFn) endFn();
  }, 5500);
}
