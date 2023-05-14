import { Request, Router } from "express";
import { Controller, LuteExpressResponse as Response } from "../../../../lib";
import { VectorSimilarityInteractor } from "./vector-similarity-interactor";

export class VectorSimilarityController extends Controller {
  get router() {
    return Router()
      .get("/vector/album/*", this.mount(this.getAlbumVector))
      .get("/similar/album/*", this.mount(this.getSimilarAlbums));
  }

  async getAlbumVector(req: Request, res: Response) {
    const albumFileName = req.path.replace("/vector/album/", "");
    const album = await this.context.albumInteractor.getAlbum(albumFileName);
    if (!album) {
      return res.notFound();
    }

    const vector = await VectorSimilarityInteractor.encodeAlbum(album);

    return res.success({ vector });
  }

  async getSimilarAlbums(req: Request, res: Response) {
    const albumFileName = req.path.replace("/similar/album/", "");
    const album = await this.context.albumInteractor.getAlbum(albumFileName);
    if (!album) {
      return res.notFound();
    }

    const similarAlbums =
      await this.context.vectorSimilarityInteractor.getSimilarAlbums(album);

    return res.success({ similarAlbums });
  }
}
