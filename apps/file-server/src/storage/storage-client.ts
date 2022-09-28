import { ENV } from "../config";
import { diskStorage } from "./disk-storage";
import { spacesStorage } from "./spaces-storage";
import { FileStorageClient } from "./storage";
import { logger } from "../logger";

export const buildFileStorageClient = (): FileStorageClient => {
  if (ENV === "production") {
    logger.info("Using spaces storage");
    return spacesStorage;
  } else {
    logger.info("Using disk storage");
    return diskStorage;
  }
};
