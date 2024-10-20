import {
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
import { User } from "@/app/_models/user.model";
import { googleSignUpSchema } from "@/app/_schemas/auth.schema";
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
    const response = googleSignUpSchema.safeParse(body);

    if (!response.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    const { email, firstName, lastName } = response.data;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const { password: _, ...userWithoutPassword } = existingUser.toObject();
      return Response.json({
        user: userWithoutPassword,
      });
    }

    const newUser = new User({ email, firstName, lastName });
    await newUser.save();

    const { password: _, ...userWithoutPassword } = newUser.toObject();
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: JWT_TOKEN_EXPIRE_LIMIT }
    );

    return Response.json({
      message: "User created successfully",
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
