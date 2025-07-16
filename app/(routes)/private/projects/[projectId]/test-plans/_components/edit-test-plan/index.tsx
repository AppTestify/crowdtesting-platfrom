import React, { useEffect, useState, useRef } from "react";
import { CalendarIcon, Loader2, Plus, FileText, Users, Calendar, Settings, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import toasterService from "@/app/_services/toaster-service";
import TextEditor from "../../../../_components/text-editor";
import { ITestPlan } from "@/app/_interface/test-plan";
import { updateTestPlanService } from "@/app/_services/test-plan.service";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TESTING_LIST } from "@/app/_constants/test-plan";
import { ProjectUserRoles } from "@/app/_constants/project-user-roles";
import { UserRoles } from "@/app/_constants/user-roles";
import { useSession } from "next-auth/react";
import { IProjectUserDisplay } from "@/app/_interface/project";
import { getUsernameWithUserId } from "@/app/_utils/common";
import { getProjectUsersListService } from "@/app/_services/project.service";
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

export function EditTestPlan({
    testPlan,
    sheetOpen,
    setSheetOpen,
    refreshTestPlans,
}: {
    testPlan: ITestPlan;
    sheetOpen: boolean;
    setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
    refreshTestPlans: () => void;
}) {
    const testSuiteId = testPlan.id;
    const { data } = useSession();
    const { title, projectId, parameters } = testPlan;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [userProjectRole, setUserProjectRole] =
        useState<ProjectUserRoles | null>(null);
    const [users, setUsers] = useState<IProjectUserDisplay[]>([]);
    const [startDateOpen, setStartDateOpen] = useState(false);
    const [endDateOpen, setEndDateOpen] = useState(false);

    const form = useForm<z.infer<typeof testPlanSchema>>({
        resolver: zodResolver(testPlanSchema),
        defaultValues: {
            title: title || "",
            projectId: projectId?._id || "",
            parameters: parameters || [],
            assignedTo: testPlan?.assignedTo?._id || "",
            startDate: testPlan?.startDate ? new Date(testPlan.startDate) : null,
            endDate: testPlan?.endDate ? new Date(testPlan.endDate) : null,
        },
    });
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "parameters",
    });

    const isFieldIncomplete = (index: number) => {
        const description = form.getValues(`parameters.${index}.description`);
        const parameter = form.getValues(`parameters.${index}.parameter`);
        return !(parameter && description);
    };

    async function onSubmit(values: z.infer<typeof testPlanSchema>) {
        setIsLoading(true);
        try {
            const response = await updateTestPlanService(projectId?._id as string, testSuiteId, {
                ...values,
                assignedTo: values.assignedTo || undefined,
            });
            if (response) {
                refreshTestPlans();
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setSheetOpen(false);
            setIsLoading(false);
        }
    }

    const resetForm = () => {
        form.reset({
            title: title || "",
            projectId: projectId?._id || "",
            parameters: parameters || [],
            assignedTo: testPlan?.assignedTo?._id || "",
            startDate: testPlan?.startDate ? new Date(testPlan.startDate) : null,
            endDate: testPlan?.endDate ? new Date(testPlan.endDate) : null,
        });
    };

    const getSelectedUser = (field: any) => {
        const selectedUser = users?.find(
            (user) => user?.userId?._id === field.value
        );
        return getUsernameWithUserId(selectedUser);
    };

    const getProjectUsers = async () => {
        try {
            const projectUsers = await getProjectUsersListService(projectId?._id as unknown as string);
            if (projectUsers?.data?.users?.length) {
                setUsers(projectUsers.data.users);
            }
        } catch (error) {
            toasterService.error();
        }
    };

    useEffect(() => {
        if (sheetOpen) {
            resetForm();
            getProjectUsers();
        }
    }, [sheetOpen]);

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
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        Edit Test Plan
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                        Update the test plan details, parameters, assignments, and timeline.
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
                                        Update the essential details for this test plan
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
                                        Update the test plan assignment and timeline
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
                                                    <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
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
                                                                onSelect={(date) => {
                                                                    field.onChange(date);
                                                                    setStartDateOpen(false);
                                                                }}
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
                                                    <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
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
                                                                onSelect={(date) => {
                                                                    field.onChange(date);
                                                                    setEndDateOpen(false);
                                                                }}
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
                                        Update the testing parameters and their descriptions
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

                                    <div className="flex justify-center">
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => append({ parameter: "", description: "" })}
                                            disabled={fields.length > 0 && isFieldIncomplete(fields.length - 1)}
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Parameter
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <Button
                                    disabled={isLoading}
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    onClick={() => setSheetOpen(false)}
                                    className="px-6"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    disabled={isLoading}
                                    type="submit"
                                    size="lg"
                                    className="px-6 bg-green-600 hover:bg-green-700"
                                >
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    {isLoading ? "Updating..." : "Update Test Plan"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
