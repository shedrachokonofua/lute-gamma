import { Controller, LuteExpressResponse as Response } from "../../lib";
import { isCrawlerStatus } from "./crawler-repository";
import { Priority } from "./priority-queue";
import { Request, Router } from "express";

export class CrawlerController extends Controller {
  private get crawlerInteractor() {
    return this.context.crawlerInteractor;
  }

  get router() {
    return Router()
      .get("/monitor", this.mount(this.getMonitor))
      .put("/status", this.mount(this.putStatus))
      .get("/status", this.mount(this.getStatus))
      .get("/head", this.mount(this.getHead))
      .post("/schedule", this.mount(this.schedule))
      .delete("/error", this.mount(this.clearError))
      .get("/error", this.mount(this.getError))
      .post("/empty", this.mount(this.empty))
      .post("/reset-quota", this.mount(this.resetQuota));
  }

  async putStatus(req: Request, res: Response) {
    const { status } = req.body;
    if (!isCrawlerStatus(status)) {
      return res.badRequest("Invalid status");
    }

    await this.crawlerInteractor.setStatus(status);
    return res.success();
  }

  async getStatus(_: Request, res: Response) {
    const status = await this.crawlerInteractor.getStatus();
    return res.success({ status });
  }

  async getHead(_: Request, res: Response) {
    const current = await this.crawlerInteractor.peek();
    return res.success({ current });
  }

  async schedule(req: Request, res: Response) {
    const { fileName } = req.body;
    if (!fileName) {
      return res.badRequest("Missing fileName");
    }

    await this.crawlerInteractor.schedule({
      fileName,
      dedupeKey: Date.now().toString(), // Don't dedupe
      priority: Priority.Express,
    });
    return res.success();
  }

  async clearError(_: Request, res: Response) {
    await this.crawlerInteractor.clearError();
    return res.success();
  }

  async getError(_: Request, res: Response) {
    const error = await this.crawlerInteractor.getError();
    return res.success({ error });
  }

  async getMonitor(_: Request, res: Response) {
    return res.success(await this.crawlerInteractor.getMonitor());
  }

  async empty(_: Request, res: Response) {
    await this.crawlerInteractor.emptyQueue();
    return res.success();
  }

  async resetQuota(_: Request, res: Response) {
    await this.crawlerInteractor.resetQuota();
    return res.success();
  }
}
