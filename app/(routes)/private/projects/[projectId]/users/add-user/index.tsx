"use client";

import { Button } from "@/components/ui/button";
import {
    Loader2,
    Plus,
} from "lucide-react";
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
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
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

const projectSchema = z.object({
    userId: z.string().min(1, "User is required"),
    role: z.string().optional()
});

export function AddProjectUser({ refreshProjectUsers }: { refreshProjectUsers: () => void }) {
    const [sheetOpen, setSheetOpen] = useState(false);
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
            setSheetOpen(false);
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
    }

    const getSelectedUser = (field: any) => {
        const selectedUser = users?.find(user => user?.id === field.value);
        return getUsernameWithUserId(selectedUser)
    }


    useEffect(() => {
        if (projectId && sheetOpen) {
            getUsers();
        }
    }, [projectId, sheetOpen]);

    const refreshUsers = () => {
        getUsers();
    };

    useEffect(() => {
        if (!sheetOpen) {
            localStorage.removeItem("userId");
        }
    }, [sheetOpen])

    useEffect(() => {
        form.setValue("userId", storedUserId);
    }, [storedUserId]);

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
                <Button onClick={() => resetForm()}>
                    <Plus /> Assign user
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full !max-w-full md:w-[580px] md:!max-w-[580px] overflow-y-auto">
                <SheetHeader>
                    <div className="flex justify-between w-full">
                        <SheetTitle className="text-left">Assign new user</SheetTitle>
                        <div className="flex items-center mr-6">
                            <AddUser refreshUsers={refreshUsers} />
                        </div>
                    </div>
                </SheetHeader>

                <div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} method="post">
                            <div className="grid grid-cols-1 gap-2 mt-3">
                                <FormField
                                    control={form.control}
                                    name="userId"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Select user</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value || storedUserId || undefined}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select user">
                                                        {
                                                            users
                                                                .filter(user => user.id === (field.value || storedUserId))
                                                                .map(user => getUsernameWithUserId(user))[0] || "Select user"
                                                        }
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {!isViewLoading ? (
                                                        <SelectGroup>
                                                            {(Array.isArray(users) ? users : [])
                                                                .filter(user => user.customId)
                                                                .length > 0 ? (
                                                                (Array.isArray(users) ? users : [])
                                                                    .filter(user => user.customId)
                                                                    .map(user => (
                                                                        <SelectItem key={user.id} value={user.id as string}>
                                                                            {getUsernameWithUserId(user)}
                                                                        </SelectItem>
                                                                    ))
                                                            ) : (
                                                                <p className="text-center">No tester found</p>
                                                            )}
                                                        </SelectGroup>
                                                    ) : (
                                                        <p className="text-center h-12 flex items-center justify-center">
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        </p>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-1 mt-4">
                                <FormField
                                    control={form.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Project user role</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value || undefined}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select role (optional)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {PROJECT_USER_ROLE_LIST.map((role) => (
                                                            <SelectItem key={role} value={role}>
                                                                <div className="flex items-center">
                                                                    {role}
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

                            <div className="mt-6 w-full flex justify-end gap-2">
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
                                    onClick={() => validateIssue()}
                                    className="w-full md:w-fit"
                                >
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    {isLoading ? "Saving" : "Save user"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>

            </SheetContent>
        </Sheet>
    );
}