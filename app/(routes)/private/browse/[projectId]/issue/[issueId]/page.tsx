"use client";

import { IIssue, IIssueAttachment } from "@/app/_interface/issue";
import { getIssueService } from "@/app/_services/issue.service";
import toasterService from "@/app/_services/toaster-service";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { displayIcon, statusBadge } from "@/app/_utils/common-functionality";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronRight, Edit, UserCircle2Icon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import MediaRenderer from "@/app/_components/media-renderer";
import { getIssueAttachmentsService } from "@/app/_services/issue-attachment.service";
import EditIssue from "@/app/(routes)/private/projects/[projectId]/issues/_components/edit-issue";
import { getProjectService } from "@/app/_services/project.service";
import { IProject } from "@/app/_interface/project";
import { UserRoles } from "@/app/_constants/user-roles";
import { checkProjectAdmin } from "@/app/_utils/common";
import ViewDevice from "./_components/view-device";
import { IDevice } from "@/app/_interface/device";
import { NAME_NOT_SPECIFIED_ERROR_MESSAGE } from "@/app/_constants/errors";
import DefaultComments from "@/app/(routes)/private/projects/[projectId]/comments";
import { DBModels } from "@/app/_constants";

const ViewIssue = () => {
  const [isViewLoading, setIsViewLoading] = useState<boolean>(false);
  const [isAttachmentLoading, setIsAttachmentLoading] =
    useState<boolean>(false);
  const [issueData, setIssueData] = useState<IIssue | null>();
  const { issueId } = useParams<{ issueId: string }>();
  const { projectId } = useParams<{ projectId: string }>();
  const { data } = useSession();
  const [issueAttachments, setIssueAttachments] = useState<IIssueAttachment[]>(
    []
  );
  const [isEditStatusOpen, setIsEditStatusOpen] = useState(false);
  const [project, setProject] = useState<IProject>();
  const [userData, setUserData] = useState<any>();
  const checkProjectRole = checkProjectAdmin(project as IProject, userData);

  const getIssueById = async () => {
    try {
      setIsViewLoading(true);
      const response = await getIssueService(projectId, issueId);
      setIssueData(response);
    } catch (error) {
      toasterService.error();
    } finally {
      setIsViewLoading(false);
    }
  };

  const getIssueAttachments = async () => {
    setIsAttachmentLoading(true);
    try {
      const response = await getIssueAttachmentsService(projectId, issueId);
      setIssueAttachments(response);
    } catch (error) {
      toasterService.error();
    } finally {
      setIsAttachmentLoading(false);
    }
  };

  const refreshAttachments = async () => {
    await getIssueAttachments();
  };

  const refreshIssues = async () => {
    setIssueData(null)
    await getIssueById();
    await getIssueAttachments();
  };

  const getProject = async () => {
    setIsViewLoading(true);
    try {
      const response = await getProjectService(projectId);
      setProject(response);
    } catch (error) {
      toasterService.error();
    } finally {
      setIsViewLoading(false);
    }
  };

  useEffect(() => {
    getIssueById();
    getIssueAttachments();
    getProject();
  }, [projectId, issueId]);

  useEffect(() => {
    if (data) {
      const { user } = data;
      setUserData(user);
    }
  }, [data]);

  return (
    <div className="pb-0 mt-2 w-full">
      {issueData && (
        <EditIssue
          issue={issueData as IIssue}
          sheetOpen={isEditStatusOpen}
          setSheetOpen={setIsEditStatusOpen}
          refreshIssues={refreshIssues}
        />
      )}
      {!isViewLoading ? (
        <main className="mx-4">
          <div className="flex justify-between mb-2">
            <div className="mb-2">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      className="text-[12px]"
                      href={`/private/projects/${projectId}/issues`}
                    >
                      Issues
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-3" />
                  </BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-[12px] text-primary">
                      {issueData?.customId}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div>
              {checkProjectRole ? (
                project?.isActive && (
                  <Button size={"sm"} onClick={() => setIsEditStatusOpen(true)}>
                    <Edit className="h-2 w-2" /> Edit
                  </Button>
                )
              ) : (project?.isActive &&
                issueData?.userId?._id?.toString() ===
                userData?._id?.toString()) ||
                userData?.role !== UserRoles.TESTER ? (
                <Button size={"sm"} onClick={() => setIsEditStatusOpen(true)}>
                  <Edit className="h-2 w-2" /> Edit
                </Button>
              ) : null}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-4">
            <div className="my-4">
              <div className=" text-[24px]">{issueData?.title}</div>
              <div className="mt-2">
                <span className="font-semibold">Description</span>
                <div
                  className="mt-2 text-sm leading-relaxed text-gray-700 rich-description"
                  dangerouslySetInnerHTML={{
                    __html: issueData?.description || "",
                  }}
                />
              </div>

              {!isAttachmentLoading ? (
                <MediaRenderer
                  attachments={issueAttachments || []}
                  title={"Attachments"}
                  refreshAttachments={refreshAttachments}
                  userData={userData}
                  issueData={issueData as IIssue}
                />
              ) : (
                <div className="flex gap-2 mt-4">
                  <Skeleton className="h-[120px] w-[155px] bg-gray-200" />
                  <Skeleton className="h-[120px] w-[155px] bg-gray-200" />
                  <Skeleton className="h-[120px] w-[155px] bg-gray-200" />
                  <Skeleton className="h-[120px] w-[155px] bg-gray-200" />
                </div>
              )}
            </div>
            <div>
              <div className="border rounded-md p-4 h-fit flex flex-col gap-3">
                <div className="flex items-center gap-[20px]">
                  <span className="text-gray-500 min-w-[70px] text-sm">Severity</span>
                  <span className="text-sm">{issueData?.severity}</span>
                </div>

                <div className="flex items-center gap-[20px]">
                  <span className="text-gray-500 min-w-[70px] text-sm">Priority</span>
                  <span className="text-sm flex items-center">
                    {displayIcon(issueData?.priority as string)}
                    <span className="ml-1 font-medium">
                      {issueData?.priority}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-[20px]">
                  <span className="text-gray-500 min-w-[70px] text-sm">Status</span>
                  <span className="text-sm">{statusBadge(issueData?.status)}</span>
                </div>

                {/* Test cycle */}
                <div className="flex items-center gap-[20px]">
                  <span className="text-gray-500 min-w-[70px] text-sm">Test cycle</span>
                  <span className="ml-1 font-medium">
                    {issueData?.testCycle?.title}
                  </span>
                </div>

                {/* Issue type */}
                <div className="flex items-center gap-[20px]">
                  <span className="text-gray-500 min-w-[70px] text-sm">Issue type</span>
                  <span className="ml-1 font-medium">
                    {issueData?.issueType}
                  </span>
                </div>

                <div className="flex items-center gap-[20px]">
                  <span className="text-gray-500 min-w-[70px] text-sm">Assignee</span>
                  <span className="text-sm flex items-center">
                    <UserCircle2Icon className="text-gray-600 h-4 w-4 mr-1" />
                    {issueData?.assignedTo?._id ? (
                      `${issueData?.assignedTo?.firstName ||
                      NAME_NOT_SPECIFIED_ERROR_MESSAGE
                      } ${issueData?.assignedTo?.lastName || ""}`
                    ) : (
                      <span className="text-gray-400">Unassigned</span>
                    )}
                  </span>
                </div>

                {userData?.role !== UserRoles.CLIENT &&
                  <div className="flex items-center gap-[20px]">
                    <span className="text-gray-500 min-w-[70px] text-sm">Reporter</span>
                    <span className="text-sm flex items-center">
                      <UserCircle2Icon className="text-gray-600 h-4 w-4 mr-1" />
                      {`${issueData?.userId?.firstName || ""} ${issueData?.userId?.lastName || ""}`}
                    </span>
                  </div>
                }
              </div>

              <div className="mt-3">
                {issueData?.device && (
                  <ViewDevice devices={issueData?.device as IDevice[]} />
                )}
              </div>
            </div>

            <div className="">
              <DefaultComments project={project as IProject} entityId={issueId} entityName={DBModels.ISSUE} />
            </div>
          </div>
        </main>
      ) : (
        <div>
          <Skeleton className="h-12 w-[300px] bg-gray-200 ml-4" />
          <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-4">
            <div>
              <Skeleton className="h-64 mt-3 bg-gray-200 ml-4" />
            </div>
            <div className="flex flex-col gap-4">
              <Skeleton className="h-12 w-[300px] bg-gray-200 ml-4" />
              <Skeleton className="h-24 w-[300px] bg-gray-200 ml-4" />
              <Skeleton className="h-24 w-[300px] bg-gray-200 ml-4" />
            </div>
          </div>
        </div>
      )
      }
    </div >
  );
};

export default ViewIssue;
