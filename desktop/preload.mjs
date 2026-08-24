import { contextBridge } from "electron";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authoritySealSrc = pathToFileURL(path.join(__dirname, "brand", "global1881-muhur-seffaf.png")).href;

contextBridge.exposeInMainWorld("global1881Desktop", {
  platform: process.platform,
  version: "offline-transition-v1",
  authoritySealSrc,
});
