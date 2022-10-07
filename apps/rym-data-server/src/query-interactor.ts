import { z } from "zod";
import { Filter } from "mongodb";
import { AlbumDocument } from "@lute/domain";
import { DataRepo } from "./data-repo";

export const albumQuerySchema = z.object({
  keys: z.array(z.string()).optional(),
  excludeKeys: z.array(z.string()).optional(),
  artists: z.array(z.string()).optional(),
  excludeArtists: z.array(z.string()).optional(),
  primaryGenres: z.array(z.string()).optional(),
  excludePrimaryGenres: z.array(z.string()).optional(),
  secondaryGenres: z.array(z.string()).optional(),
  descriptors: z.array(z.string()).optional(),
  minRating: z.number().optional(),
  maxRating: z.number().optional(),
});

type AlbumQuery = z.infer<typeof albumQuerySchema>;

const inNonEmptyArray = <T>(arr: T[] | undefined): arr is T[] =>
  arr !== undefined && arr.length > 0;

const buildDbAlbumQuery = (albumQuery: AlbumQuery): Filter<AlbumDocument> => {
  const query: Filter<AlbumDocument> = {};

  if (inNonEmptyArray(albumQuery.keys)) {
    (query as any).$or = [
      {
        fileName: { $in: albumQuery.keys },
      },
      {
        fileId: { $in: albumQuery.keys },
      },
    ];
  }

  if (inNonEmptyArray(albumQuery.excludeKeys)) {
    (query as any).$nor = [
      {
        fileName: { $in: albumQuery.excludeKeys },
      },
      {
        fileId: { $in: albumQuery.excludeKeys },
      },
    ];
  }

  if (inNonEmptyArray(albumQuery.artists)) {
    query["artists"] = { $in: albumQuery.artists };
  }

  if (inNonEmptyArray(albumQuery.excludeArtists)) {
    query["artists"] = { $nin: albumQuery.excludeArtists };
  }

  if (inNonEmptyArray(albumQuery.primaryGenres)) {
    query["primaryGenres"] = query["primaryGenres"] || {};
    (query["primaryGenres"] as any)["$in"] = albumQuery.primaryGenres;
  }

  if (inNonEmptyArray(albumQuery.excludePrimaryGenres)) {
    query["primaryGenres"] = query["primaryGenres"] || {};
    (query["primaryGenres"] as any)["$nin"] = albumQuery.excludePrimaryGenres;
  }

  if (inNonEmptyArray(albumQuery.secondaryGenres)) {
    query["secondaryGenres"] = { $in: albumQuery.secondaryGenres };
  }

  if (inNonEmptyArray(albumQuery.descriptors)) {
    query["descriptors"] = { $in: albumQuery.descriptors };
  }

  if (albumQuery.minRating) {
    query["rating"] = { $gte: albumQuery.minRating };
  }

  if (albumQuery.maxRating) {
    query["rating"] = { $lte: albumQuery.maxRating };
  }

  return query;
};

export const buildQueryInteractor = (repo: DataRepo) => ({
  async getAlbums(albumQuery: AlbumQuery) {
    const dbAlbumQuery = buildDbAlbumQuery(albumQuery);
    return repo.findAlbums(dbAlbumQuery);
  },
});
