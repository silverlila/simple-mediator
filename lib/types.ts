export type Handler<Req, Res> = {
  enableCaching: () => Handler<Req, Res>;
  addValidator: (callback: Validator<Req>) => Handler<Req, Res>;
  addPreMiddleware: (callback: Middleware<Req>) => Handler<Req, Res>;
  addPostMiddleware: (callback: Middleware<Res>) => Handler<Req, Res>;
  addErrorMiddleware: (callback: Middleware<Error>) => Handler<Req, Res>;
  execute: (request: Req) => Promise<Res>;
};

export type HandlerCallback<Req, Res> = (request: Req) => Promise<Res>;

export type HandlerSchema = {
  [key: string]: { request: any; response: any };
};

export type RequestOf<
  H extends HandlerSchema,
  K extends keyof H
> = H[K]["request"];

export type ResponseOf<
  H extends HandlerSchema,
  K extends keyof H
> = H[K]["response"];

export type MediatorMethods<H extends HandlerSchema> = {
  /**
   * Registers a handler for a specific key.
   * @param key The unique identifier for the handler.
   * @param callback The handler function that takes a request and returns a promise resolving with the response.
   * @returns A handler instance which is tied to the provided request and response types.
   */
  register<K extends keyof H>(
    key: K,
    callback: (req: RequestOf<H, K>) => Promise<ResponseOf<H, K>>
  ): Handler<RequestOf<H, K>, ResponseOf<H, K>>;

  /**
   * Adds a global middleware that will be executed for all handler requests.
   * @param callback The middleware function to process and potentially transform the input.
   */
  addMiddleware<Input>(callback: Middleware<Input>): void;

  /**
   * Sends a request to a registered handler and receives a response (or an error).
   * @param key The unique identifier for the handler.
   * @param req The request payload.
   * @returns A promise that resolves with the handler's response or an error.
   */
  send<K extends keyof HandlerSchema>(
    key: K,
    req: RequestOf<HandlerSchema, K>
  ): Promise<Error | ResponseOf<HandlerSchema, K>>;
};

export type Mediator<H extends HandlerSchema> = MediatorMethods<H> & {
  [K in keyof H]: (req: H[K]["request"]) => Promise<Error | H[K]["response"]>;
};

export type Middleware<T = any> = (
  args: T,
  next: () => Promise<T>
) => Promise<T>;

export type CacheValue<T> = { timestamp: number; value: T };

export type ValidationResult = { isValid: boolean; message?: string };

export type Validator<Req> = (request: Req) => ValidationResult;

export function NoHandlerError(message?: "No handler found for the given key") {
  const error = new Error(message);
  error.name = "NoHandlerError";
  return error;
}
