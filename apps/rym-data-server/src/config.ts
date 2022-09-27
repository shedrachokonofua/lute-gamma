import env from "env-var";

export const PORT = env.get("PORT").default(3334).asPortNumber();

export const MONGO_URL = env
  .get("MONGO_URL")
  .default("mongodb://mongodb:27017")
  .asString();

export const MONGO_DB_NAME = env
  .get("MONGO_DB_NAME")
  .default("rym-data")
  .asString();
