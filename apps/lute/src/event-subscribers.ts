import { Context } from "./context";
import { buildFileParserEventSubscribers } from "./modules/file-parser";
import { buildLookupEventSubscribers } from "./modules/lookup";

export const buildEventSubscribers = (context: Context) => {
  buildFileParserEventSubscribers(context);
  buildLookupEventSubscribers(context);
};
