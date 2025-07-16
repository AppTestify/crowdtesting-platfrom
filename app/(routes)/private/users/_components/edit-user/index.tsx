import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, User, Mail, Shield, Edit } from "lucide-react";
import React, { useState } from "react";
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
import { IUserByAdmin } from "@/app/_interface/user";
import { USER_ROLE_LIST } from "@/app/_constants/user-roles";
import { updateUserService } from "@/app/_services/user.service";

const userSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    role: z.string().min(1, "Required"),
    isActive: z.boolean(),
});

const EditUser = ({
    user,
    sheetOpen,
    setSheetOpen,
    refreshUsers,
}: {
    user: IUserByAdmin;
    sheetOpen: boolean;
    setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
    refreshUsers: () => void;
}) => {
    const userId = user?.id as string;
    const { firstName, lastName, email, role, isActive } = user;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const form = useForm<z.infer<typeof userSchema>>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            firstName: firstName || "",
            lastName: lastName || "",
            email: email || "",
            role: role || "",
            isActive: isActive,
        },
    });

    async function onSubmit(values: z.infer<typeof userSchema>) {
        setIsLoading(true);
        try {
            const response = await updateUserService(userId, {
                ...values,
                email: email || "",
                isVerified: false
            });
            if (response) {
                refreshUsers();
                toasterService.success(response?.message);
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
                        Edit User Profile
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                        Update user information and permissions for {firstName} {lastName}.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-6 space-y-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Basic Information Card */}
                            <Card className="border-l-4 border-l-blue-500">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <User className="h-5 w-5 text-blue-600" />
                                        Basic Information
                                    </CardTitle>
                                    <CardDescription>
                                        Update the user's personal information
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="firstName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium text-gray-700">
                                                        First Name
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter first name..."
                                                            {...field}
                                                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="lastName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium text-gray-700">
                                                        Last Name
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter last name..."
                                                            {...field}
                                                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Account Details Card */}
                            <Card className="border-l-4 border-l-green-500">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Mail className="h-5 w-5 text-green-600" />
                                        Account Details
                                    </CardTitle>
                                    <CardDescription>
                                        Manage account settings and permissions
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            disabled
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium text-gray-700">
                                                        Email Address
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            className="border-gray-300 bg-gray-50 text-gray-500"
                                                            disabled
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="role"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium text-gray-700">
                                                        User Role *
                                                    </FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                    >
                                                        <SelectTrigger className="w-full border-gray-300 focus:border-blue-500">
                                                            <SelectValue placeholder="Select a role" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                {USER_ROLE_LIST.map((role) => (
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

export default EditUser;
