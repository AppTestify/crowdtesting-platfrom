import { DBModels } from "@/app/_constants";
import {
  defaultTabsAccess,
  publicEmailDomains,
} from "@/app/_constants/constant-server-side";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  ONLY_BUSSINESS_EMAIL_ALLOWED,
  USER_ALREADY_EXISTS_ERROR_MESSAGE,
  USER_EXISTS_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { UserRoles } from "@/app/_constants/user-roles";
import { connectDatabase } from "@/app/_db";
import SendCredentials from "@/app/_helpers/sendEmailCredentials.helper";
import { verifySession } from "@/app/_lib/dal";
import { createSession, deleteSession } from "@/app/_lib/session";
import { Counter } from "@/app/_models/counter.model";
import { ProjectTabAccess } from "@/app/_models/project-tab-access.model";
import { Project } from "@/app/_models/project.model";
import { User } from "@/app/_models/user.model";
import { adminUserCreateSchema } from "@/app/_schemas/auth.schema";
import { projectSchema } from "@/app/_schemas/project.schema";
import mongoose from "mongoose";
import { z } from "zod";
const ObjectId = require("mongodb").ObjectId;

export async function POST(req: Request) {
  const session = await mongoose.startSession();

  try {
    const sessionAuth = await verifySession();
    if (!sessionAuth) {
      return Response.json(
        { message: USER_UNAUTHORIZED_ERROR_MESSAGE },
        { status: HttpStatusCode.UNAUTHORIZED }
      );
    }

    const isDBConnected = await connectDatabase();
    if (!isDBConnected) {
      return Response.json(
        { message: DB_CONNECTION_ERROR_MESSAGE },
        { status: HttpStatusCode.INTERNAL_SERVER_ERROR }
      );
    }

    const body = await req.json();
    const projectValidation = projectSchema.safeParse(body.project);
    const userValidation = z.array(adminUserCreateSchema).safeParse(body.users);
    let projectId = null;

    if (!projectValidation.success || !userValidation.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
          errors: {
            projectErrors: projectValidation.error?.errors || null,
            userErrors: userValidation.error?.errors || null,
          },
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    const userId = sessionAuth?.user?._id;

    await session.withTransaction(async () => {
      const existingProject = await Project.findOne({
        title: projectValidation.data.title,
        userId,
      }).session(session);

      if (existingProject) {
        throw new Error("A project with this name already exists.");
      }

      const newProject = new Project({
        ...projectValidation.data,
        userId,
        pricingId: body.pricingId,
      });

      const savedProject = await newProject.save({ session });
      projectId = savedProject._id;

      const projectTabAccess = await ProjectTabAccess.create(
        [
          {
            projectId: savedProject._id,
            tabAccess: defaultTabsAccess.map((tab) => ({
              label: tab.label,
              key: tab.key,
              roles: tab.roles,
              access: true,
            })),
          },
        ],
        { session }
      );

      savedProject.projectTabAccess = projectTabAccess[0]._id;
      await savedProject.save({ session });

      const createdUsers: { userId: string; role: string }[] = [];

      for (const user of userValidation.data) {
        const { email, firstName, lastName, role, sendCredentials } = user;

        const existingUser = await User.findOne({ email }).session(session);

        if (existingUser) {
          createdUsers.push({ userId: existingUser._id.toString(), role });
          continue;
        }

        if (role === UserRoles.CLIENT) {
          const emailDomain = email.split("@")[1];
          if (publicEmailDomains.includes(emailDomain)) {
            throw new Error(ONLY_BUSSINESS_EMAIL_ALLOWED);
          }
        }

        const emailCredentials = new SendCredentials();
        const hashedPassword = await emailCredentials.sendEmailCredentials({
          email,
          role,
          sendCredentials: sendCredentials ?? true,
        });

        const newUser = new User({
          email,
          password: hashedPassword,
          role,
          firstName,
          lastName,
          sendCredentials,
          credentialsSentAt: sendCredentials ? new Date() : "",
          accountActivationMailSentAt: new Date(),
          isVerified: true,
        });

        const savedUser = await newUser.save({ session });
        createdUsers.push({ userId: savedUser._id.toString(), role });
      }

      for (const user of createdUsers) {
        const counter = await Counter.findOneAndUpdate(
          { entity: DBModels.PROJECT_USERS, projectId: savedProject._id },
          { $inc: { sequence: 1 } },
          { new: true, upsert: true, session }
        );

        await Project.findByIdAndUpdate(
          savedProject._id,
          {
            $addToSet: {
              users: {
                userId: user.userId,
                role: user.role,
                customId: counter.sequence,
              },
            },
          },
          { session }
        );
      }
    });

    deleteSession();

    await createSession(
      {
        ...sessionAuth?.user,
        projects: [projectId],
      },
      false
    );

    return Response.json({
      message: "Onboarding completed successfully",
      projectId: body,
    });
  } catch (error: any) {
    await session.abortTransaction();
    return Response.json({ message: error.message }, { status: 400 });
  } finally {
    session.endSession();
  }
}
