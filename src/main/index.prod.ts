import { createWindow } from "@main/main";
import { app, BrowserWindow } from "electron";
import { join } from "path";

async function create() {
  const win = await createWindow(false, false);
  win.loadURL(`file://${join(app.getAppPath(), "/render/index.html")}`);
  win.removeMenu();
}

app.on("ready", create);

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) create();
});
