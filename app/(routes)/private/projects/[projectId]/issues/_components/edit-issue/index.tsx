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
} from "@/app/_constants/issue";
import { updateIssueService } from "@/app/_services/issue.service";
import IssueAttachments from "../attachments/issue-attachment";
import { displayIcon } from "@/app/_utils/common-functionality";
import TextEditor from "@/app/(routes)/private/projects/_components/text-editor";
import { addIssueAttachmentsService } from "@/app/_services/issue-attachment.service";
import { getDevicesWithoutPaginationService } from "@/app/_services/device.service";
import { IDevice } from "@/app/_interface/device";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";

const issueSchema = z.object({
  title: z.string().min(1, "Required"),
  severity: z.string().min(1, "Required"),
  priority: z.string().min(1, "Required"),
  description: z.string()
    .min(10, "The description must be at least 10 characters long.")
    .nonempty("Required."),
  status: z.string().optional(),
  projectId: z.string().optional(),
  device: z
    .array(z.string())
    .min(1, "Required")
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
  const { status, projectId, device } = issue;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [devices, setDevices] = useState<IDevice[]>([]);
  const [userData, setUserData] = useState<any>();
  const [previousDeviceId, setPreviousDeviceId] = useState<string>("");
  const { data } = useSession();
  const deviceName = device?.map(d => d.name) || [];
  const form = useForm<z.infer<typeof issueSchema>>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      title: "",
      severity: "",
      priority: "",
      description: "",
      status: "",
      projectId: "",
      device: []
    },
  });

  const hasReset = useRef(false);

  useEffect(() => {
    if (issue && !hasReset.current) {
      setPreviousDeviceId(issue?.device[0]?._id as string)
      form.reset({
        title: issue.title || "",
        severity: issue.severity || "",
        priority: issue.priority || "",
        description: issue.description || "",
        status: issue.status || "",
        projectId: issue.projectId || "",
        device: deviceName,
      });
      hasReset.current = true;
    }
  }, [issue, deviceName, form]);

  async function onSubmit(values: z.infer<typeof issueSchema>) {
    setIsLoading(true);
    try {
      const isSameDevice = values.device?.[0] === deviceName?.[0];
      const response = await updateIssueService(projectId as string, issueId, {
        ...values,
        device: isSameDevice ? [previousDeviceId] : values?.device || [],
      });
      if (response) {
        refreshIssues();
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
      await addIssueAttachmentsService(projectId as string, issueId, { attachments });
    } catch (error) {
      toasterService.error();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    const values = form.getValues();
    await onSubmit(values);
    await uploadAttachment();
  };

  const getDevices = async () => {
    const devices = await getDevicesWithoutPaginationService();
    setDevices(devices);
  };

  useEffect(() => {
    if (sheetOpen) {
      getDevices();
      if (data) {
        const { user } = data;
        setUserData(user);
      }
    }
  }, [sheetOpen]);

  useEffect(() => {
    if (data) {
      const { user } = data;
      setUserData(user);
    }
  }, [data]);

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetContent
        className="w-full !max-w-full md:w-[580px] md:!max-w-[580px] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="text-left">Edit Issue</SheetTitle>
          <SheetDescription className="text-left">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolor a
            totam blanditiis veniam laudantium dolores quidem id magni ut
            dignissimos.
          </SheetDescription>
        </SheetHeader>

        <div>
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
                                  <span className="mr-1">{displayIcon(priority)}</span>
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
              <div className="w-full grid grid-cols-2 gap-2 mt-3">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue>{field.value || ""}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {userData?.role === UserRoles.TESTER ?
                            <SelectGroup>
                              {ISSUE_TESTER_STATUS_LIST.map((status) => (
                                <SelectItem value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                            : <SelectGroup>
                              {ISSUE_STATUS_LIST.map((status) => (
                                <SelectItem value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          }
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="device"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Device</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          if (value) {
                            field.onChange([value]);
                          }
                        }}
                        value={field.value?.[0] || (devices.length > 0 ? devices[0]._id : "")}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            {
                              field.value && field.value.length > 0
                                ? devices.find((device) => device.id === field.value[0])?.name || field.value
                                : (status || " ")
                            }
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {devices.length > 0 ?
                            <SelectGroup>
                              {devices.map((device) => (
                                <SelectItem key={device.id} value={device.id}>
                                  <div className="flex items-center">
                                    {device?.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectGroup>
                            : <div className="text-center">Loading</div>}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
              <IssueAttachments issueId={issueId} isUpdate={true} isView={false}
                setAttachmentsData={setAttachments} />

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
                  type="submit"
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
    </Sheet >
  );
};

export default EditIssue;
