export interface EventEntity<T extends Record<string, any>> {
  id: string;
  type: string;
  metadata?: {
    correlationId?: string;
    [key: string]: any;
  };
  data: T;
}
