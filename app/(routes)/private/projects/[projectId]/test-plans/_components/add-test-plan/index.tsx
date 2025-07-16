"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    CalendarIcon,
    Loader2,
    Plus,
    FileText,
    Users,
    Calendar,
    Settings,
    Trash,
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
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useParams } from "next/navigation";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TESTING_LIST } from "@/app/_constants/test-plan";
import TextEditor from "../../../../_components/text-editor";
import { addTestPlanService } from "@/app/_services/test-plan.service";
import { ProjectUserRoles } from "@/app/_constants/project-user-roles";
import { getProjectUsersListService, getProjectUsersService } from "@/app/_services/project.service";
import { useSession } from "next-auth/react";
import { IProjectUserDisplay } from "@/app/_interface/project";
import { UserRoles } from "@/app/_constants/user-roles";
import { getUsernameWithUserId } from "@/app/_utils/common";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

const testPlanSchema = z.object({
    title: z.string().min(1, "Required"),
    projectId: z.string().optional(),
    parameters: z.array(z.object({
        parameter: z.string().min(1, 'Required'),
        description: z.string().min(1, 'Required')
    })),
    assignedTo: z.string().nullable().optional(),
    startDate: z.date().nullable(),
    endDate: z.date().nullable(),
});

export function AddTestPlan({ refreshTestPlans, userData }: { refreshTestPlans: () => void, userData: any }) {
    const { data } = useSession();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { projectId } = useParams<{ projectId: string }>();
    const [userProjectRole, setUserProjectRole] =
        useState<ProjectUserRoles | null>(null);
    const [users, setUsers] = useState<IProjectUserDisplay[]>([]);

    const form = useForm<z.infer<typeof testPlanSchema>>({
        resolver: zodResolver(testPlanSchema),
        defaultValues: {
            title: "",
            projectId: projectId,
            parameters: [],
            assignedTo: "",
            startDate: null,
            endDate: null
        },
    });

    async function onSubmit(values: z.infer<typeof testPlanSchema>) {
        setIsLoading(true);
        try {
            const response = await addTestPlanService(projectId, {
                ...values,
                assignedTo: values.assignedTo ?? undefined,
            });
            if (response) {
                refreshTestPlans();
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
            setDialogOpen(false);
        }
    }

    const validateTestPlan = () => {
        if (form.formState.isValid) {
            form.handleSubmit(onSubmit)();
        }
    };

    const resetForm = () => {
        form.reset();
    };

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "parameters",
    });

    if (fields.length === 0) {
        append({ parameter: "", description: "" });
    }

    const isFieldIncomplete = (index: number) => {
        const description = form.getValues(`parameters.${index}.description`);
        const parameter = form.getValues(`parameters.${index}.parameter`);
        return !(parameter && description);
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

    useEffect(() => {
        if (!dialogOpen) {
            getProjectUsers();
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
                <Button onClick={() => resetForm()} className="bg-green-600 hover:bg-green-700 transition-colors">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Test Plan
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        Create New Test Plan
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                        Define a comprehensive test plan with parameters, assignments, and timelines for your project.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-6 space-y-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Basic Information Card */}
                            <Card className="border-l-4 border-l-blue-500">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                        Basic Information
                                    </CardTitle>
                                    <CardDescription>
                                        Provide the essential details for this test plan
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium text-gray-700">
                                                    Test Plan Title *
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter test plan title..."
                                                        {...field}
                                                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Assignment & Timeline Card */}
                            <Card className="border-l-4 border-l-green-500">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Users className="h-5 w-5 text-green-600" />
                                        Assignment & Timeline
                                    </CardTitle>
                                    <CardDescription>
                                        Assign the test plan and set the timeline
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {userProjectRole === ProjectUserRoles.ADMIN ||
                                        userProjectRole === ProjectUserRoles.CLIENT ? (
                                        <FormField
                                            control={form.control}
                                            name="assignedTo"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel className="text-sm font-medium text-gray-700">
                                                        Assignee
                                                    </FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value ?? undefined}
                                                    >
                                                        <SelectTrigger className="w-full border-gray-300 focus:border-blue-500">
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
                                    ) : null}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="startDate"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel className="text-sm font-medium text-gray-700">
                                                        Start Date
                                                    </FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn(
                                                                        "w-full pl-3 text-left font-normal border-gray-300 focus:border-blue-500",
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
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <CalendarComponent
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
                                                    <FormLabel className="text-sm font-medium text-gray-700">
                                                        End Date
                                                    </FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn(
                                                                        "w-full pl-3 text-left font-normal border-gray-300 focus:border-blue-500",
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
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <CalendarComponent
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

                            {/* Test Parameters Card */}
                            <Card className="border-l-4 border-l-purple-500">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Settings className="h-5 w-5 text-purple-600" />
                                        Test Parameters
                                    </CardTitle>
                                    <CardDescription>
                                        Define the testing parameters and their descriptions
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-sm font-medium text-gray-700">
                                                    Parameter {index + 1}
                                                </h4>
                                                {index > 0 && (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => remove(index)}
                                                        className="h-8 px-2"
                                                    >
                                                        <Trash className="h-3 w-3 mr-1" />
                                                        Remove
                                                    </Button>
                                                )}
                                            </div>
                                            
                                            <div className="space-y-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`parameters.${index}.parameter`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col">
                                                            <FormLabel className="text-sm font-medium text-gray-700">
                                                                Parameter Type *
                                                            </FormLabel>
                                                            <Select
                                                                onValueChange={(value) => {
                                                                    form.setValue(`parameters.${index}.parameter`, value);
                                                                    form.trigger(`parameters.${index}.parameter`);
                                                                }}
                                                                value={field.value}
                                                            >
                                                                <SelectTrigger className="w-full border-gray-300 focus:border-blue-500">
                                                                    <SelectValue placeholder="Select parameter type..." />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectGroup>
                                                                        {TESTING_LIST.map((testing) => (
                                                                            <SelectItem key={testing} value={testing}>
                                                                                <div className="flex items-center gap-2">
                                                                                    <Settings className="h-4 w-4 text-blue-500" />
                                                                                    {testing}
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
                                                    name={`parameters.${index}.description`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col">
                                                            <FormLabel className="text-sm font-medium text-gray-700">
                                                                Description *
                                                            </FormLabel>
                                                            <FormControl>
                                                                <TextEditor
                                                                    markup={field.value || ""}
                                                                    onChange={(value) => {
                                                                        form.setValue(`parameters.${index}.description`, value);
                                                                        form.trigger(`parameters.${index}.description`);
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => append({ parameter: "", description: "" })}
                                        disabled={fields.length > 0 && isFieldIncomplete(fields.length - 1)}
                                        className="w-full border-dashed border-gray-300 hover:border-blue-500"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add New Parameter
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <Button
                                    disabled={isLoading}
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    onClick={() => setDialogOpen(false)}
                                    className="px-6"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    disabled={isLoading}
                                    type="submit"
                                    size="lg"
                                    onClick={() => validateTestPlan()}
                                    className="px-6 bg-green-600 hover:bg-green-700"
                                >
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    {isLoading ? "Creating..." : "Create Test Plan"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
