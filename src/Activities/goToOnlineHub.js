import { App } from "@tamaweb/App";
import { Definitions } from "@tamaweb/Definitions";
import { Missions } from "@tamaweb/Missions";
import { Pet } from "@tamaweb/Pet";
import { PetDefinition } from "@tamaweb/PetDefinition";
import { random } from "@tamaweb/Utils";
import { goOnDate } from "./goOnDate";
import { invitePlaydate } from "./invitePlaydate";
import { onlineHubTransition } from "./onlineHubTransition";

export async function goToOnlineHub() {
  const { hasUploadedPetDef, randomPetDefs } = App.temp.online;
  const INTERACTION_LIKES = {
    outgoing: hasUploadedPetDef.interactionOutgoingLikes ?? 0,
    receiving: hasUploadedPetDef.interactionReceivingLikes ?? 0,
  };
  const addInteraction = (def) => {
    App.apiService.addInteraction(def.ownerId);
    def.interactions = (def.interactions ?? 0) + INTERACTION_LIKES.outgoing;
    hasUploadedPetDef.interactions =
      (hasUploadedPetDef.interactions ?? 0) + INTERACTION_LIKES.receiving;
  };

  App.setScene(App.scene.online_hub);

  App.pet.stopMove();
  App.pet.x = "50%";

  let npcY = 60;
  const otherPlayersPets = randomPetDefs.slice(0, 7).map((def, i) => {
    if (i && i % 2 == 0) npcY += 10;
    const p = new Pet(def, {
      x: `${random(0, 100)}%`,
      y: `${npcY}%`,
      z: 4 + i * 0.15,
      opacity: 1,
    });
    p.stats.wander_max = 3;
    return p;
  });

  if (hasUploadedPetDef.status) {
    App.apiService.addPetDef();
  }

  // handlers
  const despawnAllPets = () => {
    otherPlayersPets.forEach((p) => p?.removeObject?.());
  };
  const handleHangout = (def) => {
    App.closeAllDisplays();
    App.toggleGameplayControls(false);
    despawnAllPets();
    addInteraction(def);
    Missions.done(Missions.TYPES.online_interact);
    invitePlaydate(def, App.scene.online_hub, () => {
      App.displayConfirm(
        `Do you want to add ${def.getCSprite()} ${def.name} to your friends list?`,
        [
          {
            name: "yes",
            onclick: () => {
              App.closeAllDisplays();
              const addedFriend = App.petDefinition.addFriend(def, 1);
              if (addedFriend) {
                App.displayPopup(
                  `${def.getCSprite()} ${def.name} has been added to the friends list!`,
                  3000
                );
                addInteraction(def);
              } else {
                App.displayPopup(
                  `You are already friends with ${def.name}`,
                  3000
                );
              }
              return false;
            },
          },
          {
            name: "no",
            class: "back-btn",
            onclick: () => {},
          },
        ]
      );
      setTimeout(() => goToOnlineHub());
    });
  };
  const handleDate = (def) => {
    return App.displayConfirm(
      `Do you want to go on a date with <div>${def.getCSprite()} ${def.name}</div>?`,
      [
        {
          name: "yes",
          onclick: () => {
            despawnAllPets();
            addInteraction(def);
            goOnDate(def, goToOnlineHub);
          },
        },
        {
          name: "cancel",
          class: "back-btn",
          onclick: () => {},
        },
      ]
    );
  };
  const handleInteract = () => {
    const petInteractions = otherPlayersPets.map((pet) => {
      const def = pet.petDefinition;
      return {
        name: `${def.getCSprite()} ${def.name}`,
        onclick: () => {
          return App.displayList([
            {
              name: `
                                <div style="
                                    display: flex;
                                    justify-content: space-between;
                                    flex-wrap: wrap;   
                                    align-items: center;                                     
                                ">
                                    <div>
                                        <i class="fa-solid fa-user-circle"></i> ${def.owner}
                                    </div>
                                    <div>
                                        <i class="fa-solid fa-thumbs-up"></i> ${def.interactions}
                                    </div>
                                </div>
                                `,
              type: "text",
              solid: true,
            },
            {
              name: "hang out",
              onclick: () => handleHangout(def),
            },
            {
              _disable:
                App.petDefinition.lifeStage !== 2 || def.lifeStage !== 2,
              name: `go on date`,
              onclick: () => handleDate(def),
            },
          ]);
        },
      };
    });
    return App.displayList([
      ...petInteractions,
      {
        name: `
                    <small>
                        <i class="fa-solid fa-info-circle"></i>
                        Every time you interact with another pet you'll receive 
                        <i class="fa-solid fa-thumbs-up"></i> ${INTERACTION_LIKES.receiving} 
                        and they'll receive
                        <i class="fa-solid fa-thumbs-up"></i> ${INTERACTION_LIKES.outgoing} 
                    </small>
                    `,
        type: "text",
      },
    ]);
  };
  const handleUploadCharacter = () => {
    return App.displayConfirm(
      `Do you want to upload ${App.petDefinition.name} to HUBCHI so that other players can see and interact with them?`,
      [
        {
          name: "yes",
          onclick: async () => {
            const popup = App.displayPopup("Uploading...", App.INF);
            const { status } = await App.apiService.addPetDef();
            popup.close();
            App.closeAllDisplays();
            hasUploadedPetDef.status = status;
            App.displayPopup("Success!");
          },
        },
        {
          name: "no",
          class: "back-btn",
          onclick: () => {},
        },
      ]
    );
  };
  const handleSyncCharacter = () => {
    return App.displayPopup(
      "Syncing is now done automatically when entering Hubchi, this option will be removed later.",
      4000
    );

    const confirm = App.displayConfirm(
      `Do you want to update your HUBCHI persona to be in sync with ${App.petDefinition.name}'s latest appearance?`,
      [
        {
          name: "yes",
          onclick: async () => {
            // confirm.close();
            // const popup = App.displayPopup('Syncing...', App.INF);
            // const {status} = await App.apiService.addPetDef();
            // popup.close();
            // App.displayPopup(status ? 'Success!' : 'Error!');
            return false;
          },
        },
        {
          name: "no",
          class: "back-btn",
          onclick: () => {},
        },
      ]
    );
    return true;
  };
  const handleReturnHome = () => {
    return App.displayConfirm(`Are you sure you want to return home?`, [
      {
        name: "yes",
        onclick: async () => {
          App.closeAllDisplays();
          otherPlayersPets.forEach((p) => p?.removeObject?.());
          onlineHubTransition((fadeOverlay) => {
            App.setScene(App.scene.home);
            fadeOverlay.direction = false;
            setTimeout(() => {
              App.pet.playCheeringAnimation(() =>
                App.toggleGameplayControls(true)
              );
            }, 500);
          });
        },
      },
      {
        name: "no",
        class: "back-btn",
        onclick: () => {},
      },
    ]);
  };
  const handleFriendSearch = () => {
    const prompt = App.displayPrompt(
      `Enter your friend's username (or UID): <small>(Case sensitive)</small>`,
      [
        {
          name: '<i class="fa-solid fa-search icon"></i> search',
          onclick: (query) => {
            if (!query.trim())
              return App.displayPopup("Please enter a valid username.");
            const searchingPopup = App.displayPopup(
              `Searching for "${query}"...`,
              App.INF
            );
            App.apiService
              .getPetDef(query)
              .then((data) => {
                App.sendAnalytics(
                  "username_search",
                  JSON.stringify({
                    status: data.status,
                    username: query,
                  })
                );

                if (!data.status)
                  return App.displayPopup(
                    `Username not found <br> <small>(Make sure you are searching for user id not pet name)</small>`
                  );

                if (data.data === hasUploadedPetDef.data) {
                  return App.displayPopup(`Something went wrong!`);
                }

                prompt.close();
                try {
                  const def = new PetDefinition(JSON.parse(data.data));
                  App.displayConfirm(
                    `Do you want to add ${def.getCSprite()} ${def.name} to your friends list?`,
                    [
                      {
                        name: "yes",
                        onclick: () => {
                          App.closeAllDisplays();
                          const addedFriend = App.petDefinition.addFriend(
                            def,
                            1
                          );
                          if (addedFriend) {
                            App.displayPopup(
                              `${def.getCSprite()} ${def.name} has been added to the friends list!`,
                              3000
                            );
                            addInteraction(def);
                          } else {
                            App.displayPopup(
                              `You are already friends with ${def.name}`,
                              3000
                            );
                          }
                          return false;
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
                  App.displayPopup("Something went wrong!");
                }
              })
              .finally(() => searchingPopup.close());
            return true;
          },
        },
        {
          name: "cancel",
          class: "back-btn",
          onclick: () => {},
        },
      ]
    );
    return prompt;
  };
  const handleRewardStore = () => {
    const showItem = (image, name, description, unlockLikesReq, unlockKey) => {
      const isUnlocked = App.getRecord(unlockKey);
      const confirm = App.displayConfirm(
        `
                        <img style="max-width: 128px" src="${image}"></img>
                        <br>
                        <b>${name}</b>
                        <br>
                        <span>${description}</span>
                    `,
        [
          {
            _disable: isUnlocked,
            // name: !isUnlocked ? 'unlock' : 'reward collected',
            name: !isUnlocked
              ? `unlock <div style="margin-left: auto"><i class="fa-solid fa-thumbs-up"></i> ${unlockLikesReq} </div>`
              : "reward collected",
            onclick: unlockKey
              ? () => {
                  if (
                    (App.temp.online?.hasUploadedPetDef?.interactions || 0) <
                    unlockLikesReq
                  ) {
                    return App.displayPopup(
                      `You don't have enough interactions to unlock ${name}.`
                    );
                  }
                  App.addRecord(unlockKey, 1, true);
                  App.displayPopup(`<b>${name}</b> unlocked!`);
                  App.sendAnalytics("unlocked_hubchi_reward_item", name);
                }
              : undefined,
          },
          {
            name: "close",
            class: "back-btn",
            onclick: () => {},
          },
        ]
      );
      return confirm;
    };

    const createEntryButton = (icon, name, item, onClick) => {
      /* let badge = ''
                if(!App.getRecord(item.unlockKey)){
                    if(App.temp.online?.hasUploadedPetDef?.interactions >= item.unlockLikes){
                        badge = App.getBadge('★');
                    }
                } else badge = App.getBadge('<i class="fa-solid fa-check"></i>', 'gray'); */
      return {
        name: `<img class="icon" src="${icon}"></img> ${name}`,
        onclick: onClick,
      };
    };

    // const accessories = Definitions.accessories.filter(e => e.onlineShopAccessible);
    const accessories = Object.keys(Definitions.accessories)
      .filter((e) => Definitions.accessories[e].onlineShopAccessible)
      .map((name) => {
        const item = Definitions.accessories[name];
        const icon = item.icon || item.image;
        return createEntryButton(icon, name, item, () =>
          showItem(icon, name, "accessory", item.unlockLikes, item.unlockKey)
        );
      });

    const backgrounds = Object.keys(Definitions.room_background)
      .filter((e) => Definitions.room_background[e].onlineShopAccessible)
      .map((name) => {
        const item = Definitions.room_background[name];
        const icon = item.image;
        return createEntryButton(icon, name, item, () =>
          showItem(icon, name, "background", item.unlockLikes, item.unlockKey)
        );
      });

    const shells = Object.keys(Definitions.shell_background)
      .filter((e) => Definitions.shell_background[e].onlineShopAccessible)
      .map((key) => {
        const item = Definitions.shell_background[key];
        const icon = item.image;
        return createEntryButton(icon, item.name, item, () =>
          showItem(
            icon,
            item.name,
            "shell design",
            item.unlockLikes,
            item.unlockKey
          )
        );
      });

    return App.displayList([...accessories, ...backgrounds, ...shells]);
  };

  App.toggleGameplayControls(false, () => {
    if (!hasUploadedPetDef.status) {
      return App.displayList([
        {
          type: "text",
          name: `
                            Upload your character to get access to hubchi!
                        `,
        },
        {
          _ignore: hasUploadedPetDef.status,
          name: "Upload character",
          onclick: handleUploadCharacter,
        },
        {
          name: '<i class="icon fa-solid fa-home"></i> return home',
          onclick: handleReturnHome,
        },
      ]);
    }

    return App.displayList([
      {
        type: "text",
        solid: true,
        name: `
                        <div style="
                            display: flex;
                            justify-content: space-between;
                            flex-wrap: wrap;
                            align-items: center;
                            width: 100%;
                        ">
                            <div style="
                                display: flex;
                                align-items: center;                        
                            ">
                                ${App.petDefinition.getCSprite()} You
                            </div>
                            <div>
                                <i class="icon fa-solid fa-thumbs-up"></i> ${hasUploadedPetDef.interactions ?? 0}
                            </div>
                        </div>
                    `,
      },
      {
        name: "interact",
        onclick: handleInteract,
      },
      {
        name: "sync character",
        onclick: handleSyncCharacter,
      },
      {
        name: `rewards store`,
        onclick: handleRewardStore,
      },
      {
        name: `add friend`,
        onclick: handleFriendSearch,
      },
      {
        name: '<i class="icon fa-solid fa-home"></i> return home',
        onclick: handleReturnHome,
      },
    ]);
  });
}
