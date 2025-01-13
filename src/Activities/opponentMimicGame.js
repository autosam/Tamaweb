import { App } from "../App";
import { Definitions } from "../Definitions";
import { Missions } from "../Missions";
import { Pet } from "../Pet";
import { PetDefinition } from "../PetDefinition";
import { random, randomFromArray } from "../Utils";

export function opponentMimicGame() {
  App.closeAllDisplays();
  App.setScene(App.scene.arcade);
  App.toggleGameplayControls(false);
  App.petDefinition.checkWant(true, App.constants.WANT_TYPES.minigame);

  const opponentPetDef = new PetDefinition({
    name: "park_game_npc",
    sprite: "resources/img/character/chara_175b.png",
  });

  const opponentPet = new Pet(opponentPetDef, { x: "70%" });

  let totalRounds = 3,
    playedRounds = 0,
    roundsWon = 0;

  const reset = () => {
    if (playedRounds >= totalRounds) {
      App.pet.stopScriptedState();
      opponentPet.removeObject();
      App.pet.x = "50%";

      const end = () => {
        App.setScene(App.scene.home);
        App.handlers.open_game_list();
        App.toggleGameplayControls(true);
        const moneyWon = roundsWon * random(20, 30);
        App.pet.stats.gold += moneyWon;
        App.pet.stats.current_fun += roundsWon * 15;
        if (moneyWon)
          App.displayPopup(`${App.petDefinition.name} won $${moneyWon}`);
        else App.displayPopup(`${App.petDefinition.name} lost!`);
        if (roundsWon == totalRounds) {
          Definitions.achievements.perfect_minigame_mimic_win_x_times.advance();
        }
      };

      if (roundsWon >= 2) {
        App.pet.playCheeringAnimation(() => end());
        Missions.done(Missions.TYPES.win_game);
      } else if (roundsWon == 0) {
        App.pet.playUncomfortableAnimation(() => end());
      } else {
        end();
        Missions.done(Missions.TYPES.win_game);
      }

      return;
    }

    opponentPet.stopMove();
    opponentPet.triggerScriptedState("idle", App.INF, null, true);
    opponentPet.x = "70%";
    opponentPet.inverted = true;

    App.pet.x = "30%";
    App.pet.inverted = false;
    App.pet.stopMove();
    App.pet.triggerScriptedState("idle", App.INF, null, true);

    setTimeout(() => {
      const screen = App.displayEmpty();
      const imgPath = "resources/img/ui/";
      screen.innerHTML = `
                <div class="flex-container flex-dir-col height-100p" style="background: var(--background-c)">
                    <div class="solid-surface-stylized inner-padding b-radius-10 relative">
                        <div class="surface-stylized" style="padding: 0px 10px;position: absolute;top: -20px;left: 0px;">
                            ${playedRounds + 1}/${totalRounds}
                        </div>
                        Which direction will your opponent turn?
                    </div>
                    <div class="mimic-game__btn-container">
                        <button id="left" class="generic-btn stylized"> <img src="${imgPath}facing_left.png"></img> </button>
                        <button id="center" class="generic-btn stylized"> <img src="${imgPath}facing_center.png"></img> </button>
                        <button id="right" class="generic-btn stylized"> <img src="${imgPath}facing_right.png"></img> </button>
                    </div>
                </div>
                `;
      ["left", "center", "right"].forEach((dir) => {
        const btn = screen.querySelector(`#${dir}`);
        btn.onclick = () => {
          setPredictedDirection(dir);
          screen.close();
        };
      });
    }, 800);
  };

  reset();

  const deriveStateFromDirection = (dir) => {
    switch (dir) {
      case "center":
        return { state: "idle", inverted: false };
      case "right":
        return { state: "idle_side", inverted: true };
      case "left":
        return { state: "idle_side", inverted: false };
    }
  };

  const setPredictedDirection = (dir) => {
    const randomDir = randomFromArray(["left", "center", "right"]);
    setTimeout(() => {
      const opponentState = deriveStateFromDirection(randomDir);
      opponentPet.setState(opponentState.state);
      opponentPet.inverted = opponentState.inverted;

      const playerState = deriveStateFromDirection(dir);
      App.pet.setState(playerState.state);
      App.pet.inverted = playerState.inverted;

      // if(randomDir === dir){
      //     App.playSound(`resources/sounds/task_complete_02.ogg`, true);
      // } else {
      //     App.playSound(`resources/sounds/task_fail_01.ogg`, true);
      // }
      App.playSound(`resources/sounds/task_complete.ogg`, true);

      setTimeout(() => {
        playedRounds++;
        if (randomDir === dir) {
          App.pet.setState("cheering");
          opponentPet.setState("angry");
          roundsWon++;
        } else {
          App.pet.setState("angry");
          opponentPet.setState("cheering");
        }
        setTimeout(reset, 1000);
      }, 1500);
    }, 1000);
  };

  return false;
}
