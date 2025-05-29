"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { projectSchema } from "@/app/_schemas/project.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TextEditor from "../text-editor";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import React, { useState } from "react";
import { OnboardingData } from "@/app/_interface/onboarding";

type ProjectFormType = z.infer<typeof projectSchema>;

export default function Project({
  setSteps,
  setFormData,
  formData,
}: {
  //

  setSteps: React.Dispatch<React.SetStateAction<number>>;
  setFormData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  formData: OnboardingData; // 👈 Accept full onboarding data
}) {
  const form = useForm<ProjectFormType>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: formData.project.title ?? "",
      startDate: formData.project.startDate ?? "",
      endDate: formData.project.endDate ?? "",
      description: formData.project.description ?? "",
      isActive: formData.project.isActive ?? true,
    },
  });

  const [open, setOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const onSubmit = (data: ProjectFormType) => {
    setFormData((d) => ({ ...d, project: data }));
    setSteps(2);
  };

  return (
    <div className="min-h-[80vh] items-center justify-center px-8 rounded-xl py-5">
      <div className="w-full max-w-2xl space-y-4">
        <p className="text-sm font-semibold text-green-600 uppercase">
          Step 1 of 3
        </p>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Your Project</h1>
          <p className="mt-2 text-gray-600">
            Set up your workspace to receive and respond to customer messages.
            This workspace will handle your email communications, with DNS
            support ensuring smooth management of customer inquiries.
          </p>
        </div>

        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              name="title"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-gray-50"
                      {...field}
                      placeholder="Enter project title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-2 mt-3">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start date</FormLabel>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal bg-gray-50",
                              open && "ring-1 ring-ring ring-offset-1",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? format(new Date(field.value), "PPP")
                              : "Start date"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date) => {
                            field.onChange(date?.toISOString() ?? null);
                            setOpen(false); // Close popover after selecting a date
                          }}
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
                    <Popover open={endOpen} onOpenChange={setEndOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal bg-gray-50",
                              endOpen && "ring-1 ring-ring ring-offset-1",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? format(new Date(field.value), "PPP")
                              : "End date"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date) => {
                            field.onChange(date?.toISOString() ?? null);
                            setEndOpen(false); // 👈 Close on date select
                          }}
                          disabled={(date) => {
                            const start = form.watch("startDate");
                            return (
                              date < new Date("1900-01-01") ||
                              (!!start && new Date(date) < new Date(start))
                            );
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              name="description"
              control={form.control}
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
                      placeholder="Write your project description..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit">Save and continue</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
