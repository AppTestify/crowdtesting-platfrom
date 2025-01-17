import {
  CANNOT_SET_PREVIOUS_PASSWORD_MESSAGE,
  DB_CONNECTION_ERROR_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  TOKEN_EXPIRED_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { resetPasswordSchema } from "@/app/_schemas/auth.schema";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "@/app/_models/user.model";

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
    const response = resetPasswordSchema.safeParse(body);

    if (!response.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    const JWT_SECRET = "customSecret";
    const { password, token } = response.data;
    let email;
    try {
      const decodeToken = jwt.verify(token, JWT_SECRET);
      if (typeof decodeToken === "object" && decodeToken.email) {
        email = decodeToken.email;
      } else {
        throw new Error("Invalid token payload");
      }
    } catch (error: any) {
      if (error instanceof jwt.TokenExpiredError) {
        return Response.json({
          message: TOKEN_EXPIRED_MESSAGE,
          status: HttpStatusCode.BAD_REQUEST,
        });
      }
    }

    const existingUser = await User.findOne({ email: email });
    const isSamePassword = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (isSamePassword) {
      return Response.json({
        message: CANNOT_SET_PREVIOUS_PASSWORD_MESSAGE,
        status: HttpStatusCode.BAD_REQUEST,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const updateResponse = await User.findOneAndUpdate(
      { email: email },
      {
        password: hashedPassword,
      }
    );

    if (!updateResponse) {
      throw new Error(GENERIC_ERROR_MESSAGE);
    }

    return Response.json({
      message: "Password updated successfully",
    });
  } catch (error: any) {
    return Response.json(
      { message: GENERIC_ERROR_MESSAGE },
      { status: HttpStatusCode.INTERNAL_SERVER_ERROR }
    );
  }
}
