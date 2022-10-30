import {
  PutLookupPayload,
  LookupKey,
  LookupStatus,
  isSavedLookup,
  PageType,
  SearchBestMatch,
} from "@lute/domain";
import {
  LuteEvent,
  LuteEventClient,
  PageDataParsedEvent,
  RedisClient,
} from "@lute/shared";
import { logger } from "../../logger";
import { AlbumInteractor } from "../albums";
import { CrawlerInteractor } from "../crawler";
import { buildLookupRepo } from "./lookup-repo";

const getSearchFileName = (artist: string, album: string) =>
  `search?${new URLSearchParams({
    searchterm: `${artist} ${album}`,
    searchtype: "l",
  }).toString()}`;

export const buildLookupInteractor = ({
  redisClient,
  eventClient,
  albumInteractor,
  crawlerInteractor,
}: {
  redisClient: RedisClient;
  eventClient: LuteEventClient;
  albumInteractor: AlbumInteractor;
  crawlerInteractor: CrawlerInteractor;
}) => {
  const lookupRepo = buildLookupRepo(redisClient);

  const interactor = {
    async getLookupByHash(hash: string) {
      return lookupRepo.getLookupByHash(hash);
    },
    async putLookup(hash: string, payload: PutLookupPayload) {
      const lookup = await lookupRepo.putLookup(hash, payload);

      if (isSavedLookup(lookup)) {
        await eventClient.publish(LuteEvent.LookupSaved, {
          lookupId: hash,
        });
      } else if (lookup.status === LookupStatus.NotFound) {
        await eventClient.publish(LuteEvent.LookupNotFound, {
          lookupId: hash,
        });
      }

      return lookup;
    },
    async getOrCreateLookup(key: LookupKey) {
      let lookup = await lookupRepo.getLookup(key);
      if (lookup) {
        return lookup;
      }
      const newLookup = await lookupRepo.createLookup(key);
      await crawlerInteractor.schedule(
        getSearchFileName(key.artist, key.album),
        newLookup.keyHash
      );
      return newLookup;
    },
    async deleteLookup(hash: string) {
      await lookupRepo.deleteLookup(hash);
    },
    async handleSearchPageParsed(event: PageDataParsedEvent) {
      if (event.pageType !== PageType.Search || !event.lookupId) {
        return;
      }
      logger.info({ event }, "Lookup search found");
      const data = JSON.parse(event.dataString) as SearchBestMatch;
      const albumData = await albumInteractor.getAlbum(data.fileName);
      const putLookupPayload = albumData
        ? {
            status: LookupStatus.Saved,
            bestMatch: {
              albumData,
              ...data,
            },
          }
        : {
            status: LookupStatus.Found,
            bestMatch: data,
          };
      logger.info({ event, putLookupPayload }, "Put lookup");

      await interactor.putLookup(event.lookupId, putLookupPayload);

      if (!albumData) {
        logger.info({ event, albumData }, "Scheduling album for crawling");
        await crawlerInteractor.schedule(data.fileName, event.lookupId);
      }
    },
  };

  return interactor;
};

export type LookupInteractor = ReturnType<typeof buildLookupInteractor>;
