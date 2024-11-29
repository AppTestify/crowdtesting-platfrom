import { DB_CONNECTION_ERROR_MESSAGE, INVALID_INPUT_ERROR_MESSAGE, USER_UNAUTHORIZED_ERROR_MESSAGE, USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { isAdmin, verifySession } from "@/app/_lib/dal";
import { Note } from "@/app/_models/note.model";
import { NoteSchema } from "@/app/_schemas/note.schema";
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
        const response = NoteSchema.safeParse(body);

        if (!response.success) {
            return Response.json(
                {
                    message: INVALID_INPUT_ERROR_MESSAGE,
                    errors: response.error.errors,
                },
                { status: HttpStatusCode.BAD_REQUEST }
            );
        }

        const { projectId } = params;
        const newNote = new Note({
            ...response.data,
            userId: session.user._id,
            projectId: projectId
        });
        const saveNote = await newNote.save();

        return Response.json({
            message: "Note added successfully",
            id: saveNote?._id,
        });

    } catch (error: any) {
        return errorHandler(error);
    }
}

export async function GET(
    req: Request,
    { params }: { params: { projectId: string } }
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

        let response = null;
        const { projectId } = params;
        const { skip, limit } = serverSidePagination(req);
        const totalNotes = await Note.find({
            projectId: projectId
        }).countDocuments();

        if (!(await isAdmin(session.user))) {
            response = await Note.find({ projectId: projectId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean();
        } else {
            response = await Note.find({ projectId: projectId })
                .populate("userId", "id firstName lastName")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean();
        }

        return Response.json({ Notes: response, total: totalNotes });
    } catch (error: any) {
        return errorHandler(error);
    }
}