import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import toasterService from "@/app/_services/toaster-service";
import {
    Form,
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
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useParams } from "next/navigation";
import { PROJECT_USER_ROLE_LIST } from "@/app/_constants/project-user-roles";
import { IProjectUserDisplay } from "@/app/_interface/project";
import { Input } from "@/components/ui/input";
import { editProjectUserService } from "@/app/_services/project.service";

const projectUserSchema = z.object({
    userId: z.string(),
    role: z.string().optional()
});

const EditProjectUser = ({
    projectUser,
    sheetOpen,
    setSheetOpen,
    refreshProjectUsers,
}: {
    projectUser: IProjectUserDisplay;
    sheetOpen: boolean;
    setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
    refreshProjectUsers: () => void;
}) => {
    const { userId, role } = projectUser;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { projectId } = useParams<{ projectId: string }>();

    const form = useForm<z.infer<typeof projectUserSchema>>({
        resolver: zodResolver(projectUserSchema),
        defaultValues: {
            userId: userId?._id || undefined,
            role: role || undefined
        },
    });

    async function onSubmit(values: z.infer<typeof projectUserSchema>) {
        setIsLoading(true);
        try {
            const response = await editProjectUserService(projectId, { ...values });
            if (response) {
                refreshProjectUsers();
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setSheetOpen(false);
            setIsLoading(false);
        }
    }

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="w-full !max-w-full md:w-[580px] md:!max-w-[580px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-left">Edit user</SheetTitle>
                </SheetHeader>

                <div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} method="post">
                            <div className="grid grid-cols-1 gap-2 mt-3">
                                <FormField
                                    control={form.control}
                                    name="userId"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Select tester</FormLabel>
                                            <Input disabled
                                                {...field}
                                                value={`${projectUser?.customId}`} />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                            </div>
                            <div className="grid grid-cols-1 mt-4">
                                <FormField
                                    control={form.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Project user role</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value || undefined}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select role (optional)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {PROJECT_USER_ROLE_LIST.map((role) => (
                                                            <SelectItem key={role} value={role}>
                                                                <div className="flex items-center">
                                                                    {role}
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
};

export default EditProjectUser;
