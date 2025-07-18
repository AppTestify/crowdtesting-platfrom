import { PaymentCurrency, PaymentCurrencyList, PaymentStatusList } from '@/app/_constants/payment';
import { IPayment } from '@/app/_interface/payment';
import { IProject } from '@/app/_interface/project';
import { updatePaymentService } from '@/app/_services/payment.service';
import { getProjectsWithoutPaginationService } from '@/app/_services/project.service';
import toasterService from '@/app/_services/toaster-service';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/text-area';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, CreditCard, Building2, DollarSign, FileText, CheckCircle, Edit3 } from 'lucide-react';
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
    senderId: z.string().optional()
});

export default function EditPayment({ isDialogOpen, dialogClose, payment, refreshPayment }: {
    isDialogOpen: boolean,
    dialogClose: () => void,
    payment: IPayment,
    refreshPayment: () => void
}) {
    const [projects, setProjects] = useState<IProject[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [wordCount, setWordCount] = useState(0);
    const paymentId = payment?._id as string;

    const form = useForm<z.infer<typeof paymentSchema>>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            receiverId: payment?.receiverId?._id || "",
            senderId: payment?.senderId?._id || "",
            amount: payment?.amount?.$numberDecimal || 0,
            projectId: payment?.projectId || "",
            description: payment?.description || "",
            status: payment?.status || "",
            currency: payment?.currency || PaymentCurrency.USD,
        },
    });

    const handleCharacterCount = (value: any) => {
        const count = value?.length || 0;
        setWordCount(count);
    };

    const getProjects = async () => {
        try {
            const response = await getProjectsWithoutPaginationService(payment?.receiverId._id as string);
            if (response) {
                setProjects(response);
            }
        } catch (error) {
            toasterService.error();
        }
    }

    async function onSubmit(values: z.infer<typeof paymentSchema>) {
        setIsLoading(true);
        try {
            const response = await updatePaymentService(paymentId, values);
            if (response) {
                refreshPayment()
                toasterService.success(response?.message);
                dialogClose();
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (isDialogOpen) {
            form.reset();
            getProjects();
            handleCharacterCount(payment?.description || "");
        }
    }, [isDialogOpen]);

    return (
        <Dialog open={isDialogOpen} onOpenChange={dialogClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0">
                {/* Balanced Header Design */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border border-blue-100 mb-6">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100/50 to-indigo-100/50 rounded-full -translate-y-12 translate-x-12"></div>
                    <div className="relative flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Edit3 className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                                <Badge variant="outline" className="bg-white/80 border-blue-200 text-blue-700">
                                    Edit Payment
                                </Badge>
                            </div>
                            <DialogTitle className="text-xl font-bold text-gray-900 mb-2">
                                Update Payment
                            </DialogTitle>
                            <DialogDescription className="text-gray-600 text-sm">
                                Modify payment details and status for this transaction
                            </DialogDescription>
                        </div>
                    </div>
                </div>
                
                <div className="px-6 pb-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} method="post">
                            <div className="space-y-6">
                                {/* Project Selection Section */}
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
                                                                <SelectGroup>
                                                                    {projects.map((project) => (
                                                                        <SelectItem key={project._id} value={project?._id as string}>
                                                                            <div className="flex items-center">
                                                                                {project?.title}
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
                                    onClick={dialogClose}
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
                                            Updating Payment...
                                        </>
                                    ) : (
                                        <>
                                            <Edit3 className="mr-2 h-4 w-4" />
                                            Update Payment
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
