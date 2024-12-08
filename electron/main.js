import { app, BrowserWindow, Menu, ipcMain } from "electron";
import * as path from "path";
import { fileURLToPath } from "url";
import store from "electron-store";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let mainWindow;
const appStore = new store();
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  Menu.setApplicationMenu(null);
  mainWindow.loadURL(`http://localhost:4200`); // Load Angular's development server
  mainWindow.on("closed", () => (mainWindow = null));
  mainWindow.webContents.openDevTools();
}

app.on("ready", createMainWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (!mainWindow) {
    createMainWindow();
  }
});

ipcMain.handle("get-printers", async (event) => {
  const printers = mainWindow.webContents.getPrintersAsync();
  return printers;
});

ipcMain.handle("get-settings", async () => {
  return appStore.get("settings") || null;
});

ipcMain.handle("save-settings", async (event, settings) => {
  return appStore.set("settings", settings);
});
