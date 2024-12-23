import AttachmentService from "@/app/_helpers/attachment.helper";
import { errorHandler } from "@/app/_utils/error-handler";

export async function GET(
  req: Request,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params;
    const attachmentService = new AttachmentService();
    const fileResponse = await attachmentService.downloadFileFromDrive(fileId);

    const contentDisposition =
      fileResponse.headers["content-disposition"] || "attachment";
    const contentType =
      fileResponse.headers["content-type"] || "application/octet-stream";

    const readableStream = fileResponse.data;

    return new Response(readableStream, {
      headers: {
        "Content-Disposition": contentDisposition,
        "Content-Type": contentType,
      },
    });
  } catch (error: any) {
    return errorHandler(error);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params;
    const attachmentService = new AttachmentService();
    const body = await req.formData();
    const file = body.get("file");

    const response = await attachmentService.updateFileInDrive(fileId, file);

    return Response.json({ message: "File uploaded successfully", response });
  } catch (error: any) {
    console.log(error);
    return errorHandler(error);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params;
    const attachmentService = new AttachmentService();

    const response = await attachmentService.deleteFileFromDrive(fileId);

    return Response.json({ message: "File deleted successfully", response });
  } catch (error: any) {
    console.log(error);
    return errorHandler(error);
  }
}
