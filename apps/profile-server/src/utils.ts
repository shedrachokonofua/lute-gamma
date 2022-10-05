import {
  buildRymDataClient,
  buildCatalogClient,
  buildRymLookupClient,
} from "@lute/clients";
import {
  CATALOG_SERVER_URL,
  RYM_DATA_SERVER_URL,
  RYM_LOOKUP_SERVER_URL,
} from "./config";

export const rymDataClient = buildRymDataClient(RYM_DATA_SERVER_URL);

export const catalogClient = buildCatalogClient(CATALOG_SERVER_URL);

export const rymLookupClient = buildRymLookupClient(RYM_LOOKUP_SERVER_URL);
