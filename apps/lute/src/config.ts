import * as env from "env-var";

const ENV = env.get("ENV").default("development").asString();
const isProduction = ENV === "production";

export const config = {
  isProduction,
  env: ENV,
  mongo: {
    url: env
      .get("MONGO_URL")
      .default("mongodb://mongodb:27017/lute")
      .asString(),
  },
  redis: {
    url: env.get("REDIS_URL").default("redis://redis:6379").asString(),
  },
  spaces: {
    key: env.get("SPACES_KEY").required(isProduction).asString(),
    secret: env.get("SPACES_SECRET").required(isProduction).asString(),
    bucket: env.get("SPACES_BUCKET").required(isProduction).asString(),
  },
  proxy: {
    host: env.get("PROXY_HOST").required().asString(),
    port: env.get("PROXY_PORT").required().asPortNumber(),
    username: env.get("PROXY_USERNAME").required().asString(),
    password: env.get("PROXY_PASSWORD").required().asString(),
  },
  loki: {
    host: env.get("LOKI_HOST").required().asString(),
    username: env.get("LOKI_USERNAME").required().asString(),
    password: env.get("LOKI_PASSWORD").required().asString(),
  },
  spotify: {
    clientId: env.get("SPOTIFY_CLIENT_ID").required().asString(),
    clientSecret: env.get("SPOTIFY_CLIENT_SECRET").required().asString(),
  },
  crawler: {
    stallSeconds: env
      .get("CRAWLER_STALL_SECONDS")
      .default(10)
      .asFloatPositive(),
    claimTtlMinutes: env
      .get("CRAWLER_CLAIM_TTL_MINUTES")
      .default(10)
      .asFloatPositive(),
    concurrency: env.get("CRAWLER_CONCURRENCY").default(10).asIntPositive(),
    dlqMaxSize: env.get("CRAWLER_DLQ_MAX_SIZE").default(3500).asIntPositive(),
    maxSize: env.get("CRAWLER_QUEUE_MAX_SIZE").default(3500).asIntPositive(),
    quota: {
      windowDays: env
        .get("CRAWLER_QUOTA_WINDOW_DAYS")
        .default(1)
        .asIntPositive(),
      maxRequests: env
        .get("CRAWLER_QUOTA_MAX_REQUESTS")
        .default(500)
        .asIntPositive(),
    },
  },
  files: {
    useSpaces: env.get("USE_SPACES").default("true").asBool(),
    ttlSeconds: env
      .get("FILE_TTL_SECONDS")
      .default(60 * 60 * 24)
      .asIntPositive(),
    localBucketPath: env
      .get("LOCAL_BUCKET_PATH")
      .default("./test-bucket")
      .asString(),
    ttlDays: {
      artist: env.get("FILE_ARTIST_TTL_DAYS").default(14).asIntPositive(),
      album: env.get("FILE_ALBUM_TTL_DAYS").default(7).asIntPositive(),
      chart: env.get("FILE_CHARTS_TTL_DAYS").default(7).asIntPositive(),
      search: env.get("FILE_SEARCH_TTL_DAYS").default(1).asIntPositive(),
    },
  },
  server: {
    host: env.get("HOST").default("http://localhost:4000").asString(),
  },
  cron: {
    isTsNode: env.get("TS_NODE").default("false").asBool(),
    profileSeedIntervalHours: env
      .get("CRON_PROFILE_SEED_INTERVAL_HOURS")
      .default(6)
      .asIntPositive(),
  },
} as const;
