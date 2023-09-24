import { createMediator } from "../lib/index";
import { createHandler } from "../lib/handlers";

describe("Mediator", () => {
  it("should register a handler and call it", async () => {
    const mediator = createMediator();
    const createUser = jest.fn().mockResolvedValue("UserCreated");

    mediator.register("createUser", createUser);
    const result = await mediator.createUser("test");

    expect(createUser).toHaveBeenCalledWith("test");
    expect(result).toBe("UserCreated");
  });

  it("should apply global middleware to requests", async () => {
    const mediator = createMediator();
    const mockHandler = jest.fn().mockResolvedValue("handled");
    const mockMiddleware = jest.fn((req) => ({ ...req, modified: true }));

    mediator.register("handle", mockHandler);
    mediator.useGlobalMiddleware(mockMiddleware);

    await mediator.handle({ original: true });

    expect(mockMiddleware).toHaveBeenCalledWith({ original: true });
    expect(mockHandler).toHaveBeenCalledWith({
      original: true,
      modified: true,
    });
  });
});

describe("Handler", () => {
  it("should enable caching and return cached results", async () => {
    const mockCallback = jest.fn().mockResolvedValue("response");
    const handler = createHandler(mockCallback);

    const result1 = await handler.execute("request");
    const result2 = await handler.execute("request");

    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(result1).toBe("response");
    expect(result2).toBe("response");
  });

  it("should validate requests and throw on invalid", async () => {
    const mockCallback = jest.fn().mockResolvedValue("response");
    const handler = createHandler(mockCallback);

    handler.addValidator((req) =>
      req !== "valid" ? new Error("Invalid") : null
    );

    await expect(handler.execute("invalid")).rejects.toThrow("Invalid");
    await expect(handler.execute("valid")).resolves.toBe("response");
  });
});

describe("Mediator + Handler Integration", () => {
  it("should apply both global middleware and handler middleware", async () => {
    const mediator = createMediator();
    const mockHandler = (data: { value: number }) =>
      Promise.resolve(data.value * 2);

    const globalMiddleware = jest.fn(async (req) => ({ value: req.value + 1 }));
    const handlerMiddleware = jest.fn(async (req) => ({
      value: req.value + 2,
    }));

    mediator
      .register("mockHandler", mockHandler)
      ?.addMiddleware(handlerMiddleware);

    mediator.useGlobalMiddleware(globalMiddleware);

    const result = await mediator.mockHandler({ value: 1 });

    expect(globalMiddleware).toHaveBeenCalledWith({ value: 1 });
    expect(handlerMiddleware).toHaveBeenCalledWith({ value: 2 });
    expect(result).toBe(8); // (1 + 1 + 2) * 2
  });
});
