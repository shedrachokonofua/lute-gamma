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
  span,
} from "../../lib";
import { EventEntity } from "../../lib/events/event-entity";
import { logger } from "../../logger";
import { AlbumInteractor } from "../albums";
import { CrawlerInteractor, Priority } from "../crawler";
import { LookupRepository } from "./lookup-repository";

const getSearchFileName = (artist: string, album: string) =>
  `search?${new URLSearchParams({
    searchterm: `${artist} ${album}`,
    searchtype: "l",
  }).toString()}`;

export class LookupInteractor {
  private readonly lookupRepository: LookupRepository;
  private readonly eventBus: EventBus;
  private readonly albumInteractor: AlbumInteractor;
  private readonly crawlerInteractor: CrawlerInteractor;

  constructor({
    redisClient,
    eventBus,
    albumInteractor,
    crawlerInteractor,
  }: {
    redisClient: RedisClient;
    eventBus: EventBus;
    albumInteractor: AlbumInteractor;
    crawlerInteractor: CrawlerInteractor;
  }) {
    this.eventBus = eventBus;
    this.albumInteractor = albumInteractor;
    this.crawlerInteractor = crawlerInteractor;
    this.lookupRepository = new LookupRepository(redisClient);
  }

  async getLookupByHash(hash: string) {
    return this.lookupRepository.getLookupByHash(hash);
  }

  async putLookup(hash: string, payload: PutLookupPayload) {
    const lookup = await this.lookupRepository.putLookup(hash, payload);

    if (isSavedLookup(lookup)) {
      await this.eventBus.publish<LookupSavedEventPayload>({
        type: EventType.LookupSaved,
        data: {
          lookupHash: hash,
        },
      });
    } else if (lookup.status === LookupStatus.NotFound) {
      await this.eventBus.publish<LookupNotFoundEventPayload>({
        type: EventType.LookupNotFound,
        data: {
          lookupHash: hash,
        },
      });
    }

    return lookup;
  }

  async getOrCreateLookup(key: LookupKey) {
    let lookup = await this.lookupRepository.getLookup(key);
    if (lookup) {
      return lookup;
    }
    const newLookup = await this.lookupRepository.createLookup(key);
    try {
      await this.crawlerInteractor.schedule({
        dedupeKey: `search:${newLookup.keyHash}`,
        fileName: getSearchFileName(key.artist, key.album),
        priority: Priority.High,
        metadata: {
          correlationId: newLookup.keyHash,
        },
      });
    } catch (err) {
      logger.error({ err }, "Failed to schedule search");
    }
    return newLookup;
  }

  async deleteLookup(hash: string) {
    await this.lookupRepository.deleteLookup(hash);
  }

  @span
  async onSearchPageParsed(event: EventEntity<ParserPageParsedEventPayload>) {
    const { data, metadata } = event;
    const lookupHash = metadata?.correlationId;
    if (data.pageType !== PageType.Search || !lookupHash) {
      return;
    }
    logger.info({ event }, "Lookup search found");
    const bestMatch = data.data as SearchBestMatch;
    const albumData = await this.albumInteractor.getAlbum(data.fileName);
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

    await this.putLookup(lookupHash, putLookupPayload);

    if (!albumData) {
      logger.info({ event, albumData }, "Scheduling album for crawling");
      try {
        await this.crawlerInteractor.schedule({
          dedupeKey: `save:${lookupHash}`,
          fileName: data.data.fileName,
          priority: Priority.High,
          metadata: {
            correlationId: lookupHash,
          },
        });
      } catch (err) {
        logger.error({ err }, "Failed to schedule album for crawling");
      }
    }
  }
}
