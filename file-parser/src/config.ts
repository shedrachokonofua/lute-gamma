import env from "env-var";

export const FILE_SERVER_URL = env
  .get("FILE_SERVER_URL")
  .default("http://app:3333")
  .asString();

export const RYM_DATA_SERVER_URL = env
  .get("RYM_DATA_SERVER_URL")
  .default("http://app:3334")
  .asString();

export const CRAWLER_SERVER_URL = env
  .get("CRAWLER_SERVER_URL")
  .default("http://app:3335")
  .asString();

export const RYM_LOOKUP_SERVER_URL = env
  .get("RYM_LOOKUP_SERVER_URL")
  .default("http://app:3337")
  .asString();

export const MONGO_URL = env
  .get("MONGO_URL")
  .default("mongodb://mongodb:27017")
  .asString();
