import { DBModels } from "@/app/_constants";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { ITestCase } from "@/app/_interface/test-case";
import { ITestCaseResult } from "@/app/_interface/test-case-result";
import { verifySession } from "@/app/_lib/dal";
import { IdFormat } from "@/app/_models/id-format.model";
import { TestCaseData } from "@/app/_models/test-case-data";
import { TestCaseResult } from "@/app/_models/test-case-result.model";
import { TestCaseStep } from "@/app/_models/test-case-step.model";
import { User } from "@/app/_models/user.model";
import { replaceCustomId } from "@/app/_utils/data-formatters";
import { errorHandler } from "@/app/_utils/error-handler";
const mongoose = require("mongoose");

export async function GET(
  req: Request,
  { params }: { params: { testExecutionId: string } }
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

    // CustomIds
    const testCaseIdFormat = await IdFormat.findOne({
      entity: DBModels.TEST_CASE,
    });
    const userIdFormat = await IdFormat.findOne({ entity: DBModels.USER });
    const testCycleIdFormat = await IdFormat.findOne({
      entity: DBModels.TEST_CYCLE,
    });

    // filter and pagination
    const { testExecutionId } = params;
    const testCaseResult = await TestCaseResult.findById(testExecutionId)
      .populate("testCycleId", "_id customId title")
      .populate("testCaseId")
      .lean();

    if (
      !testCaseResult ||
      Array.isArray(testCaseResult) ||
      !testCaseResult?.testCaseId
    ) {
      return null;  
    }

    const testCaseId = testCaseResult.testCaseId._id;

    const [testCaseSteps, testCaseData] = await Promise.all([
      TestCaseStep.find({ testCaseId }).sort({ order: 1 }).lean(),
      TestCaseData.find({ testCaseId }).lean(),
    ]);

    let updatedBy = {};
    if (mongoose.Types.ObjectId.isValid(testCaseResult.updatedBy)) {
      const user = await User.findById(testCaseResult.updatedBy)
        .select("firstName lastName customId")
        .lean();

      updatedBy = {
        firstName: !Array.isArray(user) ? user?.firstName || "" : "",
        lastName: !Array.isArray(user) ? user?.lastName || "" : "",
        customId: user
          ? !Array.isArray(user) &&
            replaceCustomId(userIdFormat?.idFormat, user?.customId)
          : null,
      };
    } else {
      updatedBy = { firstName: testCaseResult.updatedBy, lastName: "" };
    }

    // Format Custom IDs
    const customIdFormatted = replaceCustomId(
      testCaseIdFormat.idFormat,
      testCaseResult?.testCaseId?.customId
    );

    const customTestCycleId = replaceCustomId(
      testCycleIdFormat.idFormat,
      testCaseResult?.testCycleId?.customId
    );

    // Final Result
    const result = {
      ...testCaseResult,
      updatedBy,
      testCaseId: {
        ...testCaseResult.testCaseId,
        customId: customIdFormatted,
      },
      testCycleId: {
        ...testCaseResult.testCycleId,
        customId: customTestCycleId,
      },
      testCaseStep: testCaseSteps,
      testCaseData: testCaseData,
    };

    return Response.json({
      testExecution: result,
    });
  } catch (error: any) {
    return errorHandler(error);
  }
}
