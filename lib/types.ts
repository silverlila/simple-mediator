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
  register<K extends keyof H>(
    key: K,
    callback: (req: RequestOf<H, K>) => Promise<ResponseOf<H, K>>
  ): Handler<RequestOf<H, K>, ResponseOf<H, K>>;
  addlMiddleware<Input>(callback: Middleware<Input>): void;
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
