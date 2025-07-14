"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Plus, Users, UserPlus, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import toasterService from "@/app/_services/toaster-service";
import {
  Form,
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
import { useParams } from "next/navigation";
import { getUsersWithoutPaginationService } from "@/app/_services/user.service";
import { IUserByAdmin } from "@/app/_interface/user";
import { PROJECT_USER_ROLE_LIST } from "@/app/_constants/project-user-roles";
import { addProjectUserService } from "@/app/_services/project.service";
import { getUsernameWithUserId } from "@/app/_utils/common";
import { AddUser } from "@/app/(routes)/private/users/_components/add-user";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const projectSchema = z.object({
  userId: z.string().min(1, "User is required"),
  role: z.string().optional(),
});

export function AddProjectUser({
  refreshProjectUsers,
}: {
  refreshProjectUsers: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isViewLoading, setIsViewLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<IUserByAdmin[]>([]);
  const { projectId } = useParams<{ projectId: string }>();
  const storedUserId = localStorage.getItem("userId") || "";

    const form = useForm<z.infer<typeof projectSchema>>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            userId: undefined,
            role: undefined
        },
    });

  async function onSubmit(values: z.infer<typeof projectSchema>) {
    setIsLoading(true);
    try {
      const response = await addProjectUserService(projectId, { ...values });
      if (response) {
        refreshProjectUsers();
        toasterService.success(response.message);
      }
    } catch (error) {
      toasterService.error();
    } finally {
      setIsLoading(false);
      setDialogOpen(false);
      localStorage.removeItem("userId");
    }
  }

  const validateIssue = () => {
    if (form.formState.isValid) {
      form.handleSubmit(onSubmit);
    }
  };

  const resetForm = () => {
    form.reset();
  };

  const getUsers = async () => {
    try {
      setIsViewLoading(true);
      const response = await getUsersWithoutPaginationService(projectId);
      if (response?.message) {
        setUsers([]);
      } else if (response) {
        setUsers(response);
      }
    } catch (error) {
      toasterService.error();
    } finally {
      setIsViewLoading(false);
    }
  };

  const getSelectedUser = (field: any): string => {
    const selectedUser = users?.find((user) => user?.id === field.value);
    return getUsernameWithUserId(selectedUser);
  };

  useEffect(() => {
    if (projectId && dialogOpen) {
      getUsers();
    }
  }, [projectId, dialogOpen]);

  const refreshUsers = () => {
    getUsers();
  };

  useEffect(() => {
    if (!dialogOpen) {
      localStorage.removeItem("userId");
    }
  }, [dialogOpen]);

  useEffect(() => {
    form.setValue("userId", storedUserId);
  }, [storedUserId]);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          onClick={() => resetForm()}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Assign User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl w-full p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 border-b">
          <DialogHeader className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Assign New User
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Select a user to assign to this project and optionally set their role.
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Shield className="mr-1 h-3 w-3" />
                Project Assignment
              </Badge>
              <div className="flex items-center space-x-2">
                <AddUser refreshUsers={refreshUsers} />
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} method="post">
              <div className="space-y-6">
                <Card className="border-0 shadow-sm bg-gray-50/50">
                  <CardContent className="p-4">
                    <FormField
                      control={form.control}
                      name="userId"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-sm font-semibold text-gray-700 flex items-center">
                            <Users className="mr-2 h-4 w-4 text-blue-600" />
                            Select User
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || storedUserId || undefined}
                          >
                            <SelectTrigger className="w-full h-12 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors">
                              <SelectValue placeholder="Choose a user to assign">
                                {
                                  users
                                    .filter(user => user.id === (field.value || storedUserId))
                                    .map(user => getUsernameWithUserId(user))[0] || "Choose a user to assign"
                                }
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                              {!isViewLoading ? (
                                <SelectGroup>
                                  {(Array.isArray(users) ? users : [])
                                    .filter(user => user.customId)
                                    .length > 0 ? (
                                    (Array.isArray(users) ? users : [])
                                      .filter(user => user.customId)
                                      .map(user => (
                                        <SelectItem key={user.id} value={user.id as string} className="py-3">
                                          <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                              {getUsernameWithUserId(user).charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                              <div className="font-medium">{getUsernameWithUserId(user)}</div>
                                              <div className="text-xs text-gray-500">{user.customId}</div>
                                            </div>
                                          </div>
                                        </SelectItem>
                                      ))
                                  ) : (
                                    <div className="p-4 text-center text-gray-500">
                                      <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                      <p>No users available</p>
                                    </div>
                                  )}
                                </SelectGroup>
                              ) : (
                                <div className="p-4 text-center">
                                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" />
                                  <p className="text-sm text-gray-500 mt-2">Loading users...</p>
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-gray-50/50">
                  <CardContent className="p-4">
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-sm font-semibold text-gray-700 flex items-center">
                            <Shield className="mr-2 h-4 w-4 text-purple-600" />
                            Project Role (Optional)
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || undefined}
                          >
                            <SelectTrigger className="w-full h-12 border-2 border-gray-200 hover:border-purple-300 focus:border-purple-500 transition-colors">
                              <SelectValue placeholder="Select a role for this user" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {PROJECT_USER_ROLE_LIST.map((role) => (
                                  <SelectItem key={role} value={role} className="py-3">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                                        <Shield className="h-3 w-3 text-purple-600" />
                                      </div>
                                      <span className="font-medium">{role}</span>
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
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-4 border-t">
                <DialogClose asChild>
                  <Button
                    disabled={isLoading}
                    type="button"
                    variant="outline"
                    size="lg"
                    className="px-6 py-2 border-2 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  disabled={isLoading}
                  type="submit"
                  size="lg"
                  onClick={() => validateIssue()}
                  className="px-6 py-2 !bg-gradient-to-r !from-blue-600 !to-purple-600 hover:!from-blue-700 hover:!to-purple-700 !text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="mr-2 h-4 w-4" />
                  )}
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
