import { buildRymDataClient } from "@lute/shared";
import { RYM_DATA_SERVER_URL } from "./config";

export const rymDataClient = buildRymDataClient(RYM_DATA_SERVER_URL);
