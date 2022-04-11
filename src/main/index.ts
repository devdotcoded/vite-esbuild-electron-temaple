import { createWindow } from "@main/main";
import { app, BrowserWindow } from "electron";

async function create() {
  const win = await createWindow(true, false);
  win.loadURL(process.env.DEV_SERVER_URL);
  win.webContents.openDevTools();
}

app.on("ready", create);

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) create();
});
