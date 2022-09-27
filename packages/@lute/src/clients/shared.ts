import axios from "axios";
import rTracer from "cls-rtracer";

export type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

export const buildHttpClient = (baseURL: string) => {
  const network = axios.create({ baseURL });
  network.interceptors.request.use((config) => {
    config.headers = {
      ...config.headers,
      "X-Request-Id": rTracer.id() as string,
    };
    return config;
  });
  return network;
};
