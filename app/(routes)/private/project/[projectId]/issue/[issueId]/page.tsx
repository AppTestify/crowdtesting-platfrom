"use client";

import { IIssue, IIssueAttachment } from "@/app/_interface/issue";
import { getIssueService } from "@/app/_services/issue.service";
import toasterService from "@/app/_services/toaster-service";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { displayIcon, statusBadge } from "@/app/_utils/common-functionality";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { formatDate } from "@/app/_constants/date-formatter";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronRight, Edit, SendHorizontal, Slash } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import IssueAttachments from "@/app/(routes)/private/projects/[projectId]/issues/_components/attachments/issue-attachment";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getAvatarFallbackText,
  getFormattedBase64ForSrc,
} from "@/app/_utils/string-formatters";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  addCommentService,
  getCommentsService,
} from "@/app/_services/comment.service";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { IComment } from "@/app/_interface/comment";
import { formatDistanceToNow } from "date-fns";
import MediaRenderer from "@/app/_components/media-renderer";
import { getIssueAttachmentsService } from "@/app/_services/issue-attachment.service";
import EditIssue from "@/app/(routes)/private/projects/[projectId]/issues/_components/edit-issue";

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
  const [comments, setComments] = useState<IComment[]>([]);
  const [issueAttachments, setIssueAttachments] = useState<IIssueAttachment[]>([]);
  const [isEditStatusOpen, setIsEditStatusOpen] = useState(false);

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

  // const getComments = async () => {
  //   try {
  //     const response = await getCommentsService(projectId, issueId);
  //     setComments(response);
  //   } catch (error) {
  //     toasterService.error();
  //   }
  // }

  const reset = () => {
    form.reset();
  };

  useEffect(() => {
    getIssueById();
    getIssueAttachments();
    // getComments();
  }, [projectId, issueId]);

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
              <Button size={'sm'} onClick={() => setIsEditStatusOpen(true)}>
                <Edit className="h-2 w-2" /> Edit
              </Button>
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
                />
                :
                <div className="flex gap-2 mt-4">
                  <Skeleton className="h-[120px] w-[155px] bg-gray-200" />
                  <Skeleton className="h-[120px] w-[155px] bg-gray-200" />
                  <Skeleton className="h-[120px] w-[155px] bg-gray-200" />
                  <Skeleton className="h-[120px] w-[155px] bg-gray-200" />
                </div>
              }

              {/* <div className="mt-3">
            <div className="text-sm ">Comments</div>
            <div className="w-full mb-3 mt-2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} method="post">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={getFormattedBase64ForSrc(user?.profilePicture)}
                                alt="@profilePicture"
                              />
                              <AvatarFallback>
                                {getAvatarFallbackText({
                                  ...user,
                                  name: `${user?.firstName || ""} ${user?.lastName || ""
                                    }`,
                                })}
                              </AvatarFallback>
                            </Avatar>
                            <Input
                              type="text"
                              className="ml-3 rounded-sm border border-gray-300 "
                              placeholder="Add a comment"
                              {...field}
                            />
                            <Button className="ml-2">
                              <SendHorizontal />
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </form>
              </Form>
            </div>
          </div>

          <div className="mt-3">
            {comments.map((comment, index) => (
              <div
                key={index}
                className="bg-gray-50 p-3 rounded-lg mb-3 shadow-sm"
              >
                <div className="text-gray-800">{comment?.content}</div>

                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8 bg-gray-400">
                      <AvatarImage
                        src={getFormattedBase64ForSrc(comment?.commentedBy?.profilePicture)}
                        alt="@profilePicture"
                      />
                      <AvatarFallback>
                        {getAvatarFallbackText({
                          ...user,
                          name: `${comment?.commentedBy?.firstName || ""} ${comment?.commentedBy?.lastName || ""}`,
                        })}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600">
                      {`${comment?.commentedBy?.firstName} ${comment?.commentedBy?.lastName}`}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(comment?.createdAt || new Date()), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))}
          </div> */}
            </div>
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

              {/* Device */}
              <div className="mt-3">
                <span className=" font-semibold">Device:</span>
                <span className="ml-2">{issueData?.device?.[0]?.name}</span>
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
              <Skeleton className="h-12 w-[300px] bg-gray-200 ml-4" />
              <Skeleton className="h-12 w-[300px] bg-gray-200 ml-4" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewIssue;
