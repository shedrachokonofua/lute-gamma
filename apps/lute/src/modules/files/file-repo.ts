import { nanoid } from "nanoid";
import { RedisClient, getPageTypeFromFileName } from "../../lib";
import { config } from "../../config";
import { logger } from "../../logger";
import { PageType } from "@lute/domain";

const daysToSeconds = (days: number): number => days * 24 * 60 * 60;

const getFileTTLDays = (fileName: string): number => {
  switch (getPageTypeFromFileName(fileName)) {
    case PageType.Artist:
      return config.files.ttlDays.artist;
    case PageType.Album:
      return config.files.ttlDays.album;
    case PageType.Chart:
      return config.files.ttlDays.chart;
    case PageType.Search:
      return config.files.ttlDays.search;
    default:
      return 1;
  }
};

export const buildFileRepo = (redisClient: RedisClient) => ({
  async saveFileName(name: string) {
    const id = nanoid();
    await redisClient.set(`file:${id}`, name);
    await redisClient.set(`file:name:${name}`, id, {
      EX: daysToSeconds(getFileTTLDays(name)),
    });
    logger.info({ id, name }, "Saved file name");

    return id;
  },

  async getFileName(id: string) {
    return redisClient.get(`file:${id}`);
  },

  async getFileId(name: string) {
    return redisClient.get(`file:name:${name}`);
  },

  async deleteFile(id: string) {
    const name = await redisClient.get(`file:${id}`);
    if (!name) {
      return;
    }
    await redisClient.del(`file:${id}`);
    await redisClient.del(`file:name:${name}`);
    logger.info({ id, name }, "Deleted file name");
  },
});
