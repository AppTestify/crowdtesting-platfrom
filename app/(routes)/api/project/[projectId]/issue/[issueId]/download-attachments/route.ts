import { NextApiRequest, NextApiResponse } from "next";
import JSZip from "jszip";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { IssueAttachment } from "@/app/_models/issue-attachment.model";
import { issueAttachmentsDownload } from "@/app/_schemas/issue.schema";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { errorHandler } from "@/app/_utils/error-handler";
import { getAllAttachments } from "@/app/_utils/common-server-side";

export async function POST(req: Request, res: NextApiResponse) {
  try {
    const session = await verifySession();

    if (!session) {
      return Response.json(
        { message: USER_UNAUTHORIZED_ERROR_MESSAGE },
        { status: HttpStatusCode.UNAUTHORIZED }
      );
    }

    const isDBConnected = await connectDatabase();
    if (!isDBConnected) {
      return Response.json(
        {
          message: DB_CONNECTION_ERROR_MESSAGE,
        },
        { status: HttpStatusCode.INTERNAL_SERVER_ERROR }
      );
    }

    const body = await req.json();
    const response = issueAttachmentsDownload.safeParse(body);

    if (!response.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
          errors: response.error.errors,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    const issueAttachments = await IssueAttachment.find({
      issueId: response.data.issueId,
    })
      .sort({ createdAt: -1 })
      .lean();

    const attachments = issueAttachments.map((item) => ({
      cloudId: item.cloudId,
      name: item.name,
      contentType: item.contentType,
      ...item,
    }));

    const data = await getAllAttachments({ attachments });

    const zip = new JSZip();
    data.forEach((image, index) => {
      const { attachment, base64 } = image;
      const buffer = Buffer.from(base64, "base64");
      zip.file(`${attachment.name}`, buffer);
    });

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    return new Response(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": "attachment; filename=images.zip",
      },
    });
  } catch (error: any) {
    console.log("Error during attachment download:", error);
    return errorHandler(error);
  }
}
