import { Context } from "./context";
import { registerAlbumEventSubscribers } from "./modules/albums";
import { registerChartEventSubscribers } from "./modules/charts";
import { registerFileParserEventSubscribers } from "./modules/file-parser";
import { registerLookupEventSubscribers } from "./modules/lookup";
import { registerProfileEventSubscribers } from "./modules/profile/profile-event-subscribers";

export const registerEventSubscribers = async (context: Context) => {
  await registerAlbumEventSubscribers(context);
  await registerChartEventSubscribers(context);
  await registerFileParserEventSubscribers(context);
  await registerLookupEventSubscribers(context);
  await registerProfileEventSubscribers(context);
};
