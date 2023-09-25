# simple-mediator

A simple yet powerful mediator library for orchestrating and handling operations with optional middleware and caching support.

## Features

- **Handler Registration**: Dynamically register handlers with specific keys.
- **Middleware Support**: Add middleware to process requests, responses, and errors.
- **Validation**: Attach validators to handlers.
- **Caching**: Optionally enable caching for handler responses.

## Installation

(Include instructions on how to install the library, e.g., via npm or yarn.)

## Usage

### Basic Usage

```typescript
import { createMediator } from "simple-mediator";

const mediator = createMediator<{
  createUser: { request: string; response: string };
}>();

mediator.register("createUser", async (name: string) => {
  return Promise.resolve(`Hello, ${name}`);
});

const response = await mediator.createUser("John Doe");
console.log(response); // Outputs: "Hello, John Doe"
```

### Middleware

```typescript
import { createMediator } from "simple-mediator";

const mediator = createMediator<{
  greetUser: { request: string; response: string };
}>();

const handler = mediator.register("greetUser", async (name: string) => {
  return Promise.resolve(Hello, ${name});
});

handler.addPreMiddleware((name, next) => {
  return next(Mr. ${name});
});

const response = await mediator.greetUser("John Doe");
console.log(response); // Outputs: "Hello, Mr. John Doe"
```

### Validation

```typescript
import { createMediator } from "simple-mediator";

const mediator = createMediator<{
  createUser: { request: string; response: string };
}>();

const handler = mediator.register("createUser", async (name: string) => {
  return Promise.resolve(name);
});

handler.addValidator((name) => {
  if (name.length < 3) {
    return { isValid: false, message: "Name is too short." };
  }
  return { isValid: true };
});

try {
  const response = await mediator.createUser("Jo");
} catch (error) {
  console.error(error.message); // Outputs: "Name is too short."
}
```

### Error Handling

```typescript
import { createMediator } from "simple-mediator";

const mediator = createMediator<{
  throwError: { request: string; response: string };
}>();

const handler = mediator.register("throwError", async (input: string) => {
  throw new Error("An error occurred");
});

handler.addErrorMiddleware((error, next) => {
  console.error("Caught an error:", error.message);
  return next(error);
});

try {
  await mediator.throwError("test");
} catch (error) {
  // This will be reached after the error middleware logs the error.
}
```
