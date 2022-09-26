import { AxiosResponse } from "axios";
import FormData from "form-data";
import { buildHttpClient } from "./shared";

type UploadFileResponse = AxiosResponse<{
  id: string;
}>;

export const buildFileServerClient = (fileServerUrl: string) => {
  const http = buildHttpClient(fileServerUrl);

  return {
    async getFileContent(fileId: string): Promise<string> {
      const response = await http.get(`/${fileId}`);
      return response.data;
    },
    async uploadFile({
      name,
      file,
      lookupId,
    }: {
      name: string;
      file: string;
      lookupId?: string;
    }): Promise<string | undefined> {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("file", file, name);
      if (lookupId) {
        formData.append("lookupId", lookupId);
      }
      const response = await http.post<any, AxiosResponse<UploadFileResponse>>(
        `/`,
        formData
      );
      return response?.data?.data?.id;
    },
    async deleteFile(fileId: string): Promise<void> {
      await http.delete(`/${fileId}`);
    },
  };
};
