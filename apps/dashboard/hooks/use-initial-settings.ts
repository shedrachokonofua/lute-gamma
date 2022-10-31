import { RecommendationSettingsForm } from "../components";
import { useAsync } from "./use-async";

const defaultRecommendationSettings = {
  profileId: "default",
  count: 10,
  assessmentSettings: {
    noveltyFactor: 0.5,
    useAlbumWeight: true,
    parameterWeights: {
      primaryGenres: 5,
      secondaryGenres: 3,
      primaryCrossGenres: 2,
      secondaryCrossGenres: 1,
      descriptors: 10,
      rating: 2,
      ratingCount: 1,
    },
  },
  filter: {
    excludeAlbums: [],
    excludeArtists: [],
    primaryGenres: [],
    excludePrimaryGenres: [],
    secondaryGenres: [],
    excludeSecondaryGenres: [],
  },
} as RecommendationSettingsForm;

const getInitialRecommendationSettings = async () => {
  const settings = localStorage.getItem("settings");
  return settings ? JSON.parse(settings) : defaultRecommendationSettings;
};

export const useInitialSettings = () =>
  useAsync(getInitialRecommendationSettings);
