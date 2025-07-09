import { DBModels } from "@/app/_constants";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { UserRoles } from "@/app/_constants/user-roles";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { Counter } from "@/app/_models/counter.model";
import { Project } from "@/app/_models/project.model";
import { User } from "@/app/_models/user.model";
import mongoose from "mongoose";
import { z } from "zod";

const ObjectId = require("mongodb").ObjectId;

const AssignClientUserSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await mongoose.startSession();
  
  try {
    const authSession = await verifySession();

    if (!authSession) {
      return Response.json(
        { message: USER_UNAUTHORIZED_ERROR_MESSAGE },
        { status: HttpStatusCode.UNAUTHORIZED }
      );
    }

    // Only clients can access this endpoint
    if (authSession.user.role !== UserRoles.CLIENT) {
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

    // Only call req.json() once
    const body = await req.json();
    const { projectId, userId, role } = body;
    const validation = AssignClientUserSchema.safeParse({ userId, role });

    if (!validation.success) {
      return Response.json(
        { message: INVALID_INPUT_ERROR_MESSAGE, errors: validation.error.errors },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    // Verify project belongs to the client
    const project = await Project.findById(projectId);
    if (!project || project.userId !== authSession.user._id) {
      return Response.json(
        { message: "Project not found or access denied" },
        { status: HttpStatusCode.NOT_FOUND }
      );
    }

    // Verify user belongs to the client
    const user = await User.findById(userId);
    if (!user) {
      return Response.json(
        { message: "User not found" },
        { status: HttpStatusCode.NOT_FOUND }
      );
    }

    // Check if user belongs to this client
    const isUserOwnedByClient = 
      (user.createdBy === 'client' && user.clientId === authSession.user._id) ||
      user.invitedBy === authSession.user._id;

    if (!isUserOwnedByClient) {
      return Response.json(
        { message: "User not found in your team" },
        { status: HttpStatusCode.FORBIDDEN }
      );
    }

    // Check if user is already assigned to this project
    const existingAssignment = await Project.findOne({
      _id: projectId,
      "users.userId": new ObjectId(userId),
    });

    if (existingAssignment) {
      return Response.json(
        { message: "User is already assigned to this project" },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    // Defensive check: ensure a role is always present
    const projectRole = role || user.role;
    if (!projectRole) {
      return Response.json(
        { message: "User must have a role to be assigned to a project." },
        { status: 400 }
      );
    }

    await session.withTransaction(async () => {
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
              userId: userId,
              role: projectRole,
              customId: counter.sequence,
            },
          },
        },
        { session }
      );
    });

    return Response.json({
      message: "User assigned to project successfully",
    });
  } catch (error: any) {
    // Improved error logging
    console.error("Assign user to project error:", error);
    return Response.json({ message: error.message || "Unknown error", error }, { status: 400 });
  }
} 