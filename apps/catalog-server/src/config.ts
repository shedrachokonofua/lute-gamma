import env from "env-var";

export const HOST = env.get("HOST").default("http://localhost:3336").asString();

export const MONGO_URL = env
  .get("MONGO_URL")
  .default("mongodb://mongodb:27017")
  .asString();

export const SPOTIFT_CLIENT_ID = env
  .get("SPOTIFY_CLIENT_ID")
  .required()
  .asString();

export const SPOTIFT_CLIENT_SECRET = env
  .get("SPOTIFY_CLIENT_SECRET")
  .required()
  .asString();
