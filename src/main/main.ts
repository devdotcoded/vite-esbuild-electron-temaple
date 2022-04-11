import { bootstrap, destroy } from "@main/bootstrap";
import { app, BrowserWindow } from "electron";
import { join } from "path";

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";

export async function createWindow(
  showDefTools: boolean,
  autoHideMenuBar: boolean
): Promise<BrowserWindow> {
  try {
    const win = new BrowserWindow({
      width: 600,
      height: 504,
      webPreferences: {
        preload: join(__dirname, "preload.js"),
        devTools: showDefTools,
      },
      autoHideMenuBar,
    });

    win.on("closed", () => {
      destroy();
      win.destroy();
    });

    await bootstrap(win.webContents);

    return win;
  } catch (error) {
    console.log(error);
    app.quit();
  }
}

app.on("window-all-closed", () => {
  destroy();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

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
