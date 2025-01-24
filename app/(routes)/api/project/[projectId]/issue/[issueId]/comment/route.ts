import {
  DB_CONNECTION_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import AttachmentService from "@/app/_helpers/attachment.helper";
import { verifySession } from "@/app/_lib/dal";
import { Comment } from "@/app/_models/comment.model";
import { CommentSchema } from "@/app/_schemas/comment.schema";
import { serverSidePagination } from "@/app/_utils/common-server-side";
import { errorHandler } from "@/app/_utils/error-handler";

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
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

    const body = await req.json();
    const response = CommentSchema.safeParse(body);

    if (!response.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
          errors: response.error.errors,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    const newNote = new Comment({
      ...response.data,
      commentedBy: session.user._id,
    });
    const saveNote = await newNote.save();

    return Response.json({
      message: "Comment added successfully",
      id: saveNote?._id,
    });
  } catch (error: any) {
    return errorHandler(error);
  }
}

export async function GET(
  req: Request,
  { params }: { params: { issueId: string } }
) {
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

    const { issueId } = params;
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const find = { entityId: issueId, isDelete: false };

    const totalComments = await Comment.find(find).countDocuments();
    const response = await Comment.find(find)
      .limit(Number(limit))
      .populate({
        path: "commentedBy",
        populate: {
          path: "profilePicture",
        },
      })
      .sort({ createdAt: -1 });

    const data = await Promise.all(
      response.map(async (comment) => {
        if (comment.commentedBy.profilePicture.cloudId) {
          const attachmentService = new AttachmentService();
          const fileResponse = await attachmentService.fetchFileAsBase64(
            comment.commentedBy.profilePicture.cloudId
          );
          comment = {
            ...comment.toObject(),
            commentedBy: {
              ...comment.commentedBy.toObject(),
              profilePicture: {
                ...comment.commentedBy.profilePicture.toObject(),
                data: fileResponse,
              },
            },
          };
        }
        return comment;
      })
    );

    return Response.json({ comments: data, total: totalComments });
  } catch (error: any) {
    return errorHandler(error);
  }
}
