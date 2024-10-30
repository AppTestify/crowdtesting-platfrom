import { DB_CONNECTION_ERROR_MESSAGE, INVALID_INPUT_ERROR_MESSAGE, USER_UNAUTHORIZED_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { isAdmin, verifySession } from "@/app/_lib/dal";
import { Tester } from "@/app/_models/tester.model";
import { testerSchema } from "@/app/_schemas/tester.schema";
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

        const body = await req.json();
        const response = testerSchema.safeParse(body);

        if (!response.success) {
            return Response.json(
                {
                    message: INVALID_INPUT_ERROR_MESSAGE,
                    errors: response.error.errors,
                },
                { status: HttpStatusCode.BAD_REQUEST }
            );
        }

        const newTester = new Tester({
            ...response.data,
            user: session.user._id,
        });
        const saveProject = await newTester.save();

        return Response.json({
            message: "Tester added successfully",
            id: saveProject._id
        });

    } catch (error: any) {
        return errorHandler(error);
    }
}

export async function GET(req: Request) {
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

        let response = null;

        if (!(await isAdmin(session.user))) {
            response = normaliseIds(
                await Tester.find({ user: session.user._id })
                    .sort({ createdAt: -1 })
                    .lean()
            );
        } else {
            response = normaliseIds(
                await Tester.find({})
                    .populate("user")
                    .sort({ createdAt: -1 })
                    .lean()
            );
        }
        return Response.json(response);
    } catch (error: any) {
        return errorHandler(error);
    }
}