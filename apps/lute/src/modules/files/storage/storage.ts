import { Multer } from "multer";

export interface FileStorageClient {
  multer: Multer;
  getFile: (name: string) => Promise<Buffer>;
  deleteFile: (name: string) => void;
  saveFile: (name: string, data: string) => void;
}
