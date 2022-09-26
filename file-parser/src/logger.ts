import { buildLogger } from "@lute/shared";
import { MONGO_URL } from "./config";

export const logger = buildLogger({
  name: "file-parser",
  mongoUrl: MONGO_URL,
});
