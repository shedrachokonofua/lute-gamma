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

const getPathOnDisk = (name: string) =>
  `${config.files.localBucketPath}/${name}.html`;

const ensureDirectoryExists = async (name: string) => {
  const { directory } = parseFileLocation(name);
  const path = `${config.files.localBucketPath}/${directory}`;
  if (!(await doesDirectoryExist(path))) {
    await fs.mkdir(path, { recursive: true });
  }
  return path;
};

export const diskStorage: FileStorageClient = {
  multer: multer({
    storage: multer.diskStorage({
      destination: async (req, _, cb) => {
        const targetPath = await ensureDirectoryExists(req.body.name);
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
    const path = getPathOnDisk(name);
    logger.debug({ path }, "Getting file");
    return fs.readFile(path);
  },
  deleteFile: (name: string) => {
    const path = getPathOnDisk(name);
    logger.debug({ path }, "Deleting file");
    fs.unlink(path);
  },
  saveFile: async (name: string, data: string) => {
    await ensureDirectoryExists(name);
    const path = getPathOnDisk(name);
    logger.debug({ path }, "Saving file");
    await fs.writeFile(path, data);
  },
};
