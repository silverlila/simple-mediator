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

  const generateCacheKey = (request: Req) => {
    return JSON.stringify(normalizeObject(request));
  };

  const getCachedResult = (cacheKey: string): Res | null => {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRATION_TIME) {
      return cached.value;
    }
    cache.delete(cacheKey);
    return null;
  };

  const executeHandlerCallback = async (request: Req): Promise<Res> => {
    try {
      const result = await callback(request);
      if (isCachingEnabled) {
        const cacheKey = generateCacheKey(request);
        cache.set(cacheKey, { value: result, timestamp: Date.now() });
      }
      return result;
    } catch (error) {
      if (error instanceof Error) {
        await executeMiddlewares<Error>(errorMiddlewares, error);
      }
      throw error;
    }
  };

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
      const processedRequest = await executeMiddlewares(
        preMiddlewares,
        request
      );

      if (validate) {
        const { isValid, message } = validate(processedRequest);
        if (!isValid) throw new Error(message || "Validation error");
      }

      const cacheKey = generateCacheKey(processedRequest);
      let result = getCachedResult(cacheKey);

      if (!result) {
        result = await executeHandlerCallback(processedRequest);
      }

      return await executeMiddlewares(postMiddlewares, result);
    },
  };

  return handler;
}
