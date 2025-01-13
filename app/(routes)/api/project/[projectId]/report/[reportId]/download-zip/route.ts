import {
  DB_CONNECTION_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { ReportAttachment } from "@/app/_models/report-attachment.model";
import { getAllAttachments } from "@/app/_utils/common-server-side";
import { errorHandler } from "@/app/_utils/error-handler";
import JSZip from "jszip";
import { NextApiResponse } from "next";

export async function POST(
  req: Request,
  { params }: { params: { reportId: string } },
  res: NextApiResponse
) {
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

    const { reportId } = params;
    const reportAttachments = await ReportAttachment.find({
      reportId: reportId,
    })
      .sort({ createdAt: -1 })
      .lean();

    const attachments = reportAttachments.map((item) => ({
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
        "Content-Disposition": "attachment; filename=report-attachments.zip",
      },
    });
  } catch (error: any) {
    console.log("Error during attachment download:", error);
    return errorHandler(error);
  }
}
