import { createHandler } from "../lib/handler";

describe("Handler", () => {
  it("should process and return data", async () => {
    const handler = createHandler((data: { name: string }) =>
      Promise.resolve(`Hello, ${data.name}!`)
    );
    const response = await handler.execute({ name: "John" });
    expect(response).toBe("Hello, John!");
  });

  it("should apply pre-middlewares", async () => {
    const handler = createHandler((data: { age: number }) =>
      Promise.resolve(data.age)
    ).addPreMiddleware(async (data) => {
      data.age += 1;
      return data;
    });

    const response = await handler.execute({ age: 25 });
    expect(response).toBe(26);
  });

  it("should apply post-middlewares", async () => {
    const handler = createHandler((data: { name: string }) =>
      Promise.resolve(`Hello, ${data.name}!`)
    ).addPostMiddleware(async (response) => `${response} How are you?`);
    const response = await handler.execute({ name: "John" });
    expect(response).toBe("Hello, John! How are you?");
  });

  it("should validate data and throw an error for invalid data", async () => {
    const handler = createHandler((data: { age: number }) =>
      Promise.resolve(data.age)
    ).addValidator((data) => {
      if (data.age < 0) {
        return { isValid: false, message: "Age cannot be negative" };
      }
      return { isValid: true };
    });
    await expect(handler.execute({ age: -5 })).rejects.toThrow(
      "Age cannot be negative"
    );
  });
});
