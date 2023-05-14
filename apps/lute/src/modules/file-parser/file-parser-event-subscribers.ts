import { EventType, extIsMhtml } from "../../lib";
import { Context } from "../../context";
import { parseMhtmlToHtml } from "./mhtml-parser";

export const registerFileParserEventSubscribers = async (context: Context) => {
  await context.eventBus.subscribe([EventType.FileSaved], {
    name: "file-parser",
    async consumeEvent(_, event) {
      if (extIsMhtml(event.data.fileName)) {
        await parseMhtmlToHtml(context, event.data);
      } else {
        await context.htmlParser.execute(
          event.data.fileName,
          event?.metadata?.correlationId
        );
      }
    },
  });
};
