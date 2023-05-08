import { Context } from "../../context";
import { logger } from "../../logger";
import { EventEntity } from "./event-entity";
import {
  EventSubscriberRepository,
  EventSubscriberStatus,
} from "./event-subscriber-repository";

export interface EventSubscriberParameters<
  EventData extends Record<string, any>
> {
  name: string;
  consumeEvent: (
    context: Context,
    event: EventEntity<EventData>
  ) => Promise<void>;
}

export class EventSubscriber<EventData extends Record<string, any>> {
  constructor(
    protected readonly context: Context,
    private readonly eventSubscriberRepository: EventSubscriberRepository,
    private readonly parameters: EventSubscriberParameters<EventData>
  ) {}

  async consume(event: EventEntity<EventData>) {
    const status = await this.eventSubscriberRepository.getStatus(
      this.parameters.name
    );
    if (status === "stopped" || status === "bypassing") {
      logger.debug(
        { subscriberName: this.parameters.name, status },
        "Not consuming event because subscriber is stopped or bypassing"
      );
      return;
    }

    logger.debug(
      { subscriberName: this.parameters.name, status },
      "Consuming event for subscriber"
    );
    await this.parameters.consumeEvent(this.context, event);
  }

  async getStatus() {
    return this.eventSubscriberRepository.getStatus(this.parameters.name);
  }

  async setStatus(status: EventSubscriberStatus) {
    await this.eventSubscriberRepository.setStatus(
      this.parameters.name,
      status
    );
  }

  async getCursor(eventType: string) {
    return this.eventSubscriberRepository.getCursor(
      this.parameters.name,
      eventType
    );
  }

  async setCursor(event: EventEntity<EventData>) {
    const status = await this.eventSubscriberRepository.getStatus(
      this.parameters.name
    );
    if (status === "stopped") {
      logger.debug(
        { subscriberName: this.parameters.name, status },
        "Not setting cursor because subscriber is stopped"
      );
      return;
    }

    logger.debug(
      { subscriberName: this.parameters.name, status },
      "Setting cursor for subscriber"
    );
    await this.eventSubscriberRepository.setCursor(this.parameters.name, event);
  }

  async getCursorAge(eventType: string) {
    return this.eventSubscriberRepository.getCursorAge(
      this.parameters.name,
      eventType
    );
  }
}
