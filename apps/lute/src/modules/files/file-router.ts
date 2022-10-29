import { Router } from "express";
import { Context } from "../../context";
import { buildFileController } from "./file-controller";

export const buildFileRouter = (context: Context) => {
  const fileController = buildFileController(context);

  return Router()
    .post(
      "/",
      context.fileStorageClient.multer.single("file"),
      fileController.uploadFile
    )
    .get("/exists", fileController.getDoesFileExist)
    .get("/:id", fileController.getFile)
    .delete("/:id", fileController.deleteFile);
};
