import { buildCrawlerClient } from "@lute/clients";
import { CRAWLER_SERVER_URL } from "./config";

export const crawlerClient = buildCrawlerClient(CRAWLER_SERVER_URL);
