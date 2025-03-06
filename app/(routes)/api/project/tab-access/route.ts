import { defaultTabsAccess } from "@/app/_constants/constant-server-side";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { ProjectTabAccess } from "@/app/_models/project-tab-access.model";
import { Project } from "@/app/_models/project.model";
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

    const projects = await Project.find();

    if (!projects || projects.length === 0) {
      console.log("No projects found");
      return;
    }

    for (const project of projects) {
      if (!project.projectTabAccess) {
        const projectTabAccess = await ProjectTabAccess.create({
          projectId: project._id,
          tabAccess: defaultTabsAccess.map((tab) => ({
            label: tab.label,
            key: tab.key,
            roles: tab.roles,
            access: true,
          })),
        });

        project.projectTabAccess = projectTabAccess._id;
        await project.save();
      } else {
        const existingTabAccess = await ProjectTabAccess.findById(
          project.projectTabAccess?._id
        );

        const updatedTabAccess = defaultTabsAccess.map((tab) => {
          const existingTab = existingTabAccess.tabAccess.find(
            (existing: any) => existing.key === tab.key
          );

          return {
            label: tab.label,
            key: tab.key,
            roles: tab.roles,
            access: existingTab ? existingTab.access : true,
          };
        });

        await ProjectTabAccess.updateOne(
          { _id: project.projectTabAccess },
          { $set: { tabAccess: updatedTabAccess } }
        );
      }
    }

    return Response.json({
      message: "Project tabs added successfully",
    });
  } catch (error: any) {
    return errorHandler(error);
  }
}
