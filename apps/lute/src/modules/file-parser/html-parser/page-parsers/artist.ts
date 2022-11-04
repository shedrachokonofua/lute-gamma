import { ArtistPage } from "@lute/domain";
import { EventEntity, FileSavedEventPayload } from "../../../../lib";
import { xRay, xRayMetaSelector } from "./xray";

export const parseArtist = async (
  event: EventEntity<FileSavedEventPayload>,
  html: string
): Promise<ArtistPage> => {
  const artistData = await xRay(html, ".artist_page", {
    name: xRayMetaSelector("name"),
    albums: xRay("#disco_type_s a.album", [
      {
        name: "@text | trim",
        fileName: "@href | linkToFileName",
      },
    ]),
    mixtapes: xRay("#disco_type_m a.album", [
      {
        name: "@text | trim",
        fileName: "@href | linkToFileName",
      },
    ]),
    eps: xRay("#disco_type_e a.album", [
      {
        name: "@text | trim",
        fileName: "@href | linkToFileName",
      },
    ]),
  });

  return {
    name: artistData.name,
    albums: [...artistData.albums, ...artistData.mixtapes, ...artistData.eps],
  };
};
