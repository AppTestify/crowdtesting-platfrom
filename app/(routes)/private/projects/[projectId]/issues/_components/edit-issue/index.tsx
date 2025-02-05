import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  getProjectUsersService,
} from "@/app/_services/project.service";
import { checkProjectAdmin, getUsernameWithUserId } from "@/app/_utils/common";
import { useParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { ProjectUserRoles } from "@/app/_constants/project-user-roles";

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
      setProject(response);
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
    try {
      const projectUsers = await getProjectUsersService(projectId);
      if (projectUsers?.users?.length) {
        setUsers(projectUsers.users);
      }
    } catch (error) {
      toasterService.error();
    }
  };

  useEffect(() => {
    if (sheetOpen) {
      form.reset();
      getSingleTestCycle();
      getDevices();
      getTestCycle();
      getProject();
      setAttachments([]);
      getProjectUsers();
      if (data) {
        const { user } = data;
        setUserData(user);
      }
    }
  }, [sheetOpen]);

  useEffect(() => {
    if (selectedDevices?.length) {
      setIsInvalidDevices(false);
    }
  }, [selectedDevices]);

  const handleSheetClose = () => {
    refreshIssues();
  };

  const handleOpenChange = (open: boolean) => {
    if (sheetOpen !== open) {
      setSheetOpen(open);

      if (!open) {
        // handleSheetClose();
      }
    }
  };

  const getSingleTestCycle = async () => {
    try {
      const response = await getSingleCycleService(
        projectId,
        form.watch("testCycle")
      );
      setTestCycle(response);
    } catch (error) {
      toasterService.error();
    }
  };

  useEffect(() => {
    if (data) {
      const { user } = data;
      setUserData(user);
    }
  }, [data]);

  const getSelectedUser = (field: any) => {
    const selectedUser = users?.find(
      (user) => user?.userId?._id === field.value
    );
    return getUsernameWithUserId(selectedUser);
  };

  return (
    <Sheet open={sheetOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full !max-w-full md:w-[580px] md:!max-w-[580px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">Edit Issue</SheetTitle>
          <SheetDescription className="text-left">
            Problems or defects discovered during testing that need resolution
            before the product is finalized.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} method="post">
              <div className="grid grid-cols-1 gap-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <FormField
                  control={form.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Severity</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {SEVERITY_LIST.map((severity) => (
                              <SelectItem value={severity}>
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
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {PRIORITY_LIST.map((priority) => (
                              <SelectItem value={priority}>
                                <div className="flex items-center">
                                  <span className="mr-1">
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
              <div className="w-full grid grid-cols-1 gap-2 mt-3">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        disabled={
                          userData?.role === UserRoles.TESTER &&
                          !checkProjectRole &&
                          form.watch("status") !==
                          IssueStatus.READY_FOR_RETEST &&
                          !ISSUE_TESTER_STATUS_LIST.includes(field.value as any)
                        }
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue>{field.value || ""}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {userData?.role === UserRoles.TESTER &&
                            !checkProjectRole ? (
                            <SelectGroup>
                              {ISSUE_TESTER_STATUS_LIST.map((status) => (
                                <SelectItem value={status} key={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          ) : userData?.role === UserRoles.TESTER &&
                            checkProjectRole ? (
                            <SelectGroup>
                              {PROJECT_ADMIN_ISSUE_STATUS_LIST.map((status) => (
                                <SelectItem value={status} key={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          ) : userData?.role === UserRoles.CLIENT ? (
                            <SelectGroup>
                              {ISSUE_STATUS_LIST.filter(
                                (status) => status !== IssueStatus.NEW
                              ).map((status) => (
                                <SelectItem value={status} key={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          ) : (
                            <SelectGroup>
                              {ISSUE_STATUS_LIST.map((status) => (
                                <SelectItem value={status}>{status}</SelectItem>
                              ))}
                            </SelectGroup>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="w-full grid grid-cols-1 gap-2 mt-3">
                <Label className={isInvalidDevices ? "text-destructive" : ""}>
                  Devices
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
                  placeholder=""
                  disabled={devices?.length === 0}
                  variant="secondary"
                  animation={2}
                  maxCount={2}
                  className="mt-2"
                />
                {isInvalidDevices ? (
                  <FormMessage className="mt-2">
                    Please select at least one devices
                  </FormMessage>
                ) : null}
              </div>

              <div className="w-full grid grid-cols-2 gap-2 mt-3">
                <FormField
                  control={form.control}
                  name="issueType"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Issue type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {ISSUE_TYPE_LIST.map((issueType) => (
                              <SelectItem value={issueType}>
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
                      <FormLabel>Test cycle</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            {testCycles.find(
                              (cycle) => cycle._id === field.value
                            )
                              ? testCycles.find(
                                (cycle) => cycle._id === field.value
                              )?.title
                              : testCycle?.title}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {loading ? (
                              <div className="text-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              </div>
                            ) : testCycles.length === 0 ? (
                              <div className="text-center text-gray-500">
                                No test cycles found
                              </div>
                            ) : (
                              testCycles.map((testCycle) => (
                                <SelectItem
                                  key={testCycle._id}
                                  value={testCycle._id as string}
                                >
                                  {testCycle.title}
                                </SelectItem>
                              ))
                            )}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {userProjectRole === ProjectUserRoles.ADMIN ||
                userProjectRole === ProjectUserRoles.CLIENT ? (
                <div className="grid grid-cols-1 gap-2 mt-4">
                  <FormField
                    control={form.control}
                    name="assignedTo"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Assignee</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full">
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
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-2 mt-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
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
              </div>
              <IssueAttachments
                issueId={issueId}
                isUpdate={true}
                isView={false}
                setAttachmentsData={setAttachments}
              />

              <div className="mt-6 w-full flex justify-end gap-2">
                <SheetClose asChild>
                  <Button
                    disabled={isLoading}
                    type="button"
                    variant={"outline"}
                    size="lg"
                    className="w-full md:w-fit"
                  >
                    Cancel
                  </Button>
                </SheetClose>
                <Button
                  disabled={isLoading}
                  type="button"
                  size="lg"
                  className="w-full md:w-fit"
                  onClick={handleSubmit}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {isLoading ? "Updating" : "Update"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EditIssue;
