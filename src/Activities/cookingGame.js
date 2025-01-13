import { App } from "../App";
import { Definitions } from "../Definitions";
import { Missions } from "../Missions";
import { Object2d } from "../Object2d";
import { random, randomFromArray } from "../Utils";
import { task_foam } from "./task_foam";

export async function cookingGame() {
  App.closeAllDisplays();
  App.pet.triggerScriptedState("idle", App.INF, 0, false);
  App.sendAnalytics("cooking_game");
  Missions.done(Missions.TYPES.cook);
  // App.setScene(App.scene.kitchen);

  const potObject = new Object2d({
    img: "resources/img/misc/cooking_pot_p01.png",
    z: 30,
    x: 0,
    y: 0,
  });
  const potInsideObject = new Object2d({
    img: "resources/img/misc/cooking_pot_p02.png",
    z: 30.1,
    x: 0,
    y: 0,
    clipCircle: true,
    parent: potObject,
    onDraw: (me) => {
      Object2d.animations.rotateAround(me, stirringSpeed * 50);
    },
  });
  const potTopObject = new Object2d({
    img: "resources/img/misc/cooking_pot_p03.png",
    z: 30.4,
    x: 0,
    y: 0,
    parent: potObject,
  });

  let stirringSpeed = 0.001;
  const starLogicHandler = (me) => {
    if (!me._originX)
      me._originX = me.config.drawer.getRelativePositionX(50 - 11);
    if (!me._originY)
      me._originY = me.config.drawer.getRelativePositionY(50 - 11);
    if (me._current === undefined || me._current == Math.PI) me._current = 0;

    me._current += stirringSpeed * App.deltaTime;

    Object2d.animations.circleAround(
      me,
      20,
      me._current,
      me._originX,
      me._originY
    );
    Object2d.animations.pulseScale(
      me,
      0.01,
      Math.min(Math.abs(stirringSpeed) * 10, 0.03)
    );
  };

  const starObjects = [];
  for (let i = 0; i < 3; i++) {
    const img = new Object2d({
      img: "resources/img/misc/star_01.png",
      width: 22,
      height: 22,
      y: "50%",
      x: "50%",
      z: 30.5,
      _current: 2.0944 * i,
      pulseScaleFloat: i,
      clipCircle: true,
      parent: potObject,
      noPreload: true,
      onDraw: starLogicHandler,
    });
    starObjects.push(img);
  }

  let failChance = 25;
  let currentTargetImgIndex = 0;
  App.toggleGameplayControls(false, () => {
    if (currentTargetImgIndex < starObjects.length) {
      App.useWebcam((imgData) => {
        if (!imgData || imgData == -1) {
          // potObject.removeObject();
          // App.pet.stopScriptedState();
          // App.toggleGameplayControls(true);
          imgData = "resources/img/misc/exclam_01.png";
          failChance += 35;
        }
        starObjects[currentTargetImgIndex].setImg(imgData);
        currentTargetImgIndex++;
        stirringSpeed += 0.001;
      });
    } else {
      stirringSpeed += 0.001;
      if (stirringSpeed > 0.02) {
        const failed = random(0, 100) < failChance;
        App.toggleGameplayControls(false);
        stirringSpeed = -100;
        let randomFoodName, backgroundObject;
        task_foam(
          () => {
            // mid
            potObject.removeObject();
            backgroundObject = new Object2d({
              img: "resources/img/misc/light_rays_01.png",
              width: 144,
              height: 144,
              x: "50%",
              y: "50%",
              z: 30,
              onDraw: (me) => {
                Object2d.animations.rotateAround(me);
              },
            });
            randomFoodName = randomFromArray(Object.keys(Definitions.food));
            const randomFood = Definitions.food[randomFoodName];
            App.constants.FOOD_SPRITESHEET_DIMENSIONS.cellNumber =
              randomFood.sprite;
            if (!failed) {
              setTimeout(
                () =>
                  App.playSound("resources/sounds/task_complete_02.ogg", true),
                1000
              );
              new Object2d({
                img: App.constants.FOOD_SPRITESHEET,
                spritesheet: App.constants.FOOD_SPRITESHEET_DIMENSIONS,
                x: "50%",
                y: "50%",
                z: 31,
                parent: backgroundObject,
                onDraw: (me) => {
                  Object2d.animations.pulseScale(me, 0.01, 0.01);
                },
              });
            } else {
              new Object2d({
                img: "resources/img/misc/exclam_01.png",
                width: 32,
                height: 32,
                x: "50%",
                y: "50%",
                z: 31,
                parent: backgroundObject,
                clipCircle: true,
                onDraw: (me) => {
                  Object2d.animations.pulseScale(me, 0.01, 0.01);
                },
              });
            }
          },
          () => {
            // end
            setTimeout(() => {
              function end() {
                backgroundObject.removeObject();
                App.toggleGameplayControls(true);
                App.pet.stopScriptedState();
                App.pet.x = "50%";
              }
              if (!failed) {
                const amount = 1;
                App.displayPopup(
                  `${App.petDefinition.name} <br>made x${amount}<br> <b>${randomFoodName}</b>!`,
                  3000,
                  () => {
                    end();
                    App.pet.playCheeringAnimation();
                    App.pet.stats.current_fun += random(10, 25);
                    App.addNumToObject(
                      App.pet.inventory.food,
                      randomFoodName,
                      amount
                    );
                  }
                );
              } else {
                App.displayPopup(
                  `${App.petDefinition.name} <br>failed to make anything edible!<br>`,
                  3000,
                  () => {
                    end();
                    App.pet.stats.current_fun -= random(5, 15);
                    App.pet.playUncomfortableAnimation();
                  }
                );
              }
            }, 2000);
          }
        );
      }
    }
  });
}
