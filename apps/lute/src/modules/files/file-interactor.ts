import {
  RedisClient,
  EventBus,
  FileSavedEventPayload,
  EventType,
  extIsMhtml,
} from "../../lib";
import { span } from "../../lib/decorators";
import { logger } from "../../logger";
import { FileRepo, buildFileRepo } from "./file-repo";
import { FileStorageClient } from "./storage";

export class FileInteractor {
  private fileRepo: FileRepo;

  constructor(
    private redisClient: RedisClient,
    private eventBus: EventBus,
    private fileStorageClient: FileStorageClient
  ) {
    this.fileRepo = buildFileRepo(redisClient);
  }

  async handleFileSave(
    name: string,
    eventCorrelationId?: string
  ): Promise<string> {
    const id = await this.fileRepo.saveFileName(name);
    await this.eventBus.publish<FileSavedEventPayload>({
      type: EventType.FileSaved,
      data: {
        fileId: id,
        fileName: name,
      },
      metadata: {
        correlationId: eventCorrelationId,
      },
    });
    return id;
  }

  async getFileId(name: string): Promise<string | null> {
    return this.fileRepo.getFileId(name);
  }

  async getFileName(id: string): Promise<string | null> {
    const name = await this.fileRepo.getFileName(id);
    if (!name) {
      return null;
    }
    return name;
  }

  async handleFileDelete(id: string): Promise<void> {
    const name = await this.fileRepo.getFileName(id);
    if (!name) {
      return;
    }
    await this.fileRepo.deleteFile(id);
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
    return this.handleFileSave(name, eventCorrelationId);
  }

  async deleteFile(name: string) {
    await this.fileStorageClient.deleteFile(name);
    const id = await this.fileRepo.getFileId(name);
    if (!id) {
      return;
    }
    await this.fileRepo.deleteFile(id);
  }

  async getFileContent(name: string): Promise<string | null> {
    const content = await this.fileStorageClient.getFile(name);
    if (!content) return null;
    return content.toString();
  }

  async getDoesFileExist(name: string): Promise<boolean> {
    const alternativeFileName = extIsMhtml(name)
      ? name.replace(".mhtml", "")
      : null;

    logger.info({ name, alternativeFileName }, "Checking if file exists");

    const fileId = await this.getFileId(name);
    const alternativeFileId =
      alternativeFileName && (await this.getFileId(alternativeFileName));

    logger.info({ fileId, alternativeFileId }, "Got file ids");

    const exists = fileId !== null || alternativeFileId !== null;
    return exists;
  }
}
