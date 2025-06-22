"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getRequirementService } from "@/app/_services/requirement.service";
import { IRequirement } from "@/app/_interface/requirement";
import toasterService from "@/app/_services/toaster-service";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Calendar, Clock, User, Paperclip, MessageCircle, Edit2, Check, XIcon, CalendarIcon, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RequirementTabs } from "@/app/_constants/project";
import { formatDistanceToNow } from "date-fns";
import DefaultComments from "../../comments";
import { DBModels } from "@/app/_constants";
import RequirementAttachments from "../_components/attachments/requirement-attachment";
import { UserCircle2Icon } from "lucide-react";
import { NAME_NOT_SPECIFIED_ERROR_MESSAGE } from "@/app/_constants/errors";
import { UserRoles } from "@/app/_constants/user-roles";
import { useSession } from "next-auth/react";
import { taskStatusBadge } from "@/app/_utils/common-functionality";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { updateRequirementService } from "@/app/_services/requirement.service";
import { getProjectUsersListService } from "@/app/_services/project.service";
import { IProjectUserDisplay } from "@/app/_interface/project";
import { TASK_STATUS_LIST } from "@/app/_constants/issue";
import { getUsernameWithUserId } from "@/app/_utils/common";
import { checkProjectActiveRole } from "@/app/_utils/common-functionality";
import AIRefinement from "@/app/_components/ai-refinement";
import TextEditor from "@/app/(routes)/private/projects/_components/text-editor";

// Helper function for date formatting
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

export default function RequirementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data } = useSession();
  
  const projectId = params.projectId as string;
  const requirementId = params.requirementId as string;
  
  const [requirement, setRequirement] = useState<IRequirement | null>(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>();
  const [users, setUsers] = useState<IProjectUserDisplay[]>([]);
  
  // Individual field editing states
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState({
    title: "",
    description: "",
    assignedTo: "",
    status: "",
    startDate: null as Date | null,
    endDate: null as Date | null,
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const canEdit = userData?.role !== UserRoles.TESTER && 
    checkProjectActiveRole(requirement?.projectId?.isActive ?? false, userData);

  const fetchRequirement = async () => {
    try {
      setLoading(true);
      const response = await getRequirementService(projectId, requirementId);
      if (response?.data) {
        setRequirement(response.data);
        setFieldValues({
          title: response.data?.title || "",
          description: response.data?.description || "",
          assignedTo: response.data?.assignedTo?._id || "",
          status: response.data?.status || "",
          startDate: response.data?.startDate ? new Date(response.data.startDate) : null,
          endDate: response.data?.endDate ? new Date(response.data.endDate) : null,
        });
      }
    } catch (error) {
      toasterService.error("Failed to load requirement");
      router.push(`/private/projects/${projectId}/requirements`);
    } finally {
      setLoading(false);
    }
  };

  const getProjectUsers = async () => {
    try {
      const projectUsers = await getProjectUsersListService(projectId);
      if (projectUsers?.data?.users?.length) {
        setUsers(projectUsers.data.users);
      }
    } catch (error) {
      toasterService.error();
    }
  };

  const getSelectedUser = (userId: string) => {
    const selectedUser = users?.find(
      (user) => user?.userId?._id === userId
    );
    return getUsernameWithUserId(selectedUser);
  };

  const startEditing = (field: string) => {
    if (!canEdit) return;
    setEditingField(field);
  };

  const cancelEditing = () => {
    setEditingField(null);
    // Reset field values to current requirement values
    setFieldValues({
      title: requirement?.title || "",
      description: requirement?.description || "",
      assignedTo: requirement?.assignedTo?._id || "",
      status: requirement?.status || "",
      startDate: requirement?.startDate ? new Date(requirement.startDate) : null,
      endDate: requirement?.endDate ? new Date(requirement.endDate) : null,
    });
  };

  const saveField = async (field: string, value: any) => {
    setIsUpdating(true);
    try {
      // Create the updated field values with the new value
      const updatedFieldValues = {
        ...fieldValues,
        [field]: value,
      };

      const updateData = {
        ...updatedFieldValues,
        assignedTo: field === 'assignedTo' ? (value === "unassigned" ? undefined : (value || undefined)) : updatedFieldValues.assignedTo === "unassigned" ? undefined : (updatedFieldValues.assignedTo || undefined),
        startDate: field === 'startDate' ? (value ? value.toISOString() : null) : (updatedFieldValues.startDate ? updatedFieldValues.startDate.toISOString() : null),
        endDate: field === 'endDate' ? (value ? value.toISOString() : null) : (updatedFieldValues.endDate ? updatedFieldValues.endDate.toISOString() : null),
        projectId: projectId,
      };

      const response = await updateRequirementService(projectId, requirementId, updateData);
      
      if (response) {
        toasterService.success("Requirement updated successfully");
        setEditingField(null);
        
        // Update requirement with the response data
        const updatedRequirement = response.data || response;
        const newRequirement = {
          ...updatedRequirement,
          id: updatedRequirement.id || updatedRequirement._id || requirementId,
          _id: updatedRequirement._id || updatedRequirement.id || requirementId,
          userId: requirement?.userId,
          projectId: requirement?.projectId,
          customId: requirement?.customId,
          createdAt: requirement?.createdAt,
          updatedAt: updatedRequirement.updatedAt || new Date().toISOString(),
        };
        setRequirement(newRequirement);
        
        // Update field values
        setFieldValues({
          title: newRequirement?.title || "",
          description: newRequirement?.description || "",
          assignedTo: newRequirement?.assignedTo?._id || "",
          status: newRequirement?.status || "",
          startDate: newRequirement?.startDate ? new Date(newRequirement.startDate) : null,
          endDate: newRequirement?.endDate ? new Date(newRequirement.endDate) : null,
        });
      }
    } catch (error) {
      toasterService.error("Failed to update requirement");
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (data) {
      const { user } = data;
      setUserData(user);
    }
  }, [data]);

  useEffect(() => {
    fetchRequirement();
    getProjectUsers();
  }, [projectId, requirementId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg font-medium">Loading requirement...</p>
          <p className="text-gray-400 text-sm mt-1">Please wait while we fetch the details</p>
        </div>
      </div>
    );
  }

  if (!requirement) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-red-400" />
          </div>
          <p className="text-gray-500 text-lg font-medium">Requirement not found</p>
          <p className="text-gray-400 text-sm mt-1">The requirement you're looking for doesn't exist</p>
          <Button 
            onClick={() => router.push(`/private/projects/${projectId}/requirements`)}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Requirements
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push(`/private/projects/${projectId}/requirements`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Requirements
        </Button>
      </div>

      <div className="space-y-6">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 font-mono">
                  #{requirement?.customId}
                </Badge>
                
                {/* Inline Status Editing */}
                {editingField === 'status' ? (
                  <div className="flex items-center gap-2">
                    <Select 
                      value={fieldValues.status} 
                      onValueChange={(value) => {
                        setFieldValues(prev => ({ ...prev, status: value }));
                        saveField('status', value);
                      }}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TASK_STATUS_LIST.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={cancelEditing}
                      disabled={isUpdating}
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className={cn(
                      "flex items-center gap-2 cursor-pointer rounded px-2 py-1 hover:bg-gray-100",
                      canEdit ? "hover:bg-gray-100" : ""
                    )}
                    onClick={() => startEditing('status')}
                  >
                    {taskStatusBadge(requirement?.status)}
                    {canEdit && <Edit2 className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100" />}
                  </div>
                )}
              </div>
              
              {/* Inline Title Editing */}
              {editingField === 'title' ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={fieldValues.title}
                    onChange={(e) => setFieldValues(prev => ({ ...prev, title: e.target.value }))}
                    className="text-2xl font-bold border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        saveField('title', fieldValues.title);
                      } else if (e.key === 'Escape') {
                        cancelEditing();
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => saveField('title', fieldValues.title)}
                    disabled={isUpdating}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={cancelEditing}
                    disabled={isUpdating}
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <h1 
                  className={cn(
                    "text-2xl font-bold text-gray-900 leading-tight cursor-pointer rounded px-2 py-1 -ml-2",
                    canEdit ? "hover:bg-gray-100" : ""
                  )}
                  onClick={() => startEditing('title')}
                >
                  {requirement?.title}
                  {canEdit && <Edit2 className="inline h-4 w-4 text-gray-400 ml-2 opacity-0 hover:opacity-100" />}
                </h1>
              )}
            </div>
          </div>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
            {requirement?.userId?.firstName && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {`${requirement?.userId?.firstName?.[0] || ''}${requirement?.userId?.lastName?.[0] || ''}`}
                </div>
                <span>
                  Created by <span className="font-medium">{requirement?.userId?.firstName} {requirement?.userId?.lastName}</span>
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                Updated {requirement.updatedAt && formatDistanceToNow(new Date(requirement.updatedAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Assignment and Timeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Assignment Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                Assignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editingField === 'assignedTo' ? (
                <div className="flex items-center gap-2">
                  <Select 
                    value={fieldValues.assignedTo || "unassigned"} 
                    onValueChange={(value) => {
                      setFieldValues(prev => ({ ...prev, assignedTo: value }));
                      saveField('assignedTo', value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.userId?._id} value={user.userId?._id || ""}>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                              {userData?.role === UserRoles.ADMIN ? 
                                `${user.userId?.firstName?.[0] || ''}${user.userId?.lastName?.[0] || ''}` : 
                                user.userId?.customId?.[0] || ''
                              }
                            </div>
                            <span>
                              {userData?.role === UserRoles.ADMIN ? 
                                `${user.userId?.firstName || ''} ${user.userId?.lastName || ''}` : 
                                user.userId?.customId || ''
                              }
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={cancelEditing}
                    disabled={isUpdating}
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div 
                  className={cn(
                    "flex items-center gap-3 rounded px-2 py-1 -ml-2",
                    canEdit ? "cursor-pointer hover:bg-gray-100" : ""
                  )}
                  onClick={() => startEditing('assignedTo')}
                >
                  {requirement?.assignedTo?._id ? (
                    <>
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {userData?.role === UserRoles.ADMIN ? 
                          `${requirement?.assignedTo?.firstName?.[0] || ''}${requirement?.assignedTo?.lastName?.[0] || ''}` : 
                          requirement?.assignedTo?.customId?.[0]
                        }
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {userData?.role === UserRoles.ADMIN ? (
                            `${requirement?.assignedTo?.firstName || NAME_NOT_SPECIFIED_ERROR_MESSAGE} ${requirement?.assignedTo?.lastName || ""}`
                          ) : (
                            requirement?.assignedTo?.customId
                          )}
                        </p>
                        {userData?.role === UserRoles.ADMIN && requirement?.assignedTo?.email && (
                          <p className="text-sm text-gray-500">{requirement?.assignedTo?.email}</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-3 text-gray-400">
                      <div className="w-10 h-10 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                        <UserCircle2Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Unassigned</p>
                        <p className="text-xs">No one assigned yet</p>
                      </div>
                    </div>
                  )}
                  {canEdit && <Edit2 className="h-4 w-4 text-gray-400 opacity-0 hover:opacity-100" />}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Start Date */}
                {editingField === 'startDate' ? (
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !fieldValues.startDate && "text-muted-foreground"
                          )}
                        >
                          {fieldValues.startDate ? (
                            formatDate(fieldValues.startDate)
                          ) : (
                            <span>Pick a start date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={fieldValues.startDate || undefined}
                          onSelect={(date) => {
                            setFieldValues(prev => ({ ...prev, startDate: date || null }));
                            saveField('startDate', date || null);
                          }}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={cancelEditing}
                      disabled={isUpdating}
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className={cn(
                      "rounded px-2 py-1 -ml-2",
                      canEdit ? "cursor-pointer hover:bg-gray-100" : ""
                    )}
                    onClick={() => startEditing('startDate')}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Start Date:</span>
                      {canEdit && <Edit2 className="h-3 w-3 text-gray-400 opacity-0 hover:opacity-100" />}
                    </div>
                    <span className="text-sm text-gray-600">
                      {requirement?.startDate ? formatDate(new Date(requirement.startDate)) : 'Not set'}
                    </span>
                  </div>
                )}
                
                {/* End Date */}
                {editingField === 'endDate' ? (
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !fieldValues.endDate && "text-muted-foreground"
                          )}
                        >
                          {fieldValues.endDate ? (
                            formatDate(fieldValues.endDate)
                          ) : (
                            <span>Pick an end date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={fieldValues.endDate || undefined}
                          onSelect={(date) => {
                            setFieldValues(prev => ({ ...prev, endDate: date || null }));
                            saveField('endDate', date || null);
                          }}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={cancelEditing}
                      disabled={isUpdating}
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className={cn(
                      "rounded px-2 py-1 -ml-2",
                      canEdit ? "cursor-pointer hover:bg-gray-100" : ""
                    )}
                    onClick={() => startEditing('endDate')}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">End Date:</span>
                      {canEdit && <Edit2 className="h-3 w-3 text-gray-400 opacity-0 hover:opacity-100" />}
                    </div>
                    <span className="text-sm text-gray-600">
                      {requirement?.endDate ? formatDate(new Date(requirement.endDate)) : 'Not set'}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue={RequirementTabs.DESCRIPTION} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger
              value={RequirementTabs.DESCRIPTION}
              className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <FileText className="h-4 w-4" />
              Description
            </TabsTrigger>
            <TabsTrigger
              value={RequirementTabs.ATTACHMENTS}
              className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <Paperclip className="h-4 w-4" />
              Attachments
            </TabsTrigger>
          </TabsList>

          <TabsContent value={RequirementTabs.DESCRIPTION} className="space-y-6">
            {/* Description Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Description
                  </CardTitle>
                  {editingField === 'description' && (
                    <div className="flex items-center gap-2">
                      <AIRefinement
                        currentDescription={fieldValues.description || ""}
                        onApplyRefinement={(refinedDescription) => {
                          setFieldValues(prev => ({ ...prev, description: refinedDescription }));
                        }}
                        context={`Project: ${requirement?.projectId?.title || "Unknown"}, Requirement: ${requirement?.title || "Untitled"}`}
                      />
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => saveField('description', fieldValues.description)}
                        disabled={isUpdating}
                      >
                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={cancelEditing}
                        disabled={isUpdating}
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {editingField === 'description' ? (
                  <TextEditor
                    markup={fieldValues.description}
                    onChange={(value) => setFieldValues(prev => ({ ...prev, description: value }))}
                    placeholder="Enter requirement description..."
                  />
                ) : (
                  <div
                    className={cn(
                      "prose prose-sm max-w-none text-gray-700 leading-relaxed rounded px-2 py-1 -ml-2 min-h-[100px]",
                      canEdit ? "cursor-pointer hover:bg-gray-100" : ""
                    )}
                    onClick={() => startEditing('description')}
                    dangerouslySetInnerHTML={{
                      __html: requirement?.description || "Click to add description...",
                    }}
                  />
                )}
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  Comments & Discussion
                </CardTitle>
                <CardDescription>
                  Collaborate and discuss this requirement with your team
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border-t">
                  <DefaultComments 
                    project={requirement?.projectId} 
                    entityId={requirement?.id} 
                    entityName={DBModels.REQUIREMENT} 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value={RequirementTabs.ATTACHMENTS} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Paperclip className="h-5 w-5 text-orange-600" />
                  Attachments
                </CardTitle>
                <CardDescription>
                  Files and documents related to this requirement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RequirementAttachments
                  requirementId={requirementId}
                  isUpdate={true}
                  isView={true}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 