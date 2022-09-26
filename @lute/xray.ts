import buildXray from "x-ray";

export const xRay = buildXray({
  filters: {
    trim: (value: string) => value?.trim(),
    toReleaseType: (value: string) => {
      const type = value.toLowerCase();
      return type === "ep" ? "album" : type;
    },
    toNumber: (value: string) => {
      if (value === null || value === undefined) {
        return undefined;
      }
      return Number(value.replace(/,/g, "")) || 0;
    },
    dropTrailingComma: (value: string) => value.replace(/,\s*$/, "").trim(),
    dropTrailingDot: (value: string) => value.replace(/\.\s*$/, "").trim(),
    linkToFileName: (value: string) => {
      if (value === null || value === undefined) {
        return undefined;
      }

      if (value.includes("rateyourmusic.com")) {
        return new URL(value).pathname
          .split("/")
          .filter((x) => x !== "")
          .join("/");
      } else {
        return value.replace(/^\//, "").replace(/\/$/, "");
      }
    },
  },
});

export const xRayMetaSelector = (name: string) =>
  `meta[itemprop=${name}]@content`;
