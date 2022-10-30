import { FileSavedEvent } from "@lute/shared";
import { Context } from "../../context";

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

export const parseMhtmlToHtml = async (
  context: Context,
  event: FileSavedEvent
) => {
  const fileContent = await context.fileInteractor.getFileContent(
    event.fileName
  );
  if (!fileContent) throw new Error("Could not find file content");
  const html = extractHtmlFromMHtml(fileContent);
  const newFileName = event.fileName.replace(".mhtml", "");
  const id = await context.fileInteractor.saveFile({
    name: newFileName,
    data: html,
  });
  await context.fileInteractor.deleteFile(event.fileId);
  if (!id) throw new Error("Could not upload file");
};
