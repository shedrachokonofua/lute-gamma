export type ItemAndCount = {
  item: string;
  count: number;
};

export interface ProfileDetails {
  artists: ItemAndCount[];
  primaryGenres: ItemAndCount[];
  secondaryGenres: ItemAndCount[];
  descriptors: ItemAndCount[];
  years: ItemAndCount[];
  decades: ItemAndCount[];
}

export interface ProfileSummary {
  topArtists: string[];
  topPrimaryGenres: string[];
  topSecondaryGenres: string[];
  topDescriptors: string[];
  topYears: string[];
  topDecade?: string;
}

export interface Profile {
  id: string;
  title: string;
  lastUpdatedAt: Date;
  albums: ItemAndCount[];
  summary: ProfileSummary;
  details: ProfileDetails;
  weightedSummary: ProfileSummary;
  weightedProfileDetails: ProfileDetails;
}
