import * as env from "env-var";

export const FILE_SERVER_URL = env
  .get("FILE_SERVER_URL")
  .default("http://file-server")
  .asString();

export const PORT = env.get("PORT").default("3335").asPortNumber();

export const MONGO_URL = env
  .get("MONGO_URL")
  .default("mongodb://mongodb:27017")
  .asString();

export const REDIS_URL = env
  .get("REDIS_URL")
  .default("redis://redis:6379")
  .asString();

export const PROXY_HOST = env.get("PROXY_HOST").required().asString();

export const PROXY_PORT = env.get("PROXY_PORT").required().asPortNumber();

export const PROXY_USERNAME = env.get("PROXY_USERNAME").required().asString();

export const PROXY_PASSWORD = env.get("PROXY_PASSWORD").required().asString();

export const COOL_DOWN_SECONDS = env
  .get("COOL_DOWN_SECONDS")
  .default(2)
  .asIntPositive();
