"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, UserPlus, Mail, Shield, User, AtSign } from "lucide-react";
import { useState } from "react";

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
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { USER_ROLE_LIST } from "@/app/_constants/user-roles";
import { addUserService } from "@/app/_services/user.service";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const userSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().min(1, "Required").email('Invalid email address'),
    role: z.string().min(1, 'Required'),
    sendCredentials: z.boolean()
});

export function AddUser({ refreshUsers }: { refreshUsers: () => void; }) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const form = useForm<z.infer<typeof userSchema>>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            role: "",
            sendCredentials: false
        },
    });

    async function onSubmit(values: z.infer<typeof userSchema>) {
        setIsLoading(true);
        try {
            const response = await addUserService({
                ...values,
                isVerified: false
            });
            if (response) {
                if (response.status === HttpStatusCode.BAD_REQUEST) {
                    toasterService.error(response?.message);
                    return;
                }
                localStorage.setItem("userId", response?.user?._id);
                refreshUsers();
                toasterService.success(response?.message);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setDialogOpen(false);
            setIsLoading(false);
        }
    }

    const validateUser = () => {
        if (form.formState.isValid) {
            form.handleSubmit(onSubmit);
        }
    };

    const resetForm = () => {
        form.reset();
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button 
                    onClick={() => resetForm()}
                    variant="outline"
                    className="border-2 border-green-200 hover:border-green-300 hover:bg-green-50 text-green-700 transition-all duration-200"
                >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl w-full p-0 overflow-hidden">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 border-b">
                    <DialogHeader className="space-y-3">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <UserPlus className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-bold text-gray-900">
                                    Create New User
                                </DialogTitle>
                                <DialogDescription className="text-gray-600 mt-1">
                                    Add a new user to your team with the specified details and permissions.
                                </DialogDescription>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                <User className="mr-1 h-3 w-3" />
                                User Management
                            </Badge>
                        </div>
                    </DialogHeader>
                </div>

                <div className="p-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} method="post">
                            <div className="space-y-6">
                                <Card className="border-0 shadow-sm bg-gray-50/50">
                                    <CardContent className="p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="firstName"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel className="text-sm font-semibold text-gray-700 flex items-center">
                                                            <User className="mr-2 h-4 w-4 text-blue-600" />
                                                            First Name
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                {...field} 
                                                                className="h-12 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors"
                                                                placeholder="Enter first name"
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
                                                    <FormItem className="space-y-2">
                                                        <FormLabel className="text-sm font-semibold text-gray-700 flex items-center">
                                                            <User className="mr-2 h-4 w-4 text-blue-600" />
                                                            Last Name
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                {...field} 
                                                                className="h-12 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors"
                                                                placeholder="Enter last name"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-sm bg-gray-50/50">
                                    <CardContent className="p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel className="text-sm font-semibold text-gray-700 flex items-center">
                                                            <AtSign className="mr-2 h-4 w-4 text-purple-600" />
                                                            Email Address
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                {...field} 
                                                                className="h-12 border-2 border-gray-200 hover:border-purple-300 focus:border-purple-500 transition-colors"
                                                                placeholder="user@example.com"
                                                                type="email"
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
                                                    <FormItem className="space-y-2">
                                                        <FormLabel className="text-sm font-semibold text-gray-700 flex items-center">
                                                            <Shield className="mr-2 h-4 w-4 text-orange-600" />
                                                            User Role
                                                        </FormLabel>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            value={field.value}
                                                        >
                                                            <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-orange-300 focus:border-orange-500 transition-colors">
                                                                <SelectValue placeholder="Select a role" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectGroup>
                                                                    {USER_ROLE_LIST.map((role) => (
                                                                        <SelectItem key={role} value={role} className="py-3">
                                                                            <div className="flex items-center space-x-3">
                                                                                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                                                                                    <Shield className="h-3 w-3 text-orange-600" />
                                                                                </div>
                                                                                <span className="font-medium">{role}</span>
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

                                <Card className="border-0 shadow-sm bg-gray-50/50">
                                    <CardContent className="p-4">
                                        <FormField
                                            control={form.control}
                                            name="sendCredentials"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                            <Checkbox
                                                                id="sendCredentials"
                                                                className="h-5 w-5 text-blue-500 border-blue-300"
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                            <div className="flex items-center space-x-2">
                                                                <Mail className="h-4 w-4 text-blue-600" />
                                                                <Label htmlFor="sendCredentials" className="text-sm font-medium text-gray-700">
                                                                    Send login credentials via email
                                                                </Label>
                                                            </div>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="mt-8 flex justify-end gap-3 pt-4 border-t">
                                <DialogClose asChild>
                                    <Button
                                        disabled={isLoading}
                                        type="button"
                                        variant="outline"
                                        size="lg"
                                        className="px-6 py-2 border-2 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button
                                    disabled={isLoading}
                                    type="submit"
                                    size="lg"
                                    onClick={() => validateUser()}
                                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <UserPlus className="mr-2 h-4 w-4" />
                                    )}
                                    {isLoading ? "Creating..." : "Create User"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
