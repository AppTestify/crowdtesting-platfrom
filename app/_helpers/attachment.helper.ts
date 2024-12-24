import { File } from "buffer";
import { google } from "googleapis";
import path from "path";
import { getFileMetaData } from "../_utils/common-server-side";
import fs from "fs";
import { Readable } from "stream";
import { AttachmentFolder } from "../_constants/constant-server-side";
import { FILE_UPLOAD_ERROR_MESSAGE } from "../_constants/errors";

class AttachmentService {
  private auth: any;
  private drive: any;
  private USERS_FOLDER_ID = "1e6MWJ323MJnwqBWGzkUiTOSfau5M6Ifm";

  constructor() {
    const serviceAccountCredentials = {
      type: process.env.DRIVE_TYPE,
      project_id: process.env.DRIVE_PROJECT_ID,
      private_key_id: process.env.DRIVE_PRIVATE_KEY_ID,
      private_key:
        process.env.DRIVE_PRIVATE_KEY,
      client_email:
        process.env.DRIVE_CLIENT_EMAIL,
      client_id: process.env.DRIVE_CLIENT_ID,
      auth_uri: process.env.DRIVE_AUTH_URI,
      token_uri: process.env.DRIVE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.DRIVE_AUTH_PROVIDER,
      client_x509_cert_url:
        process.env.DRIVE_CLIENT_CERT_URL,
      universe_domain: process.env.DRIVE_UNIVERSE_DOMAIN,
    };

    const SCOPES = ["https://www.googleapis.com/auth/drive"];

    this.auth = new google.auth.GoogleAuth({
      credentials: serviceAccountCredentials,
      scopes: SCOPES,
    });
    this.drive = google.drive({ version: "v3", auth: this.auth });
  }

  public async getOrCreateFolder(folderName: string, parentFolderId: string) {
    try {
      const res = await this.drive.files.list({
        q: `'${parentFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}'`,
        fields: "files(id, name)",
      });

      const existingFolder = res.data.files[0];

      if (existingFolder) {
        return existingFolder.id;
      }

      const createRes = await this.drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: "application/vnd.google-apps.folder",
          parents: [parentFolderId],
        },
      });

      return createRes.data.id;
    } catch (error) {
      console.error(
        "Error occurred while interacting with Google Drive:",
        error
      );
      throw new Error("Failed to get or create folder");
    }
  }

  public async listFiles(): Promise<void> {
    try {
      const res: any = await this.drive.files.list({
        pageSize: 10,
        fields: "nextPageToken, files(id, name)",
      });
      const files = res.data.files;
      if (files.length === 0) {
        console.log("No files found.");
        return;
      }

      return files;
    } catch (err) {
      console.error("Error listing files:", err);
    }
  }

  public async uploadFileToDrive(file: any, folderId: string) {
    try {
      const { data, name } = await getFileMetaData(file);

      const fileMetadata = {
        name: name,
        parents: [folderId],
      };
      const media = {
        mimeType: "application/octet-stream",
        body: Readable.from(data),
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media,
        fields: "id",
      });

      console.log("File uploaded successfully. File ID:", response.data.id);
      return response.data;
    } catch (error) {
      console.error("Error uploading file to Google Drive:", error);
      throw error;
    }
  }

  public async updateFileInDrive(fileId: string, file: any) {
    try {
      const { data } = await getFileMetaData(file);

      const media = {
        mimeType: "application/octet-stream",
        body: Readable.from(data),
      };

      const response = await this.drive.files.update({
        fileId,
        media,
        fields: "id",
      });

      console.log("File updated successfully. File ID:", response.data.id);
      return response.data;
    } catch (error) {
      console.error("Error updating file in Google Drive:", error);
      throw error;
    }
  }

  public async downloadFileFromDrive(fileId: string): Promise<any> {
    try {
      const driveResponse = await this.drive.files.get(
        {
          fileId,
          alt: "media",
        },
        { responseType: "stream" }
      );

      return driveResponse;
    } catch (error) {
      console.error("Error during file download process:", error);
    }
  }

  public async deleteFileFromDrive(fileId: string) {
    try {
      await this.drive.files.delete({
        fileId,
      });
      console.log("File deleted successfully. File ID:", fileId);
    } catch (error) {
      console.error("Error deleting file from Google Drive:", error);
      throw error;
    }
  }

  public async uploadFileInGivenFolderInDrive(file: any, folderName: AttachmentFolder) {
    try {
      const folderId = await this.getOrCreateFolder(
        folderName,
        process.env.GOOGLE_DRIVE_PARENT_ID || ""
      );
      const response = await this.uploadFileToDrive(file, folderId);

      if (!response || !response.id) {
        throw new Error(FILE_UPLOAD_ERROR_MESSAGE);
      }

      return response.id;
    } catch (error) {
      console.error("Error deleting file from Google Drive:", error);
      throw error;
    }
  }
}

export default AttachmentService;
