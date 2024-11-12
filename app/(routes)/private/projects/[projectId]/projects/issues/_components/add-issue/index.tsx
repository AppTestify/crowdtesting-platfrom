"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Plus,
  Trash,
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
import { Controller, useForm } from "react-hook-form";
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

const projectSchema = z.object({
  title: z.string().min(1, "Required"),
  severity: z.string().min(1, "Required"),
  priority: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  status: z.string().optional(),
  projectId: z.string().optional(),
  attachments: z
    .array(z.instanceof(File))
    .optional(),
});

export function AddIssue({ refreshIssues }: { refreshIssues: () => void }) {
  const columns: ColumnDef<IIssueAttachmentDisplay[]>[] = [
    {
      accessorKey: "name",
      cell: ({ row }) =>
        <div>
          <DocumentName document={row.getValue("name")} />
        </div>,
    }
  ];

  const [sheetOpen, setSheetOpen] = useState(false);
  const [issueId, setIssueId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { projectId } = useParams<{ projectId: string }>();
  const [attachments, setAttachments] = useState<File[]>();

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      severity: "",
      priority: "",
      description: "",
      status: IssueStatus.NEW,
      projectId: projectId,
      attachments: []
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
      const response = await addIssueService(projectId, { ...values });
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
    if (form.formState.isValid) {
      form.handleSubmit(onSubmit)();
    }
  };

  const resetForm = () => {
    form.reset();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setAttachments(fileArray);
      form.setValue("attachments", fileArray);
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachments((prevAttachments) => prevAttachments?.filter((_, i) => i !== index));
    form.setValue("attachments", attachments?.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (!sheetOpen) {
      setAttachments([]);
      form.setValue("attachments", []);
    }
  }, [sheetOpen]);

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
            We are experiencing difficulties with state management across multiple tabs,
            leading to inconsistent data in certain components.
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
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="attachments"
                    className="flex mt-2 h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors cursor-pointer"
                  >
                    Choose Files
                  </label>
                  <div className="mt-4 rounded-md border">
                    <Table>
                      <TableBody>
                        {attachments?.length ? (
                          attachments.map((attachment, index) => (
                            <TableRow key={index}>
                              <TableCell>{attachment.name}</TableCell>
                              <TableCell className="flex justify-end items-end mr-6">
                                <Button type="button" onClick={() => handleRemoveFile(index)}
                                  variant="ghost"
                                  size="icon">
                                  <Trash className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                              No attachments found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
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
                  type="submit"
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
