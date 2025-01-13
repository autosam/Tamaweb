import { App } from "App";

export function addEvent(name, payload, force) {
  if (!App.gameEventsHistory[name] || force) {
    App.gameEventsHistory[name] = true;
    payload?.();
    return true;
  }
  return false;
}

export function getEvent (name) {
  return App.gameEventsHistory[name];
},