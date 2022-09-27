import * as env from "env-var";

export const PORT = env.get("PORT").default(3333).asPortNumber();

export const LOCAL_BUCKET_PATH = env
  .get("LOCAL_BUCKET_PATH")
  .default("./test-bucket")
  .asString();

export const REDIS_URL = env
  .get("REDIS_URL")
  .default("redis://redis:6379")
  .asString();

export const FILE_TTL_SECONDS = env
  .get("FILE_TTL_SECONDS")
  .default(60 * 60 * 24)
  .asIntPositive();

export const MONGO_URL = env
  .get("MONGO_URL")
  .default("mongodb://mongodb:27017")
  .asString();
