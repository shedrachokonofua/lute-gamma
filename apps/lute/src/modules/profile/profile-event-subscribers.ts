import { Context } from "../../context";
import { registerSeedersEventSubscribers } from "./seeders";

export const registerProfileEventSubscribers = async (context: Context) => {
  await registerSeedersEventSubscribers(context);
};
