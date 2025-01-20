import { App } from "@tamaweb/App";
import { Definitions } from "@tamaweb/Definitions";
import { Missions } from "@tamaweb/Missions";
import { clamp } from "@tamaweb/Utils";

export function barTimingGame() {
  App.closeAllDisplays();
  App.toggleGameplayControls(false);
  App.petDefinition.checkWant(true, App.constants.WANT_TYPES.minigame);

  let screen = App.displayEmpty();
  screen.innerHTML = `
        <div class="flex-container flex-row-down height-100p" style="background: url(${App.scene.arcade_game01.image});background-size: contain;image-rendering: pixelated;">
            <div class="timing-bar-container">
                <div class="timing-bar-rod"></div>
                <div class="timing-bar-rod"></div>
                <div class="timing-bar-rod"></div>
                <div class=timing-bar-cursor></div>
            </div>
        </div>
        `;

  const cursor = screen.querySelector(".timing-bar-cursor");

  let moneyWon = 0,
    round = 0,
    roundsWin = 0;
  let cursorSpeed = 0.19;
  let cursorCurrentPos = 0;

  let reset = (cursorSpeedAdd) => {
    cursorCurrentPos = 0;
    cursor.style.opacity = 1;
  };

  reset();

  App.onDraw = () => {
    cursorCurrentPos += cursorSpeed * App.nDeltaTime;
    if (cursorCurrentPos >= 98 || cursorCurrentPos <= 0) {
      cursorSpeed *= -1;
      cursorCurrentPos = clamp(cursorCurrentPos, 0, 100);
      // App.vibrate(25);
      App.playSound(`resources/sounds/ui_click_04.ogg`, true);
    }
    cursor.style.left = `${cursorCurrentPos}%`;
  };

  screen.onclick = () => {
    if (cursorSpeed == 0) return;

    cursorSpeed = 0;
    cursor.style.opacity = 0.3;

    if (cursorCurrentPos >= 90) {
      App.playSound(`resources/sounds/ui_click_03.ogg`, true);
      App.vibrate(80);
      // success
      moneyWon += 20;
      roundsWin++;
    } else if (cursorCurrentPos >= 70) {
      App.playSound(`resources/sounds/ui_click_01.ogg`, true);
      moneyWon += 3;
    } else {
      App.playSound(`resources/sounds/ui_click_01.ogg`, true);
      moneyWon -= 5;
      moneyWon = clamp(moneyWon, 0, 999);
    }

    round++;

    if (round == 3) {
      setTimeout(() => {
        screen.close();
        App.onDraw = null;
        App.displayPopup(
          `${App.petDefinition.name} won $${moneyWon}!`,
          null,
          () => {
            App.toggleGameplayControls(false);
            App.pet.stats.gold += moneyWon;
            App.pet.stats.current_fun += roundsWin * 10;
            App.setScene(App.scene.arcade);
            App.pet.stopMove();
            App.pet.x = "50%";
            const onEnd = () => {
              App.toggleGameplayControls(true);
              App.handlers.open_game_list();
              App.setScene(App.scene.home);
            };
            if (roundsWin <= 1) {
              // App.pet.triggerScriptedState('uncomfortable', 3000, 0, true, onEnd);
              App.pet.playAngryAnimation(onEnd);
            } else {
              if (roundsWin == 3) {
                Definitions.achievements.perfect_minigame_rodrush_win_x_times.advance();
              }
              App.pet.playCheeringAnimationIfTrue(roundsWin == 3, onEnd);
              Missions.done(Missions.TYPES.win_game);
            }
          },
        );
      }, 500);
    } else {
      setTimeout(() => {
        reset(0.15);

        cursorSpeed = round == 1 ? 0.27 : 0.37;
      }, 500);
    }
  };
}
