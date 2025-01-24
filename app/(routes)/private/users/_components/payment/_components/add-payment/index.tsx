import { PaymentCurrency, PaymentCurrencyList, PaymentStatus, PaymentStatusList } from '@/app/_constants/payment';
import { IProject } from '@/app/_interface/project';
import { addPaymentsService } from '@/app/_services/payment.service';
import { getProjectsWithoutPaginationService } from '@/app/_services/project.service';
import toasterService from '@/app/_services/toaster-service';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/text-area';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const paymentSchema = z.object({
    receiverId: z.string().min(1, "Required"),
    projectId: z.string().optional(),
    status: z.string().optional(),
    description: z.string().optional(),
    currency: z.string().min(1, 'Required'),
    amount: z
        .preprocess(
            (value) => (value === null || value === undefined ? undefined : parseFloat(value as string)),
            z.number({ required_error: "Required" }).positive("Amount must be a positive number")
        ),

});

export default function AddPayment({ isOpen, closeDialog, userId, refreshPayment }: {
    isOpen: boolean,
    closeDialog: () => void,
    userId: string,
    refreshPayment: () => void
}) {
    const [projects, setProjects] = useState<IProject[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const form = useForm<z.infer<typeof paymentSchema>>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            receiverId: userId || "",
            status: PaymentStatus.COMPLETED,
            currency: PaymentCurrency.USD,
        },
    });

    const getProjects = async () => {
        try {
            const response = await getProjectsWithoutPaginationService(userId);
            if (response) {
                setProjects(response);
            }
        } catch (error) {
            toasterService.error();
        }
    }

    useEffect(() => {
        getProjects();
    }, []);

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
        }
    }, [isOpen]);

    return (
        <div>
            <Dialog open={isOpen} onOpenChange={closeDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add payment</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} method="post">
                            <div className=" grid grid-cols-1 gap-2">
                                <FormField
                                    control={form.control}
                                    name="projectId"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Project</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {projects.map((project) => (
                                                            <SelectItem value={project?._id as string}>
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

                                <div className='grid grid-cols-[30%,70%] gap-2'>
                                    <FormField
                                        control={form.control}
                                        name="currency"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Currency</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {PaymentCurrencyList.map((currency) => (
                                                                <SelectItem value={currency as string}>
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
                                                <FormLabel>Amount</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type={"number"}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>status</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {PaymentStatusList.map((status) => (
                                                            <SelectItem value={status}>
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
                            </div>
                            <DialogFooter className="mt-4">
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    {isLoading ? "Adding payment" : "Add payment"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
