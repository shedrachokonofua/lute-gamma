import { transformObject } from "../../../../lib";
import { AlbumPage, parseReleaseDateString, Track } from "@lute/domain";
import { xRay, xRayMetaSelector } from "./xray";
import { logger } from "../../../../logger";
import { parse as parseFormattedDate, startOfYear } from "date-fns";

export const parseAlbum = async (html: string): Promise<AlbumPage> => {
  const albumData = await xRay(html, ".release_page", {
    name: xRayMetaSelector("name"),
    artists: xRay("span[itemprop='byArtist'] a", [
      {
        name: "@text | trim",
        fileName: "@href | linkToFileName",
      },
    ]),
    releaseDate: ".issue_year.ymd@title",
    releaseYear: ".issue_year.y@title | toNumber",
    rating: xRayMetaSelector("ratingValue") + "| toNumber",
    ratingCount: xRayMetaSelector("ratingCount") + "| toNumber",
    primaryGenres: xRay(".release_pri_genres > .genre", ["@text"]),
    secondaryGenres: xRay(".release_sec_genres > .genre", ["@text"]),
    descriptors: xRay(".release_descriptors > td > meta", ["@content | trim"]),
    tracks: xRay("#tracks .track", [
      {
        name: ".tracklist_title .rendered_text@text",
        lengthSeconds: ".tracklist_duration@data-inseconds | toNumber",
        rating: ".track_rating@text | toNumber",
        position: ".tracklist_num@text | trim",
      },
    ]),
  });

  logger.info({ albumData }, "Raw album data");

  return transformObject<any>(albumData, {
    releaseYear: () => undefined,
    releaseDateString: () => albumData.releaseDate,
    releaseDate: (releaseDateString) => {
      const trimmedValue = releaseDateString?.trim();
      if (trimmedValue) {
        return parseFormattedDate(trimmedValue, "dd MMMM yyyy", new Date());
      }
      if (albumData.releaseYear) {
        return new Date(albumData.releaseYear, 0, 1);
      }
      return null;
    },
    tracks: (value: Track[]) =>
      value
        .map((track) => ({
          ...track,
          lengthSeconds:
            track.lengthSeconds === 0 ? undefined : track.lengthSeconds,
          rating: track.rating === 0 ? undefined : track.rating,
        }))
        .filter((track) => !Object.values(track).every((v) => v === undefined)),
  });
};
