import { redecorRoom } from "@Activities";
import { App } from "App";
import { Definitions } from "Definitions";
import { PetDefinition } from "PetDefinition";

export function handleInputCode(rawCode) {
  const addEvent = App.addEvent;

  function showAlreadyUsed() {
    App.displayPopup(`You can only use this code once`);
    return false;
  }

  let code = rawCode.toString().toUpperCase();

  let codeEventId = `input_code_event_${code}`;

  switch (code) {
    case "XUZFWQ":
      if (
        !addEvent(codeEventId, () => {
          App.pet.stats.gold += 250;
        })
      )
        return showAlreadyUsed();
      App.displayPopup(
        `Congratulations! ${App.petDefinition.name} got $250!`,
        5000
      );
      break;
    case "PRNCSS":
      if (
        !addEvent(codeEventId, () => {
          App.displayPopup(`Success!`, 5000, () => {
            App.closeAllDisplays();
            redecorRoom();
            App.scene.home.image = Definitions.room_background.princess.image;
          });
        })
      )
        return showAlreadyUsed();
      break;
    case "HESOYAM":
      App.displayPopup(`All you had to do ...`, 5000, () => {
        App.pet.stats.gold += 2500;
        App.pet.stats.current_care = App.pet.stats.max_care;
        App.pet.stats.current_health = App.pet.stats.max_health;
      });
      break;
    default:
      const showInvalidError = () => {
        App.displayPopup(`Invalid code`);
      };

      const command = /(\S+?) *: *(.+)/g.exec(rawCode);
      if (!command) {
        showInvalidError();
        break;
      }
      [, commandType, commandPayload] = command;
      switch (commandType) {
        case "save":
          try {
            const b64 = atob(commandPayload.replace(":endsave", ""));
            console.log(b64);
            let json = JSON.parse(b64);
            if (!json.pet) {
              throw "error";
            }
            let petDef = JSON.parse(json.pet);
            console.log(json.user_id, App.userId, json.user_id === App.userId);

            let def = new PetDefinition().loadStats(petDef);

            App.displayConfirm(
              `Are you trying to load <div style="font-weight: bold">${def.getCSprite()} ${def.name}?</div>`,
              [
                {
                  name: "yes",
                  onclick: () => {
                    App.displayConfirm(
                      `What do you want to do with ${def.name}?`,
                      [
                        {
                          name: "as active pet",
                          onclick: () => {
                            App.displayConfirm(
                              `Are you sure? This will <b>remove</b> your current pet`,
                              [
                                {
                                  name: "yes",
                                  onclick: () => {
                                    App.loadFromJson(json);
                                    App.displayPopup(
                                      `${def.name} is now your pet!`,
                                      App.INF
                                    );
                                    setTimeout(() => {
                                      location.reload();
                                    }, 3000);
                                  },
                                },
                                {
                                  name: "no",
                                  onclick: () => {},
                                },
                              ]
                            );
                            return true;
                          },
                        },
                        {
                          _ignore: json.user_id === App.userId,
                          name: "add friend",
                          onclick: () => {
                            App.petDefinition.addFriend(def);
                            App.closeAllDisplays();
                            return App.displayPopup(
                              `${def.name} was added to the friends list!`,
                              3000
                            );
                          },
                        },
                        {
                          name: "cancel",
                          onclick: () => {},
                        },
                      ]
                    );
                  },
                },
                {
                  name: "no",
                  class: "back-btn",
                  onclick: () => {},
                },
              ]
            );
          } catch (e) {
            console.error(e);
            return App.displayPopup("Character code is corrupted");
          }
          break;

        case "setchar":
          App.displayConfirm(
            `Are you sure you want to change your pet's sprite?`,
            [
              {
                name: "yes",
                onclick: () => {
                  App.petDefinition.sprite = commandPayload;
                  window.location.reload();
                },
              },
              {
                name: "no",
                onclick: () => {},
              },
            ]
          );
          break;
        default:
          showInvalidError();
      }
  }
}
