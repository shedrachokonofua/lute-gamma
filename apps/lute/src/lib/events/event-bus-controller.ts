import { Controller, LuteExpressResponse as Response } from "../controller";
import { Request, Router } from "express";
import { EventSubscriberStatus } from "./event-subscriber-repository";

interface EventBusMonitor {
  subscribers: {
    name: string;
    status: EventSubscriberStatus;
    streams: {
      eventType: string;
      cursor: string;
      cursorAge: number | null;
    }[];
  }[];
}

export class EventBusController extends Controller {
  private get eventBus() {
    return this.context.eventBus;
  }

  get router() {
    return Router()
      .get("/monitor", this.mount(this.getMonitor))
      .put("/status", this.mount(this.setStatus))
      .delete("/cursor", this.mount(this.deleteCursor));
  }

  async getMonitor(req: Request, res: Response) {
    const subscribers = await Promise.all(
      Array.from(this.eventBus.subscriberParametersByName.keys()).map(
        async (name) => {
          const subscriber = this.eventBus.getEventSubscriber(
            this.context,
            name
          );
          const eventTypes =
            this.eventBus.eventTypesBySubscriberName.get(name) || [];
          const streams = await Promise.all(
            eventTypes.map(async (eventType) => ({
              eventType,
              cursor: await subscriber.getCursor(eventType),
              cursorAge: await subscriber.getCursorAge(eventType),
            }))
          );

          return {
            name,
            status: await subscriber.getStatus(),
            streams,
          };
        }
      )
    );

    const monitor: EventBusMonitor = {
      subscribers,
    };

    return res.success(monitor);
  }

  async setStatus(req: Request, res: Response) {
    const { subscriberName, status } = req.body;
    const subscriber = this.eventBus.getEventSubscriber(
      this.context,
      subscriberName
    );
    await subscriber.setStatus(status);
    return res.success();
  }

  async deleteCursor(req: Request, res: Response) {
    const { subscriberName, eventType } = req.body;
    const subscriber = this.eventBus.getEventSubscriber(
      this.context,
      subscriberName
    );
    await subscriber.deleteCursor(eventType);
    return res.success();
  }
}
