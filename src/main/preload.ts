import { contextBridge, ipcRenderer } from "electron";

export const exposedApi = {
  invoke: ipcRenderer.invoke,
  on: (event, callback: (...args: any[]) => void) =>
    ipcRenderer.on(event, callback),
  removeAllListeners: ipcRenderer.removeAllListeners,
};

contextBridge.exposeInMainWorld("electron", exposedApi);
