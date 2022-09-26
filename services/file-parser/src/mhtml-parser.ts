import { FileSavedEvent, LuteEvent, LuteEventClient } from "@lute/shared";
import { fileServerClient } from "./utils";

const removeLineTrailingEquals = (lines: string): string => {
  return lines
    .split("\n")
    .map((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine.endsWith("=")) {
        return trimmedLine.substring(0, trimmedLine.length - 1);
      }
      return line;
    })
    .join("");
};

export const extractHtmlFromMHtml = (mhtml: string): string => {
  const boundary = mhtml.match(/boundary="(.*)"/)?.[1];
  if (!boundary) {
    throw new Error("Could not find boundary in MHTML");
  }
  const rawHtml = mhtml.split(`--${boundary}`)[1];
  if (!rawHtml) {
    throw new Error("Could not find HTML in MHTML");
  }

  const withoutSpecialChars = removeLineTrailingEquals(
    rawHtml.replaceAll(`=3D`, "=").replaceAll("=20", "").replaceAll("=\n", "")
  );
  const doctypeIndex = withoutSpecialChars.indexOf("<!DOCTYPE");
  const html = withoutSpecialChars.substring(doctypeIndex);
  return html;
};

export const parseMhtmlToHtml = async (event: FileSavedEvent) => {
  const fileContent = await fileServerClient.getFileContent(event.fileId);
  const html = extractHtmlFromMHtml(fileContent);
  const newFileName = event.fileName.replace(".mhtml", "");
  const id = await fileServerClient.uploadFile({
    name: newFileName,
    file: html,
  });
  await fileServerClient.deleteFile(event.fileId);
  if (!id) {
    throw new Error("Could not upload file");
  }
};
