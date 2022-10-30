import { buildLogger } from "../../lib";
import { MONGO_URL } from "./config";

export const logger = buildLogger({
  name: "profile-server",
  mongoUrl: MONGO_URL,
});
