import SHA3 from "sha3";
import { AlbumDocument } from "./rym";

export enum LookupStatus {
  Started = "started",
  Found = "found",
  NotFound = "not-found",
  Saved = "saved",
  Error = "error",
}

export interface LookupKey {
  artist: string;
  album: string;
}

export interface LookupBestMatch {
  name: string;
  fileName: string;
  artists: {
    name: string;
    fileName: string;
  }[];
  albumData?: AlbumDocument;
}

export type Lookup = {
  key: LookupKey;
  keyHash: string;
  status: LookupStatus;
  bestMatch?: LookupBestMatch;
  error?: string;
};

export type SavedLookup = Lookup & {
  status: LookupStatus.Saved;
  bestMatch: LookupBestMatch & { albumData: AlbumDocument };
  error: undefined;
};

export const isSavedLookup = (lookup: Lookup): lookup is SavedLookup =>
  lookup.status === LookupStatus.Saved && lookup.bestMatch !== undefined;

export type PutLookupPayload = {
  status: LookupStatus;
  error?: string;
  bestMatch?: Partial<LookupBestMatch>;
};

const deterministicStringify = (obj: any) =>
  JSON.stringify(obj, Object.keys(obj).sort()).toLowerCase();

export const hashLookupKey = (key: LookupKey): string => {
  const hash = new SHA3(256);
  hash.update(deterministicStringify(key));
  const fullHash = hash.digest();
  const truncatedHash = fullHash.subarray(0, 8); // Truncate to 8 bytes (64 bits)
  const hexHash = truncatedHash.toString("hex"); // Convert to a hexadecimal string
  return hexHash;
};
