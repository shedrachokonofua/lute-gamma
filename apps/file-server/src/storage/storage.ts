import { Multer } from "multer";

export interface FileStorageClient {
  multer: Multer;
  getFile: (name: string) => Promise<Buffer>;
  deleteFile: (name: string) => void;
}
