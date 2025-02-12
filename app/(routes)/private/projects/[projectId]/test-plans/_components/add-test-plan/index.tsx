"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    CalendarIcon,
    Loader2,
    Plus,
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
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useParams } from "next/navigation";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TESTING_LIST } from "@/app/_constants/test-plan";
import TextEditor from "../../../../_components/text-editor";
import { addTestPlanService } from "@/app/_services/test-plan.service";
import { ProjectUserRoles } from "@/app/_constants/project-user-roles";
import { getProjectUsersService } from "@/app/_services/project.service";
import { useSession } from "next-auth/react";
import { IProjectUserDisplay } from "@/app/_interface/project";
import { UserRoles } from "@/app/_constants/user-roles";
import { getUsernameWithUserId } from "@/app/_utils/common";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

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
    const [sheetOpen, setSheetOpen] = useState(false);
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
            setSheetOpen(false);
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
            const projectUsers = await getProjectUsersService(projectId);
            if (projectUsers?.users?.length) {
                setUsers(projectUsers.users);
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
        if (!sheetOpen) {
            getProjectUsers();
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
                    <Plus /> Add test plan
                </Button>
            </SheetTrigger>
            <SheetContent
                className="w-full !max-w-full md:w-[580px] md:!max-w-[580px] overflow-y-auto"
            >
                <SheetHeader>
                    <SheetTitle className="text-left">Add new test plan</SheetTitle>
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
                                            <FormLabel>Test plan title</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {userProjectRole === ProjectUserRoles.ADMIN ||
                                userProjectRole === ProjectUserRoles.CLIENT ? (
                                <div className="grid grid-cols-1 gap-2 mt-4">
                                    <FormField
                                        control={form.control}
                                        name="assignedTo"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Assignee</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value ?? undefined}
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

                            <div className="flex flex-col gap-4 mt-4">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex flex-col w-full border border-1 rounded-md">
                                        <div className="flex flex-col w-full p-4">
                                            <FormField
                                                control={form.control}
                                                name={`parameters.${index}.parameter`}
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel>Parameter</FormLabel>
                                                        <Select
                                                            onValueChange={(value) => {
                                                                form.setValue(`parameters.${index}.parameter`, value);
                                                                form.trigger(`parameters.${index}.parameter`);
                                                            }}
                                                            value={field.value}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectGroup>
                                                                    {TESTING_LIST.map((testing) => (
                                                                        <SelectItem key={testing} value={testing}>
                                                                            <div className="flex items-center">
                                                                                <span className="mr-1">{testing}</span>
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

                                        <div className="flex flex-col w-full p-4">
                                            <FormField
                                                control={form.control}
                                                name={`parameters.${index}.description`}
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel>Description</FormLabel>
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

                                        <div className="px-4 py-2 flex items-center">
                                            {index === fields.length - 1 && (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    className="mr-4"
                                                    onClick={() => append({ parameter: "", description: "" })}
                                                    disabled={isFieldIncomplete(index)}
                                                >
                                                    <Plus /> New parameter
                                                </Button>
                                            )}
                                            {index > 0 && (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => remove(index)}
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            < div className="mt-6 w-full flex justify-end gap-2" >
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
                                    onClick={() => validateTestPlan()}
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
        </Sheet >
    );
}
