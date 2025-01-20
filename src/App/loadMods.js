import { App } from "@tamaweb/App";

export function loadMods(mods) {
  if (!mods || !mods.length) return;
  App.mods = mods;
  App.mods.forEach((mod) => {
    if (mod.replaced_resources) {
      mod.replaced_resources.forEach(([source, target]) => {
        App.resourceOverrides[source] = target;
      });
    }
  });
}
