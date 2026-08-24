import { app, BrowserWindow, Menu, dialog, ipcMain, shell } from "electron";
import crypto from "node:crypto";
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

function archiveDirectory() {
  const directory = path.join(app.getPath("userData"), "contract-archive");
  fs.mkdirSync(directory, { recursive: true });
  return directory;
}

const ARCHIVE_MAX_BYTES = 50 * 1024 * 1024;
const ARCHIVE_MANIFEST_FILE = "manifest.json";

function archiveManifestPath() { return path.join(archiveDirectory(), ARCHIVE_MANIFEST_FILE); }
function readArchiveManifest() {
  try {
    const manifest = JSON.parse(fs.readFileSync(archiveManifestPath(), "utf8"));
    return manifest && typeof manifest === "object" ? manifest : {};
  } catch { return {}; }
}
function writeArchiveManifest(manifest) { fs.writeFileSync(archiveManifestPath(), JSON.stringify(manifest, null, 2), "utf8"); }

function archivePath(archiveKey) {
  if (!/^[a-zA-Z0-9-]+$/.test(archiveKey)) throw new Error("Geçersiz arşiv dosya anahtarı");
  return path.join(archiveDirectory(), `${archiveKey}.pdf`);
}

function sha256File(filePath) {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex");
}

function isPdfFile(filePath) {
  const header = Buffer.alloc(5);
  const descriptor = fs.openSync(filePath, "r");
  try { fs.readSync(descriptor, header, 0, 5, 0); } finally { fs.closeSync(descriptor); }
  return header.toString("ascii") === "%PDF-";
}

function validArchiveKey(value) { return typeof value === "string" && /^[a-zA-Z0-9-]+$/.test(value); }
function validRecordId(value) { return typeof value === "string" && /^[a-zA-Z0-9-]+$/.test(value); }
function normalizeArchiveAccess(value) {
  if (!value || typeof value !== "object") throw new Error("Geçersiz arşiv erişim isteği");
  const userId = String(value.userId ?? "").trim();
  const role = value.role === "officeAssistant" ? "officeAssistant" : "consultant";
  return { userId, role, managerSessionActive: value.managerSessionActive === true };
}

ipcMain.handle("contract-archive:select", async () => {
  const result = await dialog.showOpenDialog({
    title: "Eski sözleşme PDF belgelerini seçin",
    properties: ["openFile", "multiSelections"],
    filters: [{ name: "PDF belgeleri", extensions: ["pdf"] }],
  });
  if (result.canceled) return [];
  return result.filePaths.map((sourcePath) => {
    const sourceStat = fs.statSync(sourcePath);
    if (!sourcePath.toLowerCase().endsWith(".pdf") || sourceStat.size <= 0 || sourceStat.size > ARCHIVE_MAX_BYTES || !isPdfFile(sourcePath)) throw new Error("Yalnız 50 MB altındaki geçerli PDF belgeleri arşivlenebilir.");
    const archiveKey = crypto.randomUUID();
    const destination = archivePath(archiveKey);
    fs.copyFileSync(sourcePath, destination, fs.constants.COPYFILE_EXCL);
    const stat = fs.statSync(destination);
    const sha256 = sha256File(destination);
    writeStartupLog(`Arşiv PDF içe aktarıldı; key=${archiveKey}; bytes=${stat.size}`);
    return { archiveKey, originalName: path.basename(sourcePath), byteSize: stat.size, sha256 };
  });
});

ipcMain.handle("contract-archive:register", async (_event, request) => {
  const recordId = String(request?.recordId ?? ""); const archiveKey = String(request?.archiveKey ?? ""); const ownerUserId = String(request?.ownerUserId ?? "").trim(); const sha256 = String(request?.sha256 ?? "");
  if (!validRecordId(recordId) || !validArchiveKey(archiveKey) || !ownerUserId || !/^[a-f0-9]{64}$/i.test(sha256)) throw new Error("Arşiv manifesti için geçersiz kayıt bilgisi.");
  const filePath = archivePath(archiveKey);
  if (!fs.existsSync(filePath) || sha256File(filePath) !== sha256) throw new Error("Arşiv PDF bütünlük doğrulaması başarısız.");
  const manifest = readArchiveManifest();
  manifest[recordId] = { archiveKey, ownerUserId, sha256, registeredAt: new Date().toISOString() };
  writeArchiveManifest(manifest);
  return { ok: true };
});

ipcMain.handle("contract-archive:open", async (_event, request) => {
  const recordId = String(request?.recordId ?? "");
  if (!validRecordId(recordId)) return { ok: false, message: "Geçersiz arşiv kaydı." };
  const access = normalizeArchiveAccess(request?.access);
  const manifest = readArchiveManifest(); const entry = manifest[recordId];
  if (!entry || !validArchiveKey(entry.archiveKey)) return { ok: false, message: "Arşiv manifesti veya dosya eşleşmesi bu cihazda bulunamadı." };
  if (!access.managerSessionActive && access.role !== "officeAssistant" && entry.ownerUserId !== access.userId) return { ok: false, message: "Bu arşiv belgesini açma yetkiniz yok." };
  const filePath = archivePath(entry.archiveKey);
  if (!fs.existsSync(filePath)) return { ok: false, message: "Arşiv PDF dosyası bu cihazda bulunamadı." };
  if (sha256File(filePath) !== entry.sha256) return { ok: false, message: "PDF bütünlük doğrulaması başarısız; dosya açılmadı." };
  const openError = await shell.openPath(filePath);
  if (openError) return { ok: false, message: openError };
  writeStartupLog(`Arşiv PDF açıldı; record=${recordId}`);
  return { ok: true };
});

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 700,
    title: `Global 1881 Gayrimenkul — Offline Ofis Yönetimi v${app.getVersion()}`,
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
  window.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith("file:")) {
      event.preventDefault();
      writeStartupLog(`Uzak navigasyon engellendi; url=${url}; fallback=file-offline`);
      void window.loadFile(indexPath, { hash: "/offline" });
    }
  });
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith("file:")) {
      writeStartupLog(`Uzak yeni pencere engellendi; url=${url}`);
      return { action: "deny" };
    }
    return { action: "allow" };
  });
  writeStartupLog(`Electron başlatıldı; packaged=${app.isPackaged}; appVersion=${app.getVersion()}; indexPath=${indexPath}; exists=${fs.existsSync(indexPath)}; initialRoute=#/offline`);
  window.webContents.on("did-finish-load", () => {
    writeStartupLog(`Arayüz yüklendi; url=${window.webContents.getURL()}`);
  });
  window.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    writeStartupLog(`Arayüz yükleme hatası; code=${errorCode}; description=${errorDescription}; url=${validatedURL}`);
    const diagnostic = `<h2>Global 1881 arayüzü yüklenemedi</h2><p>Kurulum paketi eksik veya bozuk olabilir.</p><p>Hata: ${errorDescription} (${errorCode})</p><p>Startup log: ${path.join(app.getPath("userData"), "startup.log")}</p>`;
    void window.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(diagnostic)}`);
  });
  void window.loadFile(indexPath, { hash: "/offline" });
}

app.whenReady().then(() => {
  writeStartupLog(`Uygulama hazır; version=${app.getVersion()}; userData=${app.getPath("userData")}`);
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
