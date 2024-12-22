import { AttachmentFolder } from "@/app/_constants/constant-server-side";
import AttachmentService from "@/app/_helpers/attachment.helper";
import { errorHandler } from "@/app/_utils/error-handler";

export async function GET(req: Request) {
  try {
    const attachmentService = new AttachmentService();
    const files = await attachmentService.listFiles();

    return Response.json({ files });
  } catch (error: any) {
    return errorHandler(error);
  }
}

export async function POST(req: Request) {
  try {
    const attachmentService = new AttachmentService();
    const body = await req.formData();
    const file = body.get("file");

    const folderId = await attachmentService.getOrCreateFolder(
      AttachmentFolder.ISSUES,
      process.env.GOOGLE_DRIVE_PARENT_ID || ""
    );
    const response = await attachmentService.uploadFileToDrive(
      file,
      folderId
    );

    return Response.json({ message: "File uploaded successfully", response });
  } catch (error: any) {
    console.log(error);
    return errorHandler(error);
  }
}
