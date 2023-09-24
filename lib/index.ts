import { createHandler } from "./handlers";
import {
  ErrorMiddleware,
  Handler,
  HandlerCallback,
  Mediator,
  Middleware,
} from "./types";

export function createMediator() {
  const handlers = new Map<string, Handler<any, any>>();
  const globalMiddlewares: Middleware<any, any>[] = [];
  const errorMiddlewares: ErrorMiddleware[] = [];

  const register = <Req, Res>(
    key: string,
    callback: HandlerCallback<Req, Res>
  ): Handler<Req, Res> => {
    const handler = createHandler(callback);
    handlers.set(key, handler);
    return handler;
  };

  const useGlobalMiddleware = <TInput, TOutput>(
    callback: Middleware<TInput, TOutput>
  ) => {
    globalMiddlewares.push(callback);
  };

  const useErrorMiddleware = (callback: ErrorMiddleware) => {
    errorMiddlewares.push(callback);
  };

  const send = async <Req, Res>(
    key: string,
    request: Req
  ): Promise<Res | Error> => {
    const handler = handlers.get(key) as Handler<Req, Res>;
    if (!handler) return new Error(`No handler found for key: ${key}`);

    try {
      let processedRequest: any = request;
      for (const middleware of globalMiddlewares) {
        processedRequest = await middleware(processedRequest);
      }

      const result = await handler.execute(processedRequest as Req);
      return result as Res | Error;
    } catch (error) {
      let processedError = error as Error;

      for (const middleware of errorMiddlewares) {
        processedError = await middleware(processedError);
      }

      return processedError;
    }
  };

  return new Proxy<Mediator>(
    {
      register,
      useGlobalMiddleware,
      useErrorMiddleware,
      send,
    },
    {
      get(target, property, receiver) {
        if (typeof property === "string" && !(property in target)) {
          return (request: any) => target.send(property, request);
        }
        return Reflect.get(target, property, receiver);
      },
    }
  );
}

const createUser = (name: string) => {
  return Promise.resolve({ user: name });
};

const container = createMediator();

container.register("createUser", createUser);

container.createUser();
