import { App } from "App";

export function registerOnDrawEvent(fn) {
  return App.registeredDrawEvents.push(fn) - 1;
}
export function unregisterOnDrawEvent(inp) {
  let index =
    typeof inp === "function" ? App.registeredDrawEvents.indexOf(inp) : inp;
  if (index != -1) App.registeredDrawEvents.splice(index, 1);
}
