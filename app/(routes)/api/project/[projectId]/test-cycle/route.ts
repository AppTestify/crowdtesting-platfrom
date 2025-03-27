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
import { isAdmin, isClient, isTester, verifySession } from "@/app/_lib/dal";
import { IdFormat } from "@/app/_models/id-format.model";
import { Project } from "@/app/_models/project.model";
import { TestCycleAttachment } from "@/app/_models/test-cycle-attachment.model";
import { TestCycle } from "@/app/_models/test-cycle.model";
import { Tester } from "@/app/_models/tester.model";
import { User } from "@/app/_models/user.model";
import {
  filterTestCyclesForAdmin,
  filterTestCyclesForClient,
  filterTestCyclesForTester,
} from "@/app/_queries/search-test-cycle";
import { testCycleSchema } from "@/app/_schemas/test-cycle.schema";
import {
  countResults,
  generateTestCycleLink,
  getFileMetaData,
  getTestCycleBasedIds,
  serverSidePagination,
} from "@/app/_utils/common-server-side";
import { addCustomIds, replaceCustomId } from "@/app/_utils/data-formatters";
import {
  replaceEmailTemplateTagsInternalService,
  testCycleCountryMail,
} from "@/app/_utils/email";
import { errorHandler } from "@/app/_utils/error-handler";
import { ObjectId } from "mongodb";

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
      emailFormat: body.get("emailFormat"),
      emailSubject: body.get("emailSubject"),
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

    const newTestCycle = new TestCycle({
      ...response.data,
      userId: session.user._id,
    });

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

      // Check email
      let unMatchedUsers = [];

      const projectUser = await Project.findById(projectId);

      if (projectUser) {
        const projectUserIds = projectUser.users.map(
          (user: any) => user.userId
        );

        unMatchedUsers = uniqueUsersArray.filter((user) => {
          const isUserMatched = projectUserIds.some((id: any) =>
            id.equals(user.id)
          );

          const matchingProjectUser = projectUser.users.find((projUser: any) =>
            projUser.userId.equals(user.id)
          );

          const hasTestCycles = matchingProjectUser?.testCycles?.length > 0;

          return !isUserMatched || hasTestCycles;
        });
      }

      for (const user of unMatchedUsers) {
        const payload = {
          emailFormat: replaceEmailTemplateTagsInternalService({
            emailBody: response?.data?.emailFormat,
            tagValuesObject: {
              emails: user.email,
              fullName: user.fullName || "",
              name: response.data.title,
              description: response?.data?.description,
              startDate: formatDateWithoutTime(response?.data?.startDate),
              endDate: formatDateWithoutTime(response?.data?.endDate),
              country: response?.data?.country || "",
              applyLink: generateTestCycleLink(
                user.id,
                projectId,
                newTestCycle?._id
              ),
            },
          }),
          subject: response?.data?.emailSubject || "",
          emails: user.email,
        };

        await testCycleCountryMail(payload);
      }
    }

    const saveTestCycle = await newTestCycle.save();

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
            testCycleId: saveTestCycle._id,
          });

          const savedAttachment = await newAttachment.save();
          return savedAttachment._id;
        }
        return null;
      })
    );

    const validAttachmentIds = attachmentIds.filter((id) => id !== null);

    await TestCycle.findByIdAndUpdate(
      saveTestCycle._id,
      { $push: { attachments: { $each: validAttachmentIds } } },
      { new: true }
    );

    return Response.json({
      message: "Test cycle added successfully",
      id: saveTestCycle?._id,
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
    let totalTestCycles = await TestCycle.find({
      projectId: projectId,
    }).countDocuments();
    const { skip, limit } = serverSidePagination(req);
    const userIdFormat = await IdFormat.findOne({
      entity: DBModels.TEST_CYCLE,
    });
    const testCaseIdFormat = await IdFormat.findOne({
      entity: DBModels.TEST_CASE,
    });

    // For tester
    const project = await Project.findById(projectId);
    const testCycleIds = getTestCycleBasedIds(project, session.user?._id);
    const query =
      testCycleIds?.length > 0
        ? { _id: { $in: testCycleIds }, projectId: new ObjectId(projectId) }
        : { projectId: projectId };

    if (searchString) {
      if (await isAdmin(session.user)) {
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
      } else if (await isTester(session.user)) {
        const { testCycles, totalTestCycles } = await filterTestCyclesForTester(
          searchString,
          skip,
          limit,
          userIdFormat,
          testCycleIds,
          projectId
        );
        return Response.json({
          testCycles: addCustomIds(testCycles, userIdFormat?.idFormat),
          total: totalTestCycles,
        });
      } else {
        const { testCycles, totalTestCycles } = await filterTestCyclesForClient(
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

    if (await isAdmin(session.user)) {
      response = addCustomIds(
        await TestCycle.find({ projectId: projectId })
          .populate("userId", "id firstName lastName")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        userIdFormat.idFormat
      );
    } else if (await isTester(session.user)) {
      response = addCustomIds(
        await TestCycle.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        userIdFormat.idFormat
      );

      totalTestCycles = await TestCycle.find(query).countDocuments();
    } else {
      response = addCustomIds(
        await TestCycle.find({ projectId: projectId })
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
