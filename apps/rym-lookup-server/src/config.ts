import * as env from "env-var";

export const PORT = env.get("PORT").default("3337").asPortNumber();

export const MONGO_URL = env
  .get("MONGO_URL")
  .default("mongodb://mongodb:27017")
  .asString();

export const REDIS_URL = env
  .get("REDIS_URL")
  .default("redis://redis:6379")
  .asString();

export const CRAWLER_SERVER_URL = env
  .get("CRAWLER_SERVER_URL")
  .default("http://crawler")
  .asString();

export const RYM_DATA_SERVER_URL = env
  .get("RYM_DATA_SERVER_URL")
  .default("http://rym-data")
  .asString();
