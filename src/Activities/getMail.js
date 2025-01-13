import { App } from "../App";
import { Pet } from "../Pet";
import { PetDefinition } from "../PetDefinition";

export function getMail() {
  App.pet.stopMove();
  App.toggleGameplayControls(false);
  App.setScene(App.scene.garden);
  App.pet.x = "78%";
  App.pet.inverted = false;
  App.pet.triggerScriptedState("idle_side", App.INF, false, true);
  const mailManDef = new PetDefinition({
    sprite: NPC_CHARACTERS[1],
    name: "Nazotchi",
  });
  const mailMan = new Pet(mailManDef, {
    x: "0%",
    y: App.scene.garden.petY,
    targetX: 50,
  });
  const payload = () => {
    mailMan.removeObject();
    App.handlers.show_newspaper();
    App.pet.stopScriptedState();
    App.toggleGameplayControls(true);
    App.setScene(App.scene.home);
    App.pet.x = "50%";
  };
  mailMan.triggerScriptedState("moving", 2500, null, true, () => {
    mailMan.stopMove();
    mailMan.playCheeringAnimation(payload, true);
    App.pet.playCheeringAnimation();
  });
}
