module.exports = {
    apps: [
        {
            name: "payment_service_grpc_server",
            script: "./dist/main.js",
            args: " --start_grpc_server",
            instances: 2,
            instance_var: "NODE_ID",
        },
        {
            name: "payment_service_kafka_consumer",
            script: "./dist/main.js",
            args: "--start_kafka_consumer",
            instances: 4,
            instance_var: "NODE_ID",
            wait_ready: true,
        },
        {
            name: "payment_service_webhook_server",
            script: "./dist/main.js",
            args: "--start_webhook_server",
            instances: 1,
            instance_var: "NODE_ID",
            wait_ready: true,
        },
    ],
};
