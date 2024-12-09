"use client";

import { ITestCycle } from '@/app/_interface/test-cycle';
import { getTestCycleListService } from '@/app/_services/test-cycle.service';
import toasterService from '@/app/_services/toaster-service';
import { Form } from '@/components/ui/form';
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
    const form = useForm<z.infer<typeof rtmSchema>>({
        resolver: zodResolver(rtmSchema),
        defaultValues: {
            testCycle: "",
            testSuite: ""
        },
    });
    const getTestCycles = async () => {
        try {
            const response = await getTestCycleListService(projectId)
            if (response) {
                setTestCycles(response);
            }
        } catch (error) {
            toasterService.error();
        }
    }

    useEffect(() => {
        getTestCycles();
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

                    </form>
                </Form>
            </div>

        </main>
    )
}
