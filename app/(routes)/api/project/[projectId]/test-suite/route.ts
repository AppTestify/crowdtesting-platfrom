import { DBModels } from "@/app/_constants";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { IRequirement } from "@/app/_interface/requirement";
import { isAdmin, verifySession } from "@/app/_lib/dal";
import { IdFormat } from "@/app/_models/id-format.model";
import { TestSuite } from "@/app/_models/test-suite.model";
import {
  filterTestSuiteForAdmin,
  filterTestSuiteNotForAdmin,
} from "@/app/_queries/search-test-suite";
import { testSuiteSchema } from "@/app/_schemas/test-suite.schema";
import { serverSidePagination } from "@/app/_utils/common-server-side";
import {
  addCustomIds,
  normaliseIds,
  replaceCustomId,
} from "@/app/_utils/data-formatters";
import { errorHandler } from "@/app/_utils/error-handler";

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
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
    const response = testSuiteSchema.safeParse(body);

    if (!response.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
          errors: response.error.errors,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    const newTestSuite = new TestSuite({
      ...response.data,
      userId: session.user._id,
    });
    const saveTestSuite = await newTestSuite.save();

    return Response.json({
      message: "Test suite added successfully",
      id: saveTestSuite?._id,
    });
  } catch (error: any) {
    return errorHandler(error);
  }
}

export async function GET(
  req: Request,
  { params }: { params: { projectId: string } }
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

    let response = null;
    const { projectId } = params;
    const url = new URL(req.url);
    const searchString = url.searchParams.get("searchString");
    const totalTestSuites = await TestSuite.find({
      projectId: projectId,
    }).countDocuments();
    const { skip, limit } = serverSidePagination(req);
    const testSuiteIdFormat = await IdFormat.findOne({
      entity: DBModels.TEST_SUITE,
    });
    const requirementUserIdFormat = await IdFormat.findOne({
      entity: DBModels.REQUIREMENT,
    });

    if (searchString) {
      if (!(await isAdmin(session.user))) {
        const { testSuites, totalTestSuites } =
          await filterTestSuiteNotForAdmin(
            searchString,
            skip,
            limit,
            projectId,
            testSuiteIdFormat
          );
        return Response.json({
          testSuites: addCustomIds(testSuites, testSuiteIdFormat?.idFormat),
          total: totalTestSuites,
        });
      } else {
        const { testSuites, totalTestSuites } = await filterTestSuiteForAdmin(
          searchString,
          skip,
          limit,
          projectId,
          testSuiteIdFormat
        );
        return Response.json({
          testSuites: addCustomIds(testSuites, testSuiteIdFormat?.idFormat),
          total: totalTestSuites,
        });
      }
    }

    if (!(await isAdmin(session.user))) {
      response = addCustomIds(
        await TestSuite.find({ projectId: projectId })
          .populate("projectId", "_id")
          .populate("requirements")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        testSuiteIdFormat.idFormat
      );
    } else {
      response = addCustomIds(
        await TestSuite.find({ projectId: projectId })
          .populate("projectId", "_id")
          .populate("userId", "id firstName lastName")
          .populate("requirements")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        testSuiteIdFormat.idFormat
      );
    }

    const result = response.map((res) => ({
      ...res,
      requirements: res?.requirements?.map((requirement: IRequirement) => ({
        ...requirement,
        customId: replaceCustomId(
          requirementUserIdFormat.idFormat,
          requirement?.customId
        ),
      })),
    }));

    return Response.json({ testSuites: result, total: totalTestSuites });
  } catch (error: any) {
    return errorHandler(error);
  }
}
