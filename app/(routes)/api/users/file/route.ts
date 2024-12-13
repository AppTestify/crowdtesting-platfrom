import {
  DB_CONNECTION_ERROR_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { File } from "@/app/_models/file.model";
import { fileSchema } from "@/app/_schemas/file.schema";
import { getFileMetaData } from "@/app/_utils/common-server-side";
import { normaliseIds } from "@/app/_utils/data-formatters";
import { errorHandler } from "@/app/_utils/error-handler";

export async function POST(req: Request) {
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

    const userId = session.user._id;
    const body = await req.formData();
    const file = body.get("file") as File;
    const fileType = body.get("fileType");

    const response = fileSchema.safeParse({ file: file, fileType: fileType });

    if (!response.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
          errors: response.error.errors,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    const { data, name, contentType } = await getFileMetaData(
      response.data.file
    );

    if (!file) {
      throw new Error(GENERIC_ERROR_MESSAGE);
    }

    const newFile = new File({
      data: data,
      name: name,
      contentType: contentType,
      fileType: response.data.fileType,
      userId: userId,
      isVerify: false
    });

    const saveFile = await newFile.save();

    return Response.json({
      message: "Document uploaded successfully",
      id: saveFile?._id,
    });
  } catch (error: any) {
    return errorHandler(error);
  }
}

export async function GET(req: Request) {
  try {
    const session = await verifySession();
    if (!session || !session.isAuth) {
      return Response.json(
        { message: USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE },
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

    const response = normaliseIds(
      await File.find({ userId: session.user._id })
        .sort({ createdAt: -1 })
        .lean()
    );

    return Response.json(response);
  } catch (error: any) {
    return errorHandler(error);
  }
}
