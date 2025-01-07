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
import { ChevronRight, Edit, SendHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  addCommentService,
} from "@/app/_services/comment.service";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import MediaRenderer from "@/app/_components/media-renderer";
import { getIssueAttachmentsService } from "@/app/_services/issue-attachment.service";
import EditIssue from "@/app/(routes)/private/projects/[projectId]/issues/_components/edit-issue";
import { getProjectService } from "@/app/_services/project.service";
import { IProject } from "@/app/_interface/project";
import { UserRoles } from "@/app/_constants/user-roles";
import { checkProjectAdmin } from "@/app/_utils/common";
import ViewDevice from "./_components/view-device";
import { IDevice } from "@/app/_interface/device";

const commentSchema = z.object({
  entityId: z.string().min(1, "Required"),
  content: z.string().min(1, "Required"),
});

const ViewIssue = () => {
  const [isViewLoading, setIsViewLoading] = useState<boolean>(false);
  const [isAttachmentLoading, setIsAttachmentLoading] = useState<boolean>(false);
  const [issueData, setIssueData] = useState<IIssue>();
  const { issueId } = useParams<{ issueId: string }>();
  const { projectId } = useParams<{ projectId: string }>();
  const { data } = useSession();
  const [user, setUser] = useState<any | null>();
  const [issueAttachments, setIssueAttachments] = useState<IIssueAttachment[]>([]);
  const [isEditStatusOpen, setIsEditStatusOpen] = useState(false);
  const [project, setProject] = useState<IProject>();
  const [userData, setUserData] = useState<any>();
  const checkProjectRole = checkProjectAdmin(project as IProject, userData);

  const form = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      entityId: issueId,
      content: "",
    },
  });

  useEffect(() => {
    if (data && data?.user) {
      setUser(data.user);
    }
  }, [data]);

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
  }

  const refreshIssues = async () => {
    await getIssueById();
    await getIssueAttachments();
  }

  async function onSubmit(values: z.infer<typeof commentSchema>) {
    try {
      const response = await addCommentService(projectId, issueId, values);
      if (response) {
        // getComments();
        reset();
      }
    } catch (error) {
      toasterService.error();
    }
  }

  const reset = () => {
    form.reset();
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
  }

  useEffect(() => {
    getIssueById();
    getIssueAttachments();
    getProject();
    // getComments();
  }, [projectId, issueId]);

  useEffect(() => {
    if (data) {
      const { user } = data;
      setUserData(user);
    }
  }, [data]);

  return (
    <div className="pb-0 mt-2 w-full">
      {issueData &&
        <EditIssue
          issue={issueData as IIssue}
          sheetOpen={isEditStatusOpen}
          setSheetOpen={setIsEditStatusOpen}
          refreshIssues={refreshIssues}
        />
      }
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
                      Issue
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
              {checkProjectRole
                ? project?.isActive && (
                  <Button size={'sm'} onClick={() => setIsEditStatusOpen(true)}>
                    <Edit className="h-2 w-2" /> Edit
                  </Button>
                )
                : (project?.isActive &&
                  issueData?.userId?._id?.toString() === userData?._id?.toString()) ||
                  userData?.role !== UserRoles.TESTER ? (
                  <Button size={'sm'} onClick={() => setIsEditStatusOpen(true)}>
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

              {!isAttachmentLoading ?
                <MediaRenderer
                  attachments={issueAttachments || []}
                  title={"Attachments"}
                  refreshAttachments={refreshAttachments}
                  userData={userData}
                  issueData={issueData as IIssue}
                />
                :
                <div className="flex gap-2 mt-4">
                  <Skeleton className="h-[120px] w-[155px] bg-gray-200" />
                  <Skeleton className="h-[120px] w-[155px] bg-gray-200" />
                  <Skeleton className="h-[120px] w-[155px] bg-gray-200" />
                  <Skeleton className="h-[120px] w-[155px] bg-gray-200" />
                </div>
              }

            </div>
            <div>
              <div className="border rounded-md p-4 h-fit">
                {/* Severity */}
                <div>
                  <span className="font-semibold">Severity:</span>
                  <span className="ml-2">{issueData?.severity}</span>
                </div>
                {/* Priority */}
                <div className="mt-3 flex items-center">
                  <span className="font-semibold">Priority:</span>
                  <span className="ml-2 flex items-center">
                    {displayIcon(issueData?.priority as string)}
                    <span className="ml-1 font-medium">
                      {issueData?.priority}
                    </span>
                  </span>
                </div>

                {/* Status */}
                <div className="mt-3">
                  <span className=" font-semibold">Status:</span>
                  <span className="ml-2">{statusBadge(issueData?.status)}</span>
                </div>

              </div>
              <div className="mt-2">
                {issueData?.device &&
                  <ViewDevice devices={issueData?.device as IDevice[]} />
                }
              </div>
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
              {/* <Skeleton className="h-12 w-[300px] bg-gray-200 ml-4" />
              <Skeleton className="h-12 w-[300px] bg-gray-200 ml-4" /> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewIssue;
