import { ItemAndCount } from "@lute/domain";
import { MongoClient } from "mongodb";

export interface ProfileDocument {
  id: string;
  title: string;
  lastUpdatedAt: Date;
  albums: ItemAndCount[];
}

export interface AddAlbumToProfilePayload {
  profileId: string;
  albumFileName: string;
  count?: number;
}

export const buildProfileRepo = (mongoClient: MongoClient) => {
  const profilesCollection = mongoClient
    .db("profile")
    .collection<ProfileDocument>("profiles");

  const repo = {
    async getProfile(id: string): Promise<ProfileDocument | null> {
      const profile = await profilesCollection.findOne({ id });

      return profile;
    },
    async createProfile(id: string, title: string): Promise<ProfileDocument> {
      const document = {
        id,
        title,
        lastUpdatedAt: new Date(),
        albums: [],
      };

      await profilesCollection.insertOne(document);

      return document;
    },
    async putAlbumOnProfile({
      profileId,
      albumFileName,
      count = 1,
    }: AddAlbumToProfilePayload): Promise<ProfileDocument> {
      const profile = await repo.getProfile(profileId);
      if (!profile) {
        throw new Error("Profile not found");
      }
      const existingAlbum = profile.albums.find(
        (a) => a.item === albumFileName
      );

      const result = existingAlbum
        ? await profilesCollection.findOneAndUpdate(
            { id: profileId, "albums.item": albumFileName },
            {
              $set: {
                lastUpdatedAt: new Date(),
                "albums.$.count": count,
              },
            }
          )
        : await profilesCollection.findOneAndUpdate(
            {
              id: profileId,
            },
            {
              $set: {
                lastUpdatedAt: new Date(),
              },
              $push: {
                albums: {
                  item: albumFileName,
                  count,
                },
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
