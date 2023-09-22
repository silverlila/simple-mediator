import { Handler, HandlerRegistry } from "./handlers";
import { Middleware } from "./middleware";
import {
  ErrorMiddleware,
  HandlerFn,
  HandlerOptions,
  Mediator,
  MiddlewareStage,
} from "./types";

export class SimpleMediator implements Mediator {
  private handlersRegistry = new HandlerRegistry();
  private middleware = new Middleware();

  register<Req, Res>(
    key: string,
    handler: HandlerFn<Req, Res>,
    options: HandlerOptions<Req> = {}
  ): void {
    const handlerEntry = new Handler<Req, Res>(handler, options);
    this.handlersRegistry.register(key, handlerEntry);
  }

  unregister(key: string): void {
    this.handlersRegistry.unregister(key);
  }

  useMiddleware<Req, Res>(
    callback: (args: Req | Res) => Promise<Req | Res>,
    stage: MiddlewareStage
  ): void {
    this.middleware.addMiddleware(callback, stage);
  }

  useGlobalMiddleware<Req>(callback: (args: Req) => Promise<Req>): void {
    this.middleware.addGlobalMiddleware(callback);
  }

  useErrorMiddleware(callback: ErrorMiddleware): void {
    this.middleware.addErrorMiddleware(callback);
  }

  async send<Req, Res>(key: string, request: Req): Promise<Res | Error> {
    const handlerData = this.handlersRegistry.getHandler<Req, Res>(key);

    if (!handlerData) return new Error(`No handler found for key: ${key}`);

    const { handler, validate } = handlerData;
    const { middleware, globalMiddleware, errorMiddleware } = this.middleware;

    try {
      let processedRequest = request;

      // Execute "before" middleware
      for (const middlewareFunc of middleware.before) {
        processedRequest = await middlewareFunc(processedRequest);
      }

      for (const middlewareFunc of globalMiddleware) {
        processedRequest = await middlewareFunc(processedRequest);
      }

      if (validate) {
        const validationError = validate(processedRequest);
        if (validationError) throw validationError;
      }

      let result = await handler(processedRequest);

      // Execute "after" middleware
      for (const middlewareFunc of middleware.after) {
        result = await middlewareFunc(result);
      }

      return result;
    } catch (error) {
      let processedError = error as Error;

      // Execute error middleware
      for (const middlewareFunc of errorMiddleware) {
        processedError = await middlewareFunc(processedError);
      }
      return processedError;
    }
  }
}
