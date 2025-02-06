"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
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
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
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
import {
    PRIORITY_LIST,
    TASK_STATUS_LIST,
} from "@/app/_constants/issue";
import { useParams } from "next/navigation";
import { displayIcon } from "@/app/_utils/common-functionality";
import TextEditor from "@/app/(routes)/private/projects/_components/text-editor";
import { IIssue } from "@/app/_interface/issue";
import { IProjectUserDisplay } from "@/app/_interface/project";
import { getProjectUsersService } from "@/app/_services/project.service";
import { getUsernameWithUserId } from "@/app/_utils/common";
import { ProjectUserRoles } from "@/app/_constants/project-user-roles";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";
import { getIssuesWithoutPaginationService } from "@/app/_services/issue.service";
import { updateTaskService } from "@/app/_services/task.service";
import { ITask } from "@/app/_interface/task";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { IRequirement } from "@/app/_interface/requirement";
import { getRequirementsWithoutPaginationService } from "@/app/_services/requirement.service";

const taskSchema = z.object({
    title: z.string().min(1, "Required"),
    priority: z.string().min(1, "Required"),
    status: z.string().min(1, "Required"),
    description: z.string().min(1, "Required"),
    issueId: z.string().nullable(),
    assignedTo: z.string().optional(),
});

export function EditTask({
    refreshTasks,
    task,
    sheetOpen,
    setSheetOpen
}: {
    refreshTasks: () => void, task: ITask, sheetOpen: boolean;
    setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const taskId = task?.id;
    const requirementsData = task?.requirementIds;
    const { data } = useSession();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { projectId } = useParams<{ projectId: string }>();
    const [issues, setIssues] = useState<IIssue[]>([]);
    const [isViewLoading, setIsViewLoading] = useState<boolean>(false);
    const [users, setUsers] = useState<IProjectUserDisplay[]>([]);
    const [userProjectRole, setUserProjectRole] =
        useState<ProjectUserRoles | null>(null);
    const [requirements, setRequirements] = useState<IRequirement[]>([]);
    const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
    const [isRequirementLoading, setIsRequirementLoading] = useState<boolean>(false);

    useEffect(() => {
        const initialSelectedRequirements = requirementsData?.map((req: any) =>
            req._id ? req._id : ""
        );
        setSelectedRequirements(initialSelectedRequirements);
    }, [requirementsData]);

    useEffect(() => {
        if (data && users?.length) {
            const { user } = data;
            const userObj: any = { ...user };
            if (userObj.role === UserRoles.ADMIN) {
                setUserProjectRole(ProjectUserRoles.ADMIN);
            } else if (userObj.role === UserRoles.CLIENT) {
                setUserProjectRole(ProjectUserRoles.CLIENT);
            } else {
                setUserProjectRole(
                    (users.find((userEl) => userEl.userId?._id === userObj._id)
                        ?.role as ProjectUserRoles) || ProjectUserRoles.TESTER
                );
            }
        }
    }, [data, users]);

    const form = useForm<z.infer<typeof taskSchema>>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: task?.title || "",
            priority: task?.priority || "",
            status: task?.status || "",
            description: task?.description || "",
            issueId: task?.issueId?._id || null,
            assignedTo: task?.assignedTo?._id || "",
        },
    });

    useEffect(() => {
        if (task) {
            form.reset({
                title: task.title || "",
                priority: task.priority || "",
                status: task.status || "",
                description: task.description || "",
                issueId: task?.issueId?._id || null,
                assignedTo: task.assignedTo?._id || "",
            });
        }
    }, [task, form.reset]);

    async function onSubmit(values: z.infer<typeof taskSchema>) {
        setIsLoading(true);
        try {
            const response = await updateTaskService(projectId, taskId, {
                ...values,
                requirementIds: selectedRequirements,
            });
            if (response) {
                refreshTasks();
                resetForm();
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
            setSheetOpen(false);
        }
    }

    const resetForm = () => {
        form.reset();
        setSelectedRequirements([]);
    };

    const validateTask = () => {
        if (form.formState.isValid) {
            form.handleSubmit(onSubmit)();
        }
    };

    const getIssues = async () => {
        setIsViewLoading(true);
        try {
            const response = await getIssuesWithoutPaginationService(projectId);
            if (response) {
                setIssues(response);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsViewLoading(false);
        }
    }

    const getProjectUsers = async () => {
        setIsViewLoading(true);
        try {
            const projectUsers = await getProjectUsersService(projectId);
            if (projectUsers?.users?.length) {
                setUsers(projectUsers.users);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsViewLoading(false);
        }
    };

    const getRequirements = async () => {
        setIsRequirementLoading(true);
        try {
            const response = await getRequirementsWithoutPaginationService(projectId);
            if (response) {
                setRequirements(response);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsRequirementLoading(false);
        }
    };

    useEffect(() => {
        if (sheetOpen) {
            getProjectUsers();
            getIssues();
            getRequirements();
        }
    }, [sheetOpen]);

    const getSelectedUser = (field: any) => {
        const selectedUser = users?.find(
            (user) => user?.userId?._id === field.value
        );
        return getUsernameWithUserId(selectedUser);
    };

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="w-full !max-w-full md:w-[580px] md:!max-w-[580px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-left">Edit task</SheetTitle>
                </SheetHeader>

                <div className="mt-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} method="post">
                            <div className="grid grid-cols-1 gap-2">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Task title</FormLabel>
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
                                    name="priority"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Priority</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value ?? undefined}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {PRIORITY_LIST.map((priority) => (
                                                            <SelectItem value={priority}>
                                                                <div className="flex items-center">
                                                                    <span className="mr-1">
                                                                        {displayIcon(priority)}
                                                                    </span>
                                                                    {priority}
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

                                <FormField
                                    control={form.control}
                                    name="issueId"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Issue</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value ?? undefined}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {issues.length > 0 ? (
                                                            issues.map((issue) => (
                                                                <SelectItem
                                                                    key={issue.id}
                                                                    value={issue.id as string}
                                                                >
                                                                    <div
                                                                        title={issue?.title}
                                                                        className="flex items-center">
                                                                        {issue?.customId} - {issue?.title.length > 30 ? `${issue?.title.substring(0, 30)}...` : issue?.title}
                                                                    </div>
                                                                </SelectItem>
                                                            ))
                                                        ) : (
                                                            <div className="p-1 text-center text-gray-500">
                                                                Issue not found
                                                            </div>
                                                        )}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className={`grid grid-cols-${userProjectRole === ProjectUserRoles.ADMIN ||
                                userProjectRole === ProjectUserRoles.CLIENT ? 2 : 1} gap-2 mt-3`}>
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Status</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {TASK_STATUS_LIST.map((status) => (
                                                            <SelectItem
                                                                key={status}
                                                                value={status as string}
                                                            >
                                                                <div className="flex items-center">
                                                                    {status}
                                                                </div>
                                                            </SelectItem>
                                                        ))
                                                        }
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {userProjectRole === ProjectUserRoles.ADMIN ||
                                    userProjectRole === ProjectUserRoles.CLIENT ? (
                                    <div className="grid grid-cols-1 gap-2">
                                        <FormField
                                            control={form.control}
                                            name="assignedTo"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>Assignee</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue>{getSelectedUser(field)}</SelectValue>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                {users.length > 0 ? (
                                                                    users.map((user) => (
                                                                        <SelectItem
                                                                            key={user._id}
                                                                            value={user?.userId?._id as string}
                                                                        >
                                                                            {getUsernameWithUserId(user)}
                                                                        </SelectItem>
                                                                    ))
                                                                ) : (
                                                                    <div className="p-1 text-center text-gray-500">
                                                                        Users not found
                                                                    </div>
                                                                )}
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                ) : null}
                            </div>

                            <div className="grid grid-cols-1 gap-2 mt-4">
                                <Label>
                                    Requirements
                                </Label>
                                <MultiSelect
                                    options={requirements?.map((requirement) => ({
                                        label: typeof requirement?.title === "string" ? requirement.title : "",
                                        value: typeof requirement?.id === "string" ? requirement.id : "",
                                    }))}
                                    onValueChange={(selectedValues) => {
                                        setSelectedRequirements(selectedValues);
                                    }}
                                    defaultValue={selectedRequirements}
                                    placeholder={isRequirementLoading ? "Loading" : (requirements?.length === 0 ? "No requirements found" : "")}
                                    disabled={requirements?.length === 0}
                                    variant="secondary"
                                    animation={2}
                                    maxCount={3}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-2 mt-4">
                                <FormField
                                    control={form.control}
                                    name="description"
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
                                                />
                                            </FormControl>
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
                                    onClick={() => validateTask()}
                                    className="w-full md:w-fit"
                                >
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    {isLoading ? "Updating" : "Update"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    );
}
