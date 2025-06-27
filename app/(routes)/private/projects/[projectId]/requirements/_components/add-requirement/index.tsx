"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    CalendarIcon,
    Loader2,
    Plus,
    Trash,
    FileText,
    User,
    Calendar,
    Upload,
    X,
    Paperclip,
} from "lucide-react";
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
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useParams } from "next/navigation";
import TextEditor from "@/app/(routes)/private/projects/_components/text-editor";
import { Label } from "@/components/ui/label";
import { ColumnDef } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { DocumentName } from "@/app/_components/document-name";
import { addRequirementService } from "@/app/_services/requirement.service";
import { IRequirementAttachmentDisplay } from "@/app/_interface/requirement";
import { ProjectUserRoles } from "@/app/_constants/project-user-roles";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { IProjectUserDisplay } from "@/app/_interface/project";
import { getProjectUsersListService, getProjectUsersService } from "@/app/_services/project.service";
import { UserRoles } from "@/app/_constants/user-roles";
import { getUsernameWithUserId } from "@/app/_utils/common";
import { TASK_STATUS_LIST } from "@/app/_constants/issue";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AIRefinement from "@/app/_components/ai-refinement";

const projectSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
    description: z.string().min(1, "Description is required"),
    projectId: z.string().optional(),
    attachments: z
        .array(z.instanceof(File))
        .optional(),
    assignedTo: z.string().optional(),
    status: z.string().min(1, 'Status is required'),
    startDate: z.date().nullable(),
    endDate: z.date().nullable(),
});

export function AddRequirement({ refreshRequirements }: { refreshRequirements: () => void }) {
    const columns: ColumnDef<IRequirementAttachmentDisplay[]>[] = [
        {
            accessorKey: "name",
            cell: ({ row }) =>
                <div>
                    <DocumentName document={row.getValue("name")} />
                </div>,
        }
    ];

    const { data } = useSession();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { projectId } = useParams<{ projectId: string }>();
    const [attachments, setAttachments] = useState<File[]>([]);
    const [userProjectRole, setUserProjectRole] =
        useState<ProjectUserRoles | null>(null);
    const [users, setUsers] = useState<IProjectUserDisplay[]>([]);

    const form = useForm<z.infer<typeof projectSchema>>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            title: "",
            description: "",
            projectId: projectId,
            attachments: [],
            assignedTo: undefined,
            status: undefined,
            startDate: null,
            endDate: null
        },
    });

    async function onSubmit(values: z.infer<typeof projectSchema>) {
        setIsLoading(true);
        try {
            const response = await addRequirementService(projectId, {
                ...values,
                startDate: values.startDate ? values.startDate.toISOString() : null,
                endDate: values.endDate ? values.endDate.toISOString() : null,
            });
            if (response) {
                refreshRequirements();
                toasterService.success(response.message);
                resetForm();
                setDialogOpen(false);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    }

    const validateRequirement = () => {
        if (form.formState.isValid) {
            form.handleSubmit(onSubmit)();
        }
    };

    const resetForm = () => {
        form.reset();
        setAttachments([]);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files).map((file) => ({
                ...file,
                name: file.name,
                contentType: file.type,
                size: file.size,
                getValue: (key: string) => (key === "contentType" ? file.type : undefined),
            }));
            const fileArray = Array.from(e.target.files);
            setAttachments(prev => [...prev, ...files]);
            form.setValue("attachments", [...attachments, ...fileArray]);
        }
    };

    const handleRemoveFile = (index: number) => {
        const newAttachments = attachments.filter((_, i) => i !== index);
        setAttachments(newAttachments);
        form.setValue("attachments", newAttachments);
    };

    const getSelectedUser = (field: any) => {
        const selectedUser = users?.find(
            (user) => user?.userId?._id === field.value
        );
        return getUsernameWithUserId(selectedUser);
    };

    const getProjectUsers = async () => {
        try {
            const projectUsers = await getProjectUsersListService(projectId);
            if (projectUsers?.data?.users?.length) {
                setUsers(projectUsers.data.users);
            }
        } catch (error) {
            toasterService.error();
        }
    };

    useEffect(() => {
        if (dialogOpen) {
            resetForm();
            getProjectUsers();
        }
    }, [dialogOpen]);

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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 transition-colors" onClick={() => resetForm()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Requirement
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        Create New Requirement
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                        Add a new requirement to track project specifications and deliverables.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Basic Information Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    Basic Information
                                </CardTitle>
                                <CardDescription>
                                    Provide the essential details for this requirement
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-700">
                                                Title *
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter requirement title..."
                                                    {...field}
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
                                                context={`New requirement for project`}
                                            />
                                        </div>
                                        <CardDescription>
                                            Provide a detailed description of what needs to be implemented
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
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <User className="h-5 w-5 text-green-600" />
                                    Assignment & Status
                                </CardTitle>
                                <CardDescription>
                                    Set the assignee and current status of the requirement
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="assignedTo"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium text-gray-700">
                                                    Assign to
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="border-gray-300 focus:border-blue-500">
                                                            <SelectValue placeholder="Select team member..." />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {users?.filter(user => user?.userId?._id).map((user, index) => (
                                                                <SelectItem
                                                                    key={user?.userId?._id || index}
                                                                    value={user?.userId?._id as string}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                                                            {`${user?.userId?.firstName?.[0] || ''}${user?.userId?.lastName?.[0] || ''}`}
                                                                        </div>
                                                                        {getUsernameWithUserId(user)}
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
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium text-gray-700">
                                                    Status *
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="border-gray-300 focus:border-blue-500">
                                                            <SelectValue placeholder="Select status..." />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {TASK_STATUS_LIST.map((status, index) => (
                                                                <SelectItem key={index} value={status}>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={`w-3 h-3 rounded-full ${
                                                                            status === 'Done' ? 'bg-green-500' :
                                                                            status === 'In progress' ? 'bg-yellow-500' :
                                                                            'bg-gray-400'
                                                                        }`}></div>
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
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-purple-600" />
                                    Timeline
                                </CardTitle>
                                <CardDescription>
                                    Set start and end dates for this requirement
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
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
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full pl-3 text-left font-normal border-gray-300 hover:border-blue-500",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value ? (
                                                                    format(field.value, "PPP")
                                                                ) : (
                                                                    <span>Pick a start date</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <CalendarComponent
                                                            mode="single"
                                                            selected={field.value || undefined}
                                                            onSelect={field.onChange}
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
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full pl-3 text-left font-normal border-gray-300 hover:border-blue-500",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value ? (
                                                                    format(field.value, "PPP")
                                                                ) : (
                                                                    <span>Pick an end date</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <CalendarComponent
                                                            mode="single"
                                                            selected={field.value || undefined}
                                                            onSelect={field.onChange}
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
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Paperclip className="h-5 w-5 text-orange-600" />
                                    Attachments
                                </CardTitle>
                                <CardDescription>
                                    Upload supporting documents, images, or files
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <Label htmlFor="file-upload" className="cursor-pointer">
                                        <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                                            Click to upload files
                                        </span>
                                        <span className="text-sm text-gray-500 ml-1">or drag and drop</span>
                                    </Label>
                                    <p className="text-xs text-gray-500 mt-2">PNG, JPG, PDF up to 10MB</p>
                                    <Input
                                        id="file-upload"
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                        className="sr-only"
                                        accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                                    />
                                </div>

                                {attachments.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
                                        <div className="grid grid-cols-1 gap-2">
                                            {attachments.map((file, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                            <Paperclip className="h-4 w-4 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                                                {file.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveFile(index)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <DialogFooter className="flex gap-3 pt-6 border-t border-gray-200">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDialogOpen(false)}
                                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="bg-blue-600 hover:bg-blue-700 transition-colors"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Requirement
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
