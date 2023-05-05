import { z } from "zod";

export enum PageType {
  Artist = "artist",
  Album = "album",
  Chart = "chart",
  Search = "search",
}

export class FileName {
  private static readonly SUPPORTED_RELEASE_TYPES = ["album", "mixtape", "ep"];

  static zodSchema = z.string().refine((value) => !!new FileName(value), {
    message: "Invalid file name",
  });

  static isAlbumPage(name: string): boolean {
    return FileName.SUPPORTED_RELEASE_TYPES.some((releaseType) =>
      name.startsWith(`release/${releaseType}/`)
    );
  }

  static isChartPage(name: string): boolean {
    return /^charts\/(\w+)\/(album|mixtape|ep)\//.test(name);
  }

  static getPageType(name: string): PageType | undefined {
    if (FileName.isAlbumPage(name)) {
      return PageType.Album;
    }
    if (FileName.isChartPage(name)) {
      return PageType.Chart;
    }
    if (name.startsWith("search")) {
      return PageType.Search;
    }
    if (name.startsWith("artist")) {
      return PageType.Artist;
    }
    return undefined;
  }

  public readonly pageType: PageType;

  public constructor(private readonly name: string) {
    const pageType = FileName.getPageType(name);
    if (!pageType) {
      throw new Error(`Invalid file name: ${name}`);
    }
    this.pageType = pageType;
  }

  public get value(): string {
    return this.name;
  }

  public get isMhtml(): boolean {
    return this.name.endsWith(".mhtml");
  }
}
