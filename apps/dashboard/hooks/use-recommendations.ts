import { useCallback } from "react";
import { api } from "../api";
import { RecommendationSettingsForm } from "../components";
import { useAsync } from "./use-async";

export const useRecommendations = () => {
  const request = useCallback((settingsForm: RecommendationSettingsForm) => {
    return api.getRecommendations(settingsForm);
  }, []);

  return useAsync(request, false);
};
