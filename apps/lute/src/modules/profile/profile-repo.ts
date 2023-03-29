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

export const buildProfileRepo = async (mongoClient: MongoClient) => {
  const profilesCollection = mongoClient
    .db("profile")
    .collection<ProfileDocument>("profiles");

  await profilesCollection.createIndex({ id: 1 }, { unique: true });

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
    isAlbumOnProfile: async (id: string, albumFileName: string) => {
      const result = await profilesCollection.findOne({
        id,
        albums: {
          $elemMatch: {
            item: albumFileName,
          },
        },
      });

      return !!result;
    },
    getProfiles: async () => {
      const profiles = await profilesCollection
        .find(
          {},
          {
            projection: {
              id: 1,
              title: 1,
              lastUpdatedAt: 1,
              albumCount: {
                $size: "$albums",
              },
            },
          }
        )
        .toArray();
      return profiles;
    },
    deleteProfile: async (id: string) => {
      return await profilesCollection.findOneAndDelete({
        id,
      });
    },
  };

  return repo;
};

export type ProfileRepo = ReturnType<typeof buildProfileRepo>;
