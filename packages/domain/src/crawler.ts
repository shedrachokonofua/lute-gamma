export interface CrawlerItem {
  fileName: string;
  lookupId?: string;
}

export enum CrawlerStatus {
  Running = "running",
  Error = "error",
  Stopped = "stopped",
}

export interface CrawlerMonitor {
  status: CrawlerStatus;
  error?: string;
  current?: string;
  queueSize: number;
}
