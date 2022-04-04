type ActionObject = {
  [key: string]: Primitive;
};

type Primitive = string | number | boolean | ActionObject[] | ActionObject;

export type Action<T = any> = new (...args: Primitive[]) => T;

export interface IpcResponse<T> {
  data?: T;
  error?: any;
}

export type Construct<T = any> = new (...args: Primitive[]) => T;
