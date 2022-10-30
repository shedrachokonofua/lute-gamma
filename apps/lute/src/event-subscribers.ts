import { Context } from "./context";
import { buildLookupEventSubscribers } from "./modules/lookup";

export const buildEventSubscribers = (context: Context) => {
  buildLookupEventSubscribers(context);
};
