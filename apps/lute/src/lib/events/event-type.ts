import { AlbumDocument, ChartDocument, PageType } from "@lute/domain";

export enum EventType {
  FileSaved = "file.saved",
  ParserPageParsed = "parser.pageParsed",
  LookupSaved = "lookup.saved",
  LookupNotFound = "lookup.notFound",
  ParserFailed = "parser.failed",
  AlbumSaved = "album.saved",
  ChartSaved = "chart.saved",
  ProfileAlbumAdded = "profile.albumAdded",
}

export interface FileSavedEventPayload {
  fileId: string;
  fileName: string;
}

export interface ParserPageParsedEventPayload {
  fileId: string;
  fileName: string;
  pageType: PageType;
  data: Record<string, any>;
}

export interface ParserFailedEventPayload {
  fileName: string;
  error: string;
}

export interface LookupSavedEventPayload {
  lookupHash: string;
}

export interface LookupNotFoundEventPayload {
  lookupHash: string;
}

export interface AlbumSavedEventPayload {
  album: AlbumDocument;
}

export interface ChartSavedEventPayload {
  chart: ChartDocument;
}

export interface ProfileAlbumAddedEventPayload {
  profileId: string;
  albumFileName: string;
}
