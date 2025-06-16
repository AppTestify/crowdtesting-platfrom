import {
  DBModels,
  DEFAULT_PASSWORD,
  JWT_SECRET,
  JWT_TOKEN_EXPIRE_LIMIT,
} from "@/app/_constants";
import { publicEmailDomains } from "@/app/_constants/constant-server-side";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  EMAIL_REQUIRED_ERROR_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  ONLY_BUSSINESS_EMAIL_ALLOWED,
  USER_EXISTS_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { UserRoles } from "@/app/_constants/user-roles";
import { connectDatabase } from "@/app/_db";
import { createSession } from "@/app/_lib/session";
import { Counter } from "@/app/_models/counter.model";
import { Tester } from "@/app/_models/tester.model";
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

    // const { email, password, role, firstName, lastName, country } = response.data;
    const { email, password, role, firstName, lastName, country, userCount } =
      response.data;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return Response.json(
        { message: USER_EXISTS_ERROR_MESSAGE },
        { status: HttpStatusCode.INTERNAL_SERVER_ERROR }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === UserRoles.CLIENT) {
      const emailDomain = email.split("@")[1];

      if (publicEmailDomains.includes(emailDomain)) {
        return Response.json(
          { message: ONLY_BUSSINESS_EMAIL_ALLOWED },
          { status: HttpStatusCode.BAD_REQUEST }
        );
      }
    }

    const newUser = new User({
      firstName: firstName,
      lastName: lastName,
      email,
      password: hashedPassword,
      role,
      userCount,
      accountActivationMailSentAt: new Date(),
      isActive: true,
    });
    await newUser.save();

    if (role === UserRoles.TESTER) {
      const newTesterCountry = new Tester({
        "address.country": country,
        user: newUser._id,
      });
      await newTesterCountry.save();
    }

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
