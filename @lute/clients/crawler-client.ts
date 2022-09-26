import { buildHttpClient } from "./shared";

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

export const getSearchFileName = (artist: string, album: string) =>
  `search?${new URLSearchParams({
    searchterm: `${artist} ${album}`,
    searchtype: "l",
  }).toString()}`;

export const buildCrawlerClient = (crawlerServerUrl: string) => {
  const httpClient = buildHttpClient(crawlerServerUrl);

  return {
    async getStatus(): Promise<CrawlerStatus> {
      const response = await httpClient.get<CrawlerStatus>(`/status`);
      return response.data;
    },
    async setError(error: string): Promise<void> {
      await httpClient.post(`/error`, { error });
    },
    async clearError(): Promise<void> {
      await httpClient.delete(`/error`);
    },
    async getHead(): Promise<string | undefined> {
      const response = await httpClient.get<string>(`/head`);
      return response.data;
    },
    async setStatus(status: CrawlerStatus): Promise<void> {
      await httpClient.post(`/status`, { status });
    },
    async getMonitor(): Promise<CrawlerMonitor | undefined> {
      const response = await httpClient.get<CrawlerMonitor>(`/monitor`);
      return response.data;
    },
    async schedule(item: CrawlerItem): Promise<void> {
      await httpClient.post(`/schedule`, item);
    },
  };
};
