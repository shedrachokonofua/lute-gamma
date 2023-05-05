import { Controller, LuteExpressResponse as Response } from "../../lib";
import { logger } from "../../logger";
import { Request, Router } from "express";

export class FileController extends Controller {
  private get fileInteractor() {
    return this.context.fileInteractor;
  }

  private get fileStorageClient() {
    return this.context.fileStorageClient;
  }

  get router() {
    return Router()
      .post(
        "/",
        this.fileStorageClient.multer.single("file"),
        this.mount(this.uploadFile)
      )
      .get("/exists", this.mount(this.getIsFileStale))
      .get("/*", this.mount(this.getFile))
      .delete("/*", this.mount(this.deleteFile));
  }

  async uploadFile(req: Request, res: Response) {
    if (!req.file || !req.body.name) {
      return res.badRequest("Invalid body");
    }
    const { name, eventCorrelationId } = req.body;
    logger.info({ name }, "File saved to storage");

    const metadata = await this.fileInteractor.afterFileContentSaved(
      name,
      eventCorrelationId
    );

    res.success({ metadata });
  }

  async getIsFileStale(req: Request, res: Response) {
    const name = (req.query.name as string) ?? "";

    if (!name) {
      return res.badRequest("Invalid request");
    }

    const exists = await this.fileInteractor.isFileStale(name);

    res.success({ exists });
  }

  async getFile(req: Request, res: Response) {
    const fileName = req.path;

    if (!fileName) {
      return res.badRequest("Invalid request");
    }

    const file = await this.fileStorageClient.getFile(fileName);

    if (!file) {
      return res.notFound();
    }

    res.send(file);
  }

  async deleteFile(req: Request, res: Response) {
    const fileName = req.path;

    if (!fileName) {
      return res.badRequest("Invalid request");
    }

    await this.fileStorageClient.deleteFile(fileName);
    await this.fileInteractor.afterFileContentDeleted(fileName);

    res.success();
  }
}
