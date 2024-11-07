import "server-only";
import { Delimeters } from "../_constants/delimeter";
import moment from "moment";

export const encodeToBase64 = (text: any) => {
  const buffer = Buffer.from(text, "utf8");
  const base64Encoded = buffer.toString("base64");
  return base64Encoded;
};

export const decodeFromBase64 = (base64EncodedText: any) => {
  const buffer = Buffer.from(base64EncodedText, "base64");
  const decodedText = buffer.toString("utf8");
  return decodedText;
};

export const explodeString = (text: any, delimeter: string) => {
  return text.split(delimeter);
};

export const generateAuthKeyForUnprotectedRoutes = (
  entityId: string
): string => {
  const currentDateTimeUTC = new Date().toISOString();
  return encodeToBase64(
    `${entityId.toString()}${Delimeters.PIPE}${currentDateTimeUTC}`
  );
};

export const generateVerificationLink = (id: string) => {
  const frontEndURL: string = process.env.URL ?? "";
  const verificationPath: string = "/auth/verify";

  const generatedAuthKeyForCandidate: string =
    generateAuthKeyForUnprotectedRoutes(id);
  const generatedVerificationLink: string = `${frontEndURL}${verificationPath}?token=${generatedAuthKeyForCandidate}`;

  return generatedVerificationLink;
};

export const extractDataFromVerificationToken = (token: string) => {
  return explodeString(decodeFromBase64(token), Delimeters.PIPE);
};

export const checkExpired = (date: string, expireLimit: number) => {
  return moment().diff(moment(date), "days") >= expireLimit;
};

export const getFileMetaData = async (file: any) => {
  const fileBuffer = await file.arrayBuffer().then((buffer: any) => Buffer.from(buffer));
  const data = {
    data: fileBuffer,
    name: file.name,
    contentType: file.type,
  }
  return data;
}

export const generateCustomPassword = (length = 12) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=<>?';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

export const serverSidePagination = (req: Request) => {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '10', 10);
  const skip = (page == 0 ? 1 : page - 1) * limit;
  const data = {
    skip,
    limit
  }
  return data;
}