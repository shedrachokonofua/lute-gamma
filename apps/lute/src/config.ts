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
  proxy: {
    host: env.get("PROXY_HOST").required().asString(),
    port: env.get("PROXY_PORT").required().asPortNumber(),
    username: env.get("PROXY_USERNAME").required().asString(),
    password: env.get("PROXY_PASSWORD").required().asString(),
  },
  spotify: {
    clientId: env.get("SPOTIFY_CLIENT_ID").required().asString(),
    clientSecret: env.get("SPOTIFY_CLIENT_SECRET").required().asString(),
  },
  crawler: {
    coolDownSeconds: env
      .get("COOL_DOWN_SECONDS")
      .default(0.25)
      .asFloatPositive(),
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
  },
  server: {
    host: env.get("HOST").default("http://localhost:4000").asString(),
  },
  cron: {
    isTsNode: env.get("TS_NODE").default("false").asBool(),
  },
} as const;
