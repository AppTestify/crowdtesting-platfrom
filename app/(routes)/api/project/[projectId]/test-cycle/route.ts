import { DBModels } from "@/app/_constants";
import { AttachmentFolder } from "@/app/_constants/constant-server-side";
import { formatDateWithoutTime } from "@/app/_constants/date-formatter";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { UserRoles } from "@/app/_constants/user-roles";
import { connectDatabase } from "@/app/_db";
import AttachmentService from "@/app/_helpers/attachment.helper";
import { ITestCase } from "@/app/_interface/test-case";
import { isAdmin, verifySession } from "@/app/_lib/dal";
import { IdFormat } from "@/app/_models/id-format.model";
import { TestCycleAttachment } from "@/app/_models/test-cycle-attachment.model";
import { TestCycle } from "@/app/_models/test-cycle.model";
import { Tester } from "@/app/_models/tester.model";
import { User } from "@/app/_models/user.model";
import {
  filterTestCyclesForAdmin,
  filterTestCyclesNotForAdmin,
} from "@/app/_queries/search-test-cycle";
import { testCycleSchema } from "@/app/_schemas/test-cycle.schema";
import {
  countResults,
  generateTestCycleLink,
  getFileMetaData,
  serverSidePagination,
} from "@/app/_utils/common-server-side";
import { addCustomIds, replaceCustomId } from "@/app/_utils/data-formatters";
import { testCycleCountryMail } from "@/app/_utils/email";
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
    const { projectId } = params;
    const attachments = body.getAll("attachments");
    const formData = {
      title: body.get("title"),
      projectId: body.get("projectId"),
      description: body.get("description"),
      startDate: body.get("startDate"),
      endDate: body.get("endDate"),
      country: body.get("country"),
      isEmailSend: body.get("isEmailSend") === "true",
    };
    const response = testCycleSchema.safeParse(formData);

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

    if (response.data?.isEmailSend) {
      const testers = await User.find({ role: UserRoles.TESTER });

      const users = await Tester.find({
        "address.country": response?.data?.country,
        user: testers?.map((tester) => tester?._id),
      }).populate("user", "firstName lastName email");

      // unique users
      const uniqueUsers = new Map();
      users.forEach((user) => {
        if (user?.user?._id) {
          uniqueUsers.set(user.user._id.toString(), {
            id: user.user._id,
            email: user.user.email,
            fullName: `${user.user.firstName.trim()} ${user.user.lastName.trim()}`,
          });
        }
      });

      const uniqueUsersArray = Array.from(uniqueUsers.values());

      for (const user of uniqueUsersArray) {
        const payload = {
          emails: user.email,
          fullName: user.fullName || "",
          name: response.data.title,
          description: response?.data?.description,
          startDate: formatDateWithoutTime(response?.data?.startDate),
          endDate: formatDateWithoutTime(response?.data?.endDate),
          country: response?.data?.country || "",
          applyLink: generateTestCycleLink(user.id, projectId),
        };
        await testCycleCountryMail(payload);
      }
    }

    const newTestSuite = new TestCycle({
      ...response.data,
      userId: session.user._id,
    });
    const saveTestSuite = await newTestSuite.save();

    const attachmentService = new AttachmentService();
    const attachmentIds = await Promise.all(
      attachments.map(async (file) => {
        if (file) {
          const { name, contentType } = await getFileMetaData(file);
          const cloudId =
            await attachmentService.uploadFileInGivenFolderInDrive(
              file,
              AttachmentFolder.TEST_CYCLE
            );
          const newAttachment = new TestCycleAttachment({
            cloudId: cloudId,
            name,
            contentType,
            testCycleId: saveTestSuite._id,
          });

          const savedAttachment = await newAttachment.save();
          return savedAttachment._id;
        }
        return null;
      })
    );

    const validAttachmentIds = attachmentIds.filter((id) => id !== null);

    await TestCycle.findByIdAndUpdate(
      saveTestSuite._id,
      { $push: { attachments: { $each: validAttachmentIds } } },
      { new: true }
    );

    return Response.json({
      message: "Test cycle added successfully",
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
    const totalTestCycles = await TestCycle.find({
      projectId: projectId,
    }).countDocuments();
    const { skip, limit } = serverSidePagination(req);
    const userIdFormat = await IdFormat.findOne({
      entity: DBModels.TEST_CYCLE,
    });
    const testCaseIdFormat = await IdFormat.findOne({
      entity: DBModels.TEST_CASE,
    });

    if (searchString) {
      if (!(await isAdmin(session.user))) {
        const { testCycles, totalTestCycles } =
          await filterTestCyclesNotForAdmin(
            searchString,
            skip,
            limit,
            projectId,
            userIdFormat
          );
        return Response.json({
          testCycles: addCustomIds(testCycles, userIdFormat?.idFormat),
          total: totalTestCycles,
        });
      } else {
        const { testCycles, totalTestCycles } = await filterTestCyclesForAdmin(
          searchString,
          skip,
          limit,
          projectId,
          userIdFormat
        );
        return Response.json({
          testCycles: addCustomIds(testCycles, userIdFormat?.idFormat),
          total: totalTestCycles,
        });
      }
    }

    if (!(await isAdmin(session.user))) {
      response = addCustomIds(
        await TestCycle.find({ projectId: projectId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        userIdFormat.idFormat
      );
    } else {
      response = addCustomIds(
        await TestCycle.find({ projectId: projectId })
          .populate("userId", "id firstName lastName")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        userIdFormat.idFormat
      );
    }

    const result = response.map((res) => ({
      ...res,
      testCaseId: res?.testCaseId?.map((testCase: ITestCase) => ({
        ...testCase,
        customId: replaceCustomId(
          testCaseIdFormat.idFormat,
          testCase?.customId
        ),
      })),
      resultCounts: countResults(res.testCaseResults || []),
    }));

    return Response.json({ testCycles: result, total: totalTestCycles });
  } catch (error: any) {
    return errorHandler(error);
  }
}
