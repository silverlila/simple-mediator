import {
  CacheValue,
  Handler,
  HandlerCallback,
  Middleware,
  Validator,
} from "./types";
import { executeMiddlewares, normalizeObject } from "./utils";

const CACHE_EXPIRATION_TIME = 600000; // 10 minutes

export function createHandler<Req, Res>(
  callback: HandlerCallback<Req, Res>
): Handler<Req, Res> {
  const preMiddlewares: Middleware<Req>[] = [];
  const postMiddlewares: Middleware<Res>[] = [];
  const errorMiddlewares: Middleware<Error>[] = [];

  let validate: Validator<Req> | null = null;

  let isCachingEnabled = false;
  const cache = new Map<string, CacheValue<Res>>();

  const handler = {
    enableCaching: () => {
      isCachingEnabled = true;
      return handler;
    },

    addValidator: (validator: Validator<Req>) => {
      validate = validator;
      return handler;
    },

    addPreMiddleware: (callback: Middleware<Req>) => {
      preMiddlewares.push(callback);
      return handler;
    },

    addPostMiddleware: (callback: Middleware<Res>) => {
      postMiddlewares.push(callback);
      return handler;
    },

    addErrorMiddleware: (callback: Middleware<Error>) => {
      errorMiddlewares.push(callback);
      return handler;
    },

    execute: async (request: Req) => {
      let processedRequest = await executeMiddlewares<Req>(
        preMiddlewares,
        request
      );

      if (validate) {
        const { isValid, message } = validate(processedRequest);
        if (!isValid) throw new Error(message || "Validation error");
      }

      let result: Res;
      let resultsFromCache: Res | null = null;

      const cacheKey = JSON.stringify(normalizeObject(processedRequest));
      if (isCachingEnabled && cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < CACHE_EXPIRATION_TIME) {
          resultsFromCache = cached.value;
        } else {
          cache.delete(cacheKey);
        }
      }

      if (resultsFromCache) {
        result = resultsFromCache;
      } else {
        try {
          result = await callback(processedRequest);
          if (isCachingEnabled) {
            cache.set(cacheKey, { value: result, timestamp: Date.now() });
          }
        } catch (error) {
          if (error instanceof Error) {
            await executeMiddlewares<Error>(errorMiddlewares, error);
          }
          throw error;
        }
      }

      result = await executeMiddlewares<Res>(postMiddlewares, result);
      return result;
    },
  };

  return handler;
}
