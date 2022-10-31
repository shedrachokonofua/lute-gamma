import axios from "axios";
import * as qs from "qs";
import { Recommendation, RecommendationSettings } from "@lute/domain";
import { config } from "./config";

const isBrowser = typeof window !== "undefined";
const host = isBrowser
  ? config.luteServerUrl.browserSide
  : config.luteServerUrl.serverSide;
const http = axios.create({ baseURL: host });

export const api = {
  async getRecommendations(
    profileId: string,
    settings: RecommendationSettings
  ): Promise<Recommendation[]> {
    const response = await http.get(
      `/profile/${profileId}/recommendations?${qs.stringify(settings)}`
    );
    return response.data?.data || [];
  },
  async getGenres() {
    const response = await http.get("/albums/genres");
    return response.data?.data || [];
  },
};
