import { runScript } from "./helpers";
import { config } from "../apps/lute/src/config";
import { s3Client } from "../apps/lute/src/modules/files";
import { Context } from "../apps/lute/src/context";
import { logger } from "../apps/lute/src/logger";

const getAlbumFileNames = async () => {
  const fileNames: string[] = [];
  let continuationToken: string | undefined;
  while (true) {
    const { Contents, NextContinuationToken } = await s3Client.listObjectsV2({
      Bucket: config.spaces.bucket,
      MaxKeys: 1000,
      Prefix: "release/",
      ContinuationToken: continuationToken,
    });
    if (!Contents) {
      break;
    }
    for (const { Key } of Contents) {
      if (Key) {
        fileNames.push(Key);
      }
    }
    logger.info({ count: fileNames.length }, "Total album files found");
    if (!NextContinuationToken) {
      break;
    }
    continuationToken = NextContinuationToken;
  }
  return fileNames;
};

runScript(async (context: Context) => {
  const fileNames = await getAlbumFileNames();
  for (const fileName of fileNames) {
    try {
      await context.fileInteractor.afterFileContentSaved(fileName);
    } catch (error) {
      logger.error({ error, fileName }, "Failed to reprocess file");
    }
  }
});
