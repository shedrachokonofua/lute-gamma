import { SavedLookup } from "@lute/domain";
import { RedisClient } from "../../../lib";
import { logger } from "../../../logger";
import { ProfileInteractor } from "../profile-interactor";
import { buildSeedLookupRepo } from "./seed-lookup-repo";

export const buildSeedLookupInteractor = ({
  redisClient,
  profileInteractor,
}: {
  redisClient: RedisClient;
  profileInteractor: ProfileInteractor;
}) => {
  const seedLookupRepo = buildSeedLookupRepo(redisClient);

  return {
    buildTable: async (
      profileId: string,
      trackCountByLookupHash: Record<string, number>
    ) => {
      return seedLookupRepo.buildTable(profileId, trackCountByLookupHash);
    },
    handleSavedLookup: async (lookup: SavedLookup) => {
      logger.info({ lookup }, "Handling saved lookup");
      const trackCountsByProfileId =
        await seedLookupRepo.getTrackCountsByProfileId(lookup.keyHash);

      await Promise.all(
        Object.keys(trackCountsByProfileId).map(async (profileId) => {
          const trackCount = trackCountsByProfileId[profileId];
          const albumFileName = lookup.bestMatch.fileName;

          try {
            await profileInteractor.putAlbumOnProfile({
              profileId,
              albumFileName,
              count: trackCount,
            });
          } catch (error) {
            logger.error(
              { error, lookup, albumFileName, trackCount },
              "Failed to put album on profile"
            );
          } finally {
            logger.info({ lookup, profileId }, "Deleting seed lookup");
            await seedLookupRepo.deleteSeedLookup(lookup.keyHash, profileId);
          }
        })
      );
    },
    hasWaitingSeeds: async (lookupHash: string) => {
      return seedLookupRepo.hasWaitingSeeds(lookupHash);
    },
    handleLookupNotFound: async (lookupHash: string) => {
      logger.info({ lookupHash }, "Handling lookup not found");
      await seedLookupRepo.deleteAllSeedLookups(lookupHash);
    },
  };
};

export type SeedLookupInteractor = ReturnType<typeof buildSeedLookupInteractor>;
