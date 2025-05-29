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

export function InvitePage({
  setSteps,
  setFormData,
  formData,
}: {
  setSteps: React.Dispatch<React.SetStateAction<number>>;
  setFormData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  formData: OnboardingData;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      users: formData.users?.length
        ? formData.users
        : [
            {
              firstName: "",
              lastName: "",
              email: "",
              role: "",
              // sendCredentials: false,
            },
          ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "users",
  });

  const isFieldIncomplete = (index: number) => {
    const firstName = form.getValues(`users.${index}.firstName`);
    const email = form.getValues(`users.${index}.email`);
    const role = form.getValues(`users.${index}.role`);
    return !(firstName && email && role);
  };

 
  const watchedUsers = form.watch("users");

 
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      users: watchedUsers,
    }));
  }, [watchedUsers, setFormData]);

  function onSubmit(data: any) {
    setFormData((prev) => ({
      ...prev,
      users: data.users,
    }));
  }

  return (
    <div>
      <div className="w-full space-y-2">
        <p className="text-sm font-semibold text-green-600 uppercase">
          Step 3 of 3
        </p>

        <div className="w-full">
          <h2 className="text-xl font-semibold mb-4">Invite Users</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="">
              {fields.map((field, index) => (
                <div key={field.id} className="rounded-sm">
                  <div className="relative border bg-gray-50 rounded-lg p-4 mb-4">
                    {/* Delete Icon */}
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      >
                        <X size={18} />
                      </button>
                    )}

                    <div className="flex gap-3 flex-wrap">
                      <div className="flex-1 min-w-[200px]">
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
                      </div>

                      <div className="flex-1 min-w-[200px]">
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
                      </div>

                      <div className="flex-1 min-w-[200px]">
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
                      </div>

                      <div className="flex-1 min-w-[200px]">
                        <FormField
                          control={form.control}
                          name={`users.${index}.role`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  form.setValue(`users.${index}.role`, value);
                                  form.trigger(`users.${index}.role`);
                                }}
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
                    </div>
                  </div>

                  <div className="flex mt-2">
                    {index === fields.length - 1 && (
                      <Button
                        type="button"
                        size="sm"
                        className="mr-4"
                        onClick={() =>
                          append({
                            firstName: "",
                            lastName: "",
                            email: "",
                            role: "",
                            // sendCredentials: false,
                          })
                        }
                        disabled={isFieldIncomplete(fields.length - 1)}
                      >
                        <Plus /> Add User
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading} className="px-12">
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isLoading ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
        <div className="flex justify-between mt-5">
          {/* Back Button */}
          <Button
            onClick={() => setSteps(2)}
            className="bg-green-600 text-white transition-opacity duration-200"
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
