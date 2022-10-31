import { AlbumDocument, PutAlbumPayload } from "@lute/domain";
import { MongoClient } from "mongodb";
import { AlbumSavedEventPayload, EventBus, EventType } from "../../lib";
import { AlbumQuery, buildDbAlbumQuery } from "./album-query";
import { buildAlbumRepo } from "./album-repo";

export const buildAlbumInteractor = ({
  eventBus,
  mongoClient,
}: {
  eventBus: EventBus;
  mongoClient: MongoClient;
}) => {
  const albumRepo = buildAlbumRepo(mongoClient);

  return {
    async putAlbum(
      album: PutAlbumPayload,
      eventCorrelationId?: string
    ): Promise<AlbumDocument> {
      const data = await albumRepo.putAlbum(album);
      await eventBus.publish<AlbumSavedEventPayload>({
        data: {
          album: data,
        },
        type: EventType.AlbumSaved,
        metadata: {
          correlationId: eventCorrelationId,
        },
      });
      return data;
    },
    async getAlbum(key: string): Promise<AlbumDocument | null> {
      return albumRepo.getAlbum(key);
    },
    async findAlbums(query: AlbumQuery): Promise<AlbumDocument[]> {
      return albumRepo.findAlbums(buildDbAlbumQuery(query));
    },
    async createAlbumIfNotExists(album: PutAlbumPayload): Promise<void> {
      return albumRepo.createAlbumIfNotExists(album);
    },
    async getGenres(): Promise<string[]> {
      return albumRepo.getGenres();
    },
  };
};

export type AlbumInteractor = ReturnType<typeof buildAlbumInteractor>;
