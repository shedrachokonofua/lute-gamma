import * as env from "env-var";

export const PROFILE_SERVER_URL = env
  .get("PROFILE_SERVER_URL")
  .default("http://profile-server")
  .asString();

export const BROWSER_PROFILE_SERVER_URL = env
  .get("BROWSER_PROFILE_SERVER_URL")
  .default("http://localhost:3338")
  .asString();
