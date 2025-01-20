import { App } from "@tamaweb/App";

export function isTester() {
  const testers = ["Saman", "samandev"];
  return testers.includes(App.userName) || App.ENV == "dev";
}
