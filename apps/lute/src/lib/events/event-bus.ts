import { logger } from "../../logger";
import { Context } from "../../context";
import { RedisClient } from "../db";
import { delay, retry } from "../utils";
import { EventEntity } from "./event-entity";
import { EventSubscriber, EventSubscriberParameters } from "./event-subscriber";
import { executeWithTimer } from "../helpers";
import { eventBusMetrics } from "./event-bus-metrics";
import { runWithTraceId } from "../tracing";
import { EventSubscriberRepository } from "./event-subscriber-repository";

export interface EventBusParams {
  batchSize?: number;
  blockDurationSeconds?: number;
  retryCount?: number;
  redisClient: RedisClient;
}

export const getEventStreamKey = (eventType: string) => `event:${eventType}`;

export class EventBus {
  private readonly batchSize: number;
  private readonly blockDurationSeconds: number;
  private readonly retryCount: number;
  private readonly redisClient: RedisClient;
  readonly subscriberParametersByName = new Map<
    string,
    EventSubscriberParameters<any>
  >();
  readonly eventTypesBySubscriberName = new Map<string, string[]>();
  private readonly redisClientBySubscriberName = new Map<string, RedisClient>();
  private readonly eventSubscriberRepository: EventSubscriberRepository;

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
    this.eventSubscriberRepository = new EventSubscriberRepository(redisClient);
  }

  subscribe<T extends Record<string, any> = any>(
    eventTypes: string[],
    subscriber: EventSubscriberParameters<T>
  ): void {
    this.subscriberParametersByName.set(subscriber.name, subscriber);
    this.eventTypesBySubscriberName.set(subscriber.name, eventTypes);
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

  getEventSubscriber<T extends Record<string, any> = any>(
    context: Context,
    subscriberName: string
  ): EventSubscriber<T> {
    const subscriberParameters =
      this.subscriberParametersByName.get(subscriberName);
    if (!subscriberParameters) {
      throw new Error(`No subscriber found for ${subscriberName}`);
    }
    const subscriber = new EventSubscriber(
      context,
      this.eventSubscriberRepository,
      subscriberParameters
    );
    return subscriber;
  }

  async subscriberListen(
    context: Context,
    subscriberName: string
  ): Promise<void> {
    const redisClient = await context.spawnRedisClient();
    this.redisClientBySubscriberName.set(subscriberName, redisClient);
    const subscriber = this.getEventSubscriber(context, subscriberName);
    const eventTypes =
      this.eventTypesBySubscriberName.get(subscriberName) || [];

    while (true) {
      const readParams = await Promise.all(
        eventTypes.map(async (eventType) => ({
          key: getEventStreamKey(eventType),
          id: await subscriber.getCursor(eventType),
        }))
      );

      const responses = await redisClient.xRead(readParams, {
        BLOCK: this.blockDurationSeconds * 1000,
        COUNT: subscriber.batchSize || this.batchSize,
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
                runWithTraceId(event?.metadata?.correlationId, async () => {
                  await retry(
                    async () => {
                      await subscriber.consume(event);
                    },
                    async (error) => {
                      logger.error({ error }, "Error consuming event");
                    },
                    this.retryCount
                  );
                });
              })
            );

            const lastEvent = events[events.length - 1];
            await subscriber.setCursor(lastEvent);
          });
          eventBusMetrics.observeEventBatchConsumed({
            subscriberName,
            elapsedTime,
            eventCount: events.length,
          });
          if ((await subscriber.getStatus()) !== "active") {
            logger.info("Subscriber is not active, stalling");
            await delay(5);
          } else {
            logger.info(
              { elapsedTime, eventCount: events.length, subscriberName },
              "Event batch consumed"
            );
          }
        })
      );
    }
  }

  async listen(context: Context): Promise<void> {
    Promise.allSettled(
      Array.from(this.subscriberParametersByName.keys()).map((subscriberName) =>
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
