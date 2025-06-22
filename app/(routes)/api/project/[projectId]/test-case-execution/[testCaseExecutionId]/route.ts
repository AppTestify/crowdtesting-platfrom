import { AttachmentFolder } from "@/app/_constants/constant-server-side";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { IssueStatus } from "@/app/_constants/issue";
import { connectDatabase } from "@/app/_db";
import AttachmentService from "@/app/_helpers/attachment.helper";
import { verifySession } from "@/app/_lib/dal";
import { IssueAttachment } from "@/app/_models/issue-attachment.model";
import { Issue } from "@/app/_models/issue.model";
import { TestCaseResultAttachment } from "@/app/_models/test-case-result-attachment.model";
import { TestCaseResult } from "@/app/_models/test-case-result.model";
import { testCaseExecutionSchema } from "@/app/_schemas/test-case-execution";
import { getFileMetaData } from "@/app/_utils/common-server-side";
import { errorHandler } from "@/app/_utils/error-handler";

export async function POST(
  req: Request,
  { params }: { params: { testCaseExecutionId: string; projectId: string } }
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

    const body = await req.formData();
    const attachments = body.getAll("attachments");

    // test steps
    const testStepsRaw = body.getAll("testSteps[]");
    const testSteps = testStepsRaw
      .map((item) => {
        try {
          return JSON.parse(item.toString());
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    // test cycle
    const testCycleRaw = body.get("testCycle");
    const testCycleData =
      typeof testCycleRaw === "string" && testCycleRaw.trim() !== ""
        ? testCycleRaw.trim()
        : null;

    // Issue
    const isIssueRaw = body.get("isIssue");
    const isIssue =
      typeof isIssueRaw === "string" &&
      isIssueRaw.trim().toLowerCase() === "true";

    // Linked Issue ID
    const linkedIssueIdRaw = body.get("linkedIssueId");
    const linkedIssueIdValue =
      typeof linkedIssueIdRaw === "string" && linkedIssueIdRaw.trim() !== ""
        ? linkedIssueIdRaw.trim()
        : null;

    const formData = {
      result: body.get("result"),
      actualResult: body.get("actualResult"),
      remarks: body.get("remarks"),
      isIssue: isIssue,
      linkedIssueId: linkedIssueIdValue,
      testCycleId: testCycleData,
      testSteps: testSteps,
    };
    const response = testCaseExecutionSchema.safeParse(formData);

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
    let issueIdToLink;

    // Handle issue creation or linking
    if (response.data.isIssue) {
      // Create new issue
      const TestExecution = await TestCaseResult.findById(
        testCaseExecutionId
      ).populate("testCaseId", "_id title");
      newIssue = new Issue({
        title: TestExecution.testCaseId?.title,
        userId: session.user._id,
        projectId: projectId,
        status: IssueStatus.NEW,
        testCycle: response?.data?.testCycleId,
        description: response?.data?.remarks ? response?.data?.remarks : "",
      });
      await newIssue.save();
      issueIdToLink = newIssue._id;
    } else if (response.data.linkedIssueId) {
      // Link to existing issue
      issueIdToLink = response.data.linkedIssueId;
      
      // Verify the issue exists and belongs to the project
      const existingIssue = await Issue.findOne({
        _id: response.data.linkedIssueId,
        projectId: projectId
      });
      
      if (!existingIssue) {
        return Response.json(
          { message: "Selected issue not found or doesn't belong to this project" },
          { status: HttpStatusCode.BAD_REQUEST }
        );
      }
    }

    const { testCycleId, linkedIssueId, ...restData } = response.data;
    const updatePayload: any = {
      ...restData,
      issueId: issueIdToLink || null,
      updatedBy: session.user._id,
      updatedAt: Date.now(),
    };

    if (!response?.data?.testCycleId || response?.data?.testCycleId === "") {
      delete updatePayload.testCycleId;
    }

    const updateResponse = await TestCaseResult.findByIdAndUpdate(
      testCaseExecutionId,
      updatePayload,
      { new: true }
    );

    const attachmentService = new AttachmentService();
    const attachmentIds = await Promise.all(
      attachments.map(async (file) => {
        if (file) {
          const { name, contentType } = await getFileMetaData(file);
          const cloudId =
            await attachmentService.uploadFileInGivenFolderInDrive(
              file,
              AttachmentFolder.TEST_CASE_RESULT
            );
          const newAttachment = new TestCaseResultAttachment({
            cloudId: cloudId,
            name,
            contentType,
            testCaseResultId: updateResponse._id,
          });

          const savedAttachment = await newAttachment.save();
          return savedAttachment._id;
        }
        return null;
      })
    );

    const validAttachmentIds = attachmentIds.filter((id) => id !== null);

    // Add attachment in issue if exists
    if (newIssue) {
      const issueAttachmentIds = await Promise.all(
        attachments.map(async (file) => {
          if (file) {
            const { name, contentType } = await getFileMetaData(file);
            const cloudId =
              await attachmentService.uploadFileInGivenFolderInDrive(
                file,
                AttachmentFolder.ISSUES
              );
            const newAttachment = new IssueAttachment({
              cloudId: cloudId,
              name,
              contentType,
              issueId: newIssue._id,
            });

            const savedAttachment = await newAttachment.save();
            return savedAttachment._id;
          }
          return null;
        })
      );

      const validIssueAttachmentIds = issueAttachmentIds.filter(
        (id) => id !== null
      );

      await Issue.findByIdAndUpdate(
        newIssue._id,
        { $push: { attachments: { $each: validIssueAttachmentIds } } },
        { new: true }
      );
    }

    await TestCaseResult.findByIdAndUpdate(
      updateResponse._id,
      { $push: { attachments: { $each: validAttachmentIds } } },
      { new: true }
    );

    if (!updateResponse) {
      throw new Error(GENERIC_ERROR_MESSAGE);
    }

    return Response.json({
      message: "Test case moderated successfully",
    });
  } catch (error: any) {
    return errorHandler(error);
  }
}
