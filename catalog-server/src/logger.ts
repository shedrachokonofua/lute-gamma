import { buildLogger } from "@lute/shared";
import { MONGO_URL } from "./config";

export const logger = buildLogger({
  name: "catalog-server",
  mongoUrl: MONGO_URL,
});
