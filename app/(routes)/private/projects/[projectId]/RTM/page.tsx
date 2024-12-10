"use client";

import { SEVERITY_LIST } from '@/app/_constants/issue';
import { ITestCycle } from '@/app/_interface/test-cycle';
import { ITestSuite } from '@/app/_interface/test-suite';
import { getTestCycleListService } from '@/app/_services/test-cycle.service';
import { getTestWithoutPaginationSuiteService } from '@/app/_services/test-suite.service';
import toasterService from '@/app/_services/toaster-service';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const rtmSchema = z.object({
    testCycle: z.string().optional(),
    testSuite: z.string().optional(),
});

export default function RTM() {

    const { projectId } = useParams<{ projectId: string }>();
    const [testCycles, setTestCycles] = useState<ITestCycle[]>([]);
    const [testSuites, setTestSuites] = useState<ITestSuite[]>([]);
    const [isViewLoading, setIsViewLoading] = useState<boolean>(false);
    const form = useForm<z.infer<typeof rtmSchema>>({
        resolver: zodResolver(rtmSchema),
        defaultValues: {
            testCycle: "",
            testSuite: ""
        },
    });

    const getTestCycles = async () => {
        setIsViewLoading(true);
        try {
            const response = await getTestCycleListService(projectId)
            if (response) {
                setTestCycles(response);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsViewLoading(false);
        }
    }

    const getTestSuites = async () => {
        setIsViewLoading(true);
        try {
            const response = await getTestWithoutPaginationSuiteService(projectId)
            if (response) {
                setTestSuites(response);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsViewLoading(false);
        }
    }

    useEffect(() => {
        getTestCycles();
        getTestSuites();
    }, []);

    async function onSubmit(values: z.infer<typeof rtmSchema>) {
        try {
            // const response = await addRequirementService(projectId, { ...values });
            // if (response) {
            //     refreshRequirements();
            //     toasterService.success(response.message);
            // }
        } catch (error) {
            toasterService.error();
        }
    }

    return (
        <main className="mx-4 mt-2">
            <div className="">
                <h2 className="text-medium">RTM</h2>
                <span className="text-xs text-gray-600">
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                    cumque vel nesciunt sunt velit possimus sapiente tempore repudiandae fugit fugiat.
                </span>
            </div>
            <div className="mt-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} method="post">
                        {isViewLoading ?
                            <div className='flex mt-10'>
                                <Skeleton className="h-10 w-[325px]" />
                                <Skeleton className="ml-3 h-10 w-[325px]" />
                            </div>
                            :
                            <div className="grid grid-cols-3 gap-2 mt-3">
                                <FormField
                                    control={form.control}
                                    name="testCycle"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Test cycle</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {testCycles.map((testCycle) => (
                                                            <SelectItem value={testCycle?._id as string}>
                                                                {testCycle.title}
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
                                    name="testSuite"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Test suite</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {testSuites.map((testSuite) => (
                                                            <SelectItem value={testSuite?._id as string}>
                                                                {testSuite.title}
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
                        }
                    </form>
                </Form>
            </div>

        </main>
    )
}
