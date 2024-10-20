import {
  DB_CONNECTION_ERROR_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_NOT_FOUND_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { User } from "@/app/_models/user.model";
import { userRoleUpdateSchema } from "@/app/_schemas/users.schema";
import { updateUserRole } from "@/app/_services/auth-service";
import { errorHandler } from "@/app/_utils/error-handler";
import { Slot } from "@radix-ui/react-slot";

export async function PATCH(req: Request) {
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
    const response = userRoleUpdateSchema.safeParse(body);

    if (!response.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    const { _id, role } = response.data;

    const updateResponse = await User.findOneAndUpdate({ _id }, { role });

    if (!updateResponse) {
      throw new Error(GENERIC_ERROR_MESSAGE);
    }
    return Response.json({ message: "Role added successfully" });
  } catch (error: any) {
    return errorHandler(error);
  }
}
