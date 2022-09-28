import { LuteEventClient, RedisClient } from "@lute/shared";
import { FileStorageClient } from "./storage";

export interface ServerContext {
  port: number;
  redisClient: RedisClient;
  eventClient: LuteEventClient;
  fileStorageClient: FileStorageClient;
}
