import { app, BrowserWindow, Menu } from "electron";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.setName("Global 1881 Gayrimenkul");

function writeStartupLog(message) {
  try {
    const logPath = path.join(app.getPath("userData"), "startup.log");
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${message}\n`, "utf8");
  } catch {
    // A diagnostics log must never prevent the application from opening.
  }
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 700,
    title: "Global 1881 Gayrimenkul — Offline Ofis Yönetimi",
    backgroundColor: "#f7f7f4",
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  Menu.setApplicationMenu(null);
  const indexPath = path.join(__dirname, "..", "dist", "public", "index.html");
  writeStartupLog(`Electron başlatıldı; packaged=${app.isPackaged}; indexPath=${indexPath}; exists=${fs.existsSync(indexPath)}`);
  window.webContents.on("did-finish-load", () => {
    writeStartupLog(`Arayüz yüklendi; url=${window.webContents.getURL()}`);
  });
  window.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    writeStartupLog(`Arayüz yükleme hatası; code=${errorCode}; description=${errorDescription}; url=${validatedURL}`);
    const diagnostic = `<h2>Global 1881 arayüzü yüklenemedi</h2><p>Kurulum paketi eksik veya bozuk olabilir.</p><p>Hata: ${errorDescription} (${errorCode})</p><p>Startup log: ${path.join(app.getPath("userData"), "startup.log")}</p>`;
    void window.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(diagnostic)}`);
  });
  window.loadFile(indexPath);
}

app.whenReady().then(() => {
  writeStartupLog(`Uygulama hazır; version=${app.getVersion()}; userData=${app.getPath("userData")}`);
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
