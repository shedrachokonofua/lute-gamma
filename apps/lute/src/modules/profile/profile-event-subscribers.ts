import { Context } from "../../context";
import { buildSeedersEventSubscribers } from "./seeders";

export const buildProfileEventSubscribers = (context: Context) => {
  buildSeedersEventSubscribers(context);
};
