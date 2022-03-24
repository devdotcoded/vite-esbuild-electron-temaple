import { exposedApi } from "../main/preload";

declare global {
  interface Window {
    electron: typeof exposedApi;
  }
}
