import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { IProject, IProjectPayload } from "@/app/_interface/project";
import { updateProjectService } from "@/app/_services/project.service";
import toasterService from "@/app/_services/toaster-service";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import TextEditor from "../text-editor";
import {
  formatDateReverse,
  formatSimpleDate,
} from "@/app/_constants/date-formatter";

const projectSchema = z.object({
  title: z.string().min(1, "Required"),
  startDate: z.preprocess(
    (val) => (val ? new Date(val as string) : null),
    z.date().nullable()
  )
    .optional(),
  endDate: z
    .preprocess(
      (val) => (val ? new Date(val as string) : null),
      z.date().nullable()
    )
    .optional(),
  description: z.string().min(1, "Required"),
  isActive: z.boolean().optional(),
});

const EditProject = ({
  project,
  sheetOpen,
  setSheetOpen,
  refreshProjects,
}: {
  project: IProject;
  sheetOpen: boolean;
  setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
  refreshProjects: () => void;
}) => {
  const projectId = project?.id as string;
  const { title, startDate, endDate, description } = project;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: title || "",
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      description: description || "",
    },
  });

  async function onSubmit(values: z.infer<typeof projectSchema>) {
    setIsLoading(true);
    try {
      const response = await updateProjectService(projectId, {
        ...values,
        startDate: values.startDate ? new Date(values.startDate.toISOString()) : null,
        endDate: values.endDate ? new Date(values.endDate.toISOString()) : null,
      });
      if (response) {
        refreshProjects();
        toasterService.success(response.message);
      }
    } catch (error) {
      toasterService.error();
    } finally {
      setSheetOpen(false);
      setIsLoading(false);
    }
  }
  const formatDate = (date: Date) => {
    return formatSimpleDate(date);
  };

  function parseDate(date: string | Date): Date {
    if (typeof date === "string") {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }
    return new Date();
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetContent className="w-full !max-w-full md:w-[580px] md:!max-w-[580px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">Edit project</SheetTitle>
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
                      <FormLabel>Project title</FormLabel>
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
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[260px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field?.value ? (
                                format(formatDate(field.value), "PPP")
                              ) : (
                                <span>Start date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[260px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field?.value ? (
                                format(formatDate(field.value), "PPP")
                              ) : (
                                <span>End date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              (form.watch("startDate") ? date < (form.watch("startDate") as Date) : false) ||
                              date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
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

              <div className="mt-10 w-full flex justify-end gap-2">
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
                  //   onClick={() => validateBrowsers()}
                  className="w-full md:w-fit"
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

export default EditProject;
