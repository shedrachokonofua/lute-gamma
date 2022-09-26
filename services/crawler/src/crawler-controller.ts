import { buildControllerFactory } from "@lute/shared";
import { CrawlerRepo, isCrawlerStatus } from "./crawler-repo";

export const buildCrawlerController = buildControllerFactory<{
  crawlerRepo: CrawlerRepo;
}>(({ crawlerRepo }) => ({
  async putStatus(req, res) {
    const { status } = req.body;
    if (!isCrawlerStatus(status)) {
      return res.status(400).json({ ok: false, error: "invalid status" });
    }
    await crawlerRepo.setStatus(status);
    return res.json({ ok: true });
  },
  async getStatus(_, res) {
    const status = await crawlerRepo.getStatus();
    return res.json({ ok: true, data: { status } });
  },
  async getHead(_, res) {
    const current = await crawlerRepo.peek();
    return res.json({ ok: true, data: { current } });
  },
  async schedule(req, res) {
    const { fileName, lookupId } = req.body;
    if (!fileName) {
      return res.status(400).json({ ok: false, error: "Invalid fileName" });
    }
    await crawlerRepo.schedule({ fileName, lookupId });
    return res.json({ ok: true });
  },
  async clearError(_, res) {
    await crawlerRepo.clearError();
    return res.json({ ok: true });
  },
  async getError(_, res) {
    const error = await crawlerRepo.getError();
    return res.json({ ok: true, data: { error } });
  },
  async getMonitor(_, res) {
    const status = await crawlerRepo.getStatus();
    const error = await crawlerRepo.getError();
    const current = await crawlerRepo.peek();
    const queueSize = await crawlerRepo.getQueueSize();

    return res.json({
      ok: true,
      data: {
        status,
        error,
        current,
        queueSize,
      },
    });
  },
}));
