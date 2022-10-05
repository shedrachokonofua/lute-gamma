import { Assessment, RecommendationSettings } from "@lute/domain";
import { buildHttpClient } from "./shared";

export const buildProfileClient = (profileServerUrl: string) => {
  const http = buildHttpClient(profileServerUrl);

  return {
    getRecommendations: async (
      profileId: string,
      settings: RecommendationSettings
    ): Promise<Assessment[]> => {
      const response = await http.get(`/${profileId}/recommendations`, {
        params: settings,
      });
      return response.data?.data || [];
    },
  };
};
