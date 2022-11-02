import {
  RedisClient,
  EventBus,
  FileSavedEventPayload,
  EventType,
  extIsMhtml,
} from "../../lib";
import { logger } from "../../logger";
import { buildFileRepo } from "./file-repo";
import { FileStorageClient } from "./storage";

export const buildFileInteractor = ({
  redisClient,
  eventBus,
  fileStorageClient,
}: {
  redisClient: RedisClient;
  eventBus: EventBus;
  fileStorageClient: FileStorageClient;
}) => {
  const fileRepo = buildFileRepo(redisClient);

  const interactor = {
    async handleFileSave(
      name: string,
      eventCorrelationId?: string
    ): Promise<string> {
      const id = await fileRepo.saveFileName(name);
      await eventBus.publish<FileSavedEventPayload>({
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
    },
    async getFileId(name: string): Promise<string | null> {
      return fileRepo.getFileId(name);
    },
    async getFileName(id: string): Promise<string | null> {
      const name = await fileRepo.getFileName(id);
      if (!name) {
        return null;
      }
      return name;
    },
    async handleFileDelete(id: string): Promise<void> {
      const name = await fileRepo.getFileName(id);
      if (!name) {
        return;
      }
      await fileRepo.deleteFile(id);
    },
    async saveFile({
      name,
      data,
      eventCorrelationId,
    }: {
      name: string;
      data: string;
      eventCorrelationId?: string;
    }) {
      await fileStorageClient.saveFile(name, data);
      return interactor.handleFileSave(name, eventCorrelationId);
    },
    async deleteFile(name: string) {
      await fileStorageClient.deleteFile(name);
      const id = await fileRepo.getFileId(name);
      if (!id) {
        return;
      }
      await fileRepo.deleteFile(id);
    },
    async getFileContent(name: string): Promise<string | null> {
      const content = await fileStorageClient.getFile(name);
      if (!content) return null;
      return content.toString();
    },
    async getDoesFileExist(name: string): Promise<boolean> {
      const alternativeFileName = extIsMhtml(name)
        ? name.replace(".mhtml", "")
        : null;

      logger.info({ name, alternativeFileName }, "Checking if file exists");

      const fileId = await interactor.getFileId(name);
      const alternativeFileId =
        alternativeFileName &&
        (await interactor.getFileId(alternativeFileName));

      logger.info({ fileId, alternativeFileId }, "Got file ids");

      const exists = fileId !== null || alternativeFileId !== null;
      return exists;
    },
  };

  return interactor;
};

export type FileInteractor = ReturnType<typeof buildFileInteractor>;
