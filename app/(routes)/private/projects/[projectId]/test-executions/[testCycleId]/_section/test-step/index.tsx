import { ITestCaseResult } from '@/app/_interface/test-case-result'
import { CircleGauge, FileCheck, NotepadText } from 'lucide-react'
import React from 'react'

export default function TestStep({ testCaseResult }:
    { testCaseResult: ITestCaseResult }
) {
    return (
        <div className="">
            <div className="text-lg font-semibold">
                Test Step
            </div>
            {testCaseResult?.testCaseStep?.length > 0 ?
                <div className="flex flex-col space-y-4 mt-4">
                    {testCaseResult?.testCaseStep?.map((testStep, index) => (
                        <div key={index} className="flex items-start relative">
                            <div className="flex flex-col items-center relative">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs z-10">
                                    {!testStep?.additionalSelectType && (
                                        testCaseResult?.testCaseStep
                                            .filter(step => !step?.additionalSelectType)
                                            .indexOf(testStep) + 1
                                    )}
                                    {testStep?.additionalSelectType === "Impact" ? <CircleGauge className='h-4 w-4' /> :
                                        testStep?.additionalSelectType === "Notes" ? <NotepadText className='h-4 w-4' /> :
                                            testStep?.additionalSelectType === "Condition" ? <FileCheck className='h-4 w-4' /> : ""
                                    }
                                </div>
                                {index < testCaseResult?.testCaseStep?.length - 1 && (
                                    <div className="absolute top-4 w-[2px] h-full bg-primary"></div>
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
                    ))}
                </div>
                :
                <div className='text-sm ml-1'>
                    No test step found
                </div>
            }
        </div>
    )
}
