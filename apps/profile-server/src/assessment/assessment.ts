import { AlbumDocument } from "@lute/shared";
import * as ss from "simple-statistics";
import { z } from "zod";
import { Profile } from "../profile-repo";
import { rymDataClient } from "../utils";
import { AssessmentSettings } from "./assessment-settings";

interface Assessment {
  albumFileName: string;
  ratingQuantile: number;
  ratingCountQuantile: number;
  averagePrimaryGenreQuantile: number;
  averageSecondaryGenreQuantile?: number;
  averagePrimaryCrossGenreQuantile: number;
  averageSecondaryCrossGenreQuantile?: number;
  averageDescriptorQuantile: number;
  averageQuantile: number;
}

const assessableAlbumSchema = z
  .object({
    fileName: z.string(),
    rating: z.number(),
    ratingCount: z.number(),
    primaryGenres: z.array(z.string()).nonempty(),
    secondaryGenres: z.array(z.string()),
    descriptors: z.array(z.string()).nonempty(),
  })
  .passthrough();

type AssessableAlbum = z.infer<typeof assessableAlbumSchema>;

const itemAndCountSchema = z.object({
  item: z.string(),
  count: z.number(),
});

const assessableProfileDetailsSchema = z
  .object({
    artists: z.array(itemAndCountSchema),
    primaryGenres: z.array(itemAndCountSchema),
    secondaryGenres: z.array(itemAndCountSchema),
    descriptors: z.array(itemAndCountSchema),
  })
  .passthrough();

const assessableProfileSchema = z
  .object({
    albums: z.array(itemAndCountSchema).min(10),
    details: assessableProfileDetailsSchema,
    weightedProfileDetails: assessableProfileDetailsSchema,
  })
  .passthrough();

const repeat = (value: number, times: number) =>
  Array.from({ length: times }, () => value);

const flatCompact = <T>(arr: (T[] | undefined)[]) =>
  arr.reduce<T[]>((acc, val) => acc.concat(val || []), [] as T[]);

export const buildAssessment = async ({
  profile: inputProfile,
  album: inputAlbum,
  settings,
}: {
  profile: Profile;
  album: AlbumDocument;
  settings: AssessmentSettings;
}): Promise<Assessment> => {
  const profile = assessableProfileSchema.parse(inputProfile);
  const album = assessableAlbumSchema.parse(inputAlbum);

  const rawProfileAlbums = await rymDataClient.getAlbums(
    profile.albums.map((album) => album.item)
  );
  const profileAlbums = rawProfileAlbums.filter(
    (album) => assessableAlbumSchema.safeParse(album).success
  ) as unknown as AssessableAlbum[];

  const ratingQuantile = ss.quantileRank(
    profileAlbums.map((a) => a.rating),
    album.rating
  );

  const ratingCountQuantile = ss.quantileRank(
    profileAlbums.map((a) => a.ratingCount),
    album.ratingCount
  );

  const profileDetails = settings.useAlbumWeight
    ? profile.weightedProfileDetails
    : profile.details;

  const averagePrimaryGenreQuantile =
    ss.mean(
      album.primaryGenres.map((albumGenre) => {
        return ss.quantileRank(
          profileDetails.primaryGenres.map((a) => a.count),
          profileDetails.primaryGenres.find((g) => g.item === albumGenre)
            ?.count || 0
        );
      })
    ) || settings.noveltyFactor;

  const averageSecondaryGenreQuantile =
    album.secondaryGenres.length > 0
      ? ss.mean(
          album.secondaryGenres.map((albumGenre) => {
            return ss.quantileRank(
              profileDetails.secondaryGenres.map((a) => a.count),
              profileDetails.secondaryGenres.find((g) => g.item === albumGenre)
                ?.count || 0
            );
          })
        ) || settings.noveltyFactor
      : undefined;

  const averagePrimaryCrossGenreQuantile =
    ss.mean(
      album.primaryGenres.map((albumGenre) => {
        return ss.quantileRank(
          profileDetails.secondaryGenres.map((a) => a.count),
          profileDetails.secondaryGenres.find((g) => g.item === albumGenre)
            ?.count || 0
        );
      })
    ) || settings.noveltyFactor;

  const averageSecondaryCrossGenreQuantile =
    album.secondaryGenres.length > 0
      ? ss.mean(
          album.secondaryGenres.map((albumGenre) => {
            return ss.quantileRank(
              profileDetails.primaryGenres.map((a) => a.count),
              profileDetails.primaryGenres.find((g) => g.item === albumGenre)
                ?.count || 0
            );
          })
        ) || settings.noveltyFactor
      : undefined;

  const averageDescriptorQuantile =
    ss.mean(
      album.descriptors.map((descriptor) => {
        return ss.quantileRank(
          profileDetails.descriptors.map((a) => a.count),
          profileDetails.descriptors.find((d) => d.item === descriptor)
            ?.count || 0
        );
      })
    ) || settings.noveltyFactor;

  const averageQuantile = ss.mean(
    flatCompact([
      repeat(ratingQuantile, settings.parameterWeights.rating),
      repeat(ratingCountQuantile, settings.parameterWeights.ratingCount),
      repeat(
        averagePrimaryGenreQuantile,
        settings.parameterWeights.primaryGenres
      ),
      averageSecondaryGenreQuantile
        ? repeat(
            averageSecondaryGenreQuantile,
            settings.parameterWeights.secondaryGenres
          )
        : undefined,
      repeat(
        averagePrimaryCrossGenreQuantile,
        settings.parameterWeights.primaryCrossGenres
      ),
      averageSecondaryCrossGenreQuantile
        ? repeat(
            averageSecondaryCrossGenreQuantile,
            settings.parameterWeights.secondaryCrossGenres
          )
        : undefined,
      repeat(averageDescriptorQuantile, settings.parameterWeights.descriptors),
    ])
  );

  return {
    albumFileName: album.fileName,
    ratingQuantile,
    ratingCountQuantile,
    averagePrimaryGenreQuantile,
    averageSecondaryGenreQuantile,
    averagePrimaryCrossGenreQuantile,
    averageSecondaryCrossGenreQuantile,
    averageDescriptorQuantile,
    averageQuantile,
  };
};
