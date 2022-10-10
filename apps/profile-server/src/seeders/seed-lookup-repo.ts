import { RedisClient } from "@lute/shared";

const getLookupHsetKey = (lookupHash: string): string =>
  `seeder:lookup:${lookupHash}`;

export const buildSeedLookupRepo = (redisClient: RedisClient) => {
  return {
    buildTable: async (
      profileId: string,
      trackCountByLookupHash: Record<string, number>
    ) => {
      const transaction = redisClient.multi();
      Object.entries(trackCountByLookupHash).forEach(
        ([lookupHash, trackCount]) => {
          transaction.hSet(getLookupHsetKey(lookupHash), profileId, trackCount);
        }
      );
      await transaction.exec();
    },
    getTrackCountsByProfileId: async (lookupHash: string) => {
      const result = await redisClient.hGetAll(getLookupHsetKey(lookupHash));
      return Object.entries(result).reduce<Record<string, number>>(
        (acc, [profileId, trackCount]) => {
          acc[profileId] = Number(trackCount);
          return acc;
        },
        {}
      );
    },
    hasWaitingSeeds: async (lookupHash: string) => {
      const result = await redisClient.hLen(getLookupHsetKey(lookupHash));
      return result > 0;
    },
    getTrackCount: async (lookupHash: string, profileId: string) => {
      const hashSetKey = getLookupHsetKey(lookupHash);
      const res = redisClient.hGet(hashSetKey, profileId);
      if (res === null) {
        return 0;
      }
      return Number(res);
    },
    deleteAllSeedLookups: async (lookupId: string) => {
      await redisClient.del(getLookupHsetKey(lookupId));
    },
    deleteSeedLookup: async (lookupHash: string, profileId: string) => {
      const hashSetKey = getLookupHsetKey(lookupHash);
      await redisClient.hDel(hashSetKey, profileId);
      const showDelHashSet = await redisClient.hLen(hashSetKey);
      if (showDelHashSet === 0) {
        await redisClient.del(hashSetKey);
      }
    },
  };
};

export type SeedLookupRepo = ReturnType<typeof buildSeedLookupRepo>;
