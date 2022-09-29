import { AlbumDocument } from "@lute/shared";
import * as ss from "simple-statistics";
import { z } from "zod";
import { Profile } from "./profile-repo";
import { rymDataClient } from "./utils";

interface Assessment {
  albumFileName: string;
  ratingQuantile: number;
  averagePrimaryGenreQuantile: number;
  averageSecondaryGenreQuantile: number;
  averagePrimaryCrossGenreQuantile: number;
  averageSecondaryCrossGenreQuantile: number;
  averageDescriptorQuantile: number;
  averageQuantile: number;
}

const assessableAlbumSchema = z
  .object({
    fileName: z.string(),
    rating: z.number(),
    primaryGenres: z.array(z.string()).nonempty(),
    secondaryGenres: z.array(z.string()).nonempty(),
    descriptors: z.array(z.string()).nonempty(),
  })
  .passthrough();

type AssessableAlbum = z.infer<typeof assessableAlbumSchema>;

const itemAndCountSchema = z.object({
  item: z.string(),
  count: z.number(),
});

const assessableProfileSchema = z
  .object({
    albums: z.array(itemAndCountSchema).min(10),
    weightedProfileDetails: z
      .object({
        artists: z.array(itemAndCountSchema),
        primaryGenres: z.array(itemAndCountSchema),
        secondaryGenres: z.array(itemAndCountSchema),
        descriptors: z.array(itemAndCountSchema),
      })
      .passthrough(),
  })
  .passthrough();

export const buildAssessment = async ({
  profile: inputProfile,
  album: inputAlbum,
}: {
  profile: Profile;
  album: AlbumDocument;
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

  const averagePrimaryGenreQuantile = ss.mean(
    album.primaryGenres.map((albumGenre) => {
      return ss.quantileRank(
        profile.weightedProfileDetails.primaryGenres.map((a) => a.count),
        profile.weightedProfileDetails.primaryGenres.find(
          (g) => g.item === albumGenre
        )?.count || 0
      );
    })
  );

  const averageSecondaryGenreQuantile = ss.mean(
    album.secondaryGenres.map((albumGenre) => {
      return ss.quantileRank(
        profile.weightedProfileDetails.secondaryGenres.map((a) => a.count),
        profile.weightedProfileDetails.secondaryGenres.find(
          (g) => g.item === albumGenre
        )?.count || 0
      );
    })
  );

  const averagePrimaryCrossGenreQuantile = ss.mean(
    album.primaryGenres.map((albumGenre) => {
      return ss.quantileRank(
        profile.weightedProfileDetails.secondaryGenres.map((a) => a.count),
        profile.weightedProfileDetails.secondaryGenres.find(
          (g) => g.item === albumGenre
        )?.count || 0
      );
    })
  );

  const averageSecondaryCrossGenreQuantile = ss.mean(
    album.secondaryGenres.map((albumGenre) => {
      return ss.quantileRank(
        profile.weightedProfileDetails.primaryGenres.map((a) => a.count),
        profile.weightedProfileDetails.primaryGenres.find(
          (g) => g.item === albumGenre
        )?.count || 0
      );
    })
  );

  const averageDescriptorQuantile = ss.mean(
    album.descriptors.map((descriptor) => {
      return ss.quantileRank(
        profile.weightedProfileDetails.descriptors.map((a) => a.count),
        profile.weightedProfileDetails.descriptors.find(
          (d) => d.item === descriptor
        )?.count || 0
      );
    })
  );

  const averageQuantile = ss.mean([
    ratingQuantile,
    averagePrimaryGenreQuantile,
    averageSecondaryGenreQuantile,
    averagePrimaryCrossGenreQuantile,
    averageSecondaryCrossGenreQuantile,
    averageDescriptorQuantile,
  ]);

  return {
    albumFileName: album.fileName,
    ratingQuantile,
    averagePrimaryGenreQuantile,
    averageSecondaryGenreQuantile,
    averagePrimaryCrossGenreQuantile,
    averageSecondaryCrossGenreQuantile,
    averageDescriptorQuantile,
    averageQuantile,
  };
};
