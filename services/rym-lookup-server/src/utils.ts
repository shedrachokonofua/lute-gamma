import { buildCrawlerClient } from "@lute/shared";
import { CRAWLER_SERVER_URL } from "./config";

export const crawlerClient = buildCrawlerClient(CRAWLER_SERVER_URL);
