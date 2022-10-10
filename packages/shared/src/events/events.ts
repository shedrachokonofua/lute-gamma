import * as rTracer from "cls-rtracer";
import { Logger } from "pino";
import { RedisClient } from "../db";
import { retry } from "../utils";

export enum LuteEvent {
  FileSaved = "file-saved",
  PageDataParsed = "page-data-parsed",
  LookupSaved = "lookup-saved",
  LookupNotFound = "lookup-not-found",
}

const getEventStreamKey = (event: LuteEvent) => `event:${event}`;

const getEventStreamCursorKey = (subscriberName: string, event: LuteEvent) =>
  `cursor:${subscriberName}:${event}`;

const deleteUndefinedValues = <T extends {}>(obj: T): T =>
  Object.keys(obj).reduce((acc, key) => {
    const keyOfT = key as keyof T;
    if (obj[keyOfT] !== undefined) {
      acc[keyOfT] = obj[keyOfT];
    }
    return acc;
  }, {} as T);

export const buildLuteEventClient = (redisClient: RedisClient) => {
  return {
    publish(
      event: LuteEvent,
      data: Record<string, any>,
      traceId = rTracer.id() as string | undefined
    ): Promise<string> {
      if (traceId) {
        data._luteTraceId = traceId;
      }

      return redisClient.xAdd(
        getEventStreamKey(event),
        "*",
        deleteUndefinedValues(data)
      );
    },
  };
};

export type LuteEventClient = ReturnType<typeof buildLuteEventClient>;

export const buildLuteEventSubscriber = async <T = any>({
  redisClient,
  name,
  event,
  handler,
  logger,
  retryCount = 5,
  retryDelay = 1000,
  messageCount = 10,
  predicate = (message: T) => true,
}: {
  redisClient: RedisClient;
  name: string;
  event: LuteEvent;
  handler: (messages: T) => void;
  logger: Logger;
  messageCount?: number;
  retryCount?: number;
  retryDelay?: number;
  timeoutSeconds?: number;
  predicate?: (message: T) => boolean;
}) => {
  const eventStreamKey = getEventStreamKey(event);
  const eventStreamCursorKey = getEventStreamCursorKey(name, event);

  while (true) {
    const cursor = (await redisClient.get(eventStreamCursorKey)) ?? "0";
    const response = await redisClient.xRead(
      {
        key: eventStreamKey,
        id: cursor,
      },
      {
        COUNT: messageCount,
        BLOCK: 5000,
      }
    );

    if (!response) {
      continue;
    }

    const messages = response[0].messages;

    if (messages.length === 0) {
      continue;
    }

    const filteredMessages = messages.filter(({ message }) =>
      predicate(message as T)
    );

    if (filteredMessages.length > 0) {
      await retry(
        async () => {
          await Promise.all(
            filteredMessages.map(async ({ message }) => {
              await rTracer.runWithId(async () => {
                await handler(message as T);
              }, (message as any)?._luteTraceId);
            })
          );
        },
        async (error) => {
          logger.error(
            { error, filteredMessages },
            "Error while handling messages"
          );
        },
        retryCount,
        retryDelay
      );
    }

    const nextCursor = messages[messages.length - 1]?.id;
    if (nextCursor) {
      await redisClient.set(eventStreamCursorKey, nextCursor);
      logger.debug(
        { nextCursor, eventStreamCursorKey, previousCursor: cursor },
        "Updated event stream cursor"
      );
    }
  }
};
