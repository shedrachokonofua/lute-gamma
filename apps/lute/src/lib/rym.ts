import { PageType, isLuteAlbumFileName } from "@lute/domain";

export const getPageTypeFromFileName = (
  fileName: string
): PageType | undefined => {
  if (isLuteAlbumFileName(fileName)) {
    return PageType.Album;
  }
  if (fileName.startsWith("charts/")) {
    return PageType.Chart;
  }
  if (fileName.startsWith("search")) {
    return PageType.Search;
  }
  if (fileName.startsWith("artist")) {
    return PageType.Artist;
  }
  return undefined;
};
