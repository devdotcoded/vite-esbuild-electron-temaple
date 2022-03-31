import { EVENTS } from "@common/events";
import { IpcResponse } from "@common/types";

export function useAction<T = any>(actionName: EVENTS) {
  return async (args) => {
    const response: IpcResponse<T> = await window.electron.invoke(
      actionName.toString(),
      args
    );
    if (response.hasOwnProperty("error")) {
      throw response;
    }

    return response;
  };
}

export function useWaitForAction<T = any>(event: EVENTS) {
  return (callback: (args: T) => void) => {
    window.electron.on(event.toString(), (args: T) => callback(args));
    return () => {
      window.electron.removeAllListeners(event.toString());
    };
  };
}
