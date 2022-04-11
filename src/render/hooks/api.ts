import { Construct, IpcResponse } from "@common/infraestructure/bridge-types";

export function useAction<T, R>(action: Construct<T>) {
  return async (args: T) => {
    const response: IpcResponse<R> = await window.electron.invoke(
      action.name,
      args
    );
    if (response.error) {
      throw response.error;
    }

    return response.data;
  };
}

export function onAction<T>(action: Construct<T>) {
  return (callback: (args: T) => void) => {
    window.electron.on(action.name, (args: IpcResponse<T>) => {
      if (args.error) {
        throw args.error;
      }
      callback(args.data);
    });
    return () => {
      window.electron.removeAllListeners(action.name);
    };
  };
}
