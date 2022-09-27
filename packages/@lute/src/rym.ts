import { parse as parseFormattedDate } from "date-fns";

export enum PageType {
  Album = "album",
  Chart = "chart",
  Search = "search",
}

export interface Track {
  name: string;
  lengthSeconds?: number;
  rating?: number;
  position?: string;
}

export interface AlbumPage {
  name: string;
  artists: string[];
  rating: number;
  ratingCount: number;
  primaryGenres: string[];
  secondaryGenres: string[];
  descriptors: string[];
  releaseDate: Date;
  tracks: Track[];
}

export interface ChartParameters {
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

export const parseReleaseDateString = (value: string) =>
  parseFormattedDate(value, "dd MMMM yyyy", new Date());

export interface SearchBestMatch {
  name: string;
  artists: string[];
  fileName: string;
}