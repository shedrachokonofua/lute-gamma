import { EventType, extIsMhtml } from "../../lib";
import { Context } from "../../context";
import { parseHtmlToPageData } from "./html-parser";
import { parseMhtmlToHtml } from "./mhtml-parser";

export const registerFileParserEventSubscribers = async (context: Context) => {
  await context.eventBus.subscribe([EventType.FileSaved], {
    name: "file-parser",
    async consumeEvent(context, event) {
      if (extIsMhtml(event.data.fileName)) {
        await parseMhtmlToHtml(context, event.data);
      } else {
        await parseHtmlToPageData(context, event);
      }
    },
  });
};
