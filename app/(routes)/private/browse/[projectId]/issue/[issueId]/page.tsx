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
import { 
  ChevronRight, 
  Edit, 
  UserCircle2Icon, 
  AlertTriangle, 
  Bug, 
  Calendar, 
  Clock, 
  User, 
  Users, 
  FileText, 
  Paperclip,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Target,
  MessageSquare
} from "lucide-react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/app/_constants/date-formatter";

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

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open': return <AlertCircle className="h-4 w-4" />;
      case 'in progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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

  const canEdit = checkProjectRole ? 
    (project?.isActive) : 
    ((project?.isActive && issueData?.userId?._id?.toString() === userData?._id?.toString()) || 
     (userData?.role !== UserRoles.TESTER && userData?.role !== UserRoles.CROWD_TESTER));

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {issueData && (
        <EditIssue
          issue={issueData as IIssue}
          sheetOpen={isEditStatusOpen}
          setSheetOpen={setIsEditStatusOpen}
          refreshIssues={refreshIssues}
        />
      )}

      {!isViewLoading ? (
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/private/projects/${projectId}/issues`}>
                      Issues
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-3 w-3" />
                  </BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-medium">
                      {issueData?.customId}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                {canEdit && (
                  <Button 
                    onClick={() => setIsEditStatusOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Issue
                  </Button>
                )}
              </div>
            </div>

            {/* Issue Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Bug className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {issueData?.customId}
                    </h1>
                    <p className="text-gray-600 text-sm">
                      Issue Details & Information
                    </p>
                  </div>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {issueData?.title}
                </h2>

                {/* Key Badges */}
                <div className="flex flex-wrap items-center gap-3">
                  {issueData?.severity && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Severity:</span>
                      <Badge className={`flex items-center gap-1 ${getSeverityColor(issueData.severity)}`}>
                        <AlertTriangle className="h-3 w-3" />
                        {issueData.severity}
                      </Badge>
                    </div>
                  )}
                  
                  {issueData?.priority && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Priority:</span>
                      <Badge className={`flex items-center gap-1 ${getPriorityColor(issueData.priority)}`}>
                        <Zap className="h-3 w-3" />
                        {issueData.priority}
                      </Badge>
                    </div>
                  )}

                  {issueData?.status && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Status:</span>
                      <Badge className={`flex items-center gap-1 ${getStatusColor(issueData.status)}`}>
                        {getStatusIcon(issueData.status)}
                        {issueData.status}
                      </Badge>
                    </div>
                  )}

                  {issueData?.issueType && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Type:</span>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {issueData.issueType}
                      </Badge>
                    </div>
                  )}

                  {issueData?.createdAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Created {formatDate(issueData.createdAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="xl:col-span-2 space-y-6">
                {/* Description */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Description
                    </CardTitle>
                    <CardDescription>
                      Detailed description of the issue
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="text-sm leading-relaxed text-gray-700 space-y-2 rich-description prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: issueData?.description || "No description provided.",
                      }}
                    />
                  </CardContent>
                </Card>

                {/* Attachments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Paperclip className="h-5 w-5 text-gray-600" />
                      Attachments
                      {issueAttachments?.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {issueAttachments.length}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Files, screenshots, and supporting documents
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!isAttachmentLoading ? (
                      <MediaRenderer
                        attachments={issueAttachments || []}
                        title=""
                        refreshAttachments={refreshAttachments}
                        userData={userData}
                        issueData={issueData as IIssue}
                      />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Skeleton className="h-[120px] w-full" />
                        <Skeleton className="h-[120px] w-full" />
                        <Skeleton className="h-[120px] w-full" />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Comments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-purple-600" />
                      Comments & Discussion
                    </CardTitle>
                    <CardDescription>
                      Team discussion and updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DefaultComments 
                      project={project as IProject} 
                      entityId={issueId} 
                      entityName={DBModels.ISSUE} 
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Issue Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bug className="h-5 w-5 text-red-600" />
                      Issue Details
                    </CardTitle>
                    <CardDescription>
                      Key information about this issue
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Assignee */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Assignee</span>
                      <div className="flex items-center gap-2">
                        {issueData?.assignedTo?._id ? (
                          <>
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={issueData.assignedTo?.profilePicture?.data || ""} />
                              <AvatarFallback className="text-xs">
                                {getInitials(issueData.assignedTo?.firstName, issueData.assignedTo?.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-900">
                              {`${issueData.assignedTo?.firstName || NAME_NOT_SPECIFIED_ERROR_MESSAGE} ${issueData.assignedTo?.lastName || ""}`.trim()}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500">Unassigned</span>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Reporter */}
                    {userData?.role !== UserRoles.CLIENT && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Reporter</span>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={issueData?.userId?.profilePicture?.data || ""} />
                              <AvatarFallback className="text-xs">
                                {getInitials(issueData?.userId?.firstName, issueData?.userId?.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-900">
                              {`${issueData?.userId?.firstName || ""} ${issueData?.userId?.lastName || ""}`.trim()}
                            </span>
                          </div>
                        </div>
                        <Separator />
                      </>
                    )}

                    {/* Test Cycle */}
                    {issueData?.testCycle && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Test Cycle</span>
                          <Badge variant="outline" className="text-xs">
                            {issueData.testCycle.title}
                          </Badge>
                        </div>
                        <Separator />
                      </>
                    )}

                    {/* Timestamps */}
                    <div className="space-y-3">
                      {issueData?.createdAt && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Created</span>
                          <span className="text-sm text-gray-900">
                            {formatDate(issueData.createdAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Devices */}
                {issueData?.device && issueData.device.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-600" />
                        Affected Devices
                      </CardTitle>
                      <CardDescription>
                        Devices where this issue was reported
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ViewDevice devices={issueData.device as IDevice[]} />
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Loading State */
        <div className="w-full min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {/* Header Skeleton */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <Skeleton className="h-6 w-64 mb-4" />
              <Skeleton className="h-8 w-96 mb-2" />
              <Skeleton className="h-6 w-128" />
            </div>
            
            {/* Content Skeleton */}
            <div className="p-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-96 w-full" />
                </div>
                <div className="space-y-6">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewIssue;
