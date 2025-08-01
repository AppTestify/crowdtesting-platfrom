"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash, Bug, AlertTriangle, FileText, Users, Smartphone, Calendar, Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
  DialogTrigger,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { addIssueService } from "@/app/_services/issue.service";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ISSUE_TYPE_LIST,
  IssueStatus,
  ISSUE_STATUS_LIST,
  PRIORITY_LIST,
  SEVERITY_LIST,
} from "@/app/_constants/issue";
import { useParams } from "next/navigation";
import { displayIcon } from "@/app/_utils/common-functionality";
import TextEditor from "@/app/(routes)/private/projects/_components/text-editor";
import { Label } from "@/components/ui/label";
import { ColumnDef } from "@tanstack/react-table";
import { IIssueAttachmentDisplay } from "@/app/_interface/issue";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { DocumentName } from "@/app/_components/document-name";
import { getDevicesWithoutPaginationService } from "@/app/_services/device.service";
import { IDevice } from "@/app/_interface/device";
import { getTestCycleWithoutPaginationService } from "@/app/_services/test-cycle.service";
import { ITestCycle } from "@/app/_interface/test-cycle";
import { MultiSelect } from "@/components/ui/multi-select";
import { IProjectUserDisplay } from "@/app/_interface/project";
import { getProjectUsersListService, getProjectUsersService } from "@/app/_services/project.service";
import { getUsernameWithUserId } from "@/app/_utils/common";
import { ProjectUserRoles } from "@/app/_constants/project-user-roles";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const projectSchema = z.object({
  title: z.string().min(1, "Required"),
  severity: z.string().min(1, "Required"),
  priority: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  status: z.string().optional(),
  projectId: z.string().optional(),
  issueType: z.string().min(1, "Required"),
  attachments: z.array(z.instanceof(File)).optional(),
  device: z.array(z.string()),
  testCycle: z.string().min(1, "Required"),
  assignedTo: z.string().optional(),
});

export function AddIssue({ refreshIssues }: { refreshIssues: () => void }) {
  const columns: ColumnDef<IIssueAttachmentDisplay[]>[] = [
    {
      accessorKey: "name",
      cell: ({ row }) => (
        <div>
          <DocumentName document={row.getValue("name")} />
        </div>
      ),
    },
  ];

  const { data } = useSession();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [issueId, setIssueId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { projectId } = useParams<{ projectId: string }>();
  const [attachments, setAttachments] = useState<File[]>([]);
  const [devices, setDevices] = useState<IDevice[]>([]);
  const [isViewLoading, setIsViewLoading] = useState<boolean>(false);
  const [testCycles, setTestCycles] = useState<ITestCycle[]>([]);
  const [users, setUsers] = useState<IProjectUserDisplay[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [isInvalidDevices, setIsInvalidDevices] = useState<boolean>(false);
  const [userProjectRole, setUserProjectRole] =
    useState<ProjectUserRoles | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

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

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      severity: "",
      priority: "",
      description: "",
      status: IssueStatus.NEW,
      projectId: projectId,
      issueType: "",
      attachments: [],
      device: [],
      testCycle: "",
      assignedTo: "",
    },
  });

  useEffect(() => {
    if (dialogOpen) {
      setIssueId("");
    }
  }, [dialogOpen]);

  async function onSubmit(values: z.infer<typeof projectSchema>) {
    setIsLoading(true);
    try {
      const response = await addIssueService(projectId, {
        ...values,
        device: selectedDevices,
      });
      if (response) {
        setIssueId(response.id);
        refreshIssues();
        toasterService.success(response.message);
      }
    } catch (error) {
      toasterService.error();
    } finally {
      setIsLoading(false);
      setDialogOpen(false);
    }
  }

  const validateIssue = () => {
    if (!selectedDevices.length) {
      setIsInvalidDevices(true);
    } else {
      form.handleSubmit(onSubmit)();
    }
  };

  const resetForm = () => {
    form.reset();
    setIsInvalidDevices(false);
    setSelectedDevices([]);
  };

  useEffect(() => {
    if (selectedDevices.length) {
      setIsInvalidDevices(false);
    }
  }, [selectedDevices]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      setAttachments((prevAttachments = []) => {
        const uniqueAttachments = newFiles.filter(
          (file) =>
            !prevAttachments.some(
              (prevFile) => prevFile.name === file.name && prevFile.size === file.size
            )
        );

        const updatedAttachments = [...prevAttachments, ...uniqueAttachments];
        form.setValue("attachments", updatedAttachments);

        return updatedAttachments;
      });

    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachments((prevAttachments) => {
      const updatedAttachments = prevAttachments?.filter((_, i) => i !== index);

      form.setValue("attachments", updatedAttachments);

      return updatedAttachments;
    });

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const getDevices = async () => {
    setIsViewLoading(true);
    try {
      const devices = await getDevicesWithoutPaginationService();
      setDevices(devices);
    } catch (error) {
      toasterService.error();
    } finally {
      setIsViewLoading(false);
    }
  };

  const getTestCycle = async () => {
    setIsViewLoading(true);
    try {
      const response = await getTestCycleWithoutPaginationService(projectId);
      if (response) {
        setTestCycles(response);
      }
    } catch (error) {
      toasterService.error();
    } finally {
      setIsViewLoading(false);
    }
  };

  const getProjectUsers = async () => {
    setIsViewLoading(true);
    try {
      const projectUsers = await getProjectUsersListService(projectId);
      if (projectUsers?.data?.users?.length) {
        setUsers(projectUsers.data.users);
      }
    } catch (error) {
      toasterService.error();
    } finally {
      setIsViewLoading(false);
    }
  };

  useEffect(() => {
    if (!dialogOpen) {
      setAttachments([]);
      form.setValue("attachments", []);
    }
  }, [dialogOpen]);

  useEffect(() => {
    if (dialogOpen) {
      getTestCycle();
      getProjectUsers();
      getDevices();
    }
  }, [dialogOpen]);

  const getSelectedUser = (field: any) => {
    const selectedUser = users?.find(
      (user) => user?.userId?._id === field.value
    );
    return getUsernameWithUserId(selectedUser);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          onClick={() => resetForm()}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Issue
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-6">
          {/* Enhanced Header with Gradient Background */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-50 to-orange-50 p-6 border border-red-100">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-100/50 to-orange-100/50 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="relative flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Bug className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline" className="bg-white/80 border-red-200 text-red-700">
                    New Issue
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  Report New Issue
                </h1>
                <p className="text-gray-600">
                  Document problems or defects discovered during testing that need resolution
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
                    Provide essential details about the issue
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
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            <SelectTrigger className="w-full border-gray-300 focus:border-red-500 focus:ring-red-500">
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
                            <SelectTrigger className="w-full border-gray-300 focus:border-red-500 focus:ring-red-500">
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
                            <SelectTrigger className="w-full border-gray-300 focus:border-red-500 focus:ring-red-500">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {ISSUE_STATUS_LIST.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status}
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
                    Specify devices and test cycle where the issue was found
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <SelectTrigger className="w-full border-gray-300 focus:border-red-500 focus:ring-red-500">
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
                            <SelectTrigger className="w-full border-gray-300 focus:border-red-500 focus:ring-red-500">
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
                  </div>
                </CardContent>
              </Card>

              {/* Assignment Card */}
              {userProjectRole === ProjectUserRoles.ADMIN ||
                userProjectRole === ProjectUserRoles.CLIENT ||
                userProjectRole === ProjectUserRoles.MANAGER ||
                userProjectRole === ProjectUserRoles.DEVELOPER ? (
                <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-600" />
                      Assignment
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Assign the issue to a team member for resolution
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
                            <SelectTrigger className="w-full border-gray-300 focus:border-red-500 focus:ring-red-500">
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
              ) : null}

              {/* Description Card */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Description *
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Provide detailed information about the issue
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
                    Add screenshots, logs, or other supporting files
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="w-full">
                      <Input
                        className="mt-2 opacity-0 cursor-pointer absolute w-0 h-0"
                        id="attachments"
                        type="file"
                        multiple
                        ref={inputRef}
                        onChange={handleFileChange}
                      />
                      <label
                        htmlFor="attachments"
                        className="flex mt-2 h-12 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm transition-colors cursor-pointer hover:bg-gray-50 items-center justify-center"
                      >
                        <FileText className="h-4 w-4 mr-2 text-gray-500" />
                        Choose Files
                      </label>
                    </div>
                    
                    {attachments?.length > 0 && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700">
                            Selected Files ({attachments.length})
                          </span>
                        </div>
                        <div className="space-y-2">
                          {attachments.map((attachment, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                              <DocumentName document={attachment} />
                              <Button
                                type="button"
                                onClick={() => handleRemoveFile(index)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6">
                <Button
                  disabled={isLoading}
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setDialogOpen(false)}
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
                  {isLoading ? "Creating..." : "Create Issue"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
