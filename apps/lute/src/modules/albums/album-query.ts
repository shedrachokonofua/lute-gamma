import { z } from "zod";
import { Filter } from "mongodb";
import { AlbumDocument, inNonEmptyArray } from "@lute/domain";

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

export type AlbumQuery = z.infer<typeof albumQuerySchema>;

export const buildDbAlbumQuery = (
  albumQuery: AlbumQuery
): Filter<AlbumDocument> => {
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
    (query as any)["artists.name"] = (query as any)["artists.name"] || {};
    (query as any)["artists.name"]["$in"] = albumQuery.artists;
  }

  if (inNonEmptyArray(albumQuery.excludeArtists)) {
    (query as any)["artists.name"] = (query as any)["artists.name"] || {};
    (query as any)["artists.name"]["$nin"] = albumQuery.excludeArtists;
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
