"use client";

import toasterService from "@/app/_services/toaster-service";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { displayDate, displayIcon, taskStatusBadge } from "@/app/_utils/common-functionality";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronRight, Edit, UserCircle2Icon, CheckSquare, Calendar, Target, FileText, Users, AlertTriangle, Clock } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import EditTaskStatus from "@/app/(routes)/private/projects/[projectId]/tasks/_components/edit-task-status";
import { EditTask } from "@/app/(routes)/private/projects/[projectId]/tasks/_components/edit-task";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ViewTask = () => {
    const [isViewLoading, setIsViewLoading] = useState<boolean>(false);
    const [taskData, setTaskData] = useState<ITask | null>();
    const { taskId } = useParams<{ taskId: string }>();
    const { projectId } = useParams<{ projectId: string }>();
    const { data } = useSession();
    const [project, setProject] = useState<IProject>();
    const [userData, setUserData] = useState<any>();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isEditStatusOpen, setIsEditStatusOpen] = useState(false);

    const getTaskById = async () => {
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

    const refreshTasks = () => {
        getTaskById();
        setIsEditStatusOpen(false);
        setIsEditOpen(false);
    }

    useEffect(() => {
        getTaskById();
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
            <EditTaskStatus
                task={taskData as ITask}
                refreshTasks={refreshTasks}
                sheetOpen={isEditStatusOpen}
                setSheetOpen={setIsEditStatusOpen}
            />

            <EditTask
                refreshTasks={refreshTasks}
                task={taskData as ITask}
                sheetOpen={isEditOpen}
                setSheetOpen={setIsEditOpen}
            />
            {!isViewLoading ? (
                <main className="mx-4">
                    {/* Enhanced Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex-1">
                                <Breadcrumb className="mb-4">
                                    <BreadcrumbList>
                                        <BreadcrumbItem>
                                            <BreadcrumbLink
                                                className="text-sm text-gray-600 hover:text-gray-900"
                                                href={`/private/projects/${projectId}/tasks`}
                                            >
                                                Tasks
                                            </BreadcrumbLink>
                                        </BreadcrumbItem>
                                        <BreadcrumbSeparator>
                                            <ChevronRight className="h-4 w-4" />
                                        </BreadcrumbSeparator>
                                        <BreadcrumbItem>
                                            <BreadcrumbPage className="text-sm text-gray-900 font-medium">
                                                {taskData?.title && taskData.title.length > 50 ? `${taskData.title.substring(0, 50)}...` : taskData?.title}
                                            </BreadcrumbPage>
                                        </BreadcrumbItem>
                                    </BreadcrumbList>
                                </Breadcrumb>
                                
                                {/* Task Header with Gradient Background */}
                                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-6 border border-green-100">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100/50 to-emerald-100/50 rounded-full -translate-y-16 translate-x-16"></div>
                                    <div className="relative flex items-start gap-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <CheckSquare className="h-8 w-8 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Badge variant="outline" className="bg-white/80 border-green-200 text-green-700">
                                                    {taskData?.status}
                                                </Badge>
                                                {displayIcon(taskData?.priority as string)}
                                                <span className="text-sm font-medium text-gray-600">
                                                    {taskData?.priority}
                                                </span>
                                            </div>
                                            <h1 className="text-3xl font-bold text-gray-900 mb-3">
                                                {taskData?.title}
                                            </h1>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {displayDate(taskData)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="ml-4">
                                {userData?.role !== UserRoles.TESTER || taskData?.userId?._id === userData?._id ? (
                                    <Button size="sm" onClick={() => setIsEditOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
                                        <Edit className="h-4 w-4 mr-2" /> Edit Task
                                    </Button>
                                ) : taskData?.assignedTo?._id === userData?._id ? (
                                    <Button size="sm" onClick={() => setIsEditStatusOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
                                        <Edit className="h-4 w-4 mr-2" /> Edit Status
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
                        {/* Main Content */}
                        <div className="space-y-6">
                            {/* Description Card */}
                            <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                                        Description
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div
                                        className="text-sm leading-relaxed text-gray-700 rich-description prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{
                                            __html: taskData?.description || "",
                                        }}
                                    />
                                </CardContent>
                            </Card>

                            {/* Requirements Card */}
                            {taskData?.requirementIds && taskData.requirementIds.length > 0 && (
                                <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-blue-600" />
                                            Related Requirements
                                            <Badge variant="secondary" className="ml-2">
                                                {taskData?.requirementIds?.length}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {taskData.requirementIds.map((requirement, index) => (
                                                <Badge key={requirement?.id || index} className="bg-blue-100 text-blue-800 border-blue-200">
                                                    {requirement?.title}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Comments Section */}
                            <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Users className="h-5 w-5 text-purple-600" />
                                        Comments & Discussion
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <DefaultComments project={project as IProject} entityId={taskId as string} entityName={DBModels.TASK} />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Task Details Card */}
                            <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Target className="h-5 w-5 text-green-600" />
                                        Task Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <span className="text-sm font-medium text-gray-600">Status</span>
                                        <div className="text-sm">
                                            {taskStatusBadge(taskData?.status)}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <span className="text-sm font-medium text-gray-600">Priority</span>
                                        <div className="flex items-center gap-2 text-sm">
                                            {displayIcon(taskData?.priority as string)}
                                            <span className="font-medium">{taskData?.priority}</span>
                                        </div>
                                    </div>

                                    {taskData?.issueId && (
                                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                            <span className="text-sm font-medium text-gray-600">Related Issue</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {taskData?.issueId?.title}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <span className="text-sm font-medium text-gray-600">Assignee</span>
                                        <div className="flex items-center gap-2 text-sm">
                                            <UserCircle2Icon className="h-4 w-4 text-gray-500" />
                                            {taskData?.assignedTo?._id ? (
                                                <span className="font-medium">
                                                    {`${taskData?.assignedTo?.firstName || NAME_NOT_SPECIFIED_ERROR_MESSAGE} ${taskData?.assignedTo?.lastName || ""}`}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">Unassigned</span>
                                            )}
                                        </div>
                                    </div>

                                    {userData?.role !== UserRoles.CLIENT && (
                                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                            <span className="text-sm font-medium text-gray-600">Reporter</span>
                                            <div className="flex items-center gap-2 text-sm">
                                                <UserCircle2Icon className="h-4 w-4 text-gray-500" />
                                                <span className="font-medium">
                                                    {`${taskData?.userId?.firstName || ""} ${taskData?.userId?.lastName || ""}`}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Timeline Card */}
                            {(taskData?.startDate || taskData?.endDate) && (
                                <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-purple-600" />
                                            Timeline
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {taskData?.startDate && (
                                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                                <span className="text-sm font-medium text-gray-600">Start Date</span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {new Date(taskData.startDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                        {taskData?.endDate && (
                                            <div className="flex items-center justify-between py-2">
                                                <span className="text-sm font-medium text-gray-600">End Date</span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {new Date(taskData.endDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </main>
            ) : (
                <div className="mx-4">
                    <Skeleton className="h-12 w-[300px] bg-gray-200 mb-6" />
                    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
                        <div className="space-y-6">
                            <Skeleton className="h-64 bg-gray-200" />
                            <Skeleton className="h-32 bg-gray-200" />
                        </div>
                        <div className="space-y-6">
                            <Skeleton className="h-48 bg-gray-200" />
                            <Skeleton className="h-32 bg-gray-200" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewTask;
