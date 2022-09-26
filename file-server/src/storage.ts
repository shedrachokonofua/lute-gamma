import multer from "multer";
import fs from "fs/promises";
import { LOCAL_BUCKET_PATH, PORT } from "./config";
import { logger } from "./logger";

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

export const multerStorage = multer({
  storage: multer.diskStorage({
    destination: async (req, _, cb) => {
      const { directory } = parseFileLocation(req.body.name);
      const targetPath = `${LOCAL_BUCKET_PATH}/${directory}`;
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
});

export const getFile = async (name: string) => {
  const path = `${LOCAL_BUCKET_PATH}/${name}.html`;
  logger.debug({ path }, "Getting file");
  return fs.readFile(path);
};

export const deleteFile = (name: string) => {
  const path = `${LOCAL_BUCKET_PATH}/${name}.html`;
  logger.debug({ path }, "Deleting file");
  fs.unlink(path);
};
