import {
  DEFAULT_PASSWORD,
  JWT_SECRET,
  JWT_TOKEN_EXPIRE_LIMIT,
} from "@/app/_constants";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_NOT_FOUND_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { User } from "@/app/_models/user.model";
import { googleSignInSchema } from "@/app/_schemas/auth.schema";

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
    const response = googleSignInSchema.safeParse(body);

    if (!response.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    const { email } = response.data;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return Response.json(
        { message: USER_NOT_FOUND_ERROR_MESSAGE },
        { status: HttpStatusCode.INTERNAL_SERVER_ERROR }
      );
    }

    const { password: _, ...userWithoutPassword } = existingUser.toObject();
    return Response.json({
      user: userWithoutPassword,
    });
  } catch (error: any) {
    return Response.json(
      { message: GENERIC_ERROR_MESSAGE },
      { status: HttpStatusCode.INTERNAL_SERVER_ERROR }
    );
  }
}
