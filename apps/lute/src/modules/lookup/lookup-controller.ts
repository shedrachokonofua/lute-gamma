import { Controller, LuteExpressResponse as Response } from "../../lib";
import { Request, Router } from "express";

export class LookupController extends Controller {
  private get lookupInteractor() {
    return this.context.lookupInteractor;
  }

  get router() {
    return Router()
      .get("/", this.mount(this.getOrCreateLookup))
      .put("/:hash", this.mount(this.putLookup))
      .get("/:hash", this.mount(this.getLookupByHash))
      .delete("/:hash", this.mount(this.deleteLookup));
  }

  async getLookupByHash(req: Request, res: Response) {
    const { hash } = req.params;
    const lookup = await this.lookupInteractor.getLookupByHash(hash);
    return res.success(lookup);
  }

  async putLookup(req: Request, res: Response) {
    const { hash } = req.params;
    const lookup = await this.lookupInteractor.putLookup(hash, req.body);
    return res.success(lookup);
  }

  async getOrCreateLookup(req: Request, res: Response) {
    const { artist, album } = req.query;
    if (!artist || !album) {
      return res.badRequest("Missing artist or album query param");
    }
    const key = {
      artist: artist as string,
      album: album as string,
    };
    const lookup = await this.lookupInteractor.getOrCreateLookup(key);
    return res.success(lookup);
  }

  async deleteLookup(req: Request, res: Response) {
    const { hash } = req.params;
    await this.lookupInteractor.deleteLookup(hash);
    return res.success();
  }
}
