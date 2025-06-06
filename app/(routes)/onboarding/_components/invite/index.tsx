import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, X } from "lucide-react";
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

import { USER_ROLE_LIST } from "@/app/_constants/user-roles";
import { OnboardingData } from "@/app/_interface/onboarding";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";
import { publicEmailDomains } from "@/app/_constants/email-subject";

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
        `Your selected plan allows only ${testers} user(s). Please upgrade your add plan.`
      );
      setHasShownLimitToast(true);
    } else if (fields.length === testers && !hasShownLimitToast) {
      toast.warning(
        `You've reached your plan’s user limit. Upgrade your plan.`
      );
      setHasShownLimitToast(true);
    } else if (fields.length < testers && hasShownLimitToast) {
      setHasShownLimitToast(false);
    }
  }, [fields.length, testers, hasShownLimitToast, remove]);

  async function onSubmit(data: any) {
    setIsLoading(true);
    try {
      setFormData((prev) => ({ ...prev, users: data.users }));
      await addOnboarding();
    } catch {
      toast.error("Something went wrong while saving.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="px-4 md:mt-4 sm:px-6 md:px-10 lg:px-10 xl:px-10 max-w-[1440px] mx-auto">
      <p className="text-sm font-semibold text-green-600 uppercase">
        Step 3 of 3
      </p>
      <h2 className="text-lg sm:text-xl font-semibold mb-4 mt-2">
        Invite Users
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="relative border bg-gray-50 rounded-lg p-4"
            >
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  <X size={18} />
                </button>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name={`users.${index}.firstName`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <Input {...field} />
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          form.setValue(`users.${index}.role`, value)
                        }
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            {USER_ROLE_LIST.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
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
              <input
                type="hidden"
                {...form.register(`users.${index}.sendCredentials`)}
                value="true"
              />
              {index === fields.length - 1 && (
                <div className="mt-4">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      append({
                        firstName: "",
                        lastName: "",
                        email: "",
                        role: "",
                        sendCredentials: true,
                      })
                    }
                    disabled={
                      isFieldIncomplete(fields.length - 1) ||
                      fields.length >= testers
                    }
                  >
                    <Plus className="mr-1" /> Add User
                  </Button>
                </div>
              )}
            </div>
          ))}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <Button variant="outline" onClick={() => setSteps(2)}>
              Back
            </Button>
            <Button type="submit" disabled={isLoading} className="px-12">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
