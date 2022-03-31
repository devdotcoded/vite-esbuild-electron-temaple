import { exposedApi } from "../main/preload";

declare module "*.png";
declare module "*.jpeg";
declare module "*.jpg";
declare module "*.gif";

declare global {
  interface Window {
    electron: typeof exposedApi;
  }
}
