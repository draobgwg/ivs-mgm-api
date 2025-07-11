module.exports = {
    apps: [
        {
            name: "ivs-mnufc-api",
            script: "src/index.ts",
            interpreter: "npx",
            interpreter_args: "ts-node",
            watch: true, // Optional: enables file watching for changes
            max_memory_restart: "500M",
        },
    ],
};
