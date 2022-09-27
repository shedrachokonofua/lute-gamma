import { buildCrawlerClient, runWithTraceId } from "../packages/@lute";

const crawlerClient = buildCrawlerClient("http://localhost:3335");
for (let year = 1950; year < new Date().getFullYear(); year++) {
  for (let page = 1; page <= 5; page++) {
    runWithTraceId(() => {
      crawlerClient
        .schedule({
          fileName: `charts/top/album/${year}/${page}`,
        })
        .catch((err) => console.log(err));
    });
  }
}
