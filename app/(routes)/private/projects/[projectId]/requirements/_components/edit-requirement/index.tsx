import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2 } from "lucide-react";
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
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import TextEditor from "@/app/(routes)/private/projects/_components/text-editor";
import { useSession } from "next-auth/react";
import { updateRequirementService } from "@/app/_services/requirement.service";
import RequirementAttachments from "../attachments/requirement-attachment";
import { IRequirement } from "@/app/_interface/requirement";
import { addRequirementAttachmentsService } from "@/app/_services/requirement-attachment.service";
import { ProjectUserRoles } from "@/app/_constants/project-user-roles";
import { IProject, IProjectUserDisplay } from "@/app/_interface/project";
import { getProjectUsersService } from "@/app/_services/project.service";
import { UserRoles } from "@/app/_constants/user-roles";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUsernameWithUserId } from "@/app/_utils/common";
import { TASK_STATUS_LIST } from "@/app/_constants/issue";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

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
    const [userProjectRole, setUserProjectRole] =
        useState<ProjectUserRoles | null>(null);
    const [users, setUsers] = useState<IProjectUserDisplay[]>([]);
    const { data } = useSession();
    const form = useForm<z.infer<typeof requirementSchema>>({
        resolver: zodResolver(requirementSchema),
        defaultValues: {
            title: requirement?.title || "",
            description: requirement?.description || "",
            projectId: requirement?.projectId as unknown as string || "",
            assignedTo: requirement?.assignedTo?._id || "",
            status: requirement?.status || "",
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

    useEffect(() => {
        form.register("status");
    }, [form]);


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

    const getSelectedUser = (field: any) => {
        const selectedUser = users?.find(
            (user) => user?.userId?._id === field.value
        );
        return getUsernameWithUserId(selectedUser);
    };

    useEffect(() => {
        if (sheetOpen) {
            if (data) {
                form.reset();
                const { user } = data;
                setUserData(user);
                getProjectUsers();
            }
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
            <SheetContent
                className="w-full !max-w-full md:w-[580px] md:!max-w-[580px] overflow-y-auto"
            >
                <SheetHeader>
                    <SheetTitle className="text-left">Edit requirement</SheetTitle>
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
                                            <FormLabel>Issue title</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
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
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    form.clearErrors("status");
                                                }}
                                                value={field.value || ""}
                                                defaultValue={field.value || ""}
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
                                    <div className="grid grid-cols-1 gap-2 ">
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
                            <RequirementAttachments requirementId={requirementId} isUpdate={true} isView={false}
                                setAttachmentsData={setAttachments} />

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
                                    className="w-full md:w-fit"
                                    onClick={handleSubmit}
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
        </Sheet >
    );
};

export default EditRequirement;
