import { RecommendationSettings, Profile, Recommendation } from "@lute/domain";
import * as qs from "qs";
import { buildHttpClient } from "./shared";

export const buildProfileClient = (profileServerUrl: string) => {
  const http = buildHttpClient(profileServerUrl);

  return {
    getProfile: async (id: string): Promise<Profile | null> => {
      const { data } = await http.get(`/${id}`);
      return data?.data;
    },
    getRecommendations: async (
      profileId: string,
      settings: RecommendationSettings
    ): Promise<Recommendation[]> => {
      const response = await http.get(
        `/${profileId}/recommendations?${qs.stringify(settings)}`
      );
      return response.data?.data || [];
    },
  };
};
