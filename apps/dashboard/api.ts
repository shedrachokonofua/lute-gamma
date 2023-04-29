import axios from "axios";
import * as qs from "qs";
import {
  AssessmentModel,
  AlbumRecommendation,
  AlbumRecommendationParameters,
  Profile,
  ProfileDTO,
  AlbumRecommendationPreset,
} from "@lute/domain";
import { config } from "./config";

const isBrowser = typeof window !== "undefined";
const host = isBrowser
  ? config.luteServerUrl.browserSide
  : config.luteServerUrl.serverSide;
const http = axios.create({ baseURL: host });

export const api = {
  async getRecommendations(
    params: Omit<AlbumRecommendationParameters, "model">
  ): Promise<AlbumRecommendation[]> {
    const response = await http.get(
      `/recommendation/albums?${qs.stringify({
        model: AssessmentModel.QuantileRank,
        ...params,
      })}`
    );
    return response.data?.data || [];
  },
  async getGenres() {
    const response = await http.get("/albums/genres");
    return response.data?.data || [];
  },
  async getProfiles(): Promise<ProfileDTO[]> {
    const response = await http.get("/profile");
    return response.data?.data || [];
  },
  async getAlbumRecommendationPresets(): Promise<Profile> {
    const response = await http.get("/recommendation/presets/album");
    return response.data?.data || [];
  },
  async createAlbumRecommendationPreset(
    preset: AlbumRecommendationPreset
  ): Promise<void> {
    await http.post("/recommendation/presets", preset);
  },
  async updateAlbumRecommendationPreset(
    id: string,
    update: Partial<AlbumRecommendationPreset>
  ): Promise<void> {
    await http.put(`/recommendation/presets/${id}`, update);
  },
};
