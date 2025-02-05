"use client";

import toasterService from "@/app/_services/toaster-service";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { displayIcon, taskStatusBadge } from "@/app/_utils/common-functionality";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronRight, UserCircle2Icon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { getProjectService } from "@/app/_services/project.service";
import { IProject } from "@/app/_interface/project";
import { UserRoles } from "@/app/_constants/user-roles";
import { NAME_NOT_SPECIFIED_ERROR_MESSAGE } from "@/app/_constants/errors";
import { getTaskByIdService } from "@/app/_services/task.service";
import { ITask } from "@/app/_interface/task";
import { Badge } from "@/components/ui/badge";
import DefaultComments from "@/app/(routes)/private/projects/[projectId]/comments";
import { DBModels } from "@/app/_constants";

const ViewTask = () => {
    const [isViewLoading, setIsViewLoading] = useState<boolean>(false);
    const [taskData, setTaskData] = useState<ITask | null>();
    const { taskId } = useParams<{ taskId: string }>();
    const { projectId } = useParams<{ projectId: string }>();
    const { data } = useSession();
    const [project, setProject] = useState<IProject>();
    const [userData, setUserData] = useState<any>();

    const getIssueById = async () => {
        try {
            setIsViewLoading(true);
            const response = await getTaskByIdService(projectId, taskId);
            setTaskData(response);
        } catch (error) {
            toasterService.error();
        } finally {
            setIsViewLoading(false);
        }
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
        getProject();
    }, [projectId, taskId]);

    useEffect(() => {
        if (data) {
            const { user } = data;
            setUserData(user);
        }
    }, [data]);

    return (
        <div className="pb-0 mt-2 w-full">
            {!isViewLoading ? (
                <main className="mx-4">
                    <div className="flex justify-between mb-2">
                        <div className="mb-2">
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink
                                            className="text-[12px]"
                                            href={`/private/projects/${projectId}/tasks`}
                                        >
                                            Task
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator>
                                        <ChevronRight className="h-3" />
                                    </BreadcrumbSeparator>
                                    <BreadcrumbItem>
                                        <BreadcrumbPage className="text-[12px] text-primary">
                                            {taskData?.title && taskData.title.length > 50 ? `${taskData.title.substring(0, 50)}...` : taskData?.title}
                                        </BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-4">
                        <div className="my-4">
                            <div className=" text-[24px]">{taskData?.title}</div>
                            <div className="mt-2">
                                <span className="font-semibold">Description</span>
                                <div
                                    className="mt-2 text-sm leading-relaxed text-gray-700 rich-description"
                                    dangerouslySetInnerHTML={{
                                        __html: taskData?.description || "",
                                    }}
                                />
                            </div>

                        </div>
                        <div>
                            <div className="border rounded-md p-4 h-fit flex flex-col gap-3">
                                <div className="flex items-center gap-[20px]">
                                    <span className="text-gray-500 min-w-[70px] text-sm">Priority</span>
                                    <span className="text-sm flex items-center">
                                        {displayIcon(taskData?.priority as string)}
                                        <span className="ml-1 font-medium">
                                            {taskData?.priority}
                                        </span>
                                    </span>
                                </div>

                                <div className="flex items-center gap-[20px]">
                                    <span className="text-gray-500 min-w-[70px] text-sm">Status</span>
                                    <span className="text-sm">{taskStatusBadge(taskData?.status)}</span>
                                </div>

                                {/* Issue */}
                                <div className="flex items-center gap-[20px]">
                                    <span className="text-gray-500 min-w-[70px] text-sm">Issue</span>
                                    <span className="ml-1 font-medium">
                                        {taskData?.issueId?.title}
                                    </span>
                                </div>

                                <div className="flex items-center gap-[20px]">
                                    <span className="text-gray-500 min-w-[70px] text-sm">Assignee</span>
                                    <span className="text-sm flex items-center">
                                        <UserCircle2Icon className="text-gray-600 h-4 w-4 mr-1" />
                                        {taskData?.assignedTo?._id ? (
                                            `${taskData?.assignedTo?.firstName ||
                                            NAME_NOT_SPECIFIED_ERROR_MESSAGE
                                            } ${taskData?.assignedTo?.lastName || ""}`
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
                                            {`${taskData?.userId?.firstName || ""} ${taskData?.userId?.lastName || ""}`}
                                        </span>
                                    </div>
                                }
                            </div>
                            <div className="mt-3">
                                {taskData?.requirementIds &&
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">Requirements</span>
                                            <span className="bg-gray-200 rounded-full px-2 py-1 text-[10px]">
                                                {taskData?.requirementIds?.length}
                                            </span>
                                        </div>
                                        <div>
                                            {taskData.requirementIds.map((requirement, index) => (
                                                <Badge key={requirement?.id || index} className="my-1 mr-2" variant="outline">
                                                    {requirement?.title}
                                                </Badge>
                                            ))
                                            }
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>

                        <div className="">
                            <DefaultComments project={project as IProject} entityId={taskId as string} entityName={DBModels.TASK} />
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

export default ViewTask;
