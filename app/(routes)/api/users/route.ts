import { DBModels } from "@/app/_constants";
import { publicEmailDomains } from "@/app/_constants/constant-server-side";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  ONLY_BUSSINESS_EMAIL_ALLOWED,
  USER_EXISTS_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { UserRoles } from "@/app/_constants/user-roles";
import { connectDatabase } from "@/app/_db";
import AttachmentService from "@/app/_helpers/attachment.helper";
import SendCredentials from "@/app/_helpers/sendEmailCredentials.helper";
import { isAdmin, verifySession } from "@/app/_lib/dal";
import { IdFormat } from "@/app/_models/id-format.model";
import { Tester } from "@/app/_models/tester.model";
import { User } from "@/app/_models/user.model";
import { filterUsers } from "@/app/_queries/search-user";
import { adminUserCreateSchema } from "@/app/_schemas/auth.schema";
import { serverSidePagination } from "@/app/_utils/common-server-side";
import { addCustomIds } from "@/app/_utils/data-formatters";
import { errorHandler } from "@/app/_utils/error-handler";
import { URL } from "url";

export async function GET(req: Request) {
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

    // Filter by role and status
    const url = new URL(req.url);
    const role = url.searchParams.get("role");
    const status = url.searchParams.get("status");
    const searchString = url.searchParams.get("searchString");
    const filter: any = { _id: { $ne: session.user._id } };
    if (role) {
      filter.role = role;
    }
    if (status) {
      filter.isActive = status;
    }

    const userIdFormat = await IdFormat.findOne({ entity: DBModels.USER });
    const { skip, limit } = serverSidePagination(req);

    if (searchString) {
      const { users, totalUsers } = await filterUsers(
        searchString,
        skip,
        limit,
        userIdFormat,
        role as string
      );
      return Response.json({
        users: addCustomIds(users, userIdFormat?.idFormat),
        total: totalUsers,
      });
    }

    const users = addCustomIds(
      await User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      userIdFormat.idFormat
    );
    for (let i = 0; i < users.length; i++) {
      if (users[i].role === UserRoles.TESTER) {
        const tester = await Tester.findOne({ user: users[i].id })
          .sort({ _id: -1 })
          .populate("user")
          .lean();
        users[i].tester = tester;
      }
    }

    const totalUsers = await User.countDocuments(filter);
    return Response.json({ users, total: totalUsers });
  } catch (error: any) {
    return errorHandler(error);
  }
}

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
    const response = adminUserCreateSchema.safeParse(body);

    if (!response.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    const { email, firstName, lastName, role, sendCredentials } = response.data;

    const emailCredentials = new SendCredentials();
    const existingUser = await User.findOne({ email });

    // Check existing user
    if (existingUser) {
      return Response.json({
        message: USER_EXISTS_ERROR_MESSAGE,
        status: HttpStatusCode.BAD_REQUEST,
      });
    }

    // Check bussiness mail
    if (role === UserRoles.CLIENT) {
      const emailDomain = email.split("@")[1];

      if (publicEmailDomains.includes(emailDomain)) {
        return Response.json({
          message: ONLY_BUSSINESS_EMAIL_ALLOWED,
          status: HttpStatusCode.BAD_REQUEST,
        });
      }
    }

    const hashedPassword = await emailCredentials.sendEmailCredentials({
      email,
      role,
      sendCredentials,
    });

    const newUser = new User({
      email,
      password: hashedPassword,
      role,
      firstName: firstName,
      lastName: lastName,
      sendCredentials: sendCredentials,
      credentialsSentAt: sendCredentials ? new Date() : "",
      accountActivationMailSentAt: new Date(),
      isVerified: true,
    });
    await newUser.save();

    const { password: _, ...userWithoutPassword } = newUser.toObject();

    return Response.json({
      message: "User added successfully",
      user: userWithoutPassword,
    });
  } catch (error: any) {
    return errorHandler(error);
  }
}
