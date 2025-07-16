"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarIcon, Loader2, Plus, FolderOpen, Calendar, FileText } from "lucide-react";
import { useState } from "react";

import {
  addProjectService
} from "@/app/_services/project.service";
import toasterService from "@/app/_services/toaster-service";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import TextEditor from "../text-editor";

const projectSchema = z.object({
  title: z.string().min(1, "Required"),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
  description: z.string().min(1, "Required"),
  isActive: z.boolean().optional(),
});

export function AddProject({ refreshProjects }: { refreshProjects: () => void; }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      startDate: null,
      endDate: null,
      description: "",
      isActive: true,
    },
  });

  async function onSubmit(values: z.infer<typeof projectSchema>) {
    setIsLoading(true);
    try {
      const response = await addProjectService({
        ...values,
        startDate: values.startDate ?? null,
        endDate: values.endDate ?? null,
      });
      if (response) {
        refreshProjects();
        toasterService.success(response?.message);
      }
    } catch (error) {
      toasterService.error();
    } finally {
      setDialogOpen(false);
      setIsLoading(false);
    }
  }

  const validateProject = () => {
    if (form.formState.isValid) {
      form.handleSubmit(onSubmit);
    }
  };

  const resetForm = () => {
    form.reset();
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => resetForm()} className="bg-green-600 hover:bg-green-700 transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FolderOpen className="h-5 w-5 text-blue-600" />
            </div>
            Create New Project
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Set up a new project with all the essential details and timeline.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information Card */}
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Provide the essential details for this project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Project Title *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter project title..."
                            {...field}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Timeline Card */}
              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    Project Timeline
                  </CardTitle>
                  <CardDescription>
                    Set the start and end dates for your project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Start Date
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal border-gray-300 focus:border-blue-500",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Select start date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
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
                          <FormLabel className="text-sm font-medium text-gray-700">
                            End Date
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal border-gray-300 focus:border-blue-500",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Select end date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={field.value || undefined}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < (form.watch("startDate") ?? new Date("1900-01-01")) ||
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
                </CardContent>
              </Card>

              {/* Description Card */}
              <Card className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Project Description
                  </CardTitle>
                  <CardDescription>
                    Provide a detailed description of your project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Description *
                        </FormLabel>
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

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  disabled={isLoading}
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setDialogOpen(false)}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  disabled={isLoading}
                  type="submit"
                  size="lg"
                  onClick={() => validateProject()}
                  className="px-6 bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
