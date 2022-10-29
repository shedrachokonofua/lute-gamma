import multer from "multer";
import fs from "fs/promises";
import { config } from "../../../config";
import { logger } from "../../../logger";
import { FileStorageClient } from "./storage";

const doesDirectoryExist = async (path: string) => {
  try {
    await fs.access(path);
    return (await fs.lstat(path)).isDirectory();
  } catch (err) {
    return false;
  }
};

const parseFileLocation = (
  name: string
): {
  directory: string;
  fileName: string;
} => {
  const parts = name.split("/");
  const fileName = parts[parts.length - 1];
  const directory = parts.slice(0, -1).join("/") + "/";
  return { directory, fileName };
};

export const diskStorage: FileStorageClient = {
  multer: multer({
    storage: multer.diskStorage({
      destination: async (req, _, cb) => {
        const { directory } = parseFileLocation(req.body.name);
        const targetPath = `${config.files.localBucketPath}/${directory}`;
        if (!(await doesDirectoryExist(targetPath))) {
          logger.debug({ targetPath }, "Creating directory");
          await fs.mkdir(targetPath, { recursive: true });
        }
        logger.debug({ targetPath }, "Using directory");
        cb(null, targetPath);
      },
      filename: function (req, _, cb) {
        const { fileName } = parseFileLocation(req.body.name);
        const fileNameOnDisk = `${fileName}.html`;
        logger.debug({ fileNameOnDisk }, "Using file name");
        cb(null, fileNameOnDisk);
      },
    }),
  }),
  getFile: async (name: string) => {
    const path = `${config.files.localBucketPath}/${name}.html`;
    logger.debug({ path }, "Getting file");
    return fs.readFile(path);
  },
  deleteFile: (name: string) => {
    const path = `${config.files.localBucketPath}/${name}.html`;
    logger.debug({ path }, "Deleting file");
    fs.unlink(path);
  },
};
