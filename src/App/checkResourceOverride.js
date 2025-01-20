import { App } from "@tamaweb/App";

export function checkResourceOverride(res) {
  if (!res) return res;
  return App.resourceOverrides[res.replace(location.href, "")] || res;
}
