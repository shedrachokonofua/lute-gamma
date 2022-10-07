import { buildProfileClient } from "@lute/clients";
import { PROFILE_SERVER_URL, BROWSER_PROFILE_SERVER_URL } from "./config";

const isBrowser = typeof window !== "undefined";

export const profileClient = buildProfileClient(
  isBrowser ? "http://localhost:3338" : PROFILE_SERVER_URL
);
