import { Db, ObjectId, WithId } from "mongodb";

type ItemAndCount = {
  item: string;
  count: number;
};

export interface ProfileDetails {
  artists: ItemAndCount[];
  primaryGenres: ItemAndCount[];
  secondaryGenres: ItemAndCount[];
  descriptors: ItemAndCount[];
  years: ItemAndCount[];
  decades: ItemAndCount[];
}

export interface ProfileSummary {
  topArtists: string[];
  topPrimaryGenres: string[];
  topSecondaryGenres: string[];
  topDescriptors: string[];
  topYears: string[];
  topDecade?: string;
}

export interface Profile {
  id: string;
  title: string;
  lastUpdatedAt: Date;
  albumFileNames: string[];
  summary: ProfileSummary;
  details: ProfileDetails;
}

export interface ProfileDocument {
  id: string;
  title: string;
  lastUpdatedAt: Date;
  albumFileNames: string[];
}

interface CreateProfilePayload {
  title: string;
}

export const buildProfileRepo = ({ mongoDatabase }: { mongoDatabase: Db }) => {
  const repo = {
    async getProfile(id: string): Promise<ProfileDocument | null> {
      const profile = await mongoDatabase
        .collection<ProfileDocument>("profiles")
        .findOne({ id });

      return profile;
    },
    async createProfile(id: string, title: string): Promise<ProfileDocument> {
      const document = {
        id,
        title,
        lastUpdatedAt: new Date(),
        albumFileNames: [],
      };

      await mongoDatabase
        .collection<ProfileDocument>("profiles")
        .insertOne(document);

      return document;
    },
    async addAlbumToProfile(
      id: string,
      albumFileName: string
    ): Promise<ProfileDocument> {
      const profile = await repo.getProfile(id);
      if (!profile) {
        throw new Error("Profile not found");
      }
      if (profile.albumFileNames.includes(albumFileName)) {
        throw new Error("Album already added to profile");
      }
      const result = await mongoDatabase
        .collection<ProfileDocument>("profiles")
        .findOneAndUpdate(
          { id },
          {
            $set: {
              lastUpdatedAt: new Date(),
            },
            $push: {
              albumFileNames: albumFileName,
            },
          },
          { returnDocument: "after" }
        );
      if (!result.value) {
        throw new Error("Profile not found");
      }
      return result.value;
    },
  };

  return repo;
};

export type ProfileRepo = ReturnType<typeof buildProfileRepo>;
