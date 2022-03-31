import { EVENTS } from "@common/events";
import { IpcResponse } from "@common/types";
import { useEffect } from "react";

export function useAction<T = any>(actionName: EVENTS) {
  return async (args) => {
    const response: IpcResponse<T> = await window.electron.invoke(
      actionName.toString(),
      ...args
    );
    if (response.hasOwnProperty("error")) {
      throw response;
    }

    return response;
  };
}

export function useWaitForAction<T = any>(
  event: EVENTS,
  callback: (...args: any[]) => void
) {
  window.electron.on(event.toString(), (e, ...args) => {
    callback(...args);
  });

  useEffect(
    () => () => {
      window.electron.removeAllListeners(event.toString());
    },
    []
  );
}
