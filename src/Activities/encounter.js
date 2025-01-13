import { App } from "../App";
import { Pet } from "../Pet";
import { PetDefinition } from "../PetDefinition";
import { random } from "../Utils";

export function encounter() {
  if (random(0, 256) != 1) return false;
  const def = new PetDefinition({
    sprite: NPC_CHARACTERS[0],
    name: "-_-",
  }).setStats({
    current_hunger: 0,
    current_health: 0,
    current_fun: 0,
    current_death_tick: 0,
    speed: 0.1,
    wander_min: 0.1,
    wander_max: 0.11,
  });
  new Pet(def, {
    opacity: 0.5,
    x: -50,
    castShadow: false,
    z: App.constants.ACTIVE_PET_Z + 1,
    onDraw: (me) => {
      if (!App.pet.stats.is_sleeping) {
        me.removeObject();
      }
    },
  });
  return true;
}
