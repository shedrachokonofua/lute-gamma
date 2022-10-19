import { AlbumDocument, PutAlbumPayload } from "@lute/domain";
import { AlbumQuery, buildDbAlbumQuery } from "./album-query";
import { AlbumRepo } from "./album-repo";

export const buildAlbumInteractor = (albumRepo: AlbumRepo) => ({
  async putAlbum(album: PutAlbumPayload): Promise<AlbumDocument> {
    return albumRepo.putAlbum(album);
  },
  async getAlbum(key: string): Promise<AlbumDocument | null> {
    return albumRepo.getAlbum(key);
  },
  async findAlbums(query: AlbumQuery): Promise<AlbumDocument[]> {
    return albumRepo.findAlbums(buildDbAlbumQuery(query));
  },
  async createAlbumIfNotExists(album: PutAlbumPayload): Promise<void> {
    return albumRepo.createAlbumIfNotExists(album);
  },
});

export type AlbumInteractor = ReturnType<typeof buildAlbumInteractor>;
