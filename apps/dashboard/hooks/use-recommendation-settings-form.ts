import { AlbumRecommendationParameters } from "@lute/domain";
import { useForm } from "@mantine/form";
import {
  defaultRecommendationSettings,
  useInitialSettings,
} from "./use-initial-settings";
import { useEffect } from "react";

type RecommendationSettingsForm = Omit<AlbumRecommendationParameters, "model">;

export const useRecommendationSettingsForm = (
  onSubmit: (values: RecommendationSettingsForm) => void
) => {
  const { status: initialSettingsStatus, value: initialSettings } =
    useInitialSettings();

  const form = useForm<RecommendationSettingsForm>({
    initialValues: defaultRecommendationSettings,
  });

  useEffect(() => {
    if (initialSettingsStatus === "success" && initialSettings) {
      form.setValues(initialSettings);
      form.resetDirty(initialSettings);
      onSubmit(initialSettings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSettingsStatus, initialSettings]);

  const submitForm = (values: RecommendationSettingsForm) => {
    localStorage.setItem("settings", JSON.stringify(values));
    onSubmit(values);
  };

  return {
    form,
    submitForm,
    isInitialSettingsLoading:
      initialSettingsStatus === "idle" || initialSettingsStatus === "pending",
  };
};
