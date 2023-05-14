import { Context } from "../../context";
import { registerVectorSimilarityEventSubscribers } from "./models";

export const registerRecommendationEventSubscribers = async (
  context: Context
) => {
  await registerVectorSimilarityEventSubscribers(context);
};
