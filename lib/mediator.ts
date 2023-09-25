import { createHandler } from "./handler";
import {
  Handler,
  HandlerCallback,
  HandlerSchema,
  Mediator,
  Middleware,
  NoHandlerError,
  RequestOf,
  ResponseOf,
} from "./types";
import { executeMiddlewares } from "./utils";

export function createMediator<H extends HandlerSchema>() {
  type Req = RequestOf<H, keyof H>;
  type Res = ResponseOf<H, keyof H>;

  const handlers = new Map<keyof H, Handler<Req, Res>>();
  const middlewares: Middleware<any>[] = [];

  function register<K extends keyof H>(key: K, fn: HandlerCallback<H, K>) {
    const handler = createHandler<RequestOf<H, K>, ResponseOf<H, K>>(fn);
    handlers.set(key, handler);

    return handlers.get(key);
  }

  function addMiddleware<TInput>(callback: Middleware<TInput>) {
    middlewares.push(callback);
  }

  async function send<K extends keyof H>(key: K, request: RequestOf<H, K>) {
    const handler = handlers.get(key);
    if (!handler) throw NoHandlerError();

    try {
      let processedRequest = await executeMiddlewares(middlewares, request);
      return await handler.execute(processedRequest);
    } catch (error) {
      throw error;
    }
  }

  const mediator = { send, register, addMiddleware };

  return new Proxy<Mediator<H>>(mediator as any, {
    get(target, property, receiver) {
      if (typeof property === "symbol") return undefined;

      if (!(property in target)) {
        return (request: any) => target.send(property, request);
      }
      return Reflect.get(target, property, receiver);
    },
  });
}
