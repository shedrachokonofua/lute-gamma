export interface EventEntity<T extends Record<string, any>> {
  id: string;
  type: string;
  metadata?: {
    correlationId?: string;
    crawlerIgnores?: boolean;
    [key: string]: any;
  };
  data: T;
}
