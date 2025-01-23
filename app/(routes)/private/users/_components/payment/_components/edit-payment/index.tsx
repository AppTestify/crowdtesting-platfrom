import { PaymentStatusList } from '@/app/_constants/payment';
import { IPayment } from '@/app/_interface/payment';
import { IProject } from '@/app/_interface/project';
import { updatePaymentService } from '@/app/_services/payment.service';
import { getProjectsWithoutPaginationService } from '@/app/_services/project.service';
import toasterService from '@/app/_services/toaster-service';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
        },
    });

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
        }
    }, [isDialogOpen]);

    return (
        <div>
            <Dialog open={isDialogOpen} onOpenChange={dialogClose}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit payment</DialogTitle>
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
                                    {isLoading ? "Updating payment" : "Update payment"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
