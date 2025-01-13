import { App } from "App";
import { clamp } from "Utils";

export function onFrameUpdate(time) {
  App.date = new Date();
  App.hour = App.date.getHours();
  App.fullTime = App.date.getTime();
  App.time = time;
  App.deltaTime = time - App.lastTime;
  App.lastTime = time;
  App.nDeltaTime = clamp(App.deltaTime || 0, 0, 200); // normal delta time

  App.playTime += App.deltaTime;

  if (App.deltaTime > 5000) {
    // simulating offline progression
    App.pet.simulateAwayProgression(App.deltaTime);
  }

  requestAnimationFrame(App.onFrameUpdate);

  App.fpsCurrentTime = App.date.getTime();
  App.fpsElapsedTime = App.fpsCurrentTime - App.fpsLastTime;

  if (App.fpsElapsedTime > App.fpsInterval) {
    App.fpsLastTime =
      App.fpsCurrentTime - (App.fpsElapsedTime % App.fpsInterval);
    App.drawer.draw();
    if (App.onDraw) App.onDraw();
    if (App.registeredDrawEvents.length) {
      App.registeredDrawEvents.forEach((fn) => fn());
    }
  }

  // App.drawer.pixelate();
  // App.drawUI();
  // document.querySelector('.background-canvas').getContext('2d').drawImage(App.drawer.canvas, 0, 0);
}
