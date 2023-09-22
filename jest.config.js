module.exports = {
  // Set the root directory for Jest
  rootDir: "./",

  // Specify the test environment (e.g., Node.js)
  testEnvironment: "node",

  // Define the directory where Jest will look for tests
  testMatch: ["<rootDir>/tests/**/*.test.ts"], // Adjust the file pattern to match your test files

  // Configure Jest to use TypeScript for .ts files
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
};
