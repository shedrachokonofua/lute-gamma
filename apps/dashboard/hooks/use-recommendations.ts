import { useCallback } from "react";
import { api } from "../api";
import { RecommendationSettingsForm } from "../components";
import { useAsync } from "./use-async";

export const useRecommendations = () => {
  return useAsync(
    (settingsForm: RecommendationSettingsForm) => {
      return api.getRecommendations(settingsForm);
    },
    [],
    false
  );
};
