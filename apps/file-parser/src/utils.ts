import {
  buildCrawlerClient,
  buildFileServerClient,
  buildRymDataClient,
  buildRymLookupClient,
} from "@lute/clients";
import {
  FILE_SERVER_URL,
  RYM_DATA_SERVER_URL,
  RYM_LOOKUP_SERVER_URL,
  CRAWLER_SERVER_URL,
} from "./config";

export const fileServerClient = buildFileServerClient(FILE_SERVER_URL);

export const rymDataClient = buildRymDataClient(RYM_DATA_SERVER_URL);

export const rymLookupClient = buildRymLookupClient(RYM_LOOKUP_SERVER_URL);

export const crawlerClient = buildCrawlerClient(CRAWLER_SERVER_URL);
