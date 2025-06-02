// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    readTextFile: (filePath) => ipcRenderer.invoke('read-text-file', filePath),
    writeTextFile: (filePath, content) => ipcRenderer.invoke('write-text-file', filePath, content)
});