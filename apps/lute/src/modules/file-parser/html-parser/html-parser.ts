import { PageType } from "@lute/domain";
import {
  EventType,
  ParserFailedEventPayload,
  ParserPageParsedEventPayload,
  executeWithTimer,
  getPageTypeFromFileName,
  EventBus,
  span,
} from "../../../lib";
import { logger } from "../../../logger";
import {
  parseArtist,
  parseAlbum,
  parseChart,
  parseSearch,
} from "./page-parsers";
import { parserMetrics } from "../parser-metrics";
import { FileInteractor } from "../../files";

export class HtmlParser {
  @span
  static async parse(fileName: string, html: string) {
    const pageType = getPageTypeFromFileName(fileName);

    switch (pageType) {
      case PageType.Artist:
        return parseArtist(html);
      case PageType.Album:
        return parseAlbum(html);
      case PageType.Chart:
        return parseChart(fileName, html);
      case PageType.Search:
        return parseSearch(fileName, html);
      default:
        return;
    }
  }

  constructor(
    private readonly eventBus: EventBus,
    private readonly fileInteractor: FileInteractor
  ) {}

  @span
  async execute(fileName: string, correlationId?: string) {
    try {
      const metadata = await this.fileInteractor.getFileMetadata(fileName);
      if (!metadata) {
        logger.error("Could not find file metadata", {
          fileName,
        });
        return;
      }

      const html = await this.fileInteractor.getFileContent(fileName);
      if (!html) {
        logger.error("Could not find file content", {
          fileName,
        });

        return;
      }
      const pageType = getPageTypeFromFileName(fileName);

      if (!pageType) {
        logger.error({ fileName }, "Could not determine page type");
        throw new Error("Could not determine page type");
      }

      const [pageData, timeElapsed] = await executeWithTimer(async () =>
        HtmlParser.parse(fileName, html)
      );

      if (!pageData) {
        logger.error({ fileName }, "Unable to parse page");
        throw new Error("Unable to parse page");
      }
      parserMetrics.observeParseDuration(pageType, timeElapsed);
      logger.info({ fileName, timeElapsed, pageType }, "Parsed file");

      await this.eventBus.publish<ParserPageParsedEventPayload>({
        type: EventType.ParserPageParsed,
        data: {
          fileName,
          pageType,
          fileId: metadata.id,
          data: pageData,
        },
        metadata: {
          correlationId,
        },
      });

      return pageData;
    } catch (error) {
      logger.error({ fileName, error }, "Failed to parse page");
      await this.eventBus.publish<ParserFailedEventPayload>({
        type: EventType.ParserFailed,
        data: {
          fileName,
          error: (error as Error)?.message || "Unknown error",
        },
        metadata: {
          correlationId,
        },
      });
    }
  }
}
