import { config } from "../../config";
import { Pool, Worker, spawn } from "threads";

export const parserPool = Pool(
  () => spawn(new Worker("./parser-worker.ts")),
  config.parser.poolSize
);
