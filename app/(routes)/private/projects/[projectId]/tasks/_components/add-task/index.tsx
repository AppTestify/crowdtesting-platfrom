"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarIcon, Loader2, Plus, CheckSquare, AlertTriangle, FileText, Users, Save, Target, Calendar } from "lucide-react";
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
    DialogContent,
    DialogDescription,
    DialogFooter,
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
import {
    PRIORITY_LIST,
    TASK_STATUS_LIST,
} from "@/app/_constants/issue";
import { useParams } from "next/navigation";
import { displayIcon } from "@/app/_utils/common-functionality";
import TextEditor from "@/app/(routes)/private/projects/_components/text-editor";
import { IIssue } from "@/app/_interface/issue";
import { IProjectUserDisplay } from "@/app/_interface/project";
import { getProjectUsersListService } from "@/app/_services/project.service";
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
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
    const [dialogOpen, setDialogOpen] = useState(false);
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
    const [startDateOpen, setStartDateOpen] = useState(false);
    const [endDateOpen, setEndDateOpen] = useState(false);

    useEffect(() => {
        if (data && users?.length) {
            const { user } = data;
            const userObj: any = { ...user };
            if (userObj.role === UserRoles.ADMIN) {
                setUserProjectRole(ProjectUserRoles.ADMIN);
            } else if (userObj.role === UserRoles.CLIENT && userObj.role === UserRoles.MANAGER && userObj.role === UserRoles.DEVELOPER) {
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
            setDialogOpen(false);
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
        setStartDateOpen(false);
        setEndDateOpen(false);
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
            const projectUsers = await getProjectUsersListService(projectId);
            if (projectUsers?.data?.users?.length) {
                setUsers(projectUsers.data.users);
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
        if (dialogOpen) {
            getProjectUsers();
            getRequirements();
            getIssues();
            setStartDateOpen(false);
            setEndDateOpen(false);
        }
    }, [dialogOpen]);

    const getSelectedUser = (field: any) => {
        const selectedUser = users?.find(
            (user) => user?.userId?._id === field.value
        );
        return getUsernameWithUserId(selectedUser);
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button onClick={() => resetForm()} className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="h-4 w-4 mr-2" /> Add Task
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-6">
                    {/* Enhanced Header with Gradient Background */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-6 border border-green-100">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100/50 to-emerald-100/50 rounded-full -translate-y-16 translate-x-16"></div>
                        <div className="relative flex items-start gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                                <CheckSquare className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <Badge variant="outline" className="bg-white/80 border-green-200 text-green-700">
                                        New Task
                                    </Badge>
                                </div>
                                <DialogTitle className="text-2xl font-bold text-gray-900 mb-3">
                                    Create New Task
                                </DialogTitle>
                                <DialogDescription className="text-gray-600">
                                    Define a new task with priority, timeline, and assignment details
                                </DialogDescription>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="mt-8 space-y-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} method="post">
                            {/* Basic Information Card */}
                            <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Target className="h-5 w-5 text-blue-600" />
                                        Basic Information
                                    </CardTitle>
                                    <p className="text-sm text-gray-600">
                                        Provide essential details about the task
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium text-gray-700">
                                                    Task Title *
                                                </FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        {...field} 
                                                        placeholder="Enter a descriptive title for the task"
                                                        className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="priority"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel className="text-sm font-medium text-gray-700">Priority *</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value ?? undefined}
                                                    >
                                                        <SelectTrigger className="w-full border-gray-300 focus:border-green-500 focus:ring-green-500">
                                                            <SelectValue placeholder="Select priority" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                {PRIORITY_LIST.map((priority) => (
                                                                    <SelectItem key={priority} value={priority}>
                                                                        <div className="flex items-center">
                                                                            <span className="mr-2">
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
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel className="text-sm font-medium text-gray-700">Status *</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                    >
                                                        <SelectTrigger className="w-full border-gray-300 focus:border-green-500 focus:ring-green-500">
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                {TASK_STATUS_LIST.map((status) => (
                                                                    <SelectItem key={status} value={status as string}>
                                                                        <div className="flex items-center">
                                                                            {status}
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
                                </CardContent>
                            </Card>

                            {/* Timeline Card */}
                            <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-purple-600" />
                                        Timeline
                                    </CardTitle>
                                    <p className="text-sm text-gray-600">
                                        Set start and end dates for the task
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="startDate"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel className="text-sm font-medium text-gray-700">Start Date</FormLabel>
                                                    <Popover open={startDateOpen} onOpenChange={setStartDateOpen} modal={true}>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn(
                                                                        "w-full pl-3 text-left font-normal border-gray-300 focus:border-green-500 focus:ring-green-500",
                                                                        !field.value && "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    {field.value ? (
                                                                        format(field.value, "PPP")
                                                                    ) : (
                                                                        <span>Select start date</span>
                                                                    )}
                                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0 z-50" align="start" side="bottom">
                                                            <CalendarComponent
                                                                mode="single"
                                                                selected={field.value || undefined}
                                                                onSelect={(date) => {
                                                                    field.onChange(date);
                                                                    setStartDateOpen(false);
                                                                }}
                                                                disabled={(date: Date) => date < new Date("1900-01-01")}
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
                                                    <FormLabel className="text-sm font-medium text-gray-700">End Date</FormLabel>
                                                    <Popover open={endDateOpen} onOpenChange={setEndDateOpen} modal={true}>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn(
                                                                        "w-full pl-3 text-left font-normal border-gray-300 focus:border-green-500 focus:ring-green-500",
                                                                        !field.value && "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    {field.value ? (
                                                                        format(field.value, "PPP")
                                                                    ) : (
                                                                        <span>Select end date</span>
                                                                    )}
                                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0 z-50" align="start" side="bottom">
                                                            <CalendarComponent
                                                                mode="single"
                                                                selected={field.value || undefined}
                                                                onSelect={(date) => {
                                                                    field.onChange(date);
                                                                    setEndDateOpen(false);
                                                                }}
                                                                disabled={(date: Date) =>
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
                                </CardContent>
                            </Card>

                            {/* Related Items Card */}
                            <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-orange-600" />
                                        Related Items
                                    </CardTitle>
                                    <p className="text-sm text-gray-600">
                                        Link to issues and requirements
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="issueId"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className="text-sm font-medium text-gray-700">Related Issue</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value ?? undefined}
                                                >
                                                    <SelectTrigger className="w-full border-gray-300 focus:border-green-500 focus:ring-green-500">
                                                        <SelectValue placeholder="Select related issue (optional)" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {issues.length > 0 ? (
                                                                issues.map((issue) => (
                                                                    <SelectItem
                                                                        key={issue.id}
                                                                        value={issue.id as string}
                                                                    >
                                                                        <div title={issue?.title} className="flex items-center">
                                                                            {issue?.customId} - {issue?.title.length > 30 ? `${issue?.title.substring(0, 30)}...` : issue?.title}
                                                                        </div>
                                                                    </SelectItem>
                                                                ))
                                                            ) : (
                                                                <div className="p-1 text-center text-gray-500">
                                                                    No issues found
                                                                </div>
                                                            )}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700">
                                            Requirements
                                        </Label>
                                        <MultiSelect
                                            options={requirements?.map((requirement) => ({
                                                label: typeof requirement?.title === "string" ? requirement.title : "",
                                                value: typeof requirement?.id === "string" ? requirement.id : "",
                                            }))}
                                            onValueChange={setSelectedRequirements}
                                            defaultValue={selectedRequirements}
                                            placeholder={isRequirementLoading ? "Loading requirements..." : (requirements?.length === 0 ? "No requirements found" : "Select requirements (optional)")}
                                            disabled={requirements?.length === 0}
                                            variant="secondary"
                                            animation={2}
                                            maxCount={3}
                                            className="w-full"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Assignment Card */}
                            {(userProjectRole === ProjectUserRoles.ADMIN || userProjectRole === ProjectUserRoles.CLIENT) && (
                                <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <Users className="h-5 w-5 text-green-600" />
                                            Assignment
                                        </CardTitle>
                                        <p className="text-sm text-gray-600">
                                            Assign the task to a team member
                                        </p>
                                    </CardHeader>
                                    <CardContent>
                                        <FormField
                                            control={form.control}
                                            name="assignedTo"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel className="text-sm font-medium text-gray-700">Assignee</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                    >
                                                        <SelectTrigger className="w-full border-gray-300 focus:border-green-500 focus:ring-green-500">
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
                                    </CardContent>
                                </Card>
                            )}

                            {/* Description Card */}
                            <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                                        Description *
                                    </CardTitle>
                                    <p className="text-sm text-gray-600">
                                        Provide detailed information about the task
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
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
                                </CardContent>
                            </Card>

                            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6">
                                <Button
                                    disabled={isLoading}
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    onClick={() => setDialogOpen(false)}
                                    className="w-full sm:w-auto border-gray-300 hover:bg-gray-50"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    disabled={isLoading}
                                    type="submit"
                                    size="lg"
                                    onClick={() => validateIssue()}
                                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                                >
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    {isLoading ? "Creating..." : "Create Task"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
