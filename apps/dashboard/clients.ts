import { buildProfileClient } from "@lute/clients";
import { PROFILE_SERVER_URL, BROWSER_PROFILE_SERVER_URL } from "./config";

const isBrowser = typeof window !== "undefined";

export const profileClient = buildProfileClient(
  isBrowser ? BROWSER_PROFILE_SERVER_URL : PROFILE_SERVER_URL
);
