import { DBModels } from "@/app/_constants";
import { publicEmailDomains } from "@/app/_constants/constant-server-side";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  ONLY_BUSSINESS_EMAIL_ALLOWED,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { UserRoles } from "@/app/_constants/user-roles";
import { connectDatabase } from "@/app/_db";
import SendCredentials from "@/app/_helpers/sendEmailCredentials.helper";
import { verifySession } from "@/app/_lib/dal";
import { Counter } from "@/app/_models/counter.model";
import { Project } from "@/app/_models/project.model";
import { User } from "@/app/_models/user.model";
import { adminUserCreateSchema } from "@/app/_schemas/auth.schema";
import mongoose from "mongoose";
import { z } from "zod";

const ObjectId = require("mongodb").ObjectId;

const ClientUserInputSchema = z.object({
  projectId: z.string(),
  users: z.array(adminUserCreateSchema),
});

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
    const clientUser = ClientUserInputSchema.safeParse(body);

    if (!clientUser.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
          errors: clientUser.error.errors,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    const { projectId, users } = clientUser.data;

    const createdUsers: { userId: string; role: string }[] = [];

    await session.withTransaction(async () => {
      for (const user of users) {
        const { email, firstName, lastName, role, sendCredentials } = user;

        // Check existing user
        let existingUser = await User.findOne({ email }).session(session);

        // Validate client email domain
        if (!existingUser && role === UserRoles.CLIENT) {
          const emailDomain = email.split("@")[1];
          if (publicEmailDomains.includes(emailDomain)) {
            throw new Error(ONLY_BUSSINESS_EMAIL_ALLOWED);
          }
        }

        // Create user if not exists
        if (!existingUser) {
          const clientId = sessionAuth.user?.id || sessionAuth.user?._id;
          if (!clientId) {
            throw new Error('Client session user ID is missing.');
          }
          const emailCredentials = new SendCredentials();
          const hashedPassword = await emailCredentials.sendEmailCredentials({
            email,
            role,
            sendCredentials: sendCredentials ?? true,
          });

          existingUser = new User({
            email,
            password: hashedPassword,
            role,
            firstName,
            lastName,
            sendCredentials,
            credentialsSentAt: sendCredentials ? new Date() : "",
            accountActivationMailSentAt: new Date(),
            isVerified: true,
            createdBy: 'client',
            clientId,
            invitedBy: clientId,
          });

          await existingUser.save({ session });
        }

        createdUsers.push({ userId: existingUser._id.toString(), role });
      }

      for (const user of createdUsers) {
        const alreadyAssigned = await Project.findOne({
          _id: projectId,
          "users.userId": new ObjectId(user.userId),
        }).session(session);

        if (alreadyAssigned) continue;

        const counter = await Counter.findOneAndUpdate(
          { entity: DBModels.PROJECT_USERS, projectId },
          { $inc: { sequence: 1 } },
          { new: true, upsert: true, session }
        );

        await Project.findByIdAndUpdate(
          projectId,
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

    return Response.json({
      message: "Users created and assigned to project successfully",
    });
  } catch (error: any) {
    await session.abortTransaction();
    return Response.json({ message: error.message }, { status: 400 });
  } finally {
    session.endSession();
  }
}
