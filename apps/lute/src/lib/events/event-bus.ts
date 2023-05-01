import { logger } from "../../logger";
import { Context } from "../../context";
import { RedisClient } from "../db";
import { retry } from "../utils";
import { EventEntity } from "./event-entity";
import { EventSubscriber } from "./event-subscriber";
import { executeWithTimer } from "../helpers";
import { eventBusMetrics } from "./event-bus-metrics";

export interface EventBusParams {
  batchSize?: number;
  blockDurationSeconds?: number;
  retryCount?: number;
  redisClient: RedisClient;
}

const getEventStreamKey = (eventType: string) => `event:${eventType}`;

const getEventStreamCursorKey = (subscriberName: string, eventType: string) =>
  `cursor:${subscriberName}:${eventType}`;

export class EventBus {
  private readonly batchSize: number;
  private readonly blockDurationSeconds: number;
  private readonly retryCount: number;
  private readonly redisClient: RedisClient;
  private readonly subscriberByName = new Map<string, EventSubscriber<any>>();
  private readonly eventTypesBySubscriberName = new Map<string, string[]>();
  private readonly redisClientBySubscriberName = new Map<string, RedisClient>();
  private readonly subscriberKeysByName = new Map<
    string,
    {
      eventStreamKey: string;
      cursorKey: string;
    }
  >();

  constructor({
    batchSize = 100,
    blockDurationSeconds = 0.5,
    retryCount = 5,
    redisClient,
  }: EventBusParams) {
    this.blockDurationSeconds = blockDurationSeconds;
    this.retryCount = retryCount;
    this.redisClient = redisClient;
    this.batchSize = batchSize;
  }

  subscribe<T extends Record<string, any> = any>(
    eventTypes: string[],
    subscriber: EventSubscriber<T>
  ): void {
    this.subscriberByName.set(subscriber.name, subscriber);
    this.eventTypesBySubscriberName.set(subscriber.name, eventTypes);

    eventTypes.forEach((eventType) => {
      this.subscriberKeysByName.set(subscriber.name, {
        cursorKey: getEventStreamCursorKey(subscriber.name, eventType),
        eventStreamKey: getEventStreamKey(eventType),
      });
    });
  }

  async publish<T extends Record<string, any>>(
    payload: Omit<EventEntity<T>, "id">
  ): Promise<EventEntity<T>> {
    const id = await this.redisClient.xAdd(`event:${payload.type}`, "*", {
      type: payload.type,
      metadata: JSON.stringify(payload.metadata || {}),
      data: JSON.stringify(payload.data),
    });

    return {
      id,
      ...payload,
    };
  }

  private async updateEventCursor(
    subscriberName: string,
    lastEvent: EventEntity<any>
  ): Promise<void> {
    const cursorKey = getEventStreamCursorKey(subscriberName, lastEvent.type);
    logger.debug({ subscriberName, lastEvent }, "Updating cursor");
    await this.redisClient.set(cursorKey, lastEvent.id);
  }

  private async getCursor(cursorKey: string): Promise<string> {
    const cursor = await this.redisClient.get(cursorKey);
    return cursor || "0";
  }

  async subscriberListen(
    context: Context,
    subscriberName: string
  ): Promise<void> {
    const redisClient = await context.spawnRedisClient();
    this.redisClientBySubscriberName.set(subscriberName, redisClient);
    const subscriber = this.subscriberByName.get(subscriberName);
    const subscriberKeys = this.subscriberKeysByName.get(subscriberName);
    if (!subscriber || !subscriberKeys) {
      throw new Error(`No subscriber found for ${subscriberName}`);
    }
    const eventTypes =
      this.eventTypesBySubscriberName.get(subscriberName) || [];

    while (true) {
      const readParams = await Promise.all(
        eventTypes.map(async (eventType) => {
          const cursorKey = getEventStreamCursorKey(subscriberName, eventType);
          return {
            key: getEventStreamKey(eventType),
            id: await this.getCursor(cursorKey),
          };
        })
      );

      const responses = await redisClient.xRead(readParams, {
        BLOCK: this.blockDurationSeconds * 1000,
        COUNT: this.batchSize,
      });
      if (!responses) continue;

      await Promise.all(
        responses.map(async (response) => {
          const { messages } = response;
          const events: EventEntity<any>[] = messages.map((message) => ({
            id: message.id,
            type: message.message.type,
            metadata: JSON.parse(message.message.metadata) as Record<
              string,
              any
            >,
            data: JSON.parse(message.message.data) as Record<string, any>,
          }));

          const [, elapsedTime] = await executeWithTimer(async () => {
            await Promise.allSettled(
              events.map(async (event) => {
                await retry(
                  async () => subscriber.consumeEvent(context, event),
                  async (error) => {
                    logger.debug({ error }, "Error consuming event");
                  },
                  this.retryCount
                );
              })
            );

            const lastEvent = events[events.length - 1];
            await this.updateEventCursor(subscriberName, lastEvent);
          });
          eventBusMetrics.observeEventBatchConsumedDuration({
            subscriberName,
            elapsedTime,
            eventCount: events.length,
          });
          logger.info(
            { elapsedTime, eventCount: events.length, subscriberName },
            "Event batch consumed"
          );
        })
      );
    }
  }

  async listen(context: Context): Promise<void> {
    Promise.allSettled(
      Array.from(this.subscriberByName.keys()).map((subscriberName) =>
        this.subscriberListen(context, subscriberName)
      )
    );
  }

  async terminate(): Promise<void> {
    await Promise.all(
      Array.from(this.redisClientBySubscriberName.values()).map((redisClient) =>
        redisClient.quit()
      )
    );
    await this.redisClient.quit();
  }
}
