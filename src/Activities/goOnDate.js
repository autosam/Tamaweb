import { App } from "@tamaweb/App";
import { Definitions } from "@tamaweb/Definitions";
import { Pet } from "@tamaweb/Pet";
import { random } from "@tamaweb/Utils";

export async function goOnDate(otherPetDef = App.getRandomPetDef(), onFailEnd) {
  App.closeAllDisplays();
  App.toggleGameplayControls(false);
  App.setScene(App.scene.beach);
  const otherPet = new Pet(otherPetDef);

  // moving in
  otherPet.x = "70%";
  otherPet.targetX = 0;
  otherPet.triggerScriptedState("moving", 2000, false, true);
  App.pet.x = "100%";
  App.pet.targetX = 50;
  await App.pet.triggerScriptedState("moving", 2000, false, true);

  // date
  App.pet.x = "70%";
  otherPet.x = "30%";
  otherPet.inverted = true;
  otherPet.triggerScriptedState("eating", 8000, false, true);
  await App.pet.triggerScriptedState("eating", 8000, false, true);

  // conclusion
  const end = () => {
    App.pet.stopScriptedState();
    otherPet.removeObject();
    App.setScene(App.scene.home);
    App.toggleGameplayControls(true);
  };
  const determineBehavior = (pet, enjoyment) => {
    if (enjoyment) {
      pet.showThought("thought_heart");
      pet.triggerScriptedState("blush", App.INF, false, true);
      App.playSound("resources/sounds/task_complete_02.ogg", true);
    } else {
      pet.showThought("thought_heart_broken");
      pet.triggerScriptedState("idle_side_uncomfortable", App.INF, false, true);
      pet.inverted = !pet.inverted;
      setTimeout(() =>
        App.playSound("resources/sounds/task_fail_01.ogg", true)
      );
    }
  };
  const petOverall =
    (App.pet.stats.current_fun +
      App.pet.stats.current_cleanliness +
      App.pet.stats.current_health +
      random(0, 100)) /
    4;
  const otherEnjoyment = random(30, 85) <= petOverall;
  const petEnjoyment = otherEnjoyment ? !!random(0, 6) : random(0, 1); // just to make it more common for both parties to not like each other
  determineBehavior(App.pet, petEnjoyment);
  determineBehavior(otherPet, otherEnjoyment);

  setTimeout(() => {
    if (!petEnjoyment || !otherEnjoyment) {
      let text = "";
      if (!otherEnjoyment && !petEnjoyment) {
        text = `Oh no! ${App.petDefinition.name} and ${otherPetDef.name} didn't really hit it off!`;
      } else if (!otherEnjoyment && petEnjoyment) {
        text = `${otherPetDef.name} didn't quite connect with ${App.petDefinition.name}!`;
      } else {
        text = `${App.petDefinition.name} didn't quite connect with ${otherPetDef.name}!`;
      }
      return App.displayPopup(text, 5000, () => {
        end();
        onFailEnd?.();
        App.pet.stats.current_fun -= 35;
        App.pet.playUncomfortableAnimation();
      });
    }

    App.pet.stats.current_fun += 40;
    App.displayConfirm(
      `${App.petDefinition.name} and ${otherPetDef.name} had a wonderful time together! <br><br> Do you want to propose to ${otherPetDef.name}?`,
      [
        {
          name: "propose",
          onclick: () => {
            App.displayConfirm(
              `${App.petDefinition.name} and <div>${otherPetDef.getCSprite()} ${otherPetDef.name}</div> will get married and you'll receive their egg, are you sure?`,
              [
                {
                  name: "yes",
                  onclick: () => {
                    end();
                    wedding(otherPetDef);
                  },
                },
                {
                  name: "cancel",
                  class: "back-btn",
                  onclick: () => {
                    Definitions.achievements.not_propose_on_date_x_times.advance();
                    end();
                  },
                },
              ]
            );
          },
        },
        {
          name: "cancel",
          class: "back-btn",
          onclick: end,
        },
      ]
    );
  }, 3000);
}
