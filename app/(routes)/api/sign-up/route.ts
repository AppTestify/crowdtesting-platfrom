import {
  DBModels,
  DEFAULT_PASSWORD,
  JWT_SECRET,
  JWT_TOKEN_EXPIRE_LIMIT,
} from "@/app/_constants";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  EMAIL_REQUIRED_ERROR_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_EXISTS_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { createSession } from "@/app/_lib/session";
import { Counter } from "@/app/_models/counter.model";
import { User } from "@/app/_models/user.model";
import { signUpSchema } from "@/app/_schemas/auth.schema";
import { sendVerificationEmail } from "@/app/_utils/email";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
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
    const response = signUpSchema.safeParse(body);

    if (!response.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    const { email, password, role } = response.data;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return Response.json(
        { message: USER_EXISTS_ERROR_MESSAGE },
        { status: HttpStatusCode.INTERNAL_SERVER_ERROR }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      role,
      accountActivationMailSentAt: new Date(),
      isActive: true,
    });
    await newUser.save();

    const { password: _, ...userWithoutPassword } = newUser.toObject();
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: JWT_TOKEN_EXPIRE_LIMIT }
    );

    await createSession(userWithoutPassword);

    sendVerificationEmail(userWithoutPassword);

    return Response.json({
      message: "Signed up successfully",
      token,
      user: userWithoutPassword,
    });
  } catch (error: any) {
    return Response.json(
      { message: GENERIC_ERROR_MESSAGE },
      { status: HttpStatusCode.INTERNAL_SERVER_ERROR }
    );
  }
}
