import {
  ErrorMiddleware,
  MiddlewareDictionary,
  MiddlewareStage,
} from "./types";

export class Middleware {
  public globalMiddleware: ((args: any) => Promise<any>)[] = [];
  public errorMiddleware: ErrorMiddleware[] = [];
  public middleware: MiddlewareDictionary = { before: [], after: [] };

  addMiddleware<Req, Res>(
    middleware: (args: Req | Res) => Promise<Req | Res>,
    stage: MiddlewareStage
  ): void {
    this.middleware[stage].push(middleware);
  }

  addGlobalMiddleware<Req>(middleware: (args: Req) => Promise<Req>): void {
    this.globalMiddleware.push(middleware);
  }

  addErrorMiddleware(middleware: ErrorMiddleware): void {
    this.errorMiddleware.push(middleware);
  }
}
