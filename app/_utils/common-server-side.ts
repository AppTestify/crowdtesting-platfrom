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

export const getFileMetaData = async (file: File) => {
  const fileBuffer = await file.arrayBuffer().then((buffer) => Buffer.from(buffer));
  const data = {
    data: fileBuffer,
    name: file.name,
    contentType: file.type,
  }
  return data;
}