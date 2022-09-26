import { PageType } from "../rym";

export type FileSavedEvent = {
  fileId: string;
  fileName: string;
  lookupId?: string;
};

export type PageDataParsedEvent = {
  fileId: string;
  fileName: string;
  pageType: PageType;
  dataString: string;
  lookupId?: string;
};

export type LookupAlbumDataSaved = {
  lookupId: string;
  dataString: string;
};
