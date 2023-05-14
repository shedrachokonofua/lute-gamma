import { FileMetadata, PageType } from "@lute/domain";
import {
  RedisClient,
  EventBus,
  FileSavedEventPayload,
  EventType,
} from "../../lib";
import { span } from "../../lib/decorators";
import { FileMetadataRepository } from "./file-metadata-repository";
import { FileStorageClient } from "./storage";
import { config } from "../../config";
import { isBefore, addDays } from "date-fns";

const pageTypeToTTLDays = {
  [PageType.Artist]: config.files.ttlDays.artist,
  [PageType.Album]: config.files.ttlDays.album,
  [PageType.Chart]: config.files.ttlDays.chart,
  [PageType.Search]: config.files.ttlDays.search,
};

export class FileInteractor {
  constructor(
    private redisClient: RedisClient,
    private eventBus: EventBus,
    private fileStorageClient: FileStorageClient,
    private fileMetadataRepository: FileMetadataRepository = new FileMetadataRepository(
      redisClient
    )
  ) {}

  async afterFileContentSaved(
    name: string,
    eventCorrelationId?: string
  ): Promise<FileMetadata> {
    const metadata = await this.fileMetadataRepository.upsert(name);

    await this.eventBus.publish<FileSavedEventPayload>({
      type: EventType.FileSaved,
      data: {
        fileId: metadata.id,
        fileName: metadata.name,
      },
      metadata: {
        correlationId: eventCorrelationId,
      },
    });

    return metadata;
  }

  async afterFileContentDeleted(name: string): Promise<void> {
    await this.fileMetadataRepository.delete(name);
  }

  @span
  async saveFile({
    name,
    data,
    eventCorrelationId,
  }: {
    name: string;
    data: string;
    eventCorrelationId?: string;
  }) {
    await this.fileStorageClient.saveFile(name, data);
    return this.afterFileContentSaved(name, eventCorrelationId);
  }

  @span
  async deleteFile(name: string) {
    await this.fileStorageClient.deleteFile(name);
    await this.afterFileContentDeleted(name);
  }

  @span
  async getFileContent(name: string): Promise<string | null> {
    const content = await this.fileStorageClient.getFile(name);
    return content?.toString() ?? null;
  }

  @span
  async getFileMetadata(fileName: string): Promise<FileMetadata | null> {
    return this.fileMetadataRepository.findByName(fileName);
  }

  async isFileStale(name: string): Promise<boolean> {
    const metadata = await this.fileMetadataRepository.findByName(name);
    if (!metadata) return false;

    const ttlDays = pageTypeToTTLDays[metadata.pageType];

    return isBefore(
      new Date(),
      addDays(new Date(metadata.lastSavedAt), ttlDays)
    );
  }
}
