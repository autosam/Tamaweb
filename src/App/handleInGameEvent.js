import { App } from "@tamaweb/App";

export function handleInGameEvents() {
  if (!App.awayTime || App.awayTime == -1) {
    App.handlers.show_onboarding();
    return;
  }

  const addEvent = App.addEvent;

  if (!App.userName) {
    App.handlers.show_set_username_dialog();
    return;
  }

  if (
    addEvent(`update_11_notice`, () => {
      App.displayList([
        {
          name: "New update is available!",
          type: "text",
          solid: true,
          bold: true,
        },
        {
          name: `Check out the new offline/online dating feature, mail deliveries, new backgrounds, tons of rebalancing and bugfixes and much more!`,
          type: "text",
        },
        {
          link: App.routes.BLOG,
          name: "see whats new",
          class: "solid primary",
          onclick: () => {
            App.sendAnalytics("go_to_blog_whats_new");
          },
        },
      ]);
    })
  )
    return;

  if (
    addEvent("itch_rating_dialog", () => {
      App.handlers.show_rating_dialog();
      App.sendAnalytics("rating_auto_shown");
    })
  )
    return;

  // if(addEvent(`smallchange_01_notice`, () => {
  //     App.displayConfirm('The <b>Stay with parents</b> option is now moved to the <i class="fa-solid fa-house-chimney-user"></i> care menu', [
  //         {
  //             name: 'ok',
  //             class: 'solid primary',
  //             onclick: () => {}
  //         },
  //     ])
  // })) return;

  /* if(addEvent(`game_suggestions_poll_01`, () => {
            App.displayPrompt(`<b><small>Poll</small></b>what would you like to to be added in the next update?`, [
                {
                    name: 'send',
                    onclick: (data) => {
                        if(!data) return true;
                        App.displayPopup(`<b>Suggestion sent! thanks!</b><br> here's $200 for participating!`, 4000, () => {
                            App.pet.x = '50%';
                            App.pet.playCheeringAnimation();
                        });
                        App.pet.stats.gold += 200;
                        App.sendAnalytics('game_suggestions_poll_01', data);
                    },
                },
                {
                    name: 'cancel',
                    onclick: () => {
                        App.sendAnalytics('game_suggestions_poll_01', 'action_user_cancel');
                    },
                }
            ]);
        })) return;

        if(addEvent(`discord_server_01_notice`, () => {
            App.displayConfirm(`<b>We have a Discord server now!</b>Join to see the growth chart and decide which features get in the game first!`, [
                {
                    name: 'next',
                    onclick: () => {
                        App.displayConfirm(`Do you want to join and get updated on all the latest changes and exclusive items?`, [
                            {
                                link: 'https://discord.gg/FdwmmWRaTd',
                                name: 'yes',
                                onclick: () => {
                                    return false;
                                },
                            }, 
                            {
                                name: 'no',
                                onclick: () => {
                                    App.displayPopup('You can join the server through <b>Settings > Join Discord</b> if you ever change your mind', 5000)
                                }
                            }
                        ]);
                    },
                }
            ]);
        })) return; */

  /* if(App.isSalesDay()){
            if(addEvent(`sales_day_${dayId}_notice`, () => {
                App.displayConfirm(`<b>discount day!</b><br>Shops are selling their products at a discounted rate! Check them out and pile up on them!`, [
                    {
                        name: 'ok',
                        class: 'solid primary',
                        onclick: () => {},
                    }
                ]);
            })) return;
        } */
}
