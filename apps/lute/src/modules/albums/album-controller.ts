import { Request, Router } from "express";
import { Controller, LuteExpressResponse as Response } from "../../lib";
import { albumQuerySchema } from "./album-query";

export class AlbumController extends Controller {
  private get albumInteractor() {
    return this.context.albumInteractor;
  }

  get router() {
    return Router()
      .put("/", this.mount(this.putAlbum))
      .get("/genres", this.mount(this.getGenres))
      .get("/*", this.mount(this.getAlbum))
      .post("/query", this.mount(this.query));
  }

  async putAlbum(req: Request, res: Response) {
    const album = await this.albumInteractor.putAlbum(req.body);
    return res.success(album);
  }

  async getAlbum(req: Request, res: Response) {
    const album = await this.albumInteractor.getAlbum(req.params[0]);
    if (!album) {
      return res.status(404).json({ ok: false, error: "Not found" });
    }
    return res.success(album);
  }

  async query(req: Request, res: Response) {
    const query = albumQuerySchema.parse(req.body);
    const albums = await this.albumInteractor.findAlbums(query);
    return res.success(albums);
  }

  async getGenres(req: Request, res: Response) {
    const genres = await this.albumInteractor.getGenres();
    return res.success(genres);
  }
}
