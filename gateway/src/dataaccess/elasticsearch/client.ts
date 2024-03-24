import { Client } from "@elastic/elasticsearch";
import { injected, token } from "brandi";
import { ElasticsearchConfig, ELASTICSEARCH_CONFIG_TOKEN } from "../../config";

export function newElasticsearchClient(elasticsearchConfig: ElasticsearchConfig): Client {
    return new Client({
        node: `http://${elasticsearchConfig.host}:${elasticsearchConfig.port}`,
        auth: {
            username: elasticsearchConfig.username,
            password: elasticsearchConfig.password,
        },
    });
}

injected(newElasticsearchClient, ELASTICSEARCH_CONFIG_TOKEN);

export const ELASTICSEARCH_CLIENT_TOKEN = token<Client>("ElasticsearchClient");
