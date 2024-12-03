"use client";

import { ITestCaseResult } from '@/app/_interface/test-case-result';
import { getTestExecutionsService } from '@/app/_services/test-execution.service';
import toasterService from '@/app/_services/toaster-service';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'

export default function TestCasesInTestExecution() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [testExecution, setTestExecution] = useState<ITestCaseResult[]>([]);
    const { projectId } = useParams<{ projectId: string }>();
    const { testCycleId } = useParams<{ testCycleId: string }>();

    const getTestCycle = async () => {
        setIsLoading(true);
        try {
            const response = await getTestExecutionsService(projectId, testCycleId);
            setTestExecution(response?.testCycles);
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getTestCycle();
    }, []);

    return (
        <main className="mx-4 mt-2">
            <div className="">
                <h2 className="text-medium">Test execution</h2>
                {/* <span className="text-xs text-gray-600">
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                    cumque vel nesciunt sunt velit possimus sapiente tempore repudiandae fugit fugiat.
                </span> */}
            </div>
        </main>
    )
}
