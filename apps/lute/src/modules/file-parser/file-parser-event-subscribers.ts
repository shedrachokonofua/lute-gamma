import { EventType } from "../../lib";
import { Context } from "../../context";
import { parserPool } from "./parser-pool";

export const registerFileParserEventSubscribers = async (context: Context) => {
  await context.eventBus.subscribe([EventType.FileSaved], {
    name: "file-parser",
    async consumeEvent(_, event) {
      parserPool.queue((handleEvent) => handleEvent(event));
    },
  });
};
