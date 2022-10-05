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
  artists: string[];
  albumData?: AlbumDocument;
}

export type Lookup = {
  key: LookupKey;
  keyHash: string;
  status: LookupStatus;
  bestMatch?: LookupBestMatch;
  error?: string;
};

export type PutLookupPayload = {
  status: LookupStatus;
  error?: string;
  bestMatch?: Partial<LookupBestMatch>;
};
