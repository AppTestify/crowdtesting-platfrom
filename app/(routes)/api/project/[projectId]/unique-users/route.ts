import { DBModels } from "@/app/_constants";
import { DB_CONNECTION_ERROR_MESSAGE, USER_UNAUTHORIZED_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { UserRoles } from "@/app/_constants/user-roles";
import { connectDatabase } from "@/app/_db";
import { IProject } from "@/app/_interface/project";
import { verifySession } from "@/app/_lib/dal";
import { IdFormat } from "@/app/_models/id-format.model";
import { Project } from "@/app/_models/project.model";
import { User } from "@/app/_models/user.model";
import { addCustomIds } from "@/app/_utils/data-formatters";
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
        const users = await User.find({ role: UserRoles.TESTER }).select("_id");
        const userIds = users.map(user => user._id);

        const project = await Project.findById(projectId).select("_id users");

        if (!project) {
            return Response.json({ message: "Project not found" });
        }

        if (userIds.every(id => project.users.some((user: IProject) => user?.userId?.toString() === id.toString()))) {
            return Response.json({ message: "All user IDs already exist in the project" });
        }

        const projectUserIds = project.users.map((user: IProject) => user?.userId);
        const userIdFormat = await IdFormat.findOne({ entity: DBModels.USER });
        const response = addCustomIds(
            await User.find({
                _id: { $nin: projectUserIds },
                role: UserRoles.TESTER
            }).select("_id firstName lastName email role customId")
                .lean(),
            userIdFormat.idFormat
        )
        return Response.json(response);

    } catch (error: any) {
        return errorHandler(error);
    }
}