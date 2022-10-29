import * as env from "env-var";

const ENV = env.get("ENV").default("development").asString();
const isProduction = ENV === "production";

export const config = {
  isProduction,
  env: ENV,
  mongo: {
    url: env.get("MONGO_URL").default("mongodb://mongodb:27017").asString(),
  },
  redis: {
    url: env.get("REDIS_URL").default("redis://redis:6379").asString(),
  },
  spaces: {
    key: env.get("SPACES_KEY").required(isProduction).asString(),
    secret: env.get("SPACES_SECRET").required(isProduction).asString(),
    bucket: env
      .get("SPACES_BUCKET")
      .required(isProduction)
      .default("")
      .asString(),
  },
  files: {
    ttlSeconds: env
      .get("FILE_TTL_SECONDS")
      .default(60 * 60 * 24)
      .asIntPositive(),
    localBucketPath: env
      .get("LOCAL_BUCKET_PATH")
      .default("./test-bucket")
      .asString(),
  },
} as const;
