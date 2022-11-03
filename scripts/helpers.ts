import { RedisClient } from "../apps/lute/src/lib";

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
