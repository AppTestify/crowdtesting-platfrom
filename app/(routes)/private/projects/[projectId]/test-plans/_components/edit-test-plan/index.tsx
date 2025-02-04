import React, { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
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
import { getProjectUsersService } from "@/app/_services/project.service";

const testPlanSchema = z.object({
    title: z.string().min(1, "Required"),
    projectId: z.string().optional(),
    parameters: z.array(z.object({
        parameter: z.string().min(1, 'Required'),
        description: z.string().min(1, 'Required')
    })),
    assignedTo: z.string().nullable().optional(),
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

    const form = useForm<z.infer<typeof testPlanSchema>>({
        resolver: zodResolver(testPlanSchema),
        defaultValues: {
            title: title || "",
            projectId: projectId || "",
            parameters: parameters || [],
            assignedTo: testPlan?.assignedTo?._id || ""
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
            const response = await updateTestPlanService(projectId, testSuiteId, {
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
            projectId: projectId || "",
            parameters: parameters || [],
            assignedTo: testPlan?.assignedTo?._id || ""
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
            const projectUsers = await getProjectUsersService(projectId as unknown as string);
            if (projectUsers?.users?.length) {
                setUsers(projectUsers.users);
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
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="w-full !max-w-full md:w-[580px] md:!max-w-[580px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-left">Edit test plan</SheetTitle>
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

                            <div className="flex flex-col gap-4 mt-4">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex flex-col w-full border border-1 rounded-md">
                                        {/* Parameter Field */}
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
                                                            value={field.value || ""}
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

                                        {/* Description Field */}
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
                                                    className="ml-4"
                                                    onClick={() => remove(index)}
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 w-full flex justify-end gap-2">
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
                                    // onClick={() => validateBrowsers()}
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
