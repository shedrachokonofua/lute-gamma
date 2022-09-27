import { ProfileDetails, ProfileRepo, ProfileSummary } from "./profile-repo";
import { rymDataClient } from "./utils";
import { startOfDecade } from "date-fns";

export const buildProfileInteractor = ({
  profileRepo,
}: {
  profileRepo: ProfileRepo;
}) => {
  return {
    async getProfile(id: string) {
      const profileDocument = await profileRepo.getProfile(id);
      if (!profileDocument) {
        return null;
      }
      const albumDocuments = await rymDataClient.getAlbums(
        profileDocument.albumFileNames
      );
      const profileDetailsMaps = albumDocuments.reduce(
        (acc, albumDocument) => {
          const {
            artists,
            primaryGenres,
            secondaryGenres,
            descriptors,
            releaseDate,
          } = albumDocument;

          artists?.forEach((artist) => {
            acc.artists[artist] = (acc.artists[artist] || 0) + 1;
          });
          primaryGenres?.forEach((genre) => {
            acc.primaryGenres[genre] = (acc.primaryGenres[genre] || 0) + 1;
          });
          secondaryGenres?.forEach((genre) => {
            acc.secondaryGenres[genre] = (acc.secondaryGenres[genre] || 0) + 1;
          });
          descriptors?.forEach((descriptor) => {
            acc.descriptors[descriptor] =
              (acc.descriptors[descriptor] || 0) + 1;
          });
          if (releaseDate) {
            const year = new Date(releaseDate).getFullYear();
            const decade = startOfDecade(new Date(releaseDate)).getFullYear();
            acc.years[year] = (acc.years[year] || 0) + 1;
            acc.decades[decade] = (acc.decades[decade] || 0) + 1;
          }
          return acc;
        },
        {
          artists: {},
          primaryGenres: {},
          secondaryGenres: {},
          descriptors: {},
          years: {},
          decades: {},
        }
      );
      const profileDetails = Object.entries(profileDetailsMaps).reduce(
        (acc, [key, value]) => {
          acc[key] = Object.entries(value)
            .map(([item, count]) => ({
              item,
              count: count as number,
            }))
            .sort((a, b) => b.count - a.count);
          return acc;
        },
        {} as ProfileDetails
      );
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
      return {
        ...profileDocument,
        summary: profileSummary,
        details: profileDetails,
      };
    },
    addAlbumToProfile(id: string, albumFileName: string) {
      return profileRepo.addAlbumToProfile(id, albumFileName);
    },
  };
};
