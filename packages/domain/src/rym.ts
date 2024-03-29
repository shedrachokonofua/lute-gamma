import { parse as parseFormattedDate, startOfYear } from "date-fns";

export interface ArtistPage {
  name: string;
  albums: {
    name: string;
    fileName: string;
  }[];
}

export interface Track {
  name: string;
  lengthSeconds?: number;
  rating?: number;
  position?: string;
}

export interface AlbumPage {
  name: string;
  artists: {
    name: string;
    fileName: string;
  }[];
  rating: number;
  ratingCount: number;
  primaryGenres: string[];
  secondaryGenres: string[];
  descriptors: string[];
  releaseDate: Date;
  tracks: Track[];
  releaseDateString?: string;
}

export interface ChartParameters {
  releaseType: string;
  pageNumber: number;
  yearsRangeStart: number;
  yearsRangeEnd: number;
  includePrimaryGenres?: string[];
  includeSecondaryGenres?: string[];
  excludePrimaryGenres?: string[];
  excludeSecondaryGenres?: string[];
  includeDescriptors?: string[];
  excludeDescriptors?: string[];
}

export interface ChartPageAlbumEntry {
  position: number;
  fileName: string;
  albumData: Partial<AlbumPage>;
}

export interface ChartPage {
  parameters: ChartParameters;
  albums: ChartPageAlbumEntry[];
}

export const parseReleaseDateString = (value: string | undefined | null) => {
  const trimmedValue = value?.trim();
  if (!trimmedValue) return null;
  if (trimmedValue.length === 4) return startOfYear(new Date(trimmedValue));
  return parseFormattedDate(trimmedValue, "dd MMMM yyyy", new Date());
};

export interface SearchBestMatch {
  name: string;
  artists: {
    name: string;
    fileName: string;
  }[];
  fileName: string;
}

export type AlbumDocument = Partial<AlbumPage> & {
  fileId: string;
  fileName: string;
};

export type PutAlbumPayload = Partial<AlbumDocument>;

export interface ChartDocumentAlbumEntry {
  position: number;
  fileName: string;
}

export interface ChartDocument {
  fileId: string;
  fileName: string;
  parameters: ChartParameters;
  albums: ChartDocumentAlbumEntry[];
}

export type PutChartPayload = ChartPage & {
  fileName: string;
  fileId: string;
};

const SUPPORTED_RELEASE_TYPES = ["album", "mixtape", "ep"];

export const isLuteAlbumFileName = (fileName: string) =>
  SUPPORTED_RELEASE_TYPES.some((releaseType) =>
    fileName.startsWith(`release/${releaseType}/`)
  );

export const isLuteChartFileName = (fileName: string) =>
  /^charts\/(\w+)\/(album|mixtape|ep)\//.test(fileName);

export const getReleaseType = (fileName: string) => {
  return fileName.split("/")[1];
};

export const getChartReleaseType = (fileName: string) => {
  return fileName.split("/")[2];
};

export const toUrlTag = (value: string) =>
  value.replaceAll(" ", "-").replaceAll("&", "and");

export const getChartFileName = (parameters: ChartParameters) => {
  let fileName = `charts/top/${parameters.releaseType}/${parameters.yearsRangeStart}-${parameters.yearsRangeEnd}`;

  if (parameters.includePrimaryGenres) {
    fileName += `/g:${parameters.includePrimaryGenres.map(toUrlTag).join(",")}`;
  }

  if (parameters.includeDescriptors) {
    fileName += `/d:${parameters.includeDescriptors.map(toUrlTag).join(",")}`;
  }

  return `${fileName}/${parameters.pageNumber}`;
};
