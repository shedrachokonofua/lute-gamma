import { AlbumDocument, ChartDocument, PageType } from "@lute/domain";

export enum EventType {
  FileSaved = "file.saved",
  ParserPageParsed = "parser.pageParsed",
  ParserFailed = "parser.failed",
  LookupSaved = "lookup.saved",
  LookupNotFound = "lookup.notFound",
  AlbumSaved = "album.saved",
  ChartSaved = "chart.saved",
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
  fileId: string;
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
