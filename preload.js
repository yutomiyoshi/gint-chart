// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  readConfig: (filePath) => ipcRenderer.invoke("read-config", filePath),
});
