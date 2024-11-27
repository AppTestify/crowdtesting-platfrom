import { DB_CONNECTION_ERROR_MESSAGE, GENERIC_ERROR_MESSAGE, USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { TestCaseData } from "@/app/_models/test-case-data";
import { errorHandler } from "@/app/_utils/error-handler";

export async function DELETE(
    req: Request,
    { params }: { params: { testCaseDataId: string } }
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

        const { testCaseDataId } = params;
        const response = await TestCaseData.findByIdAndDelete(testCaseDataId);

        if (!response) {
            throw new Error(GENERIC_ERROR_MESSAGE);
        }

        return Response.json({ message: "Test case data deleted successfully" });
    } catch (error: any) {
        return errorHandler(error);
    }
}