import {
  DB_CONNECTION_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { isAdmin, verifySession } from "@/app/_lib/dal";
import { Mail } from "@/app/_models/mail.model";
import { filterMails } from "@/app/_queries/search-mail";
import { MailSchema } from "@/app/_schemas/mail.schema";
import { normaliseIds } from "@/app/_utils/data-formatters";
import { customMail } from "@/app/_utils/email";
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

    if (!(await isAdmin(session?.user))) {
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

    const body = await req.json();
    const response = MailSchema.safeParse(body);

    if (!response.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    const { emails, subject, body: emailBody } = response.data;

    for (const email of emails) {
      const payload = {
        emails: [email],
        subject,
        body: emailBody,
      };

      await customMail(payload);
    }

    const newMail = new Mail({
      ...response.data,
      userId: session.user._id,
    });
    await newMail.save();

    return Response.json({ message: "Email sent successfully" });
  } catch (error: any) {
    return errorHandler(error);
  }
}

export async function GET(req: Request) {
  try {
    const session = await verifySession();
    if (!session || !session.isAuth) {
      return Response.json(
        { message: USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE },
        { status: HttpStatusCode.UNAUTHORIZED }
      );
    }

    if (!(await isAdmin(session?.user))) {
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

    const url = new URL(req.url);
    const searchString = url.searchParams.get("searchString");

    if (searchString) {
      const { mails } = await filterMails(searchString);
      return Response.json(normaliseIds(mails));
    }

    const response = normaliseIds(
      await Mail.find({}).populate("userId", "firstName lastName email").lean()
    );

    return Response.json(response);
  } catch (error: any) {
    return errorHandler(error);
  }
}
