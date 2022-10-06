import { buildCrawlerClient, buildProfileClient } from "../packages/clients";
import { runWithTraceId } from "../packages/shared";

const profileClient = buildProfileClient("http://localhost:3338");
const crawlerClient = buildCrawlerClient("http://localhost:3335");

console.log(profileClient);
(async () => {
  runWithTraceId(async () => {
    const profile = await profileClient.getProfile("default");
    if (!profile) {
      throw new Error("Profile not found");
    }
    const genres = profile.details.primaryGenres.map((g) =>
      g.item.toLowerCase().replace(/ /g, "-").replace(/&/g, "and")
    );
    const names = genres.map(
      (genre) => `charts/top/album/all-time/g:${genre}/`
    );
    for (const name of names) {
      for (let i = 1; i <= 5; i++) {
        await crawlerClient.schedule({
          fileName: `${name}${i}`,
        });
      }
    }
  });
})();
//https://rateyourmusic.com/charts/top/album/all-time/g:hip-hop
