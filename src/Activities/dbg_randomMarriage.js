import { App } from "@tamaweb/App";

export function dbg_randomMarriage() {
  App.pet.removeObject();

  let parentA = App.petDefinition;
  const parentAFamily = parentA.family;
  parentA = App.getRandomPetDef(2);
  parentA.family = parentAFamily;

  App.petDefinition = App.getPetDefFromParents(parentA, App.getRandomPetDef(2));

  App.pet.stopMove();

  App.setScene(App.scene.home);

  App.pet = App.createActivePet(App.petDefinition);
  App.pet.stats.is_egg = false;
}
