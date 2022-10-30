import * as env from "env-var";

export const config = {
  luteServerUrl: {
    browserSide:
      (process.env.NEXT_PUBLIC_LUTE_SERVER_URL as string) ||
      "http://localhost:4000",
    serverSide: env.get("LUTE_SERVER_URL").default("http://lute").asString(),
  },
};
