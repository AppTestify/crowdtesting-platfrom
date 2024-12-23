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
      type: "service_account",
      project_id: "app-testify-temp",
      private_key_id: "9440d7b3049b8a1b5191f34a6c00440cec23757c",
      private_key:
        "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCX3pAAlo2Dr9hh\nQAnA5CTkL6uYmSsaeSDEGtEU6SGf79VzBYOPkbqwxk4rh964V0mWKpxo8p7lgH6a\nhBnHUEWe5fgW8/z7prOw+o/or4MAmUN5AjtwwWgDPmC8Q+MBnmawHs+QHsQTAGLL\n+Uk4rzNZBC/I+NYsuRTofBCvcZIYIV7wkm9hvATja2ud02sYPEBkFIMk79cn6Zem\nJzL8HpgTP2cvv35fmaidOMkRjweGIHPq2j9uMz/83iXFfB+A7Y7CYvXvD9/wXCGC\nZPGFnhmVwv23N+88VjcRzkkTBDiyC9ciKt0hJ+KyAybqcsfOH4WVYbv/AAMjI/vr\nDZThM+IRAgMBAAECggEAEZ60Oyc8g7nuC0lyYD9wAsv/lxC1SijhyvLYDXqnaK6b\nJ5FNFGYKYJpfZShKSD2zV1F6DGiS1CqCddOsCH6JF1CT5jjYYguTJ05Izky3sKT3\nibV/NzuvQUoWT915+9z4ichHWW+iXNiDfeoeK04TcWldkG4DblSqZvdG+c39zt/5\nh7BT20eI93co+06L9Q1AHTtBbm0bdLWOxdognZonUMrlcjtiFw3rVXp25rEp7H+3\nk+Px49t8mN1Pe38bffTDKuScCyfeETeAtFRhjJcEdkGRod7Qzbcob8Vn16MXpwfl\ntLUxlzPMPas9+bt4AoDggzm48ezAuzWUwCS76wlFiQKBgQDJm2LrRPE6dMX/EBBm\ngpXdB0W459VJ5apgn7sW+TpBGH7YbsqcpjPEh5q5QUt5BROU2pwxgyjZXy69Nydm\nOX0F0ORGTl9H9ZuC+OrnSzyr6YsfsZ7svVmLvYGk6fmgCjrC/Wv9rVWDFxDtIA1B\n473ZFQV01T4Rbv4LO4GaElcpeQKBgQDA1+T163r58B30HqOb+FhpTBIXYyj5Yb43\nTTrTFSKexS3T94i/9QhMGOPY52eDuY2mQegH/aNU36cSgbX2QzfiVM1olUq8XQ+h\n9tULepzrFOMkEyApFTlXsh75majLD59Tdhy+A9l2Z2ewZnEhZnTqJgeBFqLGWl/K\ntXs4JYNvWQKBgEky7NiFQJy710PDnmDJ2wXUZSE8s3lQNOs+M5ykwtztuuh0WYZE\n5hjeL3RB29hF2pU6RmnHuGYsI/k5dEmuZ9FbxfYs8HVdHKiSHh/6dj3o3sWUJSLJ\noSCWnuK0vRi5fhpcDwCdFaYyEsg10fpxaPXPpxqDbjTAOubzJRw+unzpAoGBAImG\n7mB7ST6KAbKhTyjiWZruh1BqhUQkctVZnIQA5Km6EU7Dj6DmDL7IWWXM0cPdRqm1\nAtcACcVzouDN5Ij1sxsUQ1E8dwoSjB2DvLfs/4+fW8XUZfEmk7h47SIwdXIreAK7\njw/sCuAoKohg5nldai+6Y0uqavduaDZWasPF7RAxAoGBAKrjq1xOlXsTg2ZAE00x\n1s2cEm6h2Tg/CHgq76PAHeMt068ome/F4wp5/yeUqOttGYhnt4wDAUxV54BXTOIN\nXKCJJqjo/P2rYBfAPwztbQPIfKae3YJgC8KjPVTOaBl/wKrXmyyeShHw37sqhNTz\n5kvpJyqbrVKsUInZSThDZ7wf\n-----END PRIVATE KEY-----\n",
      client_email:
        "crowd-testing-poc@app-testify-temp.iam.gserviceaccount.com",
      client_id: "101637751870324785601",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url:
        "https://www.googleapis.com/robot/v1/metadata/x509/crowd-testing-poc%40app-testify-temp.iam.gserviceaccount.com",
      universe_domain: "googleapis.com",
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
