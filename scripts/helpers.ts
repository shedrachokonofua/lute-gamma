import { RedisClient } from "../apps/lute/src/lib";
import { config } from "../apps/lute/src/config";
import { Context, buildContext } from "../apps/lute/src/context";

export const pushToEventStream = async (
  redisClient: RedisClient,
  payload: any
) => {
  await redisClient.xAdd(`event:${payload.type}`, "*", {
    type: payload.type,
    metadata: JSON.stringify(payload.metadata || {}),
    data: JSON.stringify(payload.data),
  });
};

type Writeable<T> = {
  -readonly [P in keyof T]: T[P] extends object ? Writeable<T[P]> : T[P];
};

const mountScriptConfig = () => {
  const scriptConfig = config as Writeable<typeof config>;
  scriptConfig.redis.url = "redis://localhost:6379";
  scriptConfig.mongo.url = "mongodb://localhost:27017";
};

export const runScript = async (fn: (context: Context) => Promise<void>) => {
  let context: Context | undefined = undefined;
  try {
    mountScriptConfig();
    context = await buildContext();
    await fn(context);
  } catch (error) {
    console.error(error);
  } finally {
    if (context) {
      await context.terminate();
    }
  }
};
