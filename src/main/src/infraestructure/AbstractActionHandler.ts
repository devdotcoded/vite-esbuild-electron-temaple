import { Construct, IpcResponse } from "@common/infraestructure/bridge-types";
import { WebContents } from "electron";

export abstract class ActionHandler<T, R = void> {
  constructor(private webContents: WebContents) {}

  public emit<E>(action: E): void {
    this.webContents.send(action.constructor.name, {
      data: action,
    } as IpcResponse<E>);
  }

  abstract getAction(): Construct<T>;

  abstract handle(action: T): Promise<R>;
}
