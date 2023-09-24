export type Mediator = {
  register<Req, Res>(
    key: string,
    callback: HandlerCallback<Req, Res>
  ): Handler<Req, Res>;
  useGlobalMiddleware<T, U = T>(callback: Middleware<T, U>): void;
  useErrorMiddleware(callback: ErrorMiddleware): void;
  send<Req = any, Res = any>(key: string, request: Req): Promise<Res | Error>;
  [key: string]: any;
};

export type Handler<Req, Res> = {
  enableCaching: () => Handler<Req, Res>;
  addValidator: (callback: (request: Req) => Error | null) => Handler<Req, Res>;
  addMiddleware: (callback: Middleware<Req>) => Handler<Req, Res>;
  execute: (request: Req) => Promise<Res>;
};

export type HandlerCallback<Req, Res> = (args: Req) => Promise<Res>;

export type Middleware<T, U = T> = (args: T) => Promise<U>;

export type ErrorMiddleware = (error: Error) => Promise<Error>;
