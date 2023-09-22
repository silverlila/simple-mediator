import { HandlerFn, HandlerOptions } from "./types";

export class Handler<Req = any, Res = any> {
  public handler: HandlerFn<Req, Res>;
  public validate?: (request: Req) => Error | null = undefined;

  constructor(handler: HandlerFn<Req, Res>, options: HandlerOptions<Req> = {}) {
    this.handler = handler;
    this.validate = options.validate;
  }
}

export class HandlerRegistry {
  private handlers = new Map<string, Handler>();

  register<Req, Res>(key: string, handler: Handler<Req, Res>): void {
    this.handlers.set(key, handler);
  }

  unregister(key: string): void {
    this.handlers.delete(key);
  }

  getHandler<Req, Res>(key: string): Handler<Req, Res> | undefined {
    return this.handlers.get(key);
  }
}
