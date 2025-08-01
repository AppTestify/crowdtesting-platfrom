import "server-only";
import { Delimeters } from "../_constants/delimeter";
import moment from "moment";
import AttachmentService from "../_helpers/attachment.helper";
import { Tester } from "../_models/tester.model";
import { replaceCustomId } from "./data-formatters";
import { TestCaseExecutionResult } from "../_constants/test-case";
import { IProject } from "../_interface/project";

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
  entityId: string,
  role: string
): string => {
  const currentDateTimeUTC = new Date().toISOString();
  return encodeToBase64(
    `${entityId.toString()}${Delimeters.PIPE}${currentDateTimeUTC}${
      Delimeters.PIPE
    }${role}`
  );
};

export const generateVerificationLink = (id: string, role: string) => {
  const frontEndURL: string = process.env.URL ?? "";
  const verificationPath: string = "/auth/verify";

  const generatedAuthKeyForCandidate: string =
    generateAuthKeyForUnprotectedRoutes(id, role);
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
  const fileBuffer = await file
    .arrayBuffer()
    .then((buffer: any) => Buffer.from(buffer));
  const data = {
    data: fileBuffer,
    name: file.name,
    contentType: file.type,
  };
  return data;
};

export const generateCustomPassword = (length = 12) => {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=<>?";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

export const serverSidePagination = (req: Request) => {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);
  const skip = (page == 0 ? 1 : page - 1) * limit;
  const data = {
    skip,
    limit,
  };
  return data;
};

export const getAllAttachments = async (issue: any) => {
  try {
    if (
      !issue ||
      !Array.isArray(issue.attachments) ||
      !issue.attachments.length
    ) {
      return [];
    }
    const attachmentService = new AttachmentService();
    const blobs = await attachmentService.fetchFilesAsBase64(issue.attachments);
    return blobs;
  } catch (error) {
    console.error("Error occurred while interacting with Google Drive:", error);
    throw new Error("Failed to get or create folder");
  }
};

export const getAllAttachmentsLink = async (attachments: any[]) => {
  try {
    if (!attachments || !Array.isArray(attachments) || !attachments.length) {
      return [];
    }

    const attachmentService = new AttachmentService();
    const links = await attachmentService.fetchFileLinks(attachments);
    return links;
  } catch (error) {
    console.error("Error occurred while interacting with Google Drive:", error);
    throw new Error("Failed to get or create file links");
  }
};

export const usersWithCustomIds = async (response: any, userIdFormat: any) => {
  if (!response?.users?.length) return [];

  const userIds = response.users
    .map((user: any) => user.userId?._id.toString())
    .filter(Boolean);
  const testers = await Tester.find({ user: { $in: userIds } }).lean();
  const testersMap = new Map(
    testers.map((tester) => [tester.user.toString(), tester])
  );

  return response.users.map((user: any) => {
    const customIdTransformed = replaceCustomId(
      userIdFormat.idFormat,
      user.customId || 0
    );
    const tester = testersMap.get(user.userId?._id?.toString() || "");
    return {
      ...user,
      customId: customIdTransformed,
      tester: tester || null,
    };
  });
};

export const customIdForSearch = (idObject: any, searchString: string) => {
  const idFormat = idObject?.idFormat
    ? idObject?.idFormat.replace(/\{.*?\}/, "")
    : "";

  if (searchString?.toLowerCase().startsWith(idFormat?.toLowerCase())) {
    searchString = searchString.slice(idFormat?.length);
  }

  return searchString;
};

export const normalizePassword = (password: string) => {
  return password.normalize("NFKC").trim();
};

export function countResults(testCaseResults: any[]) {
  const resultCount = {
    blocked: 0,
    passed: 0,
    failed: 0,
    caused: 0,
  };

  testCaseResults.forEach((result) => {
    if (result.result === TestCaseExecutionResult.BLOCKED)
      resultCount.blocked++;
    if (result.result === TestCaseExecutionResult.PASSED) resultCount.passed++;
    if (result.result === TestCaseExecutionResult.FAILED) resultCount.failed++;
    if (result.result === TestCaseExecutionResult.CAUTION) resultCount.caused++;
  });

  return resultCount;
}

export const generateTestCycleLink = (
  id: string,
  projectId: string,
  testCycleId: string
) => {
  const frontEndURL: string = process.env.URL ?? "";
  const verificationPath: string = "/test-cycle";

  const generatedAuthKeyForCandidate: string =
    generateTestCycleAuthKeyForUnprotectedRoutes(id, projectId, testCycleId);
  const generatedVerificationLink: string = `${frontEndURL}${verificationPath}?token=${generatedAuthKeyForCandidate}`;

  return generatedVerificationLink;
};

export const generateTestCycleAuthKeyForUnprotectedRoutes = (
  userId: string,
  projectId: string,
  testCycleId: string
): string => {
  const currentDateTimeUTC = new Date().toISOString();
  return encodeToBase64(
    `${userId.toString()}${Delimeters.PIPE}${currentDateTimeUTC}${
      Delimeters.PIPE
    }${projectId}${Delimeters.PIPE}${testCycleId}`
  );
};

export const getTestCycleBasedIds = (project: IProject, userId: any) => {
  const data = Array.isArray(project?.users)
    ? project.users.filter(
        (user: any) => user.userId.toString() === userId.toString()
      )
    : [];
  return data?.[0]?.testCycles;
};
