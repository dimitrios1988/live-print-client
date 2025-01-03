const { contextBridge, ipcRenderer } = require("electron");

// Example: Securely expose certain features to the renderer process
contextBridge.exposeInMainWorld("electronAPI", {
  send: (channel, data) => {
    // Validate channels here
  },
  receive: (channel, func) => {
    // Validate channels here
  },
  getPrinters: () => ipcRenderer.invoke("get-printers"),
  getSettings: () => ipcRenderer.invoke("get-settings"),
  saveSettings: (settings) => ipcRenderer.invoke("save-settings", settings),
  printHTML: (htmlContent, printerName, landscape) => {
    ipcRenderer.send("print-html", { htmlContent, printerName, landscape });
  },
  onPrintStatus: (callback) => {
    ipcRenderer.on("print-status", (_event, result) => callback(result));
  },
});
