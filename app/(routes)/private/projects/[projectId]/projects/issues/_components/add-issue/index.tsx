"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Equal,
  Loader2,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";

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
  IssueStatus,
  Priority,
  PRIORITY_LIST,
  SEVERITY_LIST,
} from "@/app/_constants/issue";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IssueAttachments from "../attachments/issue-attachment";
import { IssueTab } from "../../_constants";
import { displayIcon } from "@/app/_utils/common-functionality";
import TextEditor from "@/app/(routes)/private/projects/_components/text-editor";

const projectSchema = z.object({
  title: z.string().min(1, "Required"),
  severity: z.string().min(1, "Required"),
  priority: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  status: z.string().optional(),
  projectId: z.string().optional(),
});

export function AddIssue({ refreshIssues }: { refreshIssues: () => void }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [tab, setTab] = useState<string>(IssueTab.SUMMARY);
  const [issueId, setIssueId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { projectId } = useParams<{ projectId: string }>();

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      severity: "",
      priority: "",
      description: "",
      status: IssueStatus.NEW,
      projectId: projectId,
    },
  });

  const onTabChange = (value: string) => {
    setTab(value);
  };

  useEffect(() => {
    if (sheetOpen) {
      setIssueId("");
      setTab(IssueTab.SUMMARY);
    }
  }, [sheetOpen]);

  async function onSubmit(values: z.infer<typeof projectSchema>) {
    setIsLoading(true);
    try {
      const response = await addIssueService(projectId, { ...values });
      if (response) {
        setIssueId(response.id);
        setTab(IssueTab.ATTACHMENTS);
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
    if (form.formState.isValid) {
      form.handleSubmit(onSubmit);
    }
  };

  const resetForm = () => {
    form.reset();
  };

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button onClick={() => resetForm()}>
          <Plus /> Add Issue
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full !max-w-full md:w-[580px] md:!max-w-[580px]">
        <SheetHeader>
          <SheetTitle className="text-left">Add new issue</SheetTitle>
          <SheetDescription className="text-left">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae
            culpa sequi laborum ratione nobis saepe omnis est perspiciatis
            placeat quis?
          </SheetDescription>
        </SheetHeader>
        <Tabs value={tab} onValueChange={onTabChange} className="w-full my-3">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value={IssueTab.SUMMARY}>
              {IssueTab.SUMMARY}
            </TabsTrigger>
            <TabsTrigger value={IssueTab.ATTACHMENTS} disabled={!issueId}>
              Attachments
            </TabsTrigger>
          </TabsList>
          <TabsContent value={IssueTab.SUMMARY}>
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
                      onClick={() => validateIssue()}
                      className="w-full md:w-fit"
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {isLoading ? "Saving" : "Continue"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </TabsContent>
          <TabsContent value={IssueTab.ATTACHMENTS}>
            <IssueAttachments issueId={issueId} isUpdate={false} isView={false} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
