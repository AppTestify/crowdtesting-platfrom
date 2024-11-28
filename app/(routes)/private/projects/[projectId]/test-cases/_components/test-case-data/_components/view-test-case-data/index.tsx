import { ITestCaseData } from '@/app/_interface/test-case-data';
import { getTestCaseDataService } from '@/app/_services/test-case-data.service';
import toasterService from '@/app/_services/toaster-service';
import { Badge } from '@/components/ui/badge';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'

export default function ViewTestCaseData({ testCaseId }: { testCaseId: string }) {
    const { projectId } = useParams<{ projectId: string }>();
    const [testCaseData, setTestCaseData] = useState<ITestCaseData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const getTestCaseData = async () => {
        setIsLoading(true);
        try {
            const response = await getTestCaseDataService(projectId, testCaseId);
            if (response) {
                setTestCaseData(response);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getTestCaseData();
    }, []);

    return (
        <div className='mt-4'>
            {!isLoading ? (
                <div>
                    {testCaseData && testCaseData.length > 0 ? (
                        testCaseData.map((testCase) => (
                            <div key={testCase._id} className="bg-white rounded-lg border overflow-hidden mb-3 ">
                                <div className="p-4">
                                    {/* Name and Type */}
                                    <div className="flex  ">
                                        <div className="flex items-center w-[50%] space-x-2">
                                            <p className="">Name:</p>
                                            <span className="text-gray-700">{testCase.name}</span>
                                        </div>
                                        <div className="flex space-x-2 w-[50%]">
                                            <p className="text-right">Type:</p>
                                            <span className="text-gray-700">{testCase.type}</span>
                                        </div>
                                    </div>

                                    {/* Validation */}
                                    <div className="flex items-center mt-2">
                                        <p className="w-24">Validation:</p>
                                        <div className="flex items-center justify-start w-full flex-wrap">
                                            {testCase.validation?.map((validation, index) => (
                                                <Badge key={index} className="ml-2 font-normal hover:bg-gray-400 bg-gray-400">{validation}</Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex mt-2 space-x-2">
                                        <p className="">Input value:</p>
                                        <span className=" text-gray-700">{testCase.inputValue}</span>
                                    </div>
                                    <div className="flex space-x-2 mt-2">
                                        <p className="text-right">Description:</p>
                                        <span className="text-gray-700">{testCase.description}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div>No test case steps available</div>
                    )}
                </div>
            ) : (
                <div className='text-center h-24'>
                    Loading
                </div>
            )}
        </div>
    )
}
