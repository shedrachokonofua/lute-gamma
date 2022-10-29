import { S3 } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import streamConsumers from "stream/consumers";
import { config } from "../../../config";
import { logger } from "../../../logger";
import { FileStorageClient } from "./storage";

const s3Client = new S3({
  endpoint: "https://nyc3.digitaloceanspaces.com",
  region: "us-east-1",
  credentials: {
    accessKeyId: config.spaces.key,
    secretAccessKey: config.spaces.secret,
  },
});

const dropBackslash = (str: string) =>
  str.endsWith("/") ? str.slice(0, -1) : str;

export const spacesStorage: FileStorageClient = {
  multer: multer({
    storage: multerS3({
      s3: s3Client,
      bucket: config.spaces.bucket,
      key: function (req, file, cb) {
        const name = dropBackslash((req as any).body.name);
        logger.info({ name }, "Storing file in spaces");
        cb(null, dropBackslash((req as any).body.name));
      },
    }),
  }),
  getFile: async (name: string) => {
    const { Body } = await s3Client.getObject({
      Bucket: config.spaces.bucket,
      Key: name,
    });

    if (!Body) {
      throw new Error("Not found");
    }

    return streamConsumers.buffer(Body as any);
  },
  deleteFile: async (name: string) => {
    await s3Client.deleteObject({
      Bucket: config.spaces.bucket,
      Key: name,
    });
  },
};
