import { buildCrawlerClient, buildProfileClient } from "../packages/clients";
import { ItemAndCount } from "../packages/domain";
import { runWithTraceId } from "../packages/shared";

const profileClient = buildProfileClient("http://138.197.145.94:3338");
const crawlerClient = buildCrawlerClient("http://138.197.145.94:3335");

const toGenreTag = (g: ItemAndCount) =>
  g.item.toLowerCase().replace(/ /g, "-").replace(/&/g, "and");

const rangeInclusive = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, i) => i + start);

const getFileNamesToCrawl = (genres: string[]) =>
  genres.flatMap((g) =>
    rangeInclusive(1960, 2022)
      .reverse()
      .flatMap((y) =>
        rangeInclusive(1, 2).map((i) => `charts/top/album/${y}/g:${g}/${i}`)
      )
  );

(async () => {
  runWithTraceId(async () => {
    const profile = await profileClient.getProfile("default");
    if (!profile) {
      throw new Error("Profile not found");
    }
    const primaryGenres = profile.details.primaryGenres.map(toGenreTag);
    const secondaryGenres: string[] = [];

    const fileNamesToCrawl = getFileNamesToCrawl([
      ...primaryGenres,
      ...secondaryGenres,
    ]);
    await Promise.all(
      fileNamesToCrawl.map((f) =>
        crawlerClient.schedule({
          fileName: f,
        })
      )
    );
  });
})();
