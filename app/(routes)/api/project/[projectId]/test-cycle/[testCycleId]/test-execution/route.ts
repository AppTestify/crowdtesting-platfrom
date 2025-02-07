import { DBModels } from "@/app/_constants";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { IdFormat } from "@/app/_models/id-format.model";
import { TestCaseData } from "@/app/_models/test-case-data";
import { TestCaseResult } from "@/app/_models/test-case-result.model";
import { TestCaseStep } from "@/app/_models/test-case-step.model";
import { User } from "@/app/_models/user.model";
import { serverSidePagination } from "@/app/_utils/common-server-side";
import { replaceCustomId } from "@/app/_utils/data-formatters";
import { errorHandler } from "@/app/_utils/error-handler";
const mongoose = require("mongoose");

export async function GET(
  req: Request,
  { params }: { params: { testCycleId: string } }
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

    // filter and pagination
    const url = new URL(req.url);
    const { testCycleId } = params;
    const result = url.searchParams.get("result");
    const filter: any = { testCycleId: testCycleId };
    if (result) {
      filter.result = result;
    }
    const pagination = serverSidePagination(req);
    const skip: number = pagination.skip;
    const limit: number = pagination.limit;

    // custom ID format
    const testCaseIdFormat = await IdFormat.findOne({
      entity: DBModels.TEST_CASE,
    });
    const userIdFormat = await IdFormat.findOne({ entity: DBModels.USER });
    const testCycleIdFormat = await IdFormat.findOne({
      entity: DBModels.TEST_CYCLE,
    });

    // Main data
    const response = await TestCaseResult.find(filter)
      .populate("testCycleId", "_id customId title")
      .populate("testCaseId")
      .skip(skip)
      .limit(Number(limit))
      .lean();
    const totalTestExecutionCounts = await TestCaseResult.find(
      filter
    ).countDocuments();

    // Another data
    const testCaseIds = response.map((res) => res.testCaseId?._id);
    const testCaseStep = await TestCaseStep.find({
      testCaseId: { $in: testCaseIds },
    })
      .sort({ order: 1 })
      .lean();
    const testCaseData = await TestCaseData.find({
      testCaseId: { $in: testCaseIds },
    }).lean();

    const allData = await Promise.all(
      response.map(async (res) => {
        // Check name in string or object id
        if (mongoose.Types.ObjectId.isValid(res.updatedBy)) {
          const user = await User.findById(res.updatedBy)
            .select("firstName lastName customId")
            .lean();
          let customId = null;
          let firstName = "";
          let lastName = "";
          if (!Array.isArray(user)) {
            customId = replaceCustomId(userIdFormat?.idFormat, user?.customId);
            firstName = user?.firstName || "";
            lastName = user?.lastName || "";
          }
          res.updatedBy = {
            firstName: firstName,
            lastName: lastName,
            customId: customId,
          };
        } else {
          res.updatedBy = { firstName: res.updatedBy, lastName: "" };
        }

        const customIdFormatted = replaceCustomId(
          testCaseIdFormat.idFormat,
          res?.testCaseId?.customId
        );

        const stepsForTestCase = testCaseStep.filter(
          (step) => step.testCaseId.toString() === res.testCaseId._id.toString()
        );
        const dataForTestCase = testCaseData.filter(
          (data) => data.testCaseId.toString() === res.testCaseId._id.toString()
        );

        return {
          ...res,
          testCaseId: {
            ...res?.testCaseId,
            customId: customIdFormatted,
          },
          testCycleId: {
            ...res?.testCycleId,
            customId: replaceCustomId(
              testCycleIdFormat.idFormat,
              res?.testCycleId?.customId
            ),
          },
          testCaseStep: stepsForTestCase,
          testCaseData: dataForTestCase,
        };
      })
    );

    return Response.json({
      testExecution: allData,
      total: totalTestExecutionCounts,
    });
  } catch (error: any) {
    return errorHandler(error);
  }
}
