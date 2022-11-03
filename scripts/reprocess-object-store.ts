import { S3 } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
import { pushToEventStream } from "./helpers";
import { buildRedisClient } from "../apps/lute/src/lib/db/redis";

const key = process.env.SPACES_KEY;
const secret = process.env.SPACES_SECRET;
const bucket = process.env.SPACES_BUCKET;
const redisUrl = process.env.REDIS_URL;

if (!key || !secret || !bucket || !redisUrl) {
  throw new Error("SPACES_KEY, SPACES_SECRET, and SPACES_BUCKET must be set");
}

const s3Client = new S3({
  endpoint: "https://nyc3.digitaloceanspaces.com",
  region: "us-east-1",
  credentials: {
    accessKeyId: key,
    secretAccessKey: secret,
  },
});

const getAlbumFileNames = async () => {
  const fileNames: string[] = [];
  let continuationToken: string | undefined;
  while (true) {
    const { Contents, NextContinuationToken } = await s3Client.listObjectsV2({
      Bucket: bucket,
      MaxKeys: 1000,
      Prefix: "artist/",
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
    if (!NextContinuationToken) {
      break;
    }
    continuationToken = NextContinuationToken;
  }
  return fileNames;
};

const take = <T>(arr: T[], n: number): T[] => {
  const result: T[] = [];
  for (let i = 0; i < n; i++) {
    result.push(arr[i]);
  }
  return result;
};

(async () => {
  const redisClient = await buildRedisClient({
    url: redisUrl,
  });
  const fileNames = await getAlbumFileNames();
  for (const fileName of fileNames) {
    await pushToEventStream(redisClient, {
      type: "file.saved",
      data: {
        fileId: nanoid(),
        fileName,
      },
      metadata: {
        source: "object-storage-redrive",
      },
    });
  }
  await redisClient.quit();
})();
