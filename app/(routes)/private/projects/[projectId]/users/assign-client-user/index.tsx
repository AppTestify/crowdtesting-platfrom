"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Users } from "lucide-react";
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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
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
import { PROJECT_USER_ROLE_LIST } from "@/app/_constants/project-user-roles";
import { getClientUsersService, assignClientUserToProjectService } from "@/app/_services/user.service";
import { IUserByAdmin } from "@/app/_interface/user";
import { useParams } from "next/navigation";

const assignSchema = z.object({
  userId: z.string().min(1, "User is required"),
  role: z.string().optional().or(z.literal("")),
});

export function AssignClientUserToProject({ refreshProjectUsers }: { refreshProjectUsers: () => void }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);
  const [clientUsers, setClientUsers] = useState<IUserByAdmin[]>([]);
  const { projectId } = useParams<{ projectId: string }>();

  const form = useForm<z.infer<typeof assignSchema>>({
    resolver: zodResolver(assignSchema),
    defaultValues: {
      userId: "",
      role: "",
    },
  });

  // Fetch client's users
  const getClientUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const response = await getClientUsersService(1, 100); // Get all users
      if (response?.users) {
        setClientUsers(response.users);
      }
    } catch (error) {
      toasterService.error("Failed to fetch users");
      setClientUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  async function onSubmit(values: z.infer<typeof assignSchema>) {
    setIsLoading(true);
    try {
      const response = await assignClientUserToProjectService(
        projectId,
        values.userId,
        values.role ?? ""
      );

      if (response) {
        refreshProjectUsers();
        toasterService.success("User assigned successfully");
        setDialogOpen(false);
        form.reset();
      }
    } catch (error) {
      toasterService.error("Failed to assign user");
    } finally {
      setIsLoading(false);
    }
  }

  const resetForm = () => {
    form.reset();
  };

  useEffect(() => {
    if (dialogOpen) {
      getClientUsers();
    }
  }, [dialogOpen]);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => resetForm()}>
          <Users className="h-4 w-4 mr-2" />
          Assign User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>Assign User to Project</DialogTitle>
          <DialogDescription>
            Select a user from your team to assign to this project
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} method="post">
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select User</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a user" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {isLoadingUsers ? (
                              <div className="p-2 text-center text-gray-500">
                                Loading users...
                              </div>
                            ) : clientUsers.length > 0 ? (
                              clientUsers
                                .filter((user): user is IUserByAdmin & { id: string } => 
                                  Boolean(user.id && user.id.trim() !== '')
                                )
                                .map((user) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.customId ? `${user.customId} ` : ''}{user.firstName} {user.lastName}
                                  </SelectItem>
                                ))
                            ) : (
                              <div className="p-2 text-center text-gray-500">
                                No users found in your team
                              </div>
                            )}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Role</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {PROJECT_USER_ROLE_LIST.map((role) => (
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

              <div className="mt-6 flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </DialogClose>
                <Button disabled={isLoading} type="submit">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? "Assigning..." : "Assign User"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
} 