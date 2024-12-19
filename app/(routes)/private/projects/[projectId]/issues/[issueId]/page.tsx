"use client";

import { IIssue } from "@/app/_interface/issue";
import { getIssueService } from "@/app/_services/issue.service";
import toasterService from "@/app/_services/toaster-service";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { displayIcon, statusBadge } from "@/app/_utils/common-functionality";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { formatDate } from "@/app/_constants/date-formatter";
import IssueAttachments from "../_components/attachments/issue-attachment";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const IssueView = () => {
    const [isViewLoading, setIsViewLoading] = useState<boolean>(false);
    const [issueData, setIssueData] = useState<IIssue>();
    const { issueId } = useParams<{ issueId: string }>();
    const { projectId } = useParams<{ projectId: string }>();

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

    useEffect(() => {
        getAttachments();
    }, [projectId, issueId]);
    return (
        <div className="pb-0">
            {!isViewLoading ?
                <main className="mx-4">
                    <div className="">
                        {/* <DropdownMenuSeparator className="border-b" /> */}
                        <div className="mb-2">
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink className="text-lg" href={`/private/projects/${projectId}/issues`}>
                                            Issue
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator>
                                        <ChevronRight className='h-4 w-4' />
                                    </BreadcrumbSeparator>
                                    <BreadcrumbItem>
                                        <BreadcrumbPage className="text-lg">{issueData?.customId}</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                        <div className="">
                            <div className="flex justify-between items-center">
                                <p className="text-xl font-medium capitalize">
                                    {/* <span className="mr-2 text-primary">{issueData?.customId}:</span> */}
                                    {/* {issueData?.title} */}
                                </p>
                            </div>
                            <span className="text-mute text-sm">
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
                        <div className="mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-4 text-sm ">
                                {/* Title */}
                                <div>
                                    <span className="font-medium">Title</span>
                                    <div className="ml-2">
                                        {issueData?.title}
                                    </div>
                                </div>

                                {/* Severity */}
                                <div className="flex items-center">
                                    <span className=" font-medium">Severity:</span>
                                    <span className="ml-2">{issueData?.severity}</span>
                                </div>

                                {/* Priority */}
                                <div className="flex items-center">
                                    <span className=" font-medium">Priority:</span>
                                    <span className="ml-2 flex items-center">
                                        {displayIcon(issueData?.priority as string)}
                                        <span className="ml-1 font-medium">{issueData?.priority}</span>
                                    </span>
                                </div>

                                {/* Status */}
                                <div className="flex items-center">
                                    <span className=" font-medium">Status:</span>
                                    <span className="ml-2">{statusBadge(issueData?.status)}</span>
                                </div>

                                {/* Device */}
                                <div className="flex items-center">
                                    <span className=" font-medium">Device:</span>
                                    <span className="ml-2">{issueData?.device?.[0]?.name}</span>
                                </div>
                            </div>

                            <div>
                                <span className="font-medium">Description</span>
                                <div
                                    className="px-2 text-sm leading-relaxed text-gray-700 rich-description"
                                    dangerouslySetInnerHTML={{
                                        __html: issueData?.description || "",
                                    }}
                                />
                            </div>
                        </div>

                        <IssueAttachments issueId={issueId} isUpdate={true} isView={true} />
                    </div>
                </main>
                :
                <div>
                    <Skeleton className="h-8 w-[230px] bg-gray-200 ml-4" />
                    <Skeleton className="h-6 w-[100px] my-1 bg-gray-200 ml-4" />
                    <Skeleton className="h-5 w-[180px] my-2 bg-gray-200 ml-4" />
                    <Skeleton className="h-48 w-[95%] mt-6 bg-gray-200 ml-4" />
                </div>
            }
        </div>
    );
};

export default IssueView;
