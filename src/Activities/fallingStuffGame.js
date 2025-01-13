import { App } from "../App";
import { Definitions } from "../Definitions";
import { Missions } from "../Missions";
import { Object2d } from "../Object2d";
import { UI } from "../UiHelper";
import { randomFromArray, random } from "../Utils";

export function fallingStuffGame() {
  App.closeAllDisplays();
  App.setScene(App.scene.park);
  App.toggleGameplayControls(false);
  App.petDefinition.checkWant(true, App.constants.WANT_TYPES.minigame);
  App.mouse.x = null;

  App.pet.speedOverride = 0.07;
  App.pet.x = "50%";
  App.pet.stopMove();
  App.pet.triggerScriptedState("idle", 99999999, 0, true, null, (pet) => {
    if (App.mouse.x === null) return;

    const center = App.mouse.x - pet.spritesheet.cellSize / 2;

    if (pet.x != center) {
      const diff = pet.x - center;
      if (diff > 0) pet.inverted = false;
      else pet.inverted = true;
      pet.targetX = center;
      if (Math.abs(diff) > 0.5) pet.setState("moving");
    } else {
      pet.setState("idle_side");
    }
  });

  let lives = 2,
    moneyWon = 0;
  let nextSpawnMs = 0,
    projectileSpeed = 0.05,
    spawnDelay = 1250;
  const petHeight = 80 - App.pet.spritesheet.cellSize / 1.2;
  const petWidth = 32 / 2;
  const spawnerObject = new Object2d({
    x: -999,
    y: -999,
    onDraw: () => {
      if (App.lastTime > nextSpawnMs) {
        nextSpawnMs = App.lastTime + spawnDelay;

        projectileSpeed += 0.0018;
        if (projectileSpeed > 0.15) projectileSpeed = 0.15;
        spawnDelay -= 20;
        if (spawnDelay < 800) spawnDelay = 800;

        const xPercentage = randomFromArray(["10%", "37%", "63%", "90%"]);
        const currentIsFaulty = random(0, 3) == 1;
        const projectileObject = new Object2d({
          parent: spawnerObject,
          img: currentIsFaulty
            ? "resources/img/misc/falling_poop.png"
            : "resources/img/misc/heart_particle_01.png",
          y: -20,
          x: xPercentage,
          rotation: random(0, 180),
          z: 6,
          width: 15,
          height: 13,
          speed: projectileSpeed,
          onDraw: (me) => {
            const xCenter = me.x - me.width / 2;
            me.y += me.speed * App.deltaTime;

            me.rotation += me.speed * App.deltaTime;

            if (
              me.y > petHeight &&
              me.y < 80 &&
              xCenter > App.pet.x - petWidth &&
              xCenter < App.pet.x + petWidth
            ) {
              spawnSmoke(xCenter, me.y);
              me.removeObject();
              me.setImg("resources/img/misc/heart_particle_02.png");
              score(currentIsFaulty);
            }

            if (me.y > 90) me.removeObject();
          },
        });
      }
    },
  });

  const spawnSmoke = (x, y) => {
    new Object2d({
      img: "resources/img/misc/foam_single.png",
      x,
      y,
      z: 6,
      opacity: 1,
      scale: 1.2,
      onDraw: (me) => {
        me.rotation += 0.1 * App.deltaTime;
        me.opacity -= 0.001 * App.deltaTime;
        me.scale -= 0.001 * App.deltaTime;
        me.y -= 0.01 * App.deltaTime;
        if (me.opacity <= 0.1 || me.scale <= 0.1) me.removeObject();
      },
    });
  };

  const screen = UI.empty();
  document.querySelector(".screen-wrapper").appendChild(screen);
  screen.innerHTML = `
        <div class="width-full" style="position: absolute; bottom: 0; left: 0;">
            <div class="flex-container" style="justify-content: space-between; padding: 4px">
            <div class="flex-container" style="
                background: #ff00c647;
                padding: 0 4px;
                border-radius: 6px;
                color: #ffcaf4;
            ">
                $
                <div id="moneyWon">${moneyWon}</div>
            </div>
            <div class="flex-container">
                <div id="lives">${lives}</div>
            </div>
            </div>
        </div>
        `;

  const uiMoneyWon = screen.querySelector("#moneyWon"),
    uiLives = screen.querySelector("#lives");

  const updateUI = () => {
    uiMoneyWon.textContent = moneyWon;
    uiLives.innerHTML = new Array(lives)
      .fill("")
      .map(() => {
        return `<img src="resources/img/misc/heart_particle_01.png"></img>`;
      })
      .join(" ");
  };

  updateUI();

  const finish = () => {
    screen.remove();
    spawnerObject.removeObject();
    App.pet.stopScriptedState();
    App.pet.x = "50%";

    const end = () => {
      App.setScene(App.scene.home);
      App.handlers.open_game_list();
      App.toggleGameplayControls(true);
      App.pet.stats.gold += moneyWon;
      App.pet.stats.current_fun += moneyWon / 6;
      App.pet.speedOverride = 0;
      if (
        moneyWon >=
        Definitions.achievements.perfect_minigame_catch_win_x_gold.required
      ) {
        Definitions.achievements.perfect_minigame_catch_win_x_gold.advance();
      }
      if (moneyWon)
        App.displayPopup(`${App.petDefinition.name} won $${moneyWon}`);
      else App.displayPopup(`${App.petDefinition.name} lost!`);
    };

    if (moneyWon > 30) {
      App.pet.playCheeringAnimation(() => end());
      Missions.done(Missions.TYPES.win_game);
    } else {
      App.pet.playUncomfortableAnimation(() => end());
    }
  };

  const score = (faulty) => {
    if (faulty) {
      App.playSound(`resources/sounds/sad.ogg`, true);
      lives--;
      if (lives == 0) {
        lives = 0;
        finish();
      }
    } else {
      App.playSound(`resources/sounds/cute.ogg`, true);
      moneyWon += random(1, 2);
    }

    updateUI();
  };
}
