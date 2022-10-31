import { PageType } from "@lute/domain";
import { Context } from "../../context";
import { EventType, ParserPageParsedEventPayload } from "../../lib";
import { EventEntity } from "../../lib/events/event-entity";

export const registerChartEventSubscribers = async (context: Context) => {
  await context.eventBus.subscribe([EventType.ParserPageParsed], {
    name: "chart.store",
    async consumeEvent(
      context,
      { data: { pageType, data } }: EventEntity<ParserPageParsedEventPayload>
    ) {
      if (pageType !== PageType.Chart) return;

      await context.chartInteractor.putChart({
        fileId: data.fileId,
        fileName: data.fileName,
        ...(data as any),
      });
    },
  });
};
