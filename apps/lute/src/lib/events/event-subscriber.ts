import { Context } from "../../context";
import { EventEntity } from "./event-entity";

export interface EventSubscriber<EventData extends Record<string, any>> {
  name: string;
  consumeEvent: (
    context: Context,
    event: EventEntity<EventData>
  ) => Promise<void>;
}
