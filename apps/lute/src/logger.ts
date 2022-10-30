import { buildLogger } from "./lib";
import { config } from "./config";

export const logger = buildLogger({
  name: "lute",
  mongoUrl: config.mongo.url,
});
