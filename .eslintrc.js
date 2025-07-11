module.exports = {
    parser: "@typescript-eslint/parser", // Specify the TypeScript parser
    env: {
        node: true, // Enables Node.js specific rules
    },
    extends: ["eslint:recommended"], // Extends ESLint recommended rules

    rules: {
        // Adjust these rules to your preference (refer to point 5)
        "no-console": "warn", // Warns about usage of console.log etc.
        "no-unused-vars": "warn", // Warns about unused variables
        semi: ["error", "always"], // Enforces semicolons at the end of statements
        quotes: ["error", "double"], // Enforces double quotes for strings
    },
};
