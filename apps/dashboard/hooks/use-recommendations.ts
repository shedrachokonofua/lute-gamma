import { useCallback } from "react";
import { api } from "../api";
import { RecommendationSettingsForm } from "../components";
import { useAsync } from "./use-async";

export const useRecommendations = () => {
  const request = useCallback((settingsForm: RecommendationSettingsForm) => {
    const { profileId, ...settings } = settingsForm;
    return api.getRecommendations(profileId, settings);
  }, []);

  return useAsync(request, false);
};
