import { Context } from "./context";
import { buildFileParserEventSubscribers } from "./modules/file-parser";
import { buildLookupEventSubscribers } from "./modules/lookup";
import { buildProfileEventSubscribers } from "./modules/profile/profile-event-subscribers";

export const buildEventSubscribers = (context: Context) => {
  buildFileParserEventSubscribers(context);
  buildLookupEventSubscribers(context);
  buildProfileEventSubscribers(context);
};
