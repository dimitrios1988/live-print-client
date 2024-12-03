const { contextBridge } = require("electron");

// Example: Securely expose certain features to the renderer process
contextBridge.exposeInMainWorld("api", {
  send: (channel, data) => {
    // Validate channels here
  },
  receive: (channel, func) => {
    // Validate channels here
  },
});
