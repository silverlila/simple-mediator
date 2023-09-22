import { SimpleMediator } from "../lib/index";
import { Mediator } from "../lib/types";

describe("Mediator", () => {
  let mediator: Mediator;

  beforeEach(() => {
    mediator = new SimpleMediator();
  });

  it("should register and execute a handler", async () => {
    const requestKey = "testRequest";
    const response = "testResponse";

    mediator.register<string, string>(requestKey, async () => {
      return response;
    });

    const result = await mediator.send<string, string>(requestKey, "");
    expect(result).toBe(response);
  });

  it("should throw an validation error", async () => {
    type User = { username: string; password: string };
    const handler = (user: User) => {
      return Promise.resolve(user);
    };

    const validate = (user: User) => {
      return new Error("Validation Error");
    };

    mediator.register("user", handler, { validate });

    const result = (await mediator.send("user", {
      username: "",
      password: "",
    })) as Error;
    expect(result?.message).toBe("Validation Error");
  });

  it("should register and execute a handler by passing an object", async () => {
    const requestKey = "addNumbers";
    const request = { num1: 2, num2: 3 };
    const response = 5;

    mediator.register<typeof request, number>(requestKey, async (args) => {
      return args.num1 + args.num2;
    });

    const result = await mediator.send<typeof request, number>(
      requestKey,
      request
    );
    expect(result).toBe(response);
  });

  it("should return an error for an unregistered request", async () => {
    const requestKey = "unregisteredRequest";

    const result = (await mediator.send(requestKey, "")) as Error;
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe(
      `No handler found for request key: ${requestKey}`
    );
  });

  it("should handle errors thrown by the handler", async () => {
    const requestKey = "errorRequest";
    const errorMessage = "Handler error";

    mediator.register<string, string>(requestKey, async () => {
      throw new Error(errorMessage);
    });

    const result = (await mediator.send<string, string>(
      requestKey,
      ""
    )) as Error;
    expect(result).toBeInstanceOf(Error);
    expect(result?.message).toBe(errorMessage);
  });
});
