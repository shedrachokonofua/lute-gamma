import { z } from "zod";
import { Filter } from "mongodb";
import { ArtistDocument, inNonEmptyArray } from "@lute/domain";

export const artistQuerySchema = z.object({
  keys: z.array(z.string()).optional(),
  excludeKeys: z.array(z.string()).optional(),
  primaryGenres: z.array(z.string()).optional(),
  excludePrimaryGenres: z.array(z.string()).optional(),
  secondaryGenres: z.array(z.string()).optional(),
  descriptors: z.array(z.string()).optional(),
});

export type ArtistQuery = z.infer<typeof artistQuerySchema>;

export const buildDbArtistQuery = (
  artistQuery: ArtistQuery
): Filter<ArtistDocument> => {
  const query: Filter<ArtistDocument> = {};

  if (inNonEmptyArray(artistQuery.keys)) {
    (query as any).$or = [
      {
        fileName: { $in: artistQuery.keys },
      },
      {
        fileId: { $in: artistQuery.keys },
      },
    ];
  }

  if (inNonEmptyArray(artistQuery.excludeKeys)) {
    (query as any).$nor = [
      {
        fileName: { $in: artistQuery.excludeKeys },
      },
      {
        fileId: { $in: artistQuery.excludeKeys },
      },
    ];
  }

  if (inNonEmptyArray(artistQuery.primaryGenres)) {
    query["primaryGenres"] = query["primaryGenres"] || {};
    (query["primaryGenres"] as any)["$in"] = artistQuery.primaryGenres;
  }

  if (inNonEmptyArray(artistQuery.excludePrimaryGenres)) {
    query["primaryGenres"] = query["primaryGenres"] || {};
    (query["primaryGenres"] as any)["$nin"] = artistQuery.excludePrimaryGenres;
  }

  if (inNonEmptyArray(artistQuery.secondaryGenres)) {
    query["secondaryGenres"] = query["secondaryGenres"] || {};
    (query["secondaryGenres"] as any)["$in"] = artistQuery.secondaryGenres;
  }

  if (inNonEmptyArray(artistQuery.descriptors)) {
    query["descriptors"] = query["descriptors"] || {};
    (query["descriptors"] as any)["$in"] = artistQuery.descriptors;
  }

  return query;
};
