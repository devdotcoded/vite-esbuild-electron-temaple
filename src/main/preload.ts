import { contextBridge, ipcRenderer } from "electron";

export const exposedApi = {
  invoke: ipcRenderer.invoke,
  on: (event, callback: (arg: any) => void) =>
    ipcRenderer.on(event, (_, args) => callback(args)),
  removeAllListeners: ipcRenderer.removeAllListeners,
};

contextBridge.exposeInMainWorld("electron", exposedApi);
