module.exports = {

    apps: [
        {
            name: "movie_service_kafka_consumer",
            script: "./dist/main.js",
            args: "--start_kafka_consumer",
            instances: 8,
            instance_var: "NODE_ID",
            wait_ready: true,
        },
    ],
};

