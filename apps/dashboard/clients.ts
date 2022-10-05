import { buildProfileClient } from "@lute/clients";
import { PROFILE_SERVER_URL } from "./config";

export const profileClient = buildProfileClient(PROFILE_SERVER_URL);
