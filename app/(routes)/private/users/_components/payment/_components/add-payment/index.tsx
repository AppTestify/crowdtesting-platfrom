import { PaymentCurrency, PaymentCurrencyList, PaymentStatus, PaymentStatusList } from '@/app/_constants/payment';
import { IProject } from '@/app/_interface/project';
import { IUser, IUserByAdmin } from '@/app/_interface/user';
import { addPaymentsService } from '@/app/_services/payment.service';
import { getProjectsWithoutPaginationService } from '@/app/_services/project.service';
import toasterService from '@/app/_services/toaster-service';
import { getAllTesterUsersService, getUsersWithoutPaginationService } from '@/app/_services/user.service';
import { getUsernameWithUserId } from '@/app/_utils/common';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/text-area';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, CreditCard, User, Building2, DollarSign, FileText, CheckCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const paymentSchema = z.object({
    receiverId: z.string().min(1, "Required"),
    projectId: z.string().optional(),
    status: z.string().optional(),
    description: z.string()
        .refine(
            (value) => {
                if (!value) return true;
                return value.length <= 500;
            },
            { message: "Description must be less than 500 characters" }
        )
        .optional(),
    currency: z.string().min(1, 'Required'),
    amount: z
        .preprocess(
            (value) => (value === null || value === undefined ? undefined : parseFloat(value as string)),
            z.number({ required_error: "Required" }).positive("Amount must be a positive number")
        ),
});

export default function AddPayment({ isOpen, closeDialog, userId, refreshPayment, isTester = false }: {
    isOpen: boolean,
    closeDialog: () => void,
    userId: string,
    refreshPayment: () => void,
    isTester?: boolean
}) {
    const [projects, setProjects] = useState<IProject[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [testers, setTesters] = useState<IUserByAdmin[]>([]);
    const [wordCount, setWordCount] = useState(0);

    const form = useForm<z.infer<typeof paymentSchema>>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            receiverId: "",
            status: PaymentStatus.COMPLETED,
            currency: PaymentCurrency.USD,
        },
    });

    const handleCharacterCount = (value: any) => {
        const count = value?.length || 0;
        setWordCount(count);
    };

    const getProjects = async () => {
        try {
            const response = await getProjectsWithoutPaginationService(form.watch("receiverId"));
            if (response) {
                setProjects(response);
            }
        } catch (error) {
            toasterService.error();
        }
    }

    const getTesters = async () => {
        try {
            const response = await getAllTesterUsersService();
            if (response) {
                setTesters(response);
            }
        } catch (error) {
            toasterService.error();
        }
    }

    async function onSubmit(values: z.infer<typeof paymentSchema>) {
        setIsLoading(true);
        try {
            const response = await addPaymentsService(values);
            if (response) {
                refreshPayment()
                toasterService.success(response?.message);
                closeDialog();
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (isOpen) {
            form.reset();
            setWordCount(0);
        }
    }, [isOpen]);

    useEffect(() => {
        getTesters();
    }, []);

    useEffect(() => {
        if (!isTester && form.watch("receiverId") !== "") {
            getProjects();
        }
    }, [form.watch("receiverId"), isTester]);

    return (
        <Dialog open={isOpen} onOpenChange={closeDialog}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0">
                {/* Balanced Header Design */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-6 border border-green-100 mb-6">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-100/50 to-emerald-100/50 rounded-full -translate-y-12 translate-x-12"></div>
                    <div className="relative flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                            <CreditCard className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                                <Badge variant="outline" className="bg-white/80 border-green-200 text-green-700">
                                    New Payment
                                </Badge>
                            </div>
                            <DialogTitle className="text-xl font-bold text-gray-900 mb-2">
                                Add Payment
                            </DialogTitle>
                            <DialogDescription className="text-gray-600 text-sm">
                                Create a new payment record for project completion or services rendered
                            </DialogDescription>
                        </div>
                    </div>
                </div>
                
                <div className="px-6 pb-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} method="post">
                            <div className="space-y-6">
                                {/* User Selection Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                            <User className="h-4 w-4 text-green-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Recipient Details</h3>
                                    </div>
                                    
                                    <Card>
                                        <CardContent className="p-6">
                                            <FormField
                                                control={form.control}
                                                name="receiverId"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel className="text-sm font-medium text-gray-700 mb-2">Select User</FormLabel>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            value={field.value}
                                                        >
                                                            <SelectTrigger className="w-full h-11">
                                                                <SelectValue placeholder="Choose a user..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectGroup>
                                                                    {testers.map((tester) => (
                                                                        <SelectItem key={tester?.id} value={tester?.id as string}>
                                                                            <div className="flex items-center">
                                                                                {getUsernameWithUserId(tester)}
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
                                </div>

                                {/* Project Selection Section */}
                                {!isTester && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Building2 className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900">Project Assignment</h3>
                                        </div>
                                        
                                        <Card>
                                            <CardContent className="p-6">
                                                <FormField
                                                    control={form.control}
                                                    name="projectId"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col">
                                                            <FormLabel className="text-sm font-medium text-gray-700 mb-2">Select Project</FormLabel>
                                                            <Select
                                                                onValueChange={field.onChange}
                                                                value={field.value}
                                                            >
                                                                <SelectTrigger className="w-full h-11">
                                                                    <SelectValue placeholder="Choose a project..." />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {projects.length > 0 ? (
                                                                        <SelectGroup>
                                                                            {projects.map((project) => (
                                                                                <SelectItem key={project._id} value={project?._id as string}>
                                                                                    <div className="flex items-center">
                                                                                        {project?.title}
                                                                                    </div>
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectGroup>
                                                                    ) : (
                                                                        <div className="p-3 text-gray-500 text-center text-sm">No projects available</div>
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                                {/* Payment Details Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <DollarSign className="h-4 w-4 text-purple-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
                                    </div>
                                    
                                    <Card>
                                        <CardContent className="p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="currency"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-sm font-medium text-gray-700 mb-2">Currency</FormLabel>
                                                            <Select
                                                                onValueChange={field.onChange}
                                                                value={field.value}
                                                            >
                                                                <SelectTrigger className="w-full h-11">
                                                                    <SelectValue placeholder="Select currency..." />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectGroup>
                                                                        {PaymentCurrencyList.map((currency) => (
                                                                            <SelectItem key={currency} value={currency as string}>
                                                                                <div className="flex items-center">
                                                                                    {currency}
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
                                                    name="amount"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-sm font-medium text-gray-700 mb-2">Amount</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="Enter amount..."
                                                                    className="h-11"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Description Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                            <FileText className="h-4 w-4 text-orange-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
                                    </div>
                                    
                                    <Card>
                                        <CardContent className="p-6">
                                            <FormField
                                                control={form.control}
                                                name="description"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-sm font-medium text-gray-700 mb-2">Description</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="Enter payment description..."
                                                                maxLength={500}
                                                                onChangeCapture={(e) => handleCharacterCount((e.target as HTMLTextAreaElement).value)}
                                                                className="min-h-[100px] resize-none"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <div className="flex justify-end mt-2">
                                                            <span className="text-xs text-gray-500">
                                                                {wordCount}/500 characters
                                                            </span>
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Status Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                            <CheckCircle className="h-4 w-4 text-indigo-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Payment Status</h3>
                                    </div>
                                    
                                    <Card>
                                        <CardContent className="p-6">
                                            <FormField
                                                control={form.control}
                                                name="status"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel className="text-sm font-medium text-gray-700 mb-2">Status</FormLabel>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            value={field.value}
                                                        >
                                                            <SelectTrigger className="w-full h-11">
                                                                <SelectValue placeholder="Select status..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectGroup>
                                                                    {PaymentStatusList.map((status) => (
                                                                        <SelectItem key={status} value={status}>
                                                                            <div className="flex items-center">
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
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeDialog}
                                    disabled={isLoading}
                                    className="w-full sm:w-auto h-11"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full sm:w-auto h-11 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Adding Payment...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="mr-2 h-4 w-4" />
                                            Add Payment
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
}
