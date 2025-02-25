import { DBModels } from "@/app/_constants";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { UserRoles } from "@/app/_constants/user-roles";
import { connectDatabase } from "@/app/_db";
import { isAdmin, verifySession } from "@/app/_lib/dal";
import { IdFormat } from "@/app/_models/id-format.model";
import { Tester } from "@/app/_models/tester.model";
import { User } from "@/app/_models/user.model";
import { addCustomIds } from "@/app/_utils/data-formatters";
import { errorHandler } from "@/app/_utils/error-handler";

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

    const userIdFormat = await IdFormat.findOne({ entity: DBModels.USER });
    const users = addCustomIds(
      await User.find({})
        .select("firstName lastName email role customId")
        .lean(),
      userIdFormat?.idFormat
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

    return Response.json(users);
  } catch (error: any) {
    return errorHandler(error);
  }
}
