import { App } from "@tamaweb/App";

export function registerInputUpdates() {
  document.addEventListener("mousemove", (evt) => {
    const rect = App.drawer.canvas.getBoundingClientRect();
    let x = evt.clientX - rect.left,
      y = evt.clientY - rect.top;
    if (x < 0) x = 0;
    if (x > rect.width) x = rect.width;
    if (y < 0) y = 0;
    if (y > rect.height) y = rect.height;

    App.mouse = { x: x / 2, y: y / 2 };
  });
  document.addEventListener("touchmove", (evt) => {
    const rect = App.drawer.canvas.getBoundingClientRect();
    const targetTouch = evt.targetTouches[0];
    let x = targetTouch.clientX - rect.left,
      y = targetTouch.clientY - rect.top;
    if (x < 0) x = 0;
    if (x > rect.width) x = rect.width;
    if (y < 0) y = 0;
    if (y > rect.height) y = rect.height;

    App.mouse = { x: x / 2, y: y / 2 };
  });
}
