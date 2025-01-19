import { app, BrowserWindow, Menu, ipcMain } from "electron";
import * as path from "path";
import { fileURLToPath } from "url";
import store from "electron-store";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let mainWindow;
const appStore = new store();
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 846,
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

ipcMain.on("print-html", async (event, { htmlContent, printerName }) => {
  const result = await printHTMLContent(htmlContent, printerName, true);
  event.sender.send("print-status", result);
});

async function printHTMLContent(htmlContent, printerName, landscape) {
  return new Promise((resolve, reject) => {
    const printWindow = new BrowserWindow({ show: false });

    printWindow.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`
    );

    printWindow.webContents.on("did-finish-load", () => {
      printWindow.webContents.print(
        {
          silent: true,
          printBackground: true,
          deviceName: printerName,
          landscape,
          margins: { marginType: "none" },
        },
        (success, errorType) => {
          printWindow.close();
          if (success) {
            resolve({ success: true, message: "Print successful" });
          } else {
            reject({ success: false, message: `Print failed: ${errorType}` });
          }
        }
      );
    });

    printWindow.webContents.on(
      "did-fail-load",
      (event, errorCode, errorDescription) => {
        printWindow.close();
        reject({
          success: false,
          message: `Failed to load content: ${errorDescription}`,
        });
      }
    );

    printWindow.on("closed", () => {
      resolve({
        success: false,
        message: "Print window was closed prematurely",
      });
    });
  });
}
