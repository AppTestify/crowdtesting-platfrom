"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarIcon, Loader2, Plus } from "lucide-react";
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
import {
    PRIORITY_LIST,
    TASK_STATUS_LIST,
} from "@/app/_constants/issue";
import { useParams } from "next/navigation";
import { displayIcon } from "@/app/_utils/common-functionality";
import TextEditor from "@/app/(routes)/private/projects/_components/text-editor";
import { ColumnDef } from "@tanstack/react-table";
import { IIssue, IIssueAttachmentDisplay } from "@/app/_interface/issue";
import { DocumentName } from "@/app/_components/document-name";
import { IProjectUserDisplay } from "@/app/_interface/project";
import { getProjectUsersService } from "@/app/_services/project.service";
import { getUsernameWithUserId } from "@/app/_utils/common";
import { ProjectUserRoles } from "@/app/_constants/project-user-roles";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";
import { getIssuesWithoutPaginationService } from "@/app/_services/issue.service";
import { addTaskService } from "@/app/_services/task.service";
import { getRequirementsWithoutPaginationService } from "@/app/_services/requirement.service";
import { IRequirement } from "@/app/_interface/requirement";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

const taskSchema = z.object({
    title: z.string().min(1, "Required"),
    priority: z.string().min(1, "Required"),
    status: z.string().min(1, "Required"),
    description: z.string().min(1, "Required"),
    issueId: z.string().nullable(),
    assignedTo: z.string().optional(),
    startDate: z.date().nullable(),
    endDate: z.date().nullable(),
});

export function AddTask({ refreshTasks }: { refreshTasks: () => void }) {
    const { data } = useSession();
    const [sheetOpen, setSheetOpen] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { projectId } = useParams<{ projectId: string }>();
    const [issues, setIssues] = useState<IIssue[]>([]);
    const [isViewLoading, setIsViewLoading] = useState<boolean>(false);
    const [isIssuesView, setIsIssuesView] = useState<boolean>(false);
    const [requirements, setRequirements] = useState<IRequirement[]>([]);
    const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
    const [users, setUsers] = useState<IProjectUserDisplay[]>([]);
    const [isRequirementLoading, setIsRequirementLoading] = useState<boolean>(false);
    const [userProjectRole, setUserProjectRole] =
        useState<ProjectUserRoles | null>(null);


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
            title: "",
            priority: "",
            status: "",
            description: "",
            issueId: null,
            assignedTo: "",
            startDate: null,
            endDate: null
        },
    });

    async function onSubmit(values: z.infer<typeof taskSchema>) {
        setIsLoading(true);
        try {
            const response = await addTaskService(projectId, {
                ...values,
                startDate: values.startDate ? values.startDate.toISOString() : null,
                endDate: values.endDate ? values.endDate.toISOString() : null,
                requirementIds: selectedRequirements
            });
            if (response) {
                refreshTasks();
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
            setSheetOpen(false);
        }
    }

    const validateIssue = () => {
        if (form.formState.isValid) {
            form.handleSubmit(onSubmit)();
        }
    };

    const resetForm = () => {
        form.reset();
        setSelectedRequirements([]);
    };

    const getIssues = async () => {
        setIsIssuesView(true);
        try {
            const response = await getIssuesWithoutPaginationService(projectId);
            if (response) {
                setIssues(response);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsIssuesView(false);
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
            getRequirements();
            getIssues();
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
            <SheetTrigger asChild>
                <Button onClick={() => resetForm()}>
                    <Plus /> Add task
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full !max-w-full md:w-[580px] md:!max-w-[580px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-left">Add new task</SheetTitle>
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
                                                                    <div title={issue?.title}
                                                                        className="flex items-center"
                                                                    >
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

                            <div className="grid grid-cols-2 gap-2 mt-3">
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Start date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>Start date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value || undefined}
                                                        onSelect={field.onChange}
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
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>End date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value || undefined}
                                                        onSelect={field.onChange}
                                                        disabled={(date) =>
                                                            date < (form.watch("startDate") ?? new Date("1900-01-01")) ||
                                                            date < new Date("1900-01-01")
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
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
                                    onValueChange={setSelectedRequirements}
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
                                    onClick={() => validateIssue()}
                                    className="w-full md:w-fit"
                                >
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    {isLoading ? "Saving" : "Save"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    );
}
