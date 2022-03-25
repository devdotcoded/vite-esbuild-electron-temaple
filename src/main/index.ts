import "reflect-metadata";
import { join } from "path";
import { app, BrowserWindow } from "electron";
import { bootstrap, destroy } from "./bootstrap";

const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === "development";

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";

async function createWindow() {
  try {
    const win = new BrowserWindow({
      width: 600,
      height: 504,
      webPreferences: {
        preload: join(__dirname, "preload.js"),
        // nodeIntegration: true,
        // webSecurity: false,
        // contextIsolation: false,
        devTools: isDev,
      },
      autoHideMenuBar: !isDev,
    });

    // win.maximize();

    await bootstrap(win.webContents);
    const URL = isDev
      ? process.env.DEV_SERVER_URL
      : `file://${join(app.getAppPath(), "/render/index.html")}`;

    win.loadURL(URL);

    if (isDev) {
      win.webContents.openDevTools();
    } else {
      win.removeMenu();
    }

    win.on("closed", () => {
      destroy();
      win.destroy();
    });
  } catch (error) {
    console.log(error);
    app.quit();
  }
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("ready", async () => {
  createWindow();
});

if (isDev) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
