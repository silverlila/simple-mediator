import { Middleware } from "./types";

export async function executeMiddlewares<TInput>(
  middlewares: Middleware<TInput>[],
  input: TInput
): Promise<TInput> {
  const next = async (index: number, currentInput: TInput): Promise<TInput> => {
    if (index === middlewares.length) return currentInput;
    const middleware = middlewares[index];
    return middleware(currentInput, () => next(index + 1, currentInput));
  };

  return next(0, input);
}

export function normalizeObject(obj: any): any {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(normalizeObject);
  }

  const sortedEntries = Object.entries(obj)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => [key, normalizeObject(value)]);

  return Object.fromEntries(sortedEntries);
}
