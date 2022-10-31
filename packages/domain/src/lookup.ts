import { AlbumDocument } from "./rym";
import hash from "object-hash";

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

const normalizeString = (str: string) => str.toLowerCase().trim();

export const hashLookupKey = (key: LookupKey): string =>
  hash({
    artist: normalizeString(key.artist),
    album: normalizeString(key.album),
  });
