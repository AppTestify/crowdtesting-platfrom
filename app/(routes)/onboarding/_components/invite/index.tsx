import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, X, Users, Mail, HelpCircle, UserPlus, Check, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useFieldArray, useForm } from "react-hook-form";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { USER_ROLE_LIST } from "@/app/_constants/user-roles";
import { OnboardingData } from "@/app/_interface/onboarding";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";
import { publicEmailDomains } from "@/app/_constants/email-subject";
import { Switch } from "@/components/ui/switch";

const inviteSchema = z.object({
  users: z.array(
    z.object({
      firstName: z.string().min(1, "Required"),
      lastName: z.string().optional(),
      email: z
        .string()
        .min(1, "Required")
        .email("Invalid email address")
        .refine(
          (email) => {
            const domain = email.split("@")[1];
            return !publicEmailDomains.includes(domain);
          },
          { message: "Only business email are allowed" }
        ),
      role: z.string().min(1, "Required"),
      sendCredentials: z.boolean(),
    })
  ),
});

export function InvitePage({
  setSteps,
  setFormData,
  formData,
  addOnboarding,
  testers,
}: {
  setSteps: React.Dispatch<React.SetStateAction<number>>;
  setFormData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  formData: OnboardingData;
  addOnboarding: () => void;
  testers: number;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasShownLimitToast, setHasShownLimitToast] = useState(false);
  const [skipInvites, setSkipInvites] = useState(false);

  const form = useForm<z.infer<typeof inviteSchema>>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      users: formData.users?.length
        ? formData.users
        : [
            {
              firstName: "",
              lastName: "",
              email: "",
              role: "",
              sendCredentials: true,
            },
          ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "users",
  });

  const isFieldIncomplete = (index: number) => {
    const { firstName, email, role } = form.getValues().users[index];
    return !(firstName && email && role);
  };

  const watchedUsers = form.watch("users");
  const completedUsers = watchedUsers.filter((user, index) => !isFieldIncomplete(index)).length;

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      users: watchedUsers as OnboardingData["users"],
    }));
  }, [watchedUsers, setFormData]);

  useEffect(() => {
    if (fields.length > testers) {
      const extraCount = fields.length - testers;
      for (let i = 0; i < extraCount; i++) remove(fields.length - 1 - i);
      toast.warning(
        `Your selected plan allows only ${testers} user(s). Please upgrade your plan to add more team members.`
      );
      setHasShownLimitToast(true);
    } else if (fields.length === testers && !hasShownLimitToast) {
      toast.info(
        `You've reached your plan's user limit (${testers} users). Consider upgrading for more team members.`
      );
      setHasShownLimitToast(true);
    } else if (fields.length < testers && hasShownLimitToast) {
      setHasShownLimitToast(false);
    }
  }, [fields.length, testers, hasShownLimitToast, remove]);

  const quickFillRoles = [
    { role: "project_manager", name: "Project Manager", description: "Manages projects and oversees testing activities" },
    { role: "qa_engineer", name: "QA Engineer", description: "Executes test cases and reports bugs" },
    { role: "developer", name: "Developer", description: "Reviews test results and fixes issues" },
    { role: "viewer", name: "Viewer", description: "Read-only access to view test results" }
  ];

  const addMember = () => {
    if (fields.length < testers) {
      append({
        firstName: "",
        lastName: "",
        email: "",
        role: "",
        sendCredentials: true,
      });
    } else {
      toast.warning(`You can only add ${testers} team members with your current plan.`);
    }
  };

  const fillQuickRole = (index: number, roleData: typeof quickFillRoles[0]) => {
    form.setValue(`users.${index}.role`, roleData.role);
  };

  async function onSubmit(data: any) {
    setIsLoading(true);
    try {
      setFormData((prev) => ({ ...prev, users: data.users }));
      await addOnboarding();
      toast.success("Team setup completed successfully!");
    } catch {
      toast.error("Failed to save team members. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSkipAndComplete() {
    setIsLoading(true);
    try {
      setFormData((prev) => ({ ...prev, users: [] }));
      await addOnboarding();
      toast.success("Project created successfully! You can add team members later.");
    } catch {
      toast.error("Failed to complete setup. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <TooltipProvider>
      <div className="w-full max-w-5xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-6">
          <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-medium mb-2">
            Step 3 of 3
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 tracking-tight">
            Invite Your Team Members
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
            Collaborate better by inviting your QA, development, and product teams. Team members will receive email invitations with access credentials.
          </p>
        </div>

        {/* Plan Limit Info */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">Your Plan Allows {testers} Team Members</h3>
              <p className="text-sm text-blue-700">
                You can add up to {testers} team members with your current plan. 
                {fields.length >= testers && (
                  <span className="font-medium"> You've reached your limit.</span>
                )}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{fields.length}/{testers}</div>
              <div className="text-xs text-blue-500">Members</div>
            </div>
          </div>
        </div>

        {/* Skip Option */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">Want to add team members later?</h3>
                <p className="text-sm text-yellow-700">
                  You can skip this step and add team members from your dashboard after project creation.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleSkipAndComplete}
              disabled={isLoading}
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Skip & Complete
            </Button>
          </div>
        </div>

        {/* Enhanced Form */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className={`relative border-2 rounded-2xl p-6 transition-all duration-200 ${
                    isFieldIncomplete(index) 
                      ? "border-gray-200 bg-gray-50" 
                      : "border-green-200 bg-green-50"
                  }`}
                >
                  {/* Member Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isFieldIncomplete(index) ? "bg-gray-300" : "bg-green-500"
                      }`}>
                        {isFieldIncomplete(index) ? (
                          <span className="text-xs font-bold text-white">{index + 1}</span>
                        ) : (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        Team Member {index + 1}
                        {!isFieldIncomplete(index) && (
                          <span className="text-green-600 ml-2">✓ Complete</span>
                        )}
                      </h3>
                    </div>
                    {index > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Remove this team member</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <FormField
                      control={form.control}
                      name={`users.${index}.firstName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            First Name *
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="w-3 h-3 ml-1 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Team member's first name for identification</p>
                              </TooltipContent>
                            </Tooltip>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="bg-white border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                              placeholder="John"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`users.${index}.lastName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="bg-white border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                              placeholder="Doe"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`users.${index}.email`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            Business Email *
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="w-3 h-3 ml-1 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">Use business email addresses only. Personal email providers like Gmail, Yahoo are not allowed.</p>
                              </TooltipContent>
                            </Tooltip>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input 
                                {...field} 
                                className="bg-white border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent pl-10" 
                                placeholder="john@company.com"
                                type="email"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`users.${index}.role`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            Role *
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="w-3 h-3 ml-1 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">Select the appropriate role based on their responsibilities in the testing process.</p>
                              </TooltipContent>
                            </Tooltip>
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectGroup>
                                {USER_ROLE_LIST.map((role) => (
                                  <SelectItem key={role} value={role}>
                                    <div className="flex items-center space-x-2">
                                      <span>{role}</span>
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

                  {/* Quick Role Buttons */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Quick role selection:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickFillRoles.map((roleData) => (
                        <Button
                          key={roleData.role}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fillQuickRole(index, roleData)}
                          className="text-xs border-gray-200 hover:border-green-300 hover:bg-green-50"
                        >
                          {roleData.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Send Credentials Toggle */}
                  <FormField
                    control={form.control}
                    name={`users.${index}.sendCredentials`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-3 bg-white">
                        <div className="space-y-0.5">
                          <FormLabel className="font-medium">
                            Send login credentials via email
                          </FormLabel>
                          <div className="text-sm text-gray-600">
                            Team member will receive an email with login instructions
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              ))}

              {/* Add Member Button */}
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addMember}
                  disabled={fields.length >= testers}
                  className="px-6 py-3 border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all duration-200"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Another Team Member
                  {fields.length >= testers && (
                    <span className="ml-2 text-xs text-gray-500">(Plan limit reached)</span>
                  )}
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-gray-200 space-y-4 sm:space-y-0">
                <div className="text-sm text-gray-500">
                  💡 Team members can be added or modified later from your dashboard.
                </div>
                
                <div className="flex space-x-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setSteps(2)}
                    className="px-6 py-3 h-auto border-gray-200 hover:bg-gray-50 text-gray-700"
                  >
                    <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-3 h-auto bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Creating Project...
                      </>
                    ) : (
                      <>
                        Complete Setup
                        <Check className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </TooltipProvider>
  );
}
