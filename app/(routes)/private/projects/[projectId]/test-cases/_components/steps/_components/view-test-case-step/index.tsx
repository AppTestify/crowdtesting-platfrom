import { ITestCaseStep } from '@/app/_interface/test-case-step';
import { getTestCaseStepService } from '@/app/_services/test-case-step.service';
import toasterService from '@/app/_services/toaster-service';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'

export default function TestCaseStepView({ testCaseId }: { testCaseId: string }) {
    const { projectId } = useParams<{ projectId: string }>();
    const [testCaseSteps, setTestCaseSteps] = useState<ITestCaseStep[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const getSteps = async () => {
        setIsLoading(true);
        try {
            const response = await getTestCaseStepService(projectId, testCaseId);
            setTestCaseSteps(response);
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getSteps();
    }, []);

    return (
        <div className='mt-4'>
            {!isLoading ? (
                <div>
                    {testCaseSteps.length > 0 ? (
                        testCaseSteps.map((testCaseStep, index) => (
                            <div key={index} className='flex items-center justify-between mb-2 p-2 border border-1 rounded-md'>
                                <span>
                                    <span>
                                        {testCaseStep?.selectedType ?
                                            <span className="text-sm text-gray-800">Step {testCaseSteps.filter(step => step.selectedType).indexOf(testCaseStep) + 1} : </span> :
                                            <span>{testCaseStep?.additionalSelectType} : </span>
                                        }
                                    </span>
                                    {testCaseStep?.description}
                                    <div>
                                        {testCaseStep?.expectedResult}
                                    </div>
                                </span>
                            </div>
                        ))
                    ) : (
                        <div>No test data available</div>
                    )}
                </div>
            ) : (
                <div>
                    {Array(3).fill(null).map((_, index) => (
                        <div className='mt-2'>
                            <Skeleton key={index} className="h-10 w-full bg-gray-200" />
                        </div>
                    ))
                    }
                </div>
            )}
        </div>
    );
}    