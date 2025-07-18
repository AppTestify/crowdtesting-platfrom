import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2, User, Calendar as CalendarLucide, FileText, Settings, X, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TextEditor from "@/app/(routes)/private/projects/_components/text-editor";
import { useSession } from "next-auth/react";
import { updateRequirementService } from "@/app/_services/requirement.service";
import RequirementAttachments from "../attachments/requirement-attachment";
import { IRequirement } from "@/app/_interface/requirement";
import { addRequirementAttachmentsService } from "@/app/_services/requirement-attachment.service";
import { ProjectUserRoles } from "@/app/_constants/project-user-roles";
import { IProject, IProjectUserDisplay } from "@/app/_interface/project";
import { getProjectUsersListService, getProjectUsersService } from "@/app/_services/project.service";
import { UserRoles } from "@/app/_constants/user-roles";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUsernameWithUserId } from "@/app/_utils/common";
import { TASK_STATUS_LIST } from "@/app/_constants/issue";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import AIRefinement from "@/app/_components/ai-refinement";

// Use dynamic import for date-fns to avoid potential SSR issues
import dynamic from "next/dynamic";

// Helper function for date formatting
const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
};

const requirementSchema = z.object({
    title: z.string().min(1, "Required"),
    description: z.string()
        .min(10, "The description must be at least 10 characters long.")
        .nonempty("Required"),
    projectId: z.string().optional(),
    assignedTo: z.string().nullable().optional(),
    status: z.string().min(1, "Required"),
    startDate: z.date().nullable(),
    endDate: z.date().nullable(),
});

const EditRequirement = ({
    requirement,
    sheetOpen,
    setSheetOpen,
    refreshRequirements,
}: {
    requirement: IRequirement;
    sheetOpen: boolean;
    setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
    refreshRequirements: () => void;
}) => {
    const requirementId = requirement?.id as string;
    const { projectId, title, description } = requirement;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [attachments, setAttachments] = useState<any[]>([]);
    const [userData, setUserData] = useState<any>();
    const [userProjectRole, setUserProjectRole] = useState<ProjectUserRoles | null>(null);
    const [users, setUsers] = useState<IProjectUserDisplay[]>([]);
    const { data } = useSession();
    
    const form = useForm<z.infer<typeof requirementSchema>>({
        resolver: zodResolver(requirementSchema),
        defaultValues: {
            title: requirement?.title || "",
            description: requirement?.description || "",
            projectId: requirement?.projectId as unknown as string || "",
            assignedTo: requirement?.assignedTo?._id || undefined,
            status: requirement?.status || undefined,
            startDate: requirement?.startDate ? new Date(requirement.startDate) : null,
            endDate: requirement?.endDate ? new Date(requirement.endDate) : null
        },
    });

    async function onSubmit(values: z.infer<typeof requirementSchema>) {
        setIsLoading(true);
        try {
            const response = await updateRequirementService(projectId as unknown as string, requirementId, {
                ...values,
                assignedTo: values.assignedTo || undefined,
                startDate: values.startDate ? values.startDate.toISOString() : null,
                endDate: values.endDate ? values.endDate.toISOString() : null,
            });
            if (response) {
                refreshRequirements();
                toasterService.success(response?.message);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setSheetOpen(false);
            setIsLoading(false);
        }
    }

    const uploadAttachment = async () => {
        setIsLoading(true);
        try {
            await addRequirementAttachmentsService(projectId as unknown as string, requirementId, { attachments });
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.MouseEvent) => {
        e.preventDefault();
        const isValid = await form.trigger();
        if (!isValid) return;

        const values = form.getValues();
        await onSubmit(values);
        await uploadAttachment();
    };

    const getProjectUsers = async () => {
        try {
            const projectUsers = await getProjectUsersListService(projectId as unknown as string);
            if (projectUsers?.data?.users?.length) {
                setUsers(projectUsers.data.users);
            }
        } catch (error) {
            toasterService.error();
        }
    };

    const getSelectedUser = (field: any) => {
        const selectedUser = users?.find(
            (user) => user?.userId?._id === field.value
        );
        return getUsernameWithUserId(selectedUser);
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'Done':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'In progress':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Blocked':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    useEffect(() => {
        form.register("status");
    }, [form]);

    useEffect(() => {
        if (sheetOpen) {
            if (data) {
                form.reset({
                    title: requirement?.title || "",
                    description: requirement?.description || "",
                    projectId: requirement?.projectId as unknown as string || "",
                    assignedTo: requirement?.assignedTo?._id || undefined,
                    status: requirement?.status || undefined,
                    startDate: requirement?.startDate ? new Date(requirement.startDate) : null,
                    endDate: requirement?.endDate ? new Date(requirement.endDate) : null
                });
                const { user } = data;
                setUserData(user);
                getProjectUsers();
            }
        }
    }, [sheetOpen, requirement]);

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

    return (
        <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                <Settings className="h-6 w-6 text-blue-600" />
                                Edit Requirement
                            </DialogTitle>
                            <p className="text-gray-600 mt-1">Update requirement details and assignments</p>
                        </div>
                        <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                            #{requirement?.customId}
                        </Badge>
                    </div>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Basic Information Card */}
                        <Card className="border-l-4 border-l-blue-500">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    Basic Information
                                </CardTitle>
                                <CardDescription>
                                    Update the requirement title and description
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-700">
                                                Requirement Title *
                                            </FormLabel>
                                            <FormControl>
                                                <Input 
                                                    {...field} 
                                                    placeholder="Enter requirement title..."
                                                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Description Card */}
                                <Card className="border-l-4 border-l-blue-500">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                                <FileText className="h-5 w-5 text-blue-600" />
                                                Description
                                            </CardTitle>
                                            <AIRefinement
                                                currentDescription={form.watch("description") || ""}
                                                onApplyRefinement={(refinedDescription) => {
                                                    form.setValue("description", refinedDescription);
                                                }}
                                                context={`Editing requirement: ${requirement?.title || "Untitled"}`}
                                            />
                                        </div>
                                        <CardDescription>
                                            Update the detailed description of this requirement
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <TextEditor
                                                            markup={field.value}
                                                            onChange={field.onChange}
                                                            placeholder="Describe the requirement in detail..."
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            </CardContent>
                        </Card>

                        {/* Assignment & Status Card */}
                        <Card className="border-l-4 border-l-green-500">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Users className="h-5 w-5 text-green-600" />
                                    Assignment & Status
                                </CardTitle>
                                <CardDescription>
                                    Manage assignee and current status
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium text-gray-700">
                                                    Status *
                                                </FormLabel>
                                                <Select
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                        form.clearErrors("status");
                                                    }}
                                                    value={field.value || ""}
                                                >
                                                    <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                                                        <SelectValue placeholder="Select status">
                                                            {field.value && (
                                                                <Badge className={getStatusBadgeColor(field.value)}>
                                                                    {field.value}
                                                                </Badge>
                                                            )}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {TASK_STATUS_LIST.map((status) => (
                                                                <SelectItem key={status} value={status}>
                                                                    <Badge className={getStatusBadgeColor(status)}>
                                                                        {status}
                                                                    </Badge>
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
                                        name="assignedTo"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium text-gray-700">
                                                    Assignee
                                                </FormLabel>
                                                <Select
                                                    onValueChange={(value) => {
                                                        field.onChange(value === "unassigned" ? "" : value);
                                                    }}
                                                    value={field.value || "unassigned"}
                                                >
                                                    <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                                                        <SelectValue placeholder="Select assignee">
                                                            {field.value ? (
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                                                        {getSelectedUser(field)?.charAt(0) || 'U'}
                                                                    </div>
                                                                    <span>{getSelectedUser(field) || 'Select assignee'}</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-2 text-gray-500">
                                                                    <User className="h-4 w-4" />
                                                                    <span>Unassigned</span>
                                                                </div>
                                                            )}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            <SelectItem value="unassigned">
                                                                <div className="flex items-center gap-2 text-gray-500">
                                                                    <User className="h-4 w-4" />
                                                                    <span>Unassigned</span>
                                                                </div>
                                                            </SelectItem>
                                                            {users.length > 0 ? (
                                                                users.filter(user => user?.userId?._id).map((user) => (
                                                                    <SelectItem
                                                                        key={user._id}
                                                                        value={user?.userId?._id as string}
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                                                                {getUsernameWithUserId(user)?.charAt(0) || 'U'}
                                                                            </div>
                                                                            <span>{getUsernameWithUserId(user)}</span>
                                                                        </div>
                                                                    </SelectItem>
                                                                ))
                                                            ) : (
                                                                <div className="p-2 text-center text-gray-500 text-sm">
                                                                    No users found
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
                            </CardContent>
                        </Card>

                        {/* Timeline Card */}
                        <Card className="border-l-4 border-l-purple-500">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <CalendarLucide className="h-5 w-5 text-purple-600" />
                                    Timeline
                                </CardTitle>
                                <CardDescription>
                                    Set start and end dates for the requirement
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="startDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium text-gray-700">
                                                    Start Date
                                                </FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant="outline"
                                                                className={cn(
                                                                    "w-full pl-3 text-left font-normal border-gray-300 focus:border-purple-500 focus:ring-purple-500",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <CalendarIcon className="h-4 w-4 text-purple-600" />
                                                                        {formatDate(field.value)}
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-2">
                                                                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                                                                        <span>Select start date</span>
                                                                    </div>
                                                                )}
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
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium text-gray-700">
                                                    End Date
                                                </FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant="outline"
                                                                className={cn(
                                                                    "w-full pl-3 text-left font-normal border-gray-300 focus:border-purple-500 focus:ring-purple-500",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <CalendarIcon className="h-4 w-4 text-purple-600" />
                                                                        {formatDate(field.value)}
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-2">
                                                                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                                                                        <span>Select end date</span>
                                                                    </div>
                                                                )}
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
                            </CardContent>
                        </Card>

                        {/* Attachments Card */}
                        <Card className="border-l-4 border-l-orange-500">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-orange-600" />
                                    Attachments
                                </CardTitle>
                                <CardDescription>
                                    Upload or manage requirement attachments
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RequirementAttachments 
                                    requirementId={requirementId} 
                                    isUpdate={true} 
                                    isView={false}
                                    setAttachmentsData={setAttachments} 
                                />
                            </CardContent>
                        </Card>

                        <Separator />

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setSheetOpen(false)}
                                disabled={isLoading}
                                className="border-gray-300 hover:bg-gray-50"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Settings className="h-4 w-4 mr-2" />
                                        Update Requirement
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default EditRequirement;
