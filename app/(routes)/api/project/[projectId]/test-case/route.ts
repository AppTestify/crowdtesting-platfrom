import { DBModels } from "@/app/_constants";
import { AttachmentFolder } from "@/app/_constants/constant-server-side";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import AttachmentService from "@/app/_helpers/attachment.helper";
import { IRequirement } from "@/app/_interface/requirement";
import { isAdmin, verifySession } from "@/app/_lib/dal";
import { IdFormat } from "@/app/_models/id-format.model";
import { TestCaseAttachment } from "@/app/_models/test-case-attachment.model";
import { TestCase } from "@/app/_models/test-case.model";
import {
  filterTestCasesForAdmin,
  filterTestCasesNotForAdmin,
} from "@/app/_queries/search-test-cases";
import { testCaseSchema } from "@/app/_schemas/test-case.schema";
import {
  getFileMetaData,
  serverSidePagination,
} from "@/app/_utils/common-server-side";
import { addCustomIds, replaceCustomId } from "@/app/_utils/data-formatters";
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

    const body = await req.formData();
    const attachments = body.getAll("attachments");
    const formData = {
      title: body.get("title"),
      testType: body.get("testType"),
      severity: body.get("severity"),
      projectId: body.get("projectId"),
      expectedResult: body.get("expectedResult"),
      testSuite: body.get("testSuite"),
      requirements: body.getAll("requirements[]"),
    };
    const response = testCaseSchema.safeParse(formData);

    if (!attachments) {
      throw new Error(GENERIC_ERROR_MESSAGE);
    }

    if (!response.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
          errors: response.error.errors,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    const newTestCase = new TestCase({
      ...response.data,
      userId: session.user._id,
    });
    const saveTestCase = await newTestCase.save();

    const attachmentService = new AttachmentService();
    const attachmentIds = await Promise.all(
      attachments.map(async (file) => {
        if (file) {
          const { name, contentType } = await getFileMetaData(file);
          const cloudId =
            await attachmentService.uploadFileInGivenFolderInDrive(
              file,
              AttachmentFolder.TEST_CASE
            );
          const newAttachment = new TestCaseAttachment({
            cloudId: cloudId,
            name,
            contentType,
            testCaseId: saveTestCase._id,
          });

          const savedAttachment = await newAttachment.save();
          return savedAttachment._id;
        }
        return null;
      })
    );

    const validAttachmentIds = attachmentIds.filter((id) => id !== null);

    await TestCase.findByIdAndUpdate(
      saveTestCase._id,
      { $push: { attachments: { $each: validAttachmentIds } } },
      { new: true }
    );

    return Response.json({
      message: "Test case added successfully",
      id: saveTestCase?._id,
      data: saveTestCase,
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
    const { skip, limit } = serverSidePagination(req);

    // For custom Id
    const url = new URL(req.url);
    const searchString = url.searchParams.get("searchString");
    const requirement = url.searchParams.get("requirement");
    const filter: any = { projectId: projectId };
    if (requirement) {
      filter.requirements = requirement;
    }

    const totalTestCases = await TestCase.find(filter).countDocuments();
    const userIdFormat = await IdFormat.findOne({ entity: DBModels.TEST_CASE });
    const requirementUserIdFormat = await IdFormat.findOne({
      entity: DBModels.REQUIREMENT,
    });
    const testSuiteIdFormat = await IdFormat.findOne({
      entity: DBModels.TEST_SUITE,
    });

    if (searchString) {
      if (!(await isAdmin(session.user))) {
        const { testCases, totalTestCases } = await filterTestCasesNotForAdmin(
          searchString,
          skip,
          limit,
          projectId,
          userIdFormat,
          requirement ?? undefined,
          requirementUserIdFormat,
          testSuiteIdFormat
        );
        return Response.json({
          testCases: addCustomIds(testCases, userIdFormat?.idFormat),
          total: totalTestCases,
        });
      } else {
        const { testCases, totalTestCases } = await filterTestCasesForAdmin(
          searchString,
          skip,
          limit,
          projectId,
          userIdFormat,
          requirement ?? undefined,
          requirementUserIdFormat,
          testSuiteIdFormat
        );
        return Response.json({
          testCases: addCustomIds(testCases, userIdFormat?.idFormat),
          total: totalTestCases,
        });
      }
    }

    if (!(await isAdmin(session.user))) {
      response = addCustomIds(
        await TestCase.find(filter)
          .populate("testSuite requirements")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        userIdFormat.idFormat
      );
    } else {
      response = addCustomIds(
        await TestCase.find(filter)
          .populate("userId", "id firstName lastName")
          .populate("testSuite requirements")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        userIdFormat.idFormat
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
      testSuite: res?.testSuite
        ? {
            ...res?.testSuite,
            customId: replaceCustomId(
              testSuiteIdFormat.idFormat,
              res?.testSuite?.customId
            ),
          }
        : undefined,
    }));

    return Response.json({ testCases: result, total: totalTestCases });
  } catch (error: any) {
    return errorHandler(error);
  }
}
