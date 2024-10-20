import { GENERIC_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { deleteSession } from "@/app/_lib/session";

export async function POST(req: Request) {
  try {
    deleteSession();

    return Response.json({
      message: "Logged out successfully",
    });
  } catch (error: any) {
    return Response.json(
      { message: GENERIC_ERROR_MESSAGE },
      { status: HttpStatusCode.INTERNAL_SERVER_ERROR }
    );
  }
}
