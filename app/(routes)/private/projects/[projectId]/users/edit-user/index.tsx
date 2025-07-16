import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, User, Shield, Edit, Users } from "lucide-react";
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
            userId: typeof projectUser?.userId === 'string' ? projectUser?.userId : projectUser?.userId?._id || '', // always use MongoDB ObjectId as string
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
        <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Edit className="h-5 w-5 text-blue-600" />
                        </div>
                        Edit Project User
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                        Update user role and permissions for this project.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-6 space-y-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* User Information Card */}
                            <Card className="border-l-4 border-l-blue-500">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <User className="h-5 w-5 text-blue-600" />
                                        User Information
                                    </CardTitle>
                                    <CardDescription>
                                        View the user's details for this project
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="userId"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className="text-sm font-medium text-gray-700">
                                                    User Name
                                                </FormLabel>
                                                <Input 
                                                    disabled
                                                    {...field}
                                                    value={`${projectUser?.userId?.firstName || ""} ${projectUser?.userId?.lastName || ""}`.trim()}
                                                    className="border-gray-300 bg-gray-50 text-gray-500"
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Project Role Card */}
                            <Card className="border-l-4 border-l-green-500">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-green-600" />
                                        Project Role
                                    </CardTitle>
                                    <CardDescription>
                                        Assign or update the user's role for this project
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="role"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className="text-sm font-medium text-gray-700">
                                                    Project User Role
                                                </FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value || undefined}
                                                >
                                                    <SelectTrigger className="w-full border-gray-300 focus:border-blue-500">
                                                        <SelectValue placeholder="Select role (optional)" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {PROJECT_USER_ROLE_LIST.map((role) => (
                                                                <SelectItem key={role} value={role}>
                                                                    <div className="flex items-center gap-2">
                                                                        <Shield className="h-4 w-4 text-blue-500" />
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
                                    ) : (
                                        <Edit className="mr-2 h-4 w-4" />
                                    )}
                                    {isLoading ? "Updating..." : "Update User"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EditProjectUser;
