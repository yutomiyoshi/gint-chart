// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  readConfig: (filePath) => ipcRenderer.invoke("read-config", filePath),
  readViewConfig: () => ipcRenderer.invoke("read-view-config"),
  shell: {
    openExternal: (url) => ipcRenderer.invoke("open-external", url),
  },
});
