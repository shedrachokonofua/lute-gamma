import { buildFileRepo } from "./file-repo";
import { LuteEventClient, LuteEvent, RedisClient } from "@lute/shared";
import { FileStorageClient } from "./storage";

export const buildFileInteractor = ({
  redisClient,
  eventClient,
  fileStorageClient,
}: {
  redisClient: RedisClient;
  eventClient: LuteEventClient;
  fileStorageClient: FileStorageClient;
}) => {
  const fileRepo = buildFileRepo(redisClient);

  const interactor = {
    async handleFileSave(name: string, lookupId?: string): Promise<string> {
      const id = await fileRepo.saveFileName(name);
      eventClient.publish(LuteEvent.FileSaved, {
        fileId: id,
        fileName: name,
        lookupId,
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
      lookupId,
    }: {
      name: string;
      data: string;
      lookupId?: string;
    }) {
      await fileStorageClient.saveFile(name, data);
      return interactor.handleFileSave(name, lookupId);
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
  };

  return interactor;
};
