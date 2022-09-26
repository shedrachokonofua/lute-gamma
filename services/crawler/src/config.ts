import env from "env-var";

export const FILE_SERVER_URL = env
  .get("FILE_SERVER_URL")
  .default("http://file-server")
  .asString();

export const PORT = env.get("PORT").default("3335").asPortNumber();

export const MONGO_URL = env
  .get("MONGO_URL")
  .default("mongodb://mongodb:27017")
  .asString();
