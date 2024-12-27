"use client";

import { IIssue } from "@/app/_interface/issue";
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
import { SendHorizontal, Slash } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import IssueAttachments from "@/app/(routes)/private/projects/[projectId]/issues/_components/attachments/issue-attachment";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarFallbackText, getFormattedBase64ForSrc } from "@/app/_utils/string-formatters";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addCommentService, getCommentsService } from "@/app/_services/comment.service";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { IComment } from "@/app/_interface/comment";
import { formatDistanceToNow } from "date-fns";

const commentSchema = z.object({
  entityId: z.string().min(1, "Required"),
  content: z.string().min(1, 'Required'),
});


const ViewIssue = () => {
  const [isViewLoading, setIsViewLoading] = useState<boolean>(false);
  const [issueData, setIssueData] = useState<IIssue>();
  const { issueId } = useParams<{ issueId: string }>();
  const { projectId } = useParams<{ projectId: string }>();
  const { data } = useSession();
  const [user, setUser] = useState<any | null>();
  const [comments, setComments] = useState<IComment[]>([]);

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

  const getAttachments = async () => {
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

  async function onSubmit(values: z.infer<typeof commentSchema>) {
    try {
      const response = await addCommentService(projectId, issueId, values);
      if (response) {
        getComments();
        reset();
      }
    } catch (error) {
      toasterService.error();
    }
  }

  const getComments = async () => {
    try {
      const response = await getCommentsService(projectId, issueId);
      setComments(response);
    } catch (error) {
      toasterService.error();
    }
  }

  const reset = () => {
    form.reset();
  }

  useEffect(() => {
    getAttachments();
    getComments();
  }, [projectId, issueId]);

  return (
    <div className="pb-0 mt-2">
      {!isViewLoading ? (
        <main className="mx-4">
          <div className="">
            <div className="mb-2">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      className="text-sm"
                      href={`/private/projects/${projectId}/issues`}
                    >
                      Issue
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator>
                    <Slash className="h-1 w-1" />
                  </BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-sm">
                      {issueData?.customId}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="">
              <span className="text-mute text-sm mt-1">
                {issueData?.userId?.firstName ? (
                  <span>
                    Created by {issueData?.userId?.firstName}{" "}
                    {issueData?.userId?.lastName}
                    {", "}
                  </span>
                ) : null}
                Created on {formatDate(issueData?.createdAt || "")}
              </span>
            </div>
            <DropdownMenuSeparator className="border-b" />
            <div className="mt-2">
              <div className="mb-2 text-sm ">
                {/* Title */}
                <div className=" text-2xl">{issueData?.title}</div>

                {/* Severity */}
                <div className="mt-3">
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

              <div>
                <span className="font-semibold text-sm">Description</span>
                <div
                  className=" text-sm leading-relaxed text-gray-700 rich-description"
                  dangerouslySetInnerHTML={{
                    __html: issueData?.description || "",
                  }}
                />
              </div>
            </div>

            {/* Accordion */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-3">
                <AccordionTrigger>Attachments ({issueData?.attachments as any})</AccordionTrigger>
                <AccordionContent>
                  <IssueAttachments issueId={issueId} isUpdate={true} isView={true} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

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
          </div> */}

          {/* <div className="mt-3">
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

        </main>
      ) : (
        <div>
          <Skeleton className="h-12 w-[300px] bg-gray-200 ml-4" />
          <Skeleton className="h-64 w-[95%] mt-3 bg-gray-200 ml-4" />
        </div>
      )
      }
    </div>
  );
};

export default ViewIssue;
