import { RedisClient } from "../db";
import { EventEntity } from "./event-entity";

export type EventSubscriberStatus = "active" | "stopped" | "bypassing";

export const isEventSubscriberStatus = (
  value: string
): value is EventSubscriberStatus =>
  value === "active" || value === "stopped" || value === "bypassing";

export class EventSubscriberRepository {
  constructor(private readonly redisClient: RedisClient) {}

  private static getStatusKey = (subscriberName: string) =>
    `subscriber:${subscriberName}:status`;

  private static getCursorKey = (subscriberName: string, eventType: string) =>
    `cursor:${subscriberName}:${eventType}`;

  private static getStreamKey = (eventType: string) => `event:${eventType}`;

  async getStatus(subscriberName: string): Promise<EventSubscriberStatus> {
    const status = await this.redisClient.get(
      EventSubscriberRepository.getStatusKey(subscriberName)
    );
    return (status as EventSubscriberStatus) || "active";
  }

  async setStatus(subscriberName: string, status: EventSubscriberStatus) {
    if (!isEventSubscriberStatus(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    await this.redisClient.set(
      EventSubscriberRepository.getStatusKey(subscriberName),
      status
    );
  }

  async getCursor(subscriberName: string, eventType: string): Promise<string> {
    return (
      (await this.redisClient.get(
        EventSubscriberRepository.getCursorKey(subscriberName, eventType)
      )) || "0"
    );
  }

  async setCursor(
    subscriberName: string,
    event: EventEntity<any>
  ): Promise<void> {
    await this.redisClient.set(
      EventSubscriberRepository.getCursorKey(subscriberName, event.type),
      event.id
    );
  }

  async deleteCursor(subscriberName: string, eventType: string): Promise<void> {
    await this.redisClient.del(
      EventSubscriberRepository.getCursorKey(subscriberName, eventType)
    );
  }

  async getCursorAge(
    subscriberName: string,
    eventType: string
  ): Promise<number | null> {
    const cursor = await this.getCursor(subscriberName, eventType);
    if (cursor === "0") {
      return null;
    }

    const streamKey = EventSubscriberRepository.getStreamKey(eventType);
    const head = await this.redisClient.xRevRange(streamKey, "+", "-", {
      COUNT: 1,
    });
    if (head.length === 0) {
      return null;
    }

    const headCursor = head[0].id;
    return parseInt(headCursor) - parseInt(cursor);
  }
}
