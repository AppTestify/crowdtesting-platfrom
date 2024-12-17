import {
  DB_CONNECTION_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { UserRoles } from "@/app/_constants/user-roles";
import { connectDatabase } from "@/app/_db";
import AttachmentService from "@/app/_helpers/attachment.helper";
import { verifySession } from "@/app/_lib/dal";
import { SupportEmail } from "@/app/_models/support-email.model";
import { User } from "@/app/_models/user.model";
import { adminEmailSchema } from "@/app/_schemas/admin.schema";
import { errorHandler } from "@/app/_utils/error-handler";

export async function GET(req: Request) {
  try {
    const attachmentService = new AttachmentService();
    const files = attachmentService.listFiles();

    return Response.json(files);
  } catch (error: any) {
    return errorHandler(error);
  }
}
