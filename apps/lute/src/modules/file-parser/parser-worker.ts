import { expose } from "threads/worker";
import { buildWorkerContext } from "../../context";
import { EventEntity, extIsMhtml, FileSavedEventPayload } from "../../lib";
import { parseHtmlToPageData } from "./html-parser";
import { parseMhtmlToHtml } from "./mhtml-parser";

expose(async (event: EventEntity<FileSavedEventPayload>) => {
  const context = await buildWorkerContext();
  if (extIsMhtml(event.data.fileName)) {
    await parseMhtmlToHtml(context, event.data);
  } else {
    await parseHtmlToPageData(context, event);
  }
});
