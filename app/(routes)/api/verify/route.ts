import { VERIFICATION_LINK_EXPIRE_LIMIT } from "@/app/_constants/constant-server-side";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  LINKED_EXPIRED_ACCOUNT_VERIFICATION_ERROR_MESSAGE,
  USER_NOT_FOUND_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { UserRoles } from "@/app/_constants/user-roles";
import { connectDatabase } from "@/app/_db";
import { User } from "@/app/_models/user.model";
import { accountVerificationSchema } from "@/app/_schemas/auth.schema";
import {
  checkExpired,
  extractDataFromVerificationToken,
} from "@/app/_utils/common-server-side";
import { welcomeClientMail, welcomeTesterMail } from "@/app/_utils/email";

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
    const response = accountVerificationSchema.safeParse(body);

    if (!response.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    const { token } = response.data;
    const [id, emailSentAt] = extractDataFromVerificationToken(token);

    if (!id || !emailSentAt) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    const isExpired = checkExpired(emailSentAt, VERIFICATION_LINK_EXPIRE_LIMIT);

    if (isExpired) {
      return Response.json({
        message: LINKED_EXPIRED_ACCOUNT_VERIFICATION_ERROR_MESSAGE,
        isActivated: false,
      });
    }

    const existingUser = await User.findById(id);

    if (!existingUser) {
      return Response.json(
        { message: USER_NOT_FOUND_ERROR_MESSAGE },
        { status: HttpStatusCode.NOT_FOUND }
      );
    }

    existingUser.isVerified = true;
    existingUser.isActive = true;
    const data = existingUser.save();

    if (data) {
      const name =
        existingUser?.firstName && existingUser?.lastName
          ? `${existingUser.firstName} ${existingUser.lastName}`
          : "Sir";
      if (existingUser?.role === UserRoles.CLIENT) {
        welcomeClientMail({
          email: existingUser.email,
          name: `${name}`,
          link: `${process.env.URL}/auth/sign-in`,
        });
      } else if (existingUser?.role === UserRoles.TESTER) {
        welcomeTesterMail({
          email: existingUser.email,
          name: `${name}`,
          link: `${process.env.URL}/auth/sign-in`,
        });
      }
    }

    return Response.json({
      message: "Account verified successfully",
      isActivated: true,
    });
  } catch (error: any) {
    return Response.json(
      { message: GENERIC_ERROR_MESSAGE },
      { status: HttpStatusCode.INTERNAL_SERVER_ERROR }
    );
  }
}
