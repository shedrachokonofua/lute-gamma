import {
  PutLookupPayload,
  LookupKey,
  LookupStatus,
  isSavedLookup,
  PageType,
  SearchBestMatch,
} from "@lute/domain";
import {
  EventBus,
  EventType,
  LookupNotFoundEventPayload,
  LookupSavedEventPayload,
  ParserPageParsedEventPayload,
  RedisClient,
} from "../../lib";
import { EventEntity } from "../../lib/events/event-entity";
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
  eventBus,
  albumInteractor,
  crawlerInteractor,
}: {
  redisClient: RedisClient;
  eventBus: EventBus;
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
        await eventBus.publish<LookupSavedEventPayload>({
          type: EventType.LookupSaved,
          data: {
            lookupHash: hash,
          },
        });
      } else if (lookup.status === LookupStatus.NotFound) {
        await eventBus.publish<LookupNotFoundEventPayload>({
          type: EventType.LookupNotFound,
          data: {
            lookupHash: hash,
          },
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
    async handleSearchPageParsed(
      event: EventEntity<ParserPageParsedEventPayload>
    ) {
      const { data, metadata } = event;
      const lookupHash = metadata?.correlationId;
      if (data.pageType !== PageType.Search || !lookupHash) {
        return;
      }
      logger.info({ event }, "Lookup search found");
      const bestMatch = data.data as SearchBestMatch;
      const albumData = await albumInteractor.getAlbum(data.fileName);
      const putLookupPayload = albumData
        ? {
            status: LookupStatus.Saved,
            bestMatch: {
              albumData,
              ...bestMatch,
            },
          }
        : {
            status: LookupStatus.Found,
            bestMatch,
          };
      logger.info({ event, putLookupPayload }, "Put lookup");

      await interactor.putLookup(lookupHash, putLookupPayload);

      if (!albumData) {
        logger.info({ event, albumData }, "Scheduling album for crawling");
        await crawlerInteractor.schedule(data.data.fileName, lookupHash);
      }
    },
  };

  return interactor;
};

export type LookupInteractor = ReturnType<typeof buildLookupInteractor>;
