import Actions from "@main/src/Actions";
import { ActionHandler } from "@main/src/infraestructure/AbstractActionHandler";
import { ipcMain, WebContents } from "electron";

let initializedActionHandlers: {
  [key: string]: ActionHandler<any, any>;
} = {};

export async function bootstrap(webContents: WebContents) {
  Actions.forEach((actionHandler) => {
    const actionHandlerName = actionHandler.name;

    if (initializedActionHandlers[actionHandlerName]) {
      return;
    }
    initializedActionHandlers[actionHandlerName] = new actionHandler(
      webContents
    );

    ipcMain.handle(
      initializedActionHandlers[actionHandlerName].getAction().name,
      async (_, data: any): Promise<any> => {
        try {
          return {
            data: await initializedActionHandlers[actionHandlerName].handle(
              data
            ),
          };
        } catch (error) {
          return {
            error,
          };
        }
      }
    );
  });
}

export async function destroy() {
  Object.keys(initializedActionHandlers).forEach((actionHandlerName) => {
    ipcMain.removeHandler(
      initializedActionHandlers[actionHandlerName].getAction().name
    );
  });
  initializedActionHandlers = {};
}
