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

const buildDbAlbumQuery = (albumQuery: AlbumQuery): Filter<AlbumDocument> => {
  const query: Filter<AlbumDocument> = {};

  if (albumQuery.keys) {
    (query as any).$or = [
      {
        fileName: { $in: albumQuery.keys },
      },
      {
        fileId: { $in: albumQuery.keys },
      },
    ];
  }

  if (albumQuery.excludeKeys) {
    (query as any).$nor = [
      {
        fileName: { $in: albumQuery.excludeKeys },
      },
      {
        fileId: { $in: albumQuery.excludeKeys },
      },
    ];
  }

  if (albumQuery.artists) {
    query["artists"] = { $in: albumQuery.artists };
  }

  if (albumQuery.excludeArtists) {
    query["artists"] = { $nin: albumQuery.excludeArtists };
  }

  if (albumQuery.primaryGenres) {
    query["primaryGenres"] = { $in: albumQuery.primaryGenres };
  }

  if (albumQuery.excludePrimaryGenres) {
    query["primaryGenres"] = { $nin: albumQuery.excludePrimaryGenres };
  }

  if (albumQuery.secondaryGenres) {
    query["secondaryGenres"] = { $in: albumQuery.secondaryGenres };
  }

  if (albumQuery.descriptors) {
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
