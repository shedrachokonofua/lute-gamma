import {
  RedisClient,
  LookupKey,
  PutLookupPayload,
  Lookup,
  LookupStatus,
} from "@lute/shared";
import hash from "object-hash";

export const buildLookupRepo = (redisClient: RedisClient) => ({
  async getLookup(key: LookupKey): Promise<Lookup> {
    const keyHash = hash(key);
    const lookup = await redisClient.get(`lookup:${keyHash}`);
    return lookup ? JSON.parse(lookup) : null;
  },
  async createLookup(key: LookupKey): Promise<Lookup> {
    const keyHash = hash(key);
    const lookup: Lookup = {
      key,
      keyHash,
      status: LookupStatus.Started,
    };
    await redisClient.set(`lookup:${keyHash}`, JSON.stringify(lookup));
    return lookup;
  },
  async getOrCreateLookup(key: LookupKey): Promise<Lookup> {
    const lookup = await this.getLookup(key);
    if (lookup) {
      return lookup;
    }
    return this.createLookup(key);
  },
  async getLookupByHash(keyHash: string): Promise<Lookup> {
    const lookup = await redisClient.get(`lookup:${keyHash}`);
    return lookup ? JSON.parse(lookup) : null;
  },
  async putLookup(keyHash: string, payload: PutLookupPayload): Promise<Lookup> {
    const lookup = await redisClient.get(`lookup:${keyHash}`);
    if (!lookup) {
      throw new Error(`Lookup not found for key hash ${keyHash}`);
    }
    const parsedLookup = JSON.parse(lookup);
    const newLookup: Lookup = {
      ...parsedLookup,
      error: undefined,
      ...payload,
      bestMatch: {
        ...parsedLookup.bestMatch,
        ...payload.bestMatch,
      },
    };
    await redisClient.set(`lookup:${keyHash}`, JSON.stringify(newLookup));
    return newLookup;
  },
});

export type LookupRepo = ReturnType<typeof buildLookupRepo>;
