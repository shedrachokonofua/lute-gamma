import {
  ChartParameters,
  ChartPage,
  AlbumPage,
  parseReleaseDateString,
  getChartReleaseType,
} from "@lute/domain";
import { transformObject } from "../../../../lib";
import { xRay } from "./xray";

const parseYearSegment = (
  yearsSegment: string
): {
  yearsRangeStart: number;
  yearsRangeEnd: number;
} => {
  if (yearsSegment === "all-time") {
    return {
      yearsRangeStart: 1900,
      yearsRangeEnd: new Date().getFullYear(),
    };
  }

  if (yearsSegment.includes("-")) {
    const [yearsRangeStart, yearsRangeEnd] = yearsSegment.split("-");

    return {
      yearsRangeStart: Number(yearsRangeStart),
      yearsRangeEnd: Number(yearsRangeEnd),
    };
  }

  if (yearsSegment.includes("s")) {
    const yearsRangeStart = Number(yearsSegment.replace("s", ""));
    const yearsRangeEnd = yearsRangeStart + 9;

    return {
      yearsRangeStart,
      yearsRangeEnd,
    };
  }

  return {
    yearsRangeStart: Number(yearsSegment),
    yearsRangeEnd: Number(yearsSegment),
  };
};

enum FilterSegmemt {
  PrimaryGenres = "g",
  SecondaryGenres = "s",
  PrimaryOrSecondaryGenres = "ge",
  Descriptors = "d",
}

const isFilterSegment = (type: FilterSegmemt, segment: string) =>
  segment.startsWith(`${type}:`);

const parseFilterSegment = (
  key: string,
  filterSegment: string
): {
  includes: string[];
  excludes: string[];
} => {
  const relevantPart = filterSegment.replace(`${key}:`, "");
  const parts = relevantPart
    .split(",")
    .filter((part) => part !== "" && part !== "exact");
  const [includes, excludes] = parts.reduce<[string[], string[]]>(
    (acc, part) => {
      if (part.startsWith("-")) {
        acc[1].push(part.replace("-", ""));
      } else {
        acc[0].push(part);
      }
      return acc;
    },
    [[], []]
  );
  return { includes, excludes };
};

const isPageNumber = (segment: string) => Number(segment) > 0;

const parseChartParameters = (fileName: string): ChartParameters => {
  const releaseType = getChartReleaseType(fileName);
  const relevantPart = fileName.replace("charts/top/album/", "");
  const [yearsSegment, ...filterSegments] = relevantPart.split("/");
  const pageNumber = isPageNumber(filterSegments[filterSegments.length - 1])
    ? Number(filterSegments.pop())
    : 1;
  const { yearsRangeStart, yearsRangeEnd } = parseYearSegment(yearsSegment);

  return filterSegments.reduce<ChartParameters>(
    (params, segment) => {
      if (isFilterSegment(FilterSegmemt.PrimaryGenres, segment)) {
        const { includes, excludes } = parseFilterSegment(
          FilterSegmemt.PrimaryGenres,
          segment
        );
        params.includePrimaryGenres = includes;
        params.excludePrimaryGenres = excludes;
      }

      if (isFilterSegment(FilterSegmemt.SecondaryGenres, segment)) {
        const { includes, excludes } = parseFilterSegment(
          FilterSegmemt.SecondaryGenres,
          segment
        );
        params.includeSecondaryGenres = includes;
        params.excludeSecondaryGenres = excludes;
      }

      if (isFilterSegment(FilterSegmemt.PrimaryOrSecondaryGenres, segment)) {
        const { includes, excludes } = parseFilterSegment(
          FilterSegmemt.PrimaryOrSecondaryGenres,
          segment
        );
        params.includePrimaryGenres = [
          ...(params.includePrimaryGenres || []),
          ...includes,
        ];
        params.excludePrimaryGenres = [
          ...(params.excludePrimaryGenres || []),
          ...excludes,
        ];
        params.includeSecondaryGenres = [
          ...(params.includeSecondaryGenres || []),
          ...includes,
        ];
        params.excludeSecondaryGenres = [
          ...(params.excludeSecondaryGenres || []),
          ...excludes,
        ];
      }

      if (isFilterSegment(FilterSegmemt.Descriptors, segment)) {
        const { includes, excludes } = parseFilterSegment(
          FilterSegmemt.Descriptors,
          segment
        );
        params.includeDescriptors = includes;
        params.excludeDescriptors = excludes;
      }

      return params;
    },
    {
      releaseType,
      pageNumber,
      yearsRangeStart,
      yearsRangeEnd,
    }
  );
};

export const parseChart = async (
  fileName: string,
  html: string
): Promise<ChartPage | undefined> => {
  const parameters = parseChartParameters(fileName);

  const albumDataWithFileName: Partial<AlbumPage & { fileName?: string }>[] =
    await xRay(html, ".page_charts_section_charts_item", [
      {
        name: ".page_charts_section_charts_item_title | trim",
        artists: xRay(
          ".page_charts_section_charts_item_credited_links_primary a",
          [
            {
              name: "@text | trim",
              fileName: "@href | linkToFileName",
            },
          ]
        ),
        rating:
          ".page_charts_section_charts_item_details_average_num | toNumber",
        ratingCount:
          ".page_charts_section_charts_item_details_ratings .full | toNumber",
        primaryGenres: xRay(".page_charts_section_charts_item_genres_primary", [
          "a",
        ]),
        secondaryGenres: xRay(
          ".page_charts_section_charts_item_genres_secondary",
          ["a"]
        ),
        descriptors: xRay(
          ".page_charts_section_charts_item_genre_descriptors",
          ["span | dropTrailingComma"]
        ),
        releaseDate: ".page_charts_section_charts_item_date span",
        fileName: xRay(
          "a.page_charts_section_charts_item_link @href | linkToFileName"
        ),
      },
    ]);

  const albums = albumDataWithFileName
    .filter(({ fileName }) => !!fileName)
    .map((albumData, i) => ({
      albumData: transformObject(albumData, {
        releaseDate: parseReleaseDateString,
      }),
      fileName: albumData.fileName as string,
      position: i + 1,
    }));

  return {
    parameters,
    albums,
  };
};
