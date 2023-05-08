import { AlbumDocument, PutAlbumPayload } from "@lute/domain";
import { MongoClient } from "mongodb";
import { AlbumSavedEventPayload, EventBus, EventType } from "../../lib";
import { AlbumQuery, buildDbAlbumQuery } from "./album-query";
import { AlbumRepository } from "./album-repository";

export class AlbumInteractor {
  private eventBus: EventBus;
  private albumRepository: AlbumRepository;

  private constructor(eventBus: EventBus, albumRepository: AlbumRepository) {
    this.eventBus = eventBus;
    this.albumRepository = albumRepository;
  }

  static async create(eventBus: EventBus, mongoClient: MongoClient) {
    return new AlbumInteractor(
      eventBus,
      await AlbumRepository.createWithIndexes(mongoClient)
    );
  }

  async putAlbum(
    album: PutAlbumPayload,
    eventCorrelationId?: string
  ): Promise<AlbumDocument> {
    const data = await this.albumRepository.putAlbum(album);
    await this.eventBus.publish<AlbumSavedEventPayload>({
      data: {
        album: data,
      },
      type: EventType.AlbumSaved,
      metadata: {
        correlationId: eventCorrelationId,
      },
    });
    return data;
  }

  async getAlbum(key: string): Promise<AlbumDocument | null> {
    return this.albumRepository.getAlbum(key);
  }

  async findAlbums(query: AlbumQuery): Promise<AlbumDocument[]> {
    return this.albumRepository.findAlbums(buildDbAlbumQuery(query));
  }

  async createAlbumIfNotExists(album: PutAlbumPayload): Promise<void> {
    return this.albumRepository.createAlbumIfNotExists(album);
  }

  async getGenres(): Promise<string[]> {
    return this.albumRepository.getGenres();
  }
}
