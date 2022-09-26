import { LuteEventClient, RedisClient } from "@lute/shared";

export interface ServerContext {
  port: number;
  redisClient: RedisClient;
  eventClient: LuteEventClient;
}
