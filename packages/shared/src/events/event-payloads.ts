import { PageType } from "@lute/domain";

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

export type LookupSavedEvent = {
  lookupId: string;
};

export type LookupNotFoundEvent = {
  lookupId: string;
};
