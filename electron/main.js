import { app, BrowserWindow, Menu, ipcMain } from "electron";
import * as path from "path";
import { fileURLToPath } from "url";
import store from "electron-store";
import { createCanvas } from "canvas";
import { writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { exec } from "child_process";

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
  if (process.env.NODE_ENV === "development") {
    // Load Angular dev server (only for `npm run electron:serve`)
    mainWindow.loadURL(`http://localhost:4200`);
    mainWindow.webContents.openDevTools();
  } else {
    // Load the built Angular app (for packaged app)
    mainWindow.loadFile(
      path.join(__dirname, "../dist/live-print-client/browser/index.html")
    );
  }
  mainWindow.on("closed", () => (mainWindow = null));
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

ipcMain.on(
  "print-html",
  async (event, { htmlContent, printerName, duplex }) => {
    const result = await printHTMLContent(
      htmlContent,
      printerName,
      true,
      duplex
    );
    event.sender.send("print-status", result);
  }
);

ipcMain.on("print-binary", async (event, { content, printerName }) => {
  const result = await printBinaryContent(content, printerName);
  event.sender.send("print-status", result);
});

async function printHTMLContent(htmlContent, printerName, landscape, duplex) {
  return new Promise((resolve, reject) => {
    const printWindow = new BrowserWindow({ show: false });

    printWindow.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`
    );

    printWindow.webContents.on("did-finish-load", () => {
      if (duplex == false) {
        printWindow.webContents.print(
          {
            silent: true,
            printBackground: true,
            deviceName: printerName,
            landscape,
            pageSize: "A4",
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
      } else {
        printWindow.webContents.print(
          {
            silent: true,
            printBackground: true,
            deviceName: printerName,
            duplexMode: "shortEdge",
            duplex: true,
            landscape,
            pageSize: "A4",
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
      }
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

async function printBinaryContent(number, printerName) {
  return new Promise((resolve, reject) => {
    try {
      const tempFilePath = join(tmpdir(), "label.png");
      writeFileSync(tempFilePath, createNumberRaster(number));

      // Use Windows' built-in print command
      const isWindows = process.platform === "win32";
      let printCommand;
      if (isWindows) {
        printCommand = `mspaint /pt "${tempFilePath}" "${printerName}"`;
      } else {
        printCommand = `lp -d "${printerName}" "${tempFilePath}"`;
      }

      exec(printCommand, (error, stdout, stderr) => {
        if (error) {
          reject({ success: false, message: `Print failed: ${error.message}` });
          return;
        }
        if (stderr) {
          reject({ success: false, message: `Print failed: ${stderr}` });
          return;
        }
        console.log(`Printed number: ${number}`);
        resolve({ success: true, message: "Print successful" });
      });
    } catch (err) {
      reject({ success: false, message: `Print failed: ${err}` });
    }
  });
}

function createNumberRaster(number) {
  const DPI = 300;
  const LABEL_HEIGHT = Math.round((62 / 25.4) * DPI); // mm → pixels
  const LABEL_WIDTH = Math.round((100 / 25.4) * DPI); // mm → pixels
  const PADDING = Math.round((0 / 2.54) * DPI); // 0 cm padding
  const canvas = createCanvas(LABEL_WIDTH, LABEL_HEIGHT);
  const ctx = canvas.getContext("2d");

  // Background (white)
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, LABEL_WIDTH, LABEL_HEIGHT);

  // Text (black)
  ctx.fillStyle = "black";

  // Auto-scale font size to fit
  let fontSize = LABEL_WIDTH - 2 * PADDING;
  do {
    fontSize -= 5;
    ctx.font = `bold ${fontSize}px Arial`;
  } while (ctx.measureText(number).width > LABEL_WIDTH * 1.0);
  // Center text
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(number, LABEL_WIDTH / 2, LABEL_HEIGHT / 2);

  return canvas.toBuffer("image/png");
}
