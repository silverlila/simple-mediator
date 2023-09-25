import { createMediator } from "../lib/mediator"; // adjust path if needed
import { Mediator, NoHandlerError } from "../lib/types";

type HandlersSchema = {
  greet: { request: string; response: string };
  add: { request: { a: number; b: number }; response: number };
};

describe("Mediator", () => {
  let mediator: Mediator<HandlersSchema>;

  beforeEach(() => {
    mediator = createMediator<HandlersSchema>();
  });

  it("should register and send to a handler", async () => {
    mediator.register("greet", (name) => Promise.resolve(`Hello, ${name}!`));
    const response = await mediator.send("greet", "John");
    expect(response).toBe("Hello, John!");
  });

  it("should throw an error if no handler registered", async () => {
    await expect(mediator.send("greet", "John")).rejects.toThrow(
      NoHandlerError()
    );
  });

  it("should apply middlewares", async () => {
    mediator.register("add", (data) => Promise.resolve(data.a + data.b));
    mediator.addMiddleware<any>(async (data) => {
      data.a = data.a * 2;
      data.b = data.b * 2;
      return data;
    });
    const response = await mediator.send("add", { a: 2, b: 3 });
    expect(response).toBe(10);
  });
});
