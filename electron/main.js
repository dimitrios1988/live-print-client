import { app, BrowserWindow, Menu, ipcMain, nativeImage } from "electron";
import * as path from "path";
import { fileURLToPath } from "url";
import store from "electron-store";
import { rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import {  execFile } from "child_process";
import { randomUUID } from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let mainWindow;
let secondWindow;
let secondWindowReady = false;
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
      path.join(__dirname, "../dist/live-print-client/browser/index.html"),
    );
  }
  // No application menu (see Menu.setApplicationMenu(null) above), so F11 has no
  // default accelerator — wire it up manually.
  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (
      input.type === "keyDown" &&
      input.key === "F11" &&
      !input.isAutoRepeat
    ) {
      event.preventDefault();
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
    secondWindow?.close();
  });
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
      duplex,
    );
    event.sender.send("print-status", result);
  },
);

ipcMain.on("print-label", async (event, { content, printerName }) => {
  const result = await printLabel(content, printerName);
  event.sender.send("print-status", result);
});

async function printHTMLContent(htmlContent, printerName, landscape, duplex) {
  return new Promise((resolve, reject) => {
    const printWindow = new BrowserWindow({ show: false });

    printWindow.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`,
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
          },
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
          },
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
      },
    );

    printWindow.on("closed", () => {
      resolve({
        success: false,
        message: "Print window was closed prematurely",
      });
    });
  });
}

async function printLabel(htmlContent, printerName) {
  let outputPath;
  try {
    outputPath = await htmlToPng(htmlContent, `bib-${randomUUID()}.png`);
    await printLabelImage(outputPath, printerName);
    return { success: true, message: "Print successful" };
  } catch (err) {
    throw { success: false, message: `Print failed: ${err.message ?? err}` };
  } finally {
    if (outputPath) {
      rmSync(outputPath, { force: true });
    }
  }
}

// Prints an image as large as it fits on the printer's current paper without
// stretching it: no margins, turned to match the image's shape and centred in
// the printable area. A 1110 x 696 image fills the QL-800 sticker 1:1.
const PRINT_LABEL_PS = `
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($env:LABEL_IMAGE)
$doc = New-Object System.Drawing.Printing.PrintDocument
try {
  $doc.PrinterSettings.PrinterName = $env:LABEL_PRINTER
  $doc.DocumentName = 'Bib label'
  # Skip the 'Printing page 1' progress dialog.
  $doc.PrintController = New-Object System.Drawing.Printing.StandardPrintController
  $page = $doc.DefaultPageSettings
  $page.Margins = New-Object System.Drawing.Printing.Margins(0, 0, 0, 0)
  # Landscape when the image is wide and the paper tall, or the other way round.
  $page.Landscape = ($img.Width -gt $img.Height) -ne ($page.PaperSize.Width -gt $page.PaperSize.Height)
  $doc.add_PrintPage({
    param($s, $e)
    $g = $e.Graphics
    $g.InterpolationMode = 'NearestNeighbor'
    $g.PixelOffsetMode = 'Half'
    # The printable area, in hundredths of an inch from its own corner.
    $area = $g.VisibleClipBounds
    $f = [Math]::Min($area.Width / $img.Width, $area.Height / $img.Height)
    $w = $img.Width * $f
    $h = $img.Height * $f
    $g.DrawImage($img, [System.Drawing.RectangleF]::new(($area.Width - $w) / 2, ($area.Height - $h) / 2, $w, $h))
  })
  $doc.Print()
} finally {
  $doc.Dispose()
  $img.Dispose()
}
`;

function printLabelImage(imagePath, printerName) {
  return new Promise((resolve, reject) => {
    const done = (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr.trim().split(/\r?\n/)[0] || error.message));
      } else {
        resolve();
      }
    };

    if (process.platform === "win32") {
      execFile(
        "powershell.exe",
        ["-NoProfile", "-NonInteractive", "-Command", PRINT_LABEL_PS],
        {
          windowsHide: true,
          // Passed as environment variables so no value needs escaping.
          env: {
            ...process.env,
            LABEL_IMAGE: imagePath,
            LABEL_PRINTER: printerName,
          },
        },
        done,
      );
    } else {
      execFile("lp", ["-d", printerName, imagePath], done);
    }
  });
}

async function htmlToPng(html, outputFileName = "output.png") {
  const OUTPUT_DIR = tmpdir();
  // Printable area of the 62 x 100mm sticker (landscape) at the QL-800's
  // 300 dpi. The printer always keeps ~3mm blank at each cut end and ~1.5mm
  // along each edge of the tape, so this is as much as it can print.
  const DPI = 300;
  const WIDTH = 1110;
  const HEIGHT = 696;
  let win;
  try {
    win = new BrowserWindow({
      show: false,
      frame: false,
      useContentSize: true,
      width: WIDTH,
      // Resized after measuring. Kept short so the viewport can't inflate the
      // measured document height.
      height: 1,
      backgroundColor: "#ffffff",
      webPreferences: {
        contextIsolation: true,
        sandbox: true,
      },
    });

    await win.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(html)}`,
    );

    // Wait for fonts, images and layout to finish rendering.
    await win.webContents.executeJavaScript(`
            (async () => {
                await document.fonts.ready;

                await Promise.all(
                    Array.from(document.images, img =>
                        img.decode().catch(() => {})
                    )
                );

                await new Promise(resolve =>
                    requestAnimationFrame(() =>
                        requestAnimationFrame(resolve)
                    )
                );
            })();
        `);

    // Measure the rendered document before applying the scaling.
    const dimensions = await win.webContents.executeJavaScript(`
            (() => {
                const html = document.documentElement;
                const body = document.body;

                body.style.setProperty('margin', '0', 'important');

                return {
                    width: Math.max(
                        html.scrollWidth,
                        body.scrollWidth,
                        body.offsetWidth
                    ),
                    height: Math.max(
                        html.scrollHeight,
                        body.scrollHeight,
                        body.offsetHeight
                    ),
                    dpr: window.devicePixelRatio
                };
            })();
        `);

    if (dimensions.width <= 0 || dimensions.height <= 0) {
      throw new Error("HTML content has invalid dimensions.");
    }

    // Scale uniformly to fit the sticker: a design with the sticker's aspect
    // ratio fills it exactly, any other is never stretched. CSS pixels are
    // devicePixelRatio device pixels, so divide by it to land on exact pixels.
    const fit = Math.min(WIDTH / dimensions.width, HEIGHT / dimensions.height);
    const width = Math.round(dimensions.width * fit);
    const height = Math.round(dimensions.height * fit);
    const scale = fit / dimensions.dpr;
    const captureWidth = Math.ceil(width / dimensions.dpr);
    const captureHeight = Math.ceil(height / dimensions.dpr);

    win.setContentSize(WIDTH, captureHeight);

    await win.webContents.executeJavaScript(`
            (() => {
                const html = document.documentElement;
                const body = document.body;

                html.style.setProperty('overflow', 'hidden', 'important');
                body.style.setProperty('overflow', 'hidden', 'important');
                body.style.setProperty(
                    'transform-origin',
                    'top left',
                    'important'
                );
                body.style.setProperty(
                    'transform',
                    'scale(${scale})',
                    'important'
                );
            })();
        `);

    // Allow Chromium to paint the scaled content.
    await new Promise((resolve) => setTimeout(resolve, 50));

    const capture = await win.webContents.capturePage({
      x: 0,
      y: 0,
      width: captureWidth,
      height: captureHeight,
    });

    // The capture is in device pixels; re-decode it at 1x so the sizes below
    // are real pixels, then trim the rounding overshoot to the exact size.
    let image = nativeImage.createFromBuffer(capture.toPNG());
    const actualSize = image.getSize();

    if (actualSize.width !== width || actualSize.height !== height) {
      image =
        actualSize.width >= width && actualSize.height >= height
          ? image.crop({ x: 0, y: 0, width, height })
          : image.resize({ width, height, quality: "best" });
    }

    // Add 300 DPI metadata to the PNG without an external dependency.
    const pngBuffer = addPngDpiMetadata(image.toPNG(), DPI);

    // Restrict the filename to prevent writing outside the output folder.
    const safeFileName = path.basename(outputFileName);
    const outputPath = path.join(OUTPUT_DIR, safeFileName);
    writeFileSync(outputPath, pngBuffer);

    return outputPath;
  } finally {
    if (win && !win.isDestroyed()) {
      win.destroy();
    }
  }
}

function addPngDpiMetadata(png, dpi) {
  const signature = png.subarray(0, 8);

  if (signature.toString("hex") !== "89504e470d0a1a0a") {
    throw new Error("Invalid PNG image.");
  }

  const pixelsPerMeter = Math.round(dpi / 0.0254);

  const type = Buffer.from("pHYs");
  const data = Buffer.alloc(9);

  data.writeUInt32BE(pixelsPerMeter, 0);
  data.writeUInt32BE(pixelsPerMeter, 4);
  data.writeUInt8(1, 8); // Unit: meter.

  const chunk = Buffer.alloc(4 + 4 + data.length + 4);

  chunk.writeUInt32BE(data.length, 0);
  type.copy(chunk, 4);
  data.copy(chunk, 8);

  const crcInput = Buffer.concat([type, data]);
  chunk.writeUInt32BE(crc32(crcInput), 8 + data.length);

  const parts = [signature];
  let offset = 8;
  let inserted = false;

  while (offset < png.length) {
    const length = png.readUInt32BE(offset);
    const end = offset + length + 12;
    const chunkType = png.toString("ascii", offset + 4, offset + 8);

    if (end > png.length) {
      throw new Error("PNG contains an invalid chunk.");
    }

    // Replace any existing DPI metadata.
    if (chunkType !== "pHYs") {
      parts.push(png.subarray(offset, end));
    }

    if (chunkType === "IHDR") {
      parts.push(chunk);
      inserted = true;
    }

    offset = end;
  }

  if (!inserted) {
    throw new Error("PNG is missing its IHDR chunk.");
  }

  return Buffer.concat(parts);
}

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc ^= byte;

    for (let i = 0; i < 8; i++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

ipcMain.on("send-to-second-window", (_, data) => {
  if (secondWindow && secondWindowReady) {
    secondWindow.webContents.send("receive-data", data);
  }
});

ipcMain.handle("open-second-window", () => {
  createSecondWindow();
});

function createSecondWindow() {
  if (secondWindow) {
    secondWindow.focus();
    return;
  }

  secondWindowReady = false;

  secondWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.NODE_ENV === "development") {
    // Load Angular dev server (only for `npm run electron:serve`)
    secondWindow.loadURL("http://localhost:4200/#/secondary");
    secondWindow.webContents.openDevTools();
  } else {
    // Load the built Angular app (for packaged app)
    secondWindow.loadFile(
      path.join(__dirname, "../dist/live-print-client/browser/index.html"),
      { hash: "/secondary" },
    );
  }

  // No application menu (see Menu.setApplicationMenu(null) above), so F11 has no
  // default accelerator — wire it up manually for the customer-facing display.
  secondWindow.webContents.on("before-input-event", (event, input) => {
    if (
      input.type === "keyDown" &&
      input.key === "F11" &&
      !input.isAutoRepeat
    ) {
      event.preventDefault();
      secondWindow.setFullScreen(!secondWindow.isFullScreen());
    }
  });

  secondWindow.webContents.on("did-finish-load", () => {
    secondWindowReady = true;
  });

  secondWindow.on("closed", () => {
    secondWindow = null;
    secondWindowReady = false;
    if (mainWindow) {
      mainWindow.webContents.send("secondary-window-closed");
    }
  });
}

ipcMain.handle("close-second-window", () => {
  if (secondWindow) {
    closeSecondWindow();
  }
});

function closeSecondWindow() {
  if (secondWindow) {
    secondWindow.close();
    secondWindow = null;
    secondWindowReady = false;
    if (mainWindow) {
      mainWindow.webContents.send("secondary-window-closed");
    }
  }
}
