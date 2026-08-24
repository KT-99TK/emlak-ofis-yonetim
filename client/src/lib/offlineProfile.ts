const GREETING_KEY = "global1881.offline.profile-greeting.v1";
export const OFFLINE_PROFILE_CHANGED_EVENT = "global1881-offline-profile-changed";

export function getOfflineProfileGreeting() {
  if (typeof window === "undefined") return "";
  return (window.localStorage.getItem(GREETING_KEY) ?? "").trim().slice(0, 72);
}

export function setOfflineProfileGreeting(value: string) {
  if (typeof window === "undefined") return;
  const normalized = value.trim().replace(/\s+/g, " ").slice(0, 72);
  if (normalized) window.localStorage.setItem(GREETING_KEY, normalized);
  else window.localStorage.removeItem(GREETING_KEY);
  window.dispatchEvent(new Event(OFFLINE_PROFILE_CHANGED_EVENT));
}
