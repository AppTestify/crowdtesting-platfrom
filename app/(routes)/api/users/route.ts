import { DB_CONNECTION_ERROR_MESSAGE, INVALID_INPUT_ERROR_MESSAGE, USER_EXISTS_ERROR_MESSAGE, USER_UNAUTHORIZED_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import SendCredentials from "@/app/_helpers/sendEmailCredentials.helper";
import { isAdmin, verifySession } from "@/app/_lib/dal";
import { User } from "@/app/_models/user.model";
import { adminUserCreateSchema } from "@/app/_schemas/auth.schema";
import { normaliseIds } from "@/app/_utils/data-formatters";
import { errorHandler } from "@/app/_utils/error-handler";
import { URL } from "url";

export async function GET(req: Request) {
    try {
        const session = await verifySession();

        if (!session) {
            return Response.json(
                { message: USER_UNAUTHORIZED_ERROR_MESSAGE },
                { status: HttpStatusCode.UNAUTHORIZED }
            );
        }

        if (!(await isAdmin(session?.user))) {
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

        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get('page') || '1', 10);
        const limit = parseInt(url.searchParams.get('limit') || '10', 10);
        const skip = (page == 0 ? 1 : page - 1) * limit;
        const response = normaliseIds(
            await User.find({ _id: { $ne: session.user._id } })
                .populate("profilePicture")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean()
        );
        const totalUsers = await User.countDocuments({ _id: { $ne: session.user._id } });
        return Response.json({ "users": response, "total": totalUsers });
    } catch (error: any) {
        return errorHandler(error);
    }
}

export async function POST(req: Request) {
    try {
        const session = await verifySession();

        if (!session) {
            return Response.json(
                { message: USER_UNAUTHORIZED_ERROR_MESSAGE },
                { status: HttpStatusCode.UNAUTHORIZED }
            );
        }

        if (!(await isAdmin(session?.user))) {
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
        const response = adminUserCreateSchema.safeParse(body);

        if (!response.success) {
            return Response.json(
                {
                    message: INVALID_INPUT_ERROR_MESSAGE,
                },
                { status: HttpStatusCode.BAD_REQUEST }
            );
        }

        const { email, firstName, lastName, role, sendCredentials } = response.data;

        const emailCredentials = new SendCredentials();
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return Response.json(
                {
                    message: USER_EXISTS_ERROR_MESSAGE,
                    status: HttpStatusCode.BAD_REQUEST
                })
        }
        const hashedPassword = await emailCredentials.sendEmailCredentials({ email, role });

        const newUser = new User({
            email,
            password: hashedPassword,
            role,
            firstName: firstName,
            lastName: lastName,
            sendCredentials: sendCredentials,
            accountActivationMailSentAt: new Date(),
        });
        await newUser.save();

        const { password: _, ...userWithoutPassword } = newUser.toObject();

        return Response.json({
            message: "User added successfully",
            user: userWithoutPassword,
        });

    } catch (error: any) {
        return errorHandler(error);
    }
}