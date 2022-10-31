import { buildControllerFactory, extIsMhtml } from "../../lib";
import { logger } from "../../logger";
import { Context } from "../../context";

export const buildFileController = buildControllerFactory(
  ({ fileInteractor, fileStorageClient }: Context) => {
    return {
      async uploadFile(req, res) {
        if (!req.file || !req.body.name) {
          return res.status(400).json({ ok: false, error: "Invalid body" });
        }
        const { name, eventCorrelationId } = req.body;
        logger.info({ name }, "File saved to storage");

        const id = await fileInteractor.handleFileSave(
          name,
          eventCorrelationId
        );

        res.send({ ok: true, data: { id } });
      },
      async getDoesFileExist(req, res) {
        const name = (req.query.name as string) ?? "";

        if (!name) {
          return res.status(400).json({ ok: false, error: "Invalid request" });
        }

        const alternativeFileName = extIsMhtml(name)
          ? name.replace(".mhtml", "")
          : null;

        logger.info({ name, alternativeFileName }, "Checking if file exists");

        const fileId = await fileInteractor.getFileId(name);
        const alternativeFileId =
          alternativeFileName &&
          (await fileInteractor.getFileId(alternativeFileName));

        logger.info({ fileId, alternativeFileId }, "Got file ids");

        const exists = fileId !== null || alternativeFileId !== null;

        res.send({ ok: true, data: { exists } });
      },
      async getFile(req, res) {
        const fileId = req.params.id;

        if (!fileId) {
          return res.status(400).json({ ok: false, error: "Invalid request" });
        }

        const fileName = await fileInteractor.getFileName(fileId);

        if (!fileName) {
          return res.status(404).json({ ok: false, error: "Not found" });
        }

        res.send(await fileStorageClient.getFile(fileName));
      },
      async deleteFile(req, res) {
        const fileId = req.params.id;

        if (!fileId) {
          return res.status(400).json({ ok: false, error: "Invalid request" });
        }

        const fileName = await fileInteractor.getFileName(fileId);

        if (!fileName) {
          return res.status(404).json({ ok: false, error: "Not found" });
        }

        await fileStorageClient.deleteFile(fileName);
        await fileInteractor.handleFileDelete(fileId);

        res.send({ ok: true });
      },
    };
  }
);
