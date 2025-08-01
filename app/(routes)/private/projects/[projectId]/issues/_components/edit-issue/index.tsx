import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Bug, AlertTriangle, FileText, Users, Smartphone, Calendar, Save, Settings } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import toasterService from "@/app/_services/toaster-service";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IIssue } from "@/app/_interface/issue";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PRIORITY_LIST,
  SEVERITY_LIST,
  ISSUE_STATUS_LIST,
  ISSUE_TESTER_STATUS_LIST,
  ISSUE_TYPE_LIST,
  IssueStatus,
  PROJECT_ADMIN_ISSUE_STATUS_LIST,
} from "@/app/_constants/issue";
import {
  updateIssueService,
} from "@/app/_services/issue.service";
import IssueAttachments from "../attachments/issue-attachment";
import { displayIcon } from "@/app/_utils/common-functionality";
import TextEditor from "@/app/(routes)/private/projects/_components/text-editor";
import { addIssueAttachmentsService } from "@/app/_services/issue-attachment.service";
import {
  getDevicesWithoutPaginationByIdsService,
} from "@/app/_services/device.service";
import { IDevice } from "@/app/_interface/device";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";
import { ITestCycle } from "@/app/_interface/test-cycle";
import {
  getSingleCycleService,
  getTestCycleWithoutPaginationService,
} from "@/app/_services/test-cycle.service";
import { IProject, IProjectUserDisplay } from "@/app/_interface/project";
import {
  getProjectService,
  getProjectUsersListService,
  getProjectUsersService,
} from "@/app/_services/project.service";
import { checkProjectAdmin, getUsernameWithUserId } from "@/app/_utils/common";
import { useParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { ProjectUserRoles } from "@/app/_constants/project-user-roles";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const issueSchema = z.object({
  title: z.string().min(1, "Required"),
  severity: z.string().min(1, "Required"),
  priority: z.string().min(1, "Required"),
  description: z
    .string()
    .min(10, "The description must be at least 10 characters long.")
    .nonempty("Required."),
  status: z.string().optional(),
  projectId: z.string().optional(),
  device: z.array(z.string()),
  issueType: z.string().min(1, "Required"),
  testCycle: z.string().min(1, "Required"),
  assignedTo: z.string().optional(),
});

const EditIssue = ({
  issue,
  sheetOpen,
  setSheetOpen,
  refreshIssues,
}: {
  issue: IIssue;
  sheetOpen: boolean;
  setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
  refreshIssues: () => void;
}) => {
  const issueId = issue?.id as string;
  const { device } = issue;
  const { projectId } = useParams<{ projectId: string }>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<any>();
  const [devices, setDevices] = useState<IDevice[]>([]);
  const [userData, setUserData] = useState<any>();
  const { data } = useSession();
  const deviceName = device?.map((d) => d._id) || [];
  const [testCycles, setTestCycles] = useState<ITestCycle[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [testCycle, setTestCycle] = useState<ITestCycle | null>(null);
  const [project, setProject] = useState<IProject>();
  const checkProjectRole = checkProjectAdmin(project as IProject, userData);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [isInvalidDevices, setIsInvalidDevices] = useState<boolean>(false);
  const [users, setUsers] = useState<IProjectUserDisplay[]>([]);
  const [userProjectRole, setUserProjectRole] =
    useState<ProjectUserRoles | null>(null);

  useEffect(() => {
    if (data) {
      const { user } = data;
      setUserData(user);

      // Prevent crowd testers from editing issues
      if ((user as any)?.role === UserRoles.CROWD_TESTER) {
        setSheetOpen(false);
        return;
      }
    }
  }, [data, setSheetOpen]);

  useEffect(() => {
    if (data && users?.length) {
      const { user } = data;
      const userObj: any = { ...user };
      if (userObj.role === UserRoles.ADMIN) {
        setUserProjectRole(ProjectUserRoles.ADMIN);
      } else if (userObj.role === UserRoles.CLIENT) {
        setUserProjectRole(ProjectUserRoles.CLIENT);
      } else {
        setUserProjectRole(
          (users.find((userEl) => userEl.userId?._id === userObj._id)
            ?.role as ProjectUserRoles) || ProjectUserRoles.TESTER
        );
      }
    }
  }, [data, users]);

  useEffect(() => {
    const initialSelectedDevices = device?.map((deviceItem: any) =>
      deviceItem._id ? deviceItem._id : deviceItem?.name
    );

    setSelectedDevices(initialSelectedDevices);
  }, [device]);

  const form = useForm<z.infer<typeof issueSchema>>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      title: "",
      severity: "",
      priority: "",
      description: "",
      status: "",
      projectId: "",
      device: [],
      issueType: "",
      testCycle: "",
      assignedTo: "",
    },
  });

  const hasReset = useRef(false);

  useEffect(() => {
    if (issue && !hasReset.current) {
      form.reset({
        title: issue.title || "",
        severity: issue.severity || "",
        priority: issue.priority || "",
        description: issue.description || "",
        status: issue.status || "",
        projectId: projectId || "",
        device: deviceName,
        issueType: issue.issueType || "",
        testCycle: (issue.testCycle?._id as string) || "",
        assignedTo: (issue.assignedTo?._id as string) || "",
      });
      hasReset.current = true;
    }
  }, [issue, deviceName, form]);

  async function onSubmit(values: z.infer<typeof issueSchema>) {
    setIsLoading(true);
    try {
      const response = await updateIssueService(projectId as string, issueId, {
        ...values,
        device: selectedDevices,
      });
      if (response) {
        await uploadAttachment();
        refreshIssues();
        resetForm();
        toasterService.success(response?.message);
      }
    } catch (error) {
      toasterService.error();
    } finally {
      setSheetOpen(false);
      setIsLoading(false);
    }
  }

  const uploadAttachment = async () => {
    setIsLoading(true);
    try {
      await addIssueAttachmentsService(projectId as string, issueId, {
        attachments,
      });
    } catch (error) {
      toasterService.error();
    } finally {
      setIsLoading(false);
    }
  };

  const validateIssue = async () => {
    if (!selectedDevices.length) {
      setIsInvalidDevices(true);
    } else {
      form.handleSubmit(onSubmit)();
    }
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    validateIssue();
  };

  const getDevices = async () => {
    const devices = await getDevicesWithoutPaginationByIdsService({
      ids: device?.map((d) => d._id) as string[],
    });
    setDevices(devices);
  };

  const getTestCycle = async () => {
    setLoading(true);
    try {
      const response = await getTestCycleWithoutPaginationService(projectId);
      if (response) {
        setTestCycles(response);
      }
    } catch (error) {
      toasterService.error();
    } finally {
      setLoading(false);
    }
  };

  const getProject = async () => {
    setLoading(true);
    try {
      const response = await getProjectService(projectId);
      if (response) {
        setProject(response);
      }
    } catch (error) {
      toasterService.error();
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    form.reset();
    setIsInvalidDevices(false);
    setSelectedDevices([]);
  };

  const getProjectUsers = async () => {
    setLoading(true);
    try {
      const projectUsers = await getProjectUsersListService(projectId);
      if (projectUsers?.data?.users?.length) {
        setUsers(projectUsers.data.users);
      }
    } catch (error) {
      toasterService.error();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sheetOpen) {
      getDevices();
      getTestCycle();
      getProject();
      getProjectUsers();
    }
  }, [sheetOpen]);

  const handleSheetClose = () => {
    setSheetOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleSheetClose();
    }
  };

  const getSingleTestCycle = async () => {
    setLoading(true);
    try {
      const response = await getSingleCycleService(projectId, issue.testCycle?._id as string);
      if (response) {
        setTestCycle(response);
      }
    } catch (error) {
      toasterService.error();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (issue?.testCycle?._id) {
      getSingleTestCycle();
    }
  }, [issue]);

  const getSelectedUser = (field: any) => {
    const selectedUser = users?.find(
      (user) => user?.userId?._id === field.value
    );
    return getUsernameWithUserId(selectedUser);
  };

  useEffect(() => {
    if (selectedDevices.length) {
      setIsInvalidDevices(false);
    }
  }, [selectedDevices]);

  return (
    <Dialog open={sheetOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-6">
          {/* Enhanced Header with Gradient Background */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-50 to-red-50 p-6 border border-orange-100">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100/50 to-red-100/50 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="relative flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200 font-mono">
                    #{issue?.customId}
                  </Badge>
                  <Badge variant="outline" className="bg-white/80 border-orange-200 text-orange-700">
                    Edit Mode
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  Edit Issue
                </h1>
                <p className="text-gray-600">
                  Update issue information and assignment details
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} method="post" className="space-y-6">
              {/* Basic Information Card */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Basic Information
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Update essential details about the issue
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Issue Title *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter a descriptive title for the issue"
                            className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="severity"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-sm font-medium text-gray-700">Severity *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                              <SelectValue placeholder="Select severity" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {SEVERITY_LIST.map((severity) => (
                                  <SelectItem key={severity} value={severity}>
                                    {severity}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-sm font-medium text-gray-700">Priority *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {PRIORITY_LIST.map((priority) => (
                                  <SelectItem key={priority} value={priority}>
                                    <div className="flex items-center">
                                      <span className="mr-2">
                                        {displayIcon(priority)}
                                      </span>
                                      {priority}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-sm font-medium text-gray-700">Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {ISSUE_STATUS_LIST.map((status) => (
                                  <SelectItem value={status} key={status}>
                                    {status}
                                  </SelectItem>
                                ))}

                                {/* Show Status Role Wise */}
                                {/* {checkProjectRole
                                  ? PROJECT_ADMIN_ISSUE_STATUS_LIST.map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {status}
                                    </SelectItem>
                                  ))
                                  : ISSUE_STATUS_LIST.map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {status}
                                    </SelectItem>
                                  ))} */}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="issueType"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-sm font-medium text-gray-700">Issue Type *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                              <SelectValue placeholder="Select issue type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {ISSUE_TYPE_LIST.map((issueType) => (
                                  <SelectItem key={issueType} value={issueType}>
                                    <div className="flex items-center">
                                      {issueType}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Testing Context Card */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-purple-600" />
                    Testing Context
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Update devices and test cycle information
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className={`text-sm font-medium ${isInvalidDevices ? "text-red-600" : "text-gray-700"}`}>
                      Devices *
                    </Label>
                    <MultiSelect
                      options={devices?.map((device) => ({
                        label:
                          typeof device?.name === "string"
                            ? `${device?.name} / ${device?.os} / ${device?.version}`
                            : "",
                        value: typeof device?.id === "string" ? device.id : "",
                      }))}
                      onValueChange={setSelectedDevices}
                      defaultValue={selectedDevices}
                      placeholder="Select devices where issue was found"
                      disabled={devices?.length === 0}
                      variant="secondary"
                      animation={2}
                      maxCount={3}
                      className="w-full"
                    />
                    {isInvalidDevices ? (
                      <FormMessage className="mt-2">
                        Please select at least one device
                      </FormMessage>
                    ) : null}
                  </div>

                  <FormField
                    control={form.control}
                    name="testCycle"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-sm font-medium text-gray-700">Test Cycle *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                            <SelectValue placeholder="Select test cycle" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {testCycles.length > 0 ? (
                                testCycles.map((testCycle) => (
                                  <SelectItem
                                    key={testCycle._id}
                                    value={testCycle._id as string}
                                  >
                                    {testCycle.title}
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="p-1 text-center text-gray-500">
                                  Test cycle not found
                                </div>
                              )}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Assignment Card */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600" />
                    Assignment
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Update issue assignment and responsibility
                  </p>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="assignedTo"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-sm font-medium text-gray-700">Assignee</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                            <SelectValue>{getSelectedUser(field)}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {users.length > 0 ? (
                                users.map((user) => (
                                  <SelectItem
                                    key={user._id}
                                    value={user?.userId?._id as string}
                                  >
                                    {getUsernameWithUserId(user)}
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="p-1 text-center text-gray-500">
                                  Users not found
                                </div>
                              )}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Description Card */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Description *
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Update detailed information about the issue
                  </p>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <TextEditor
                            markup={field.value || ""}
                            onChange={(value) => {
                              form.setValue("description", value);
                              form.trigger("description");
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Attachments Card */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Attachments
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Manage issue attachments and supporting files
                  </p>
                </CardHeader>
                <CardContent>
                  <IssueAttachments
                    issueId={issueId}
                    isUpdate={true}
                    isView={false}
                    setAttachmentsData={setAttachments}
                  />
                </CardContent>
              </Card>

              <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6">
                <Button
                  disabled={isLoading}
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setSheetOpen(false)}
                  className="w-full sm:w-auto border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  disabled={isLoading}
                  type="submit"
                  size="lg"
                  onClick={() => validateIssue()}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? "Updating..." : "Update Issue"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditIssue;
