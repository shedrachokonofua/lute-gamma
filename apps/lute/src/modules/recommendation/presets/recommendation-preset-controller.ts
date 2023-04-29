import {
  RecommendationPreset,
  getFilterSchema,
  getSettingsSchema,
  isAssessmentModel,
  isPresetType,
} from "@lute/domain";
import { Context } from "../../../context";
import { buildControllerFactory } from "../../../lib";

export const buildRecommendationPresetController =
  buildControllerFactory<Context>((context) => {
    const { recommendationPresetInteractor } = context;

    return {
      async getPresets(req, res) {
        const type = req.params.type as string;

        if (!isPresetType(type)) {
          return res.badRequest("Valid presets type is required");
        }

        const presets = await recommendationPresetInteractor.getPresetsByType(
          type
        );

        return res.json({ ok: true, data: presets });
      },
      async createPreset(req, res) {
        const preset = req.body as RecommendationPreset;

        if (
          !preset.id ||
          !preset.name ||
          !isPresetType(preset.type) ||
          !isAssessmentModel(preset.model)
        ) {
          return res.badRequest("Invalid payload");
        }

        const filterSchema = getFilterSchema(preset.type);
        const settingsSchema = getSettingsSchema(preset.type, preset.model);

        const settings = settingsSchema.parse(preset.settings);
        const filter = filterSchema.parse(preset.filter);

        await recommendationPresetInteractor.createPreset({
          ...preset,
          settings,
          filter,
        } as RecommendationPreset);

        return res.json({ ok: true });
      },
      async updatePreset(req, res) {
        const id = req.params.id as string;
        const update = req.body as Partial<RecommendationPreset>;

        await recommendationPresetInteractor.updatePreset(id, update);

        return res.json({ ok: true });
      },
    };
  });
