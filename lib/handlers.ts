import { Handler, HandlerCallback, Middleware } from "./types";

export function createHandler<Req, Res>(
  callback: HandlerCallback<Req, Res>
): Handler<Req, Res> {
  let middlewares: Middleware<Req>[] = [];
  let validate: ((request: Req) => Error | null) | undefined;

  const cache = new Map<string, Res>();
  let isCachingEnabled = false;

  const handler = {
    enableCaching: () => {
      isCachingEnabled = true;
      return handler;
    },

    addValidator: (callback: (request: Req) => Error | null) => {
      validate = callback;
      return handler;
    },

    addMiddleware: (callback: Middleware<Req>) => {
      middlewares.push(callback);
      return handler;
    },

    execute: async (request: Req) => {
      if (validate) {
        const error = validate(request);
        if (error) throw error;
      }

      let processedRequest = request;
      for (const middlewareFunc of middlewares) {
        processedRequest = await middlewareFunc(processedRequest);
      }

      const cacheKey = JSON.stringify(processedRequest);
      if (isCachingEnabled && cache.has(cacheKey)) {
        const cachedResult = cache.get(cacheKey);
        if (cachedResult) return cachedResult;
      }

      const result = await callback(processedRequest);

      if (isCachingEnabled) {
        cache.set(cacheKey, result);
      }

      return result;
    },
  };

  return handler;
}
