export type HandlerFn<Req, Res> = (args: Req) => Promise<Res>;

export type HandlerOptions<Req> = {
  validate?: (request: Req) => Error | null;
};

export interface Mediator {
  register<Req, Res>(
    key: string,
    handler: (args: Req) => Promise<Res>,
    options?: HandlerOptions<Req>
  ): void;
  unregister(key: string): void;
  send<Req, Res>(key: string, request: Req): Promise<Res | Error>;
  useGlobalMiddleware<Req>(middleware: (args: Req) => Promise<Req>): void;
}

export interface ErrorMiddleware {
  (error: Error): Promise<Error>;
}

export type MiddlewareStage = "before" | "after";

export type MiddlewareDictionary = {
  [stage in MiddlewareStage]: ((args: any) => Promise<any>)[];
};
