module.exports = {
    apps: [
        {
            name: "user_service",
            script: "./dist/main.js",
            args: " --start_grpc_server",
            instances: 5,
            instance_var: "NODE_ID",
        },
    ],
};
