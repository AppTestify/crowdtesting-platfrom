import { DB_CONNECTION_ERROR_MESSAGE, USER_UNAUTHORIZED_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { Project } from "@/app/_models/project.model";
import { User } from "@/app/_models/user.model";
import { errorHandler } from "@/app/_utils/error-handler";

export async function GET(
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

        const { projectId } = params;
        const users = await User.find({}).select("_id");
        const userIds = users.map(user => user._id);

        const project = await Project.findById(projectId).select("_id users");

        if (!project) {
            return Response.json({ message: "Project not found" });
        }

        if (userIds.every(id => project.users.includes(id))) {
            return Response.json({ message: "All user IDs already exist in the project" });
        }

        const response = await User.find({
            _id: { $nin: project.users }
        }).select("_id firstName lastName");

        return Response.json(response);

    } catch (error: any) {
        return errorHandler(error);
    }
}