import { DB_CONNECTION_ERROR_MESSAGE, GENERIC_ERROR_MESSAGE, INVALID_INPUT_ERROR_MESSAGE, USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { IssueStatus } from "@/app/_constants/issue";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { Issue } from "@/app/_models/issue.model";
import { TestCaseResult } from "@/app/_models/test-case-result.model";
import { testCaseExecutionSchema } from "@/app/_schemas/test-case-execution";
import { errorHandler } from "@/app/_utils/error-handler";

export async function PUT(
    req: Request,
    { params }: { params: { testCaseExecutionId: string, projectId: string } }
) {
    try {
        const session = await verifySession();
        if (!session) {
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

        const body = await req.json();
        const response = testCaseExecutionSchema.safeParse(body);

        if (!response.success) {
            return Response.json(
                {
                    message: INVALID_INPUT_ERROR_MESSAGE,
                    errors: response.error.errors,
                },
                { status: HttpStatusCode.BAD_REQUEST }
            );
        }
        const { testCaseExecutionId, projectId } = params;
        let newIssue;

        if (response.data.isIssue) {
            const TestExecution = await TestCaseResult.findById(testCaseExecutionId).populate("testCaseId", "_id title");
            newIssue = new Issue({
                title: TestExecution.testCaseId?.title,
                userId: session.user._id,
                projectId: projectId,
                status: IssueStatus.NEW
            });
            await newIssue.save();
        }

        const updateResponse = await TestCaseResult.findByIdAndUpdate(testCaseExecutionId, {
            ...response.data,
            issueId: response.data.isIssue ? newIssue._id : null,
            updatedBy: session.user._id,
            updatedAt: Date.now()
        }, { new: true });

        if (!updateResponse) {
            throw new Error(GENERIC_ERROR_MESSAGE);
        }

        return Response.json({
            message: "Test case moderated successfully"
        });
    } catch (error: any) {
        return errorHandler(error);
    }
}