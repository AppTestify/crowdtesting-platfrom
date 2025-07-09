"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";

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
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { USER_ROLE_LIST } from "@/app/_constants/user-roles";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { addClientUserService } from "@/app/_services/user.service";
import { useParams } from "next/navigation";

const userSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().min(1, "Required").email("Invalid email address"),
  role: z.string().min(1, "Required"),
  sendCredentials: z.boolean(),
  isVerified: z.boolean(),
});

export function AddClientUser({ refreshUsers, userLimit, currentUserCount }: {
  refreshUsers: () => void,
  userLimit?: number | null,
  currentUserCount?: number
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { projectId } = useParams<{ projectId: string }>();

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "",
      sendCredentials: false,
      isVerified: false,
    },
  });

  async function onSubmit(values: z.infer<typeof userSchema>) {
    setIsLoading(true);
    try {
      const response = await addClientUserService(
        [{ ...values, isVerified: false }],
        projectId
      );

      if (response) {
        if (
          response.status === HttpStatusCode.BAD_REQUEST ||
          (typeof response.message === 'string' && response.message.includes('User limit reached'))
        ) {
          // Show the backend error message
          toasterService.error(response?.message || "Failed to add user");
          return;
        }
        localStorage.setItem("userId", response?.user?._id);
        refreshUsers();
        toasterService.success(response?.message);
      }
    } catch (error: any) {
      // If error is an object with a message, show it
      toasterService.error(error?.message || "Failed to add user");
    } finally {
      setDialogOpen(false);
      setIsLoading(false);
    }
  }

  const resetForm = () => {
    form.reset();
  };

  const isLimitReached = userLimit !== null && currentUserCount !== undefined && currentUserCount >= userLimit;

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => resetForm()} disabled={isLimitReached}>
          <Plus /> Add User
        </Button>
      </DialogTrigger>
      {isLimitReached && (
        <div className="text-red-500 text-xs mt-1">
          You have reached your user limit for this plan. Please upgrade your plan to add more users.
        </div>
      )}
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>Add new user</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} method="post">
              <div className="grid grid-cols-2 gap-2 mt-3">
                <FormField
                  control={form.control}
                  name="firstName"
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
                  name="lastName"
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

              <div className="grid grid-cols-2 gap-2 mt-3">
                <FormField
                  control={form.control}
                  name="email"
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
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <FormField
                  control={form.control}
                  name="sendCredentials"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-center space-x-2 mt-2">
                          <Checkbox
                            id="terms"
                            className="h-5 w-5 text-blue-500 border-gray-300"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <Label htmlFor="terms" className="text-gray-600">
                            Send credentials on email
                          </Label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-10 w-full flex justify-end gap-2">
                <DialogClose asChild>
                  <Button
                    disabled={isLoading}
                    type="button"
                    variant={"outline"}
                    size="lg"
                    className="w-full md:w-fit"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  disabled={isLoading}
                  type="submit"
                  size="lg"
                  className="w-full md:w-fit"
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isLoading ? "Saving" : "Save"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
