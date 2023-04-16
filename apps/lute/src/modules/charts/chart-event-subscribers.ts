import { PageType, getChartFileName, getReleaseType } from "@lute/domain";
import { Context } from "../../context";
import {
  EventType,
  ParserPageParsedEventPayload,
  ProfileAlbumAddedEventPayload,
} from "../../lib";
import { EventEntity } from "../../lib/events/event-entity";

export const registerChartEventSubscribers = async (context: Context) => {
  await context.eventBus.subscribe([EventType.ParserPageParsed], {
    name: "chart.store",
    async consumeEvent(
      context,
      {
        data: { fileId, fileName, pageType, data },
      }: EventEntity<ParserPageParsedEventPayload>
    ) {
      if (pageType !== PageType.Chart) return;

      await context.chartInteractor.putChart({
        fileId,
        fileName,
        ...(data as any),
      });
    },
  });

  await context.eventBus.subscribe<ProfileAlbumAddedEventPayload>(
    [EventType.ProfileAlbumAdded],
    {
      name: "similar.charts.crawl",
      async consumeEvent(context, { data: { albumFileName } }) {
        const album = await context.albumInteractor.getAlbum(albumFileName);
        if (!album?.releaseDate) return;

        const sharedParams = {
          releaseType: getReleaseType(album.fileName),
          pageNumber: 1,
        };

        // Same genres, same year
        await context.crawlerInteractor.cachedSchedule({
          fileName: getChartFileName({
            ...sharedParams,
            yearsRangeStart: album.releaseDate.getFullYear(),
            yearsRangeEnd: album.releaseDate.getFullYear(),
            includePrimaryGenres: ["all", ...(album?.primaryGenres || [])],
          }),
        });

        // Same genres, same descriptors
        await context.crawlerInteractor.cachedSchedule({
          fileName: getChartFileName({
            ...sharedParams,
            yearsRangeStart: 1900,
            yearsRangeEnd: new Date().getFullYear(),
            includePrimaryGenres: album.primaryGenres,
            includeDescriptors: album.descriptors,
          }),
        });
      },
    }
  );
};
