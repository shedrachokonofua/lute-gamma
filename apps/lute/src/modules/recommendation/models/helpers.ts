import {
  AlbumAssessment,
  AlbumDocument,
  AlbumRecommendation,
  ArtistAssessment,
  ArtistDocument,
  ArtistRecommendation,
} from "@lute/domain";
import { logger } from "../../../logger";

export const repeat = (value: number, times: number) =>
  Array.from({ length: times }, () => value);

export const flatCompact = <T>(arr: (T[] | undefined)[]) =>
  arr.reduce<T[]>((acc, val) => acc.concat(val || []), [] as T[]);

export type MaybePromise<T> = T | Promise<T>;

export const getAlbumRecommendations = async ({
  albums,
  count,
  getAssessment,
}: {
  albums: AlbumDocument[];
  count: number;
  getAssessment: (item: AlbumDocument) => MaybePromise<AlbumAssessment>;
}): Promise<AlbumRecommendation[]> => {
  const results = await Promise.all(
    albums.map(async (album) => {
      try {
        return {
          album,
          assessment: await getAssessment(album),
        };
      } catch (error) {
        logger.error({ albumId: album.fileName }, "Failed to assess album");
        return undefined;
      }
    })
  );

  return results
    .filter((r): r is AlbumRecommendation => !!r)
    .sort((a, b) => b.assessment.score - a.assessment.score)
    .slice(0, count);
};

export const getArtistRecommendations = async ({
  artists,
  count,
  getAssessment,
}: {
  artists: ArtistDocument[];
  count: number;
  getAssessment: (item: ArtistDocument) => MaybePromise<ArtistAssessment>;
}): Promise<ArtistRecommendation[]> => {
  const results = await Promise.all(
    artists.map(async (artist) => {
      try {
        return {
          artist,
          assessment: await getAssessment(artist),
        };
      } catch (error) {
        logger.error({ artistId: artist.fileName }, "Failed to assess artist");
        return undefined;
      }
    })
  );

  return results
    .filter((r): r is ArtistRecommendation => !!r)
    .sort((a, b) => b.assessment.score - a.assessment.score)
    .slice(0, count);
};
