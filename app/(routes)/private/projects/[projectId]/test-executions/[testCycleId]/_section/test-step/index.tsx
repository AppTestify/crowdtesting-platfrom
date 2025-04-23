import { ITestCaseResult } from '@/app/_interface/test-case-result'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CircleGauge, FileCheck, NotepadText } from 'lucide-react'
import React, { useLayoutEffect, useRef, useState } from 'react'

interface TestStepProps {
    testCaseResult: ITestCaseResult,
    onTestStepResult?: (index: number, status: string) => void,
    isAdmin?: boolean,
    testStepErrors?: any
    isView?: boolean
}


export default function TestStep({ testCaseResult, onTestStepResult, isAdmin, testStepErrors, isView }: TestStepProps) {
    const [selectedStatuses, setSelectedStatuses] = useState<{ [key: number]: string }>({});

    const handleStatusChange = (index: number, value: string) => {
        setSelectedStatuses(prev => ({ ...prev, [index]: value }));
        onTestStepResult?.(index, value);
    };

    const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [lineHeights, setLineHeights] = useState<number[]>([]);

    useLayoutEffect(() => {
        const heights = stepRefs.current.map((ref, index) => {
            if (ref && stepRefs.current[index + 1]) {
                const nextRef = stepRefs.current[index + 1];
                if (nextRef) {
                    const height = nextRef.offsetTop - ref.offsetTop;
                    return height;
                }
            }
            return 0;
        });

        setLineHeights(heights);
    }, [testCaseResult]);
    return (
        <div className='max-h-[85vh] overflow-auto'>
            <div className="text-lg font-semibold">
                Test Step
            </div>
            {testCaseResult?.testCaseStep?.length > 0 ?
                <div className="flex flex-col space-y-4 mt-4">
                    {testCaseResult?.testCaseStep?.map((testStep, index) => (
                        <div key={index} ref={(el) => { stepRefs.current[index] = el; }} className="flex flex-col items-start relative space-y-2">
                            <div className="flex items-start">
                                <div className="flex flex-col items-center relative">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs z-10">
                                        {!testStep?.additionalSelectType && (
                                            testCaseResult?.testCaseStep
                                                .filter(step => !step?.additionalSelectType)
                                                .indexOf(testStep) + 1
                                        )}
                                        {testStep?.additionalSelectType === "Impact" ? <CircleGauge className='h-4 w-4' /> :
                                            testStep?.additionalSelectType === "Notes" ? <NotepadText className='h-4 w-4' /> :
                                                testStep?.additionalSelectType === "Condition" ? <FileCheck className='h-4 w-4' /> : ""}
                                    </div>
                                    {index < testCaseResult?.testCaseStep?.length - 1 && (
                                        <div
                                            className="absolute top-6 w-[3px] bg-primary"
                                            style={{ height: `${lineHeights[index] || 0}px` }}
                                        />
                                    )}
                                </div>
                                <div className="ml-4 text-gray-700 text-[15px]">
                                    {testStep?.additionalSelectType && (
                                        <span className="font-semibold text-black mr-2">
                                            {testStep?.additionalSelectType} -
                                        </span>
                                    )}
                                    {testStep?.description}
                                </div>
                            </div>
                            {testStep?.expectedResult &&
                                <div className="ml-10 text-gray-700 text-[15px]">
                                    <span className='text-black font-medium'>Expected result:</span>  {testStep?.expectedResult}
                                </div>
                            }
                            {isView && testCaseResult?.testSteps?.[index]?.status && (
                                <div className="ml-10 text-gray-700 text-sm font-medium">
                                    Status: <span className={`${testCaseResult.testSteps[index].status === "Passed"
                                        ? "text-primary" : testCaseResult.testSteps[index].status === "Failed"
                                            ? "text-destructive" : ""}`}>{testCaseResult.testSteps[index].status}</span>
                                </div>
                            )}
                            {isAdmin &&
                                <>
                                    <div className='flex flex-row gap-4 mt-2 ml-10'>
                                        <RadioGroup
                                            onValueChange={(value) => handleStatusChange(index, value)}
                                            className="flex flex-row gap-6"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Passed" id={`passed-${index}`} />
                                                <Label htmlFor={`passed-${index}`}>Passed</Label>
                                            </div>
                                            <div className={`flex items-center space-x-2 ${selectedStatuses === "failed" && 'bg-destructive'}`}>
                                                <RadioGroupItem className="data-[state=checked]:text-destructive data-[state=checked]:fill-destructive"
                                                    value="Failed" id={`failed-${index}`} />
                                                <Label htmlFor={`failed-${index}`}>Failed</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                    {testCaseResult?.testCaseStep?.map((testStep, index) => (
                                        <div key={index} className="flex flex-col items-start relative space-y-2">
                                            {Array.isArray(testStep) && testStep[index]?.status && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {testStep[index].status.message}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </>
                            }
                        </div>
                    ))}
                    {!Array.isArray(testStepErrors) && testStepErrors?.message && (
                        <p className="text-red-500 text-sm mt-2">
                            {testStepErrors.message}
                        </p>
                    )}

                </div>
                :
                <div className='text-sm ml-1'>
                    No test step found
                </div>
            }
        </div>
    )
}
