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
import React, { useState, useEffect } from "react";
import { OnboardingData } from "@/app/_interface/onboarding";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

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
  const [showTips, setShowTips] = useState(false);
  const [formProgress, setFormProgress] = useState(0);

  // Calculate form completion progress
  const watchedFields = form.watch();
  useEffect(() => {
    const fields = ['title', 'startDate', 'endDate', 'description'];
    const completed = fields.filter(field => {
      const value = watchedFields[field as keyof typeof watchedFields];
      return value && value.toString().trim().length > 0;
    }).length;
    setFormProgress((completed / fields.length) * 100);
  }, [watchedFields]);

  const onSubmit = (data: ProjectFormType) => {
    setFormData((d) => ({ ...d, project: data }));
    setSteps(2);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Enhanced Header with Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-medium">
            Step 1 of 3
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Form Progress:</span>
            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${formProgress}%` }}
              />
            </div>
            <span className="text-xs font-medium text-green-600">{Math.round(formProgress)}%</span>
          </div>
        </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 tracking-tight">
          Add Your First Project
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">
          Set up your workspace to receive and respond to customer messages. This workspace will handle your email communications, with DNS support ensuring smooth management of customer inquiries.
        </p>
      </div>

      {/* Enhanced Form Container */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <Form {...form}>
          <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
            {/* Project Title with Enhanced Validation */}
            <FormField
              name="title"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold text-gray-900 flex items-center">
                    Project Title *
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 ml-2 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Choose a clear, descriptive title that summarizes your testing project. This will help team members understand the project's purpose at a glance.</p>
                      </TooltipContent>
                    </Tooltip>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        className="bg-white border-gray-200 h-12 text-base focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 pr-12"
                        {...field}
                        placeholder="e.g., E-commerce Website Testing Project"
                      />
                      {field.value && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <div className="text-sm text-gray-500 mt-1">
                    Character count: {field.value?.length || 0}/100
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Enhanced Date Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-base font-semibold text-gray-900 flex items-center">
                      Start Date *
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-4 h-4 ml-2 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">When do you plan to begin testing? This helps set expectations and timeline for your team.</p>
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full h-12 pl-4 text-left font-normal bg-white border-gray-200 hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? format(new Date(field.value), "PPP")
                              : "Select start date"}
                            <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
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
                            setOpen(false);
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
                    <FormLabel className="text-base font-semibold text-gray-900 flex items-center">
                      End Date *
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-4 h-4 ml-2 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Target completion date for your testing project. This helps with planning and resource allocation.</p>
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <Popover open={endOpen} onOpenChange={setEndOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full h-12 pl-4 text-left font-normal bg-white border-gray-200 hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? format(new Date(field.value), "PPP")
                              : "Select end date"}
                            <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
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
                            setEndOpen(false);
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

            {/* Enhanced Description Field */}
            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold text-gray-900 flex items-center">
                    Project Description
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 ml-2 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Provide detailed information about your testing goals, scope, and requirements. This helps team members understand the project context.</p>
                      </TooltipContent>
                    </Tooltip>
                  </FormLabel>
                  <div className="mt-2">
                    <FormControl>
                      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent transition-all duration-200">
                        <TextEditor
                          markup={field.value || ""}
                          onChange={(value) => {
                            form.setValue("description", value);
                            form.trigger("description");
                          }}
                          placeholder="Write a detailed description of your project goals, scope, and requirements..."
                        />
                      </div>
                    </FormControl>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Provide context about what you're testing and what you hope to achieve.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Enhanced Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-gray-200 space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <p className="text-sm text-gray-500">
                  You can always edit these details later in your project settings.
                </p>
                {showTips && (
                  <div className="hidden lg:block p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800">
                      💡 <strong>Pro tip:</strong> A well-defined project description helps your team understand goals and stay aligned throughout the testing process.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  type="button" 
                  variant="outline"
                  className="px-6 py-3 h-auto border-gray-200 hover:bg-gray-50 text-gray-700 transition-all duration-200"
                  onClick={() => form.reset()}
                >
                  <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset Form
                </Button>
                <Button 
                  type="submit"
                  className="px-8 py-3 h-auto bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Save and Continue
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
