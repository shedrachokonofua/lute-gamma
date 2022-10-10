import * as env from "env-var";

export const RYM_DATA_SERVER_URL = env
  .get("RYM_DATA_SERVER_URL")
  .default("http://rym-data-server")
  .asString();

export const CRAWLER_SERVER_URL = env
  .get("CRAWLER_SERVER_URL")
  .default("http://crawler")
  .asString();

export const CATALOG_SERVER_URL = env
  .get("CATALOG_SERVER_URL")
  .default("http://catalog-server")
  .asString();

export const RYM_LOOKUP_SERVER_URL = env
  .get("RYM_LOOKUP_SERVER_URL")
  .default("http://rym-lookup-server")
  .asString();

export const MONGO_URL = env
  .get("MONGO_URL")
  .default("mongodb://mongodb:27017")
  .asString();

export const MONGO_DB_NAME = env
  .get("MONGO_DB_NAME")
  .default("profile")
  .asString();

export const REDIS_URL = env
  .get("REDIS_URL")
  .default("redis://redis:6379")
  .asString();
