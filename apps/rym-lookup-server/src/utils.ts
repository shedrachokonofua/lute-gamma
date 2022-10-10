import { buildCrawlerClient, buildRymDataClient } from "@lute/clients";
import { CRAWLER_SERVER_URL, RYM_DATA_SERVER_URL } from "./config";

export const crawlerClient = buildCrawlerClient(CRAWLER_SERVER_URL);

export const rymDataClient = buildRymDataClient(RYM_DATA_SERVER_URL);
