import { RedisClient } from "@lute/shared";
import { CrawlerRepo } from "./crawler-repo";

export interface ServerContext {
  port: number;
  redisClient: RedisClient;
  crawlerRepo: CrawlerRepo;
}
