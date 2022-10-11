import * as env from "env-var";

export const PROFILE_SERVER_URL = env
  .get("PROFILE_SERVER_URL")
  .default("http://profile-server")
  .asString();

export const MONGO_URL = env
  .get("MONGO_URL")
  .default("mongodb://mongodb:27017")
  .asString();

export const IS_TS_NODE = env.get("TS_NODE").default("false").asBool();
