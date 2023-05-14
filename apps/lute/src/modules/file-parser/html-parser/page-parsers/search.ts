import { SearchBestMatch, isLuteAlbumFileName } from "@lute/domain";
import { logger } from "../../../../logger";
import { xRay } from "./xray";

export const parseSearch = async (
  fileName: string,
  html: string
): Promise<SearchBestMatch | undefined> => {
  const results = (await xRay(html, ".infobox", [
    {
      name: "a.searchpage",
      fileName: "a.searchpage@href | linkToFileName",
      artists: xRay("a.artist", [
        {
          name: "@text | trim",
          fileName: "@href | linkToFileName",
        },
      ]),
    },
  ])) as SearchBestMatch[];

  const filteredResults = results.filter((result) =>
    isLuteAlbumFileName(result.fileName)
  );

  if (filteredResults.length === 0) {
    logger.info({ fileName }, "No results found");
    return undefined;
  }

  const bestMatch = filteredResults[0];
  logger.info({ fileName, bestMatch }, "Best match found");
  return bestMatch;
};
