import {
  AddAlbumToProfilePayload,
  ProfileDetails,
  ProfileRepo,
  ProfileSummary,
} from "./profile-repo";
import { rymDataClient } from "./utils";
import { startOfDecade } from "date-fns";
import { logger } from "./logger";
import {
  Assessment,
  AssessmentSettings,
  buildAssessment,
  buildAssessmentContext,
} from "./assessment";
import { RecommendationSettings } from "./recommendation";

export const buildProfileInteractor = ({
  profileRepo,
}: {
  profileRepo: ProfileRepo;
}) => {
  const interactor = {
    async getProfile(id: string) {
      const profileDocument = await profileRepo.getProfile(id);
      if (!profileDocument) {
        return null;
      }
      const albumDocuments = await rymDataClient.queryAlbums({
        keys: profileDocument.albums.map((album) => album.item),
      });
      const trackCountByAlbumFileName = profileDocument.albums.reduce<
        Record<string, number>
      >((acc, album) => {
        acc[album.item] = album.count;
        return acc;
      }, {});
      const profileDetailsMaps = {
        artists: {},
        primaryGenres: {},
        secondaryGenres: {},
        descriptors: {},
        years: {},
        decades: {},
      } as Record<keyof ProfileDetails, Record<string, number>>;
      const weightedDetailsMaps = {
        artists: {},
        primaryGenres: {},
        secondaryGenres: {},
        descriptors: {},
        years: {},
        decades: {},
      } as Record<keyof ProfileDetails, Record<string, number>>;

      for (const {
        artists,
        primaryGenres,
        secondaryGenres,
        descriptors,
        releaseDate,
        fileName,
      } of albumDocuments) {
        artists?.forEach((artist) => {
          profileDetailsMaps.artists[artist] =
            (profileDetailsMaps.artists[artist] || 0) + 1;
          weightedDetailsMaps.artists[artist] =
            (weightedDetailsMaps.artists[artist] || 0) +
            trackCountByAlbumFileName[fileName];
        });

        primaryGenres?.forEach((genre) => {
          profileDetailsMaps.primaryGenres[genre] =
            (profileDetailsMaps.primaryGenres[genre] || 0) + 1;
          weightedDetailsMaps.primaryGenres[genre] =
            (weightedDetailsMaps.primaryGenres[genre] || 0) +
            trackCountByAlbumFileName[fileName];
        });

        secondaryGenres?.forEach((genre) => {
          profileDetailsMaps.secondaryGenres[genre] =
            (profileDetailsMaps.secondaryGenres[genre] || 0) + 1;
          weightedDetailsMaps.secondaryGenres[genre] =
            (weightedDetailsMaps.secondaryGenres[genre] || 0) +
            trackCountByAlbumFileName[fileName];
        });

        descriptors?.forEach((descriptor) => {
          profileDetailsMaps.descriptors[descriptor] =
            (profileDetailsMaps.descriptors[descriptor] || 0) + 1;
          weightedDetailsMaps.descriptors[descriptor] =
            (weightedDetailsMaps.descriptors[descriptor] || 0) +
            trackCountByAlbumFileName[fileName];
        });

        if (releaseDate) {
          const year = new Date(releaseDate).getFullYear();
          const decade = startOfDecade(new Date(releaseDate)).getFullYear();
          profileDetailsMaps.years[year] =
            (profileDetailsMaps.years[year] || 0) + 1;
          profileDetailsMaps.decades[decade] =
            (profileDetailsMaps.decades[decade] || 0) + 1;

          weightedDetailsMaps.years[year] =
            (weightedDetailsMaps.years[year] || 0) +
            trackCountByAlbumFileName[fileName];
          weightedDetailsMaps.decades[decade] =
            (weightedDetailsMaps.decades[decade] || 0) +
            trackCountByAlbumFileName[fileName];
        }
      }
      const profileDetails = Object.entries(
        profileDetailsMaps
      ).reduce<ProfileDetails>((acc, [key, value]) => {
        acc[key as keyof ProfileDetails] = Object.entries(value)
          .map(([item, count]) => ({
            item,
            count: count as number,
          }))
          .sort((a, b) => b.count - a.count);
        return acc;
      }, {} as ProfileDetails);

      const weightedProfileDetails = Object.entries(
        weightedDetailsMaps
      ).reduce<ProfileDetails>((acc, [key, value]) => {
        acc[key as keyof ProfileDetails] = Object.entries(value)
          .map(([item, count]) => ({
            item,
            count: count as number,
          }))
          .sort((a, b) => b.count - a.count);
        return acc;
      }, {} as ProfileDetails);

      const profileSummary: ProfileSummary = {
        topArtists: profileDetails.artists.slice(0, 5).map((a) => a.item),
        topPrimaryGenres: profileDetails.primaryGenres
          .slice(0, 5)
          .map((a) => a.item),
        topSecondaryGenres: profileDetails.secondaryGenres
          .slice(0, 5)
          .map((a) => a.item),
        topDescriptors: profileDetails.descriptors
          .slice(0, 5)
          .map((a) => a.item),
        topYears: profileDetails.years.slice(0, 5).map((a) => a.item),
        topDecade: profileDetails.decades.sort((a, b) => b.count - a.count)[0]
          ?.item,
      };
      const weightedSummary: ProfileSummary = {
        topArtists: weightedProfileDetails.artists
          .slice(0, 5)
          .map((a) => a.item),
        topPrimaryGenres: weightedProfileDetails.primaryGenres
          .slice(0, 5)
          .map((a) => a.item),
        topSecondaryGenres: weightedProfileDetails.secondaryGenres
          .slice(0, 5)
          .map((a) => a.item),
        topDescriptors: weightedProfileDetails.descriptors
          .slice(0, 5)
          .map((a) => a.item),
        topYears: weightedProfileDetails.years.slice(0, 5).map((a) => a.item),
        topDecade: weightedProfileDetails.decades.sort(
          (a, b) => b.count - a.count
        )[0]?.item,
      };
      return {
        ...profileDocument,
        summary: profileSummary,
        weightedSummary,
        weightedProfileDetails,
        details: profileDetails,
      };
    },
    async putAlbumOnProfile(payload: AddAlbumToProfilePayload) {
      const albumDocument = await rymDataClient.getAlbum(payload.albumFileName);
      if (!albumDocument) {
        throw new Error("Unknown album");
      }
      logger.info({ payload }, "Adding album to profile");

      return profileRepo.putAlbumOnProfile(payload);
    },
    createProfile(id: string, title: string) {
      return profileRepo.createProfile(id, title);
    },
    async getAlbumAssessment({
      profileId,
      albumFileId,
      settings,
    }: {
      profileId: string;
      albumFileId: string;
      settings: AssessmentSettings;
    }) {
      const profile = await interactor.getProfile(profileId);
      if (!profile) {
        throw new Error("Unknown profile");
      }
      const album = await rymDataClient.getAlbum(albumFileId);
      if (!album) {
        throw new Error("Unknown album");
      }
      return buildAssessment(
        await buildAssessmentContext({
          profile,
          settings,
        }),
        album
      );
    },
    async getRecommendations({
      profileId,
      settings,
    }: {
      profileId: string;
      settings: RecommendationSettings;
    }) {
      const profile = await interactor.getProfile(profileId);
      if (!profile) {
        throw new Error("Unknown profile");
      }
      const assessmentContext = await buildAssessmentContext({
        profile,
        settings: settings.assessmentSettings,
      });
      const albums = await rymDataClient.queryAlbums({
        excludeArtists: [
          ...profile.details.artists.map((a) => a.item),
          ...settings.filter.excludeArtists,
        ],
        excludePrimaryGenres: [...settings.filter.excludePrimaryGenres],
        excludeKeys: [...settings.filter.excludeAlbums],
      });
      const assessments = albums.map((album) => {
        try {
          return buildAssessment(assessmentContext, album);
        } catch {
          return undefined;
        }
      });
      const recommendations = assessments
        .filter((a): a is Assessment => a !== undefined)
        .sort((a, b) => b.averageQuantile - a.averageQuantile)
        .slice(0, settings.count);
      return recommendations;
    },
  };

  return interactor;
};

export type ProfileInteractor = ReturnType<typeof buildProfileInteractor>;
