import { Db } from "mongodb";

interface CreateProfilePayload {}

export const buildProfileRepo = ({ mongoDatabase }: { mongoDatabase: Db }) => {
  return {
    async createProfile() {},
  };
};
