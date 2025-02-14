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
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
                                    name="receiverId"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>User</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
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
                                                    {projects.length > 0 ? (
                                                        <SelectGroup>
                                                            {projects.map((project) => (
                                                                <SelectItem value={project?._id as string}>
                                                                    <div className="flex items-center">
                                                                        {project?.title}
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    ) : (
                                                        <div className="p-2 text-gray-500 text-center">No project assigned</div>
                                                    )}
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
                                                    maxLength={500}
                                                    onChangeCapture={(e) => handleCharacterCount((e.target as HTMLTextAreaElement).value)}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className='flex justify-end'>
                                    <span>
                                        {wordCount}/500
                                    </span>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Status</FormLabel>
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
