import { Context } from "./context";
import { registerAlbumEventSubscribers } from "./modules/albums";
import { registerArtistEventSubscribers } from "./modules/artists";
import { registerChartEventSubscribers } from "./modules/charts";
import { registerCrawlerEventSubscribers } from "./modules/crawler";
import { registerFileParserEventSubscribers } from "./modules/file-parser";
import { registerLookupEventSubscribers } from "./modules/lookup";
import { registerProfileEventSubscribers } from "./modules/profile/profile-event-subscribers";

export const registerEventSubscribers = async (context: Context) => {
  await registerArtistEventSubscribers(context);
  await registerAlbumEventSubscribers(context);
  await registerChartEventSubscribers(context);
  await registerCrawlerEventSubscribers(context);
  await registerFileParserEventSubscribers(context);
  await registerLookupEventSubscribers(context);
  await registerProfileEventSubscribers(context);
};
