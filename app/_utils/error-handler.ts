import "server-only";
import {
  GENERIC_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
} from "../_constants/errors";
import { HttpStatusCode } from "../_constants/http-status-code";
import { ErrorCode } from "../_constants/error-codes";

export const errorHandler = (error: any) => {
  if (error?.code === ErrorCode.ERR_JWS_INVALID) {
    return Response.json(
      { message: USER_UNAUTHORIZED_ERROR_MESSAGE },
      { status: HttpStatusCode.UNAUTHORIZED }
    );
  }
  return Response.json(
    { message: error.toString() || GENERIC_ERROR_MESSAGE },
    { status: HttpStatusCode.INTERNAL_SERVER_ERROR }
  );
};
