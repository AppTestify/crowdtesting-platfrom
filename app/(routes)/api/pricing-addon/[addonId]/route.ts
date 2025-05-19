import {
  DB_CONNECTION_ERROR_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { AddOn } from "@/app/_models/addon.model";
import { addonSchema } from "@/app/_schemas/addon.schema";
import { errorHandler } from "@/app/_utils/error-handler";

export async function PUT(
  req: Request,
  { params }: { params: { addonId: string } }
) {
  try {
    const session = await verifySession();

    if (!session) {
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
    const response = addonSchema.safeParse(body);

    if (!response.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
          errors: response.error.errors,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    const { addonId } = params;
    const updateResponse = await AddOn.findByIdAndUpdate(addonId, {
      ...response.data,
    });

    if (!updateResponse) {
      throw new Error(GENERIC_ERROR_MESSAGE);
    }

    return Response.json({
      message: "addon updated successfully",
    });
  } catch (error: any) {
    return errorHandler(error);
  }
}

export async function GET(
  req: Request,
  { params }: { params: { addonId: string } }
) {
  try {
    const session = await verifySession();

    if (!session) {
      return Response.json(
        { message: USER_UNAUTHORIZED_ERROR_MESSAGE },
        { status: HttpStatusCode.UNAUTHORIZED }
      );
    }

    const isDBConnected = await connectDatabase();
    if (!isDBConnected) {
      return Response.json(
        { message: DB_CONNECTION_ERROR_MESSAGE },
        { status: HttpStatusCode.INTERNAL_SERVER_ERROR }
      );
    }

    const { addonId } = params;
    const addon = await AddOn.findById(addonId);

    if (!addon) {
      return Response.json(
        { message: 'Addon not found' },
        { status: HttpStatusCode.NOT_FOUND }
      );
    }

    return Response.json(addon);
  } catch (error: any) {
    return errorHandler(error);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { addonId: string } }
) {
  try {
    const session = await verifySession();
    if (!session || !session.isAuth) {
      return Response.json(
        { message: USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE },
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

    const { addonId } = params;
    const response = await AddOn.findByIdAndDelete(addonId);

    if (!response) {
      throw new Error(GENERIC_ERROR_MESSAGE);
    }

    return Response.json({ message: "Addon deleted successfully" });
  } catch (error: any) {
    return errorHandler(error);
  }
}
