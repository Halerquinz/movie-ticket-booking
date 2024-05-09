module.exports = {
    apps: [
        {
            name: "movie_service_grpc_server",
            script: "./dist/main.js",
            args: "--start_grpc_server",
            instances: 2,
            instance_var: "NODE_ID",
        },
        {
            name: "movie_service_kafka_consumer",
            script: "./dist/main.js",
            args: "--start_kafka_consumer",
            instances: 4,
            instance_var: "NODE_ID",
            wait_ready: true,
        },
    ],
};

