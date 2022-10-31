import { buildLogger } from "./lib/logger";
import { config } from "./config";

export const logger = buildLogger({
  name: "lute",
  mongoUrl: config.mongo.url,
});
