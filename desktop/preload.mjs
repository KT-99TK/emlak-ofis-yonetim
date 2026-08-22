import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("global1881Desktop", {
  platform: process.platform,
  version: "offline-transition-v1",
});
