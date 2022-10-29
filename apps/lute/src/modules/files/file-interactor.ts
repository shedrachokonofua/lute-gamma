import { buildFileRepo } from "./file-repo";
import { LuteEventClient, LuteEvent, RedisClient } from "@lute/shared";

export const buildFileInteractor = ({
  redisClient,
  eventClient,
}: {
  redisClient: RedisClient;
  eventClient: LuteEventClient;
}) => {
  const fileRepo = buildFileRepo(redisClient);

  return {
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
  };
};
