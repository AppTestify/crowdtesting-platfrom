"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash } from "lucide-react";
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
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import { getProjectUsersService } from "@/app/_services/project.service";
import { getUsernameWithUserId } from "@/app/_utils/common";
import { ProjectUserRoles } from "@/app/_constants/project-user-roles";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";

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
  // .min(1, "Required"),
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
  const [sheetOpen, setSheetOpen] = useState(false);
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
    if (sheetOpen) {
      setIssueId("");
    }
  }, [sheetOpen]);

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
      setSheetOpen(false);
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
      const projectUsers = await getProjectUsersService(projectId);
      if (projectUsers?.users?.length) {
        setUsers(projectUsers.users);
      }
    } catch (error) {
      toasterService.error();
    } finally {
      setIsViewLoading(false);
    }
  };

  useEffect(() => {
    if (!sheetOpen) {
      setAttachments([]);
      form.setValue("attachments", []);
    }
  }, [sheetOpen]);

  useEffect(() => {
    if (sheetOpen) {
      getTestCycle();
      getProjectUsers();
      getDevices();
    }
  }, [sheetOpen]);

  const getSelectedUser = (field: any) => {
    const selectedUser = users?.find(
      (user) => user?.userId?._id === field.value
    );
    return getUsernameWithUserId(selectedUser);
  };

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button onClick={() => resetForm()}>
          <Plus /> Add issue
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full !max-w-full md:w-[580px] md:!max-w-[580px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">Add new issue</SheetTitle>
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

              <div className="grid grid-cols-1 gap-2 mt-4">
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
                  className="w-full"
                />
                {isInvalidDevices ? (
                  <FormMessage className="mt-2">
                    Please select at least one device
                  </FormMessage>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3">
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
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
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
              <div className="grid grid-cols-1 gap-2 ">
                <div className="w-full mt-3">
                  <Label htmlFor="attachments">Attachments</Label>
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
                    className="flex mt-2 h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors cursor-pointer"
                  >
                    Choose Files
                  </label>
                  {attachments?.length > 0 && (
                    <div className="mt-2">
                      New attachments
                      <div className="mt-4 rounded-md border">
                        <Table>
                          <TableBody>
                            {attachments?.length ? (
                              attachments.map((attachment, index) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    <DocumentName document={attachment} />
                                  </TableCell>
                                  <TableCell className="flex justify-end items-end mr-6">
                                    <Button
                                      type="button"
                                      onClick={() => handleRemoveFile(index)}
                                      variant="ghost"
                                      size="icon"
                                    >
                                      <Trash className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell
                                  colSpan={columns.length}
                                  className="h-24 text-center"
                                >
                                  No attachments found
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
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
                  onClick={() => validateIssue()}
                  className="w-full md:w-fit"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {isLoading ? "Saving" : "Save"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
