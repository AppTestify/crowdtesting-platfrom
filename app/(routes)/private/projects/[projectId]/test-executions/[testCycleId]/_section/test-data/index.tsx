import { accordionBodyColors, accrodionColors } from '@/app/_constants/test-case'
import { ITestCaseResult } from '@/app/_interface/test-case-result'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import React from 'react'
import TestCasesMediaRenderer from '../../../../test-cases/_components/media-render'

export default function TestData({ testCaseResult }:
    { testCaseResult: ITestCaseResult }
) {
    return (
        <div className="mt-5">
            <div className="text-lg font-semibold">
                Test data
            </div>
            {testCaseResult?.testCaseData?.length > 0 ?
                <div className='mt-2'>
                    {testCaseResult?.testCaseData?.map((testData, index) => (
                        <Accordion type="single" collapsible className={`mb-2 rounded-lg w-[95%] ${accordionBodyColors[index % accordionBodyColors.length]} relative`}>
                            <AccordionItem value="item-1">
                                <AccordionTrigger className="ml-4 pr-8">{testData?.name}</AccordionTrigger>
                                <AccordionContent className="pr-8">
                                    <div className="ml-4 mt-1 space-y-1">
                                        <p className="text-gray-700">
                                            <span className="font-medium">Name:</span> {testData?.name}
                                        </p>
                                        <p className="text-gray-700">
                                            <span className="font-medium">Type:</span> {testData?.type}
                                        </p>
                                        <p className="text-gray-700">
                                            <span className="font-medium">Input Value:</span> {testData?.inputValue}
                                        </p>
                                        <p className="text-gray-700">
                                            Description:
                                            <span dangerouslySetInnerHTML={{
                                                __html: testData?.description || "",
                                            }} className="font-medium" />
                                        </p>
                                        {testData?.attachments &&
                                            <div>
                                                <TestCasesMediaRenderer
                                                    attachments={testData?.attachments || []}
                                                    title={"Attachments"}
                                                />
                                            </div>
                                        }
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                            <div
                                className={`absolute rounded-r-none rounded-lg left-0 top-0 w-1.5 h-full ${accrodionColors[index % accrodionColors.length]}`}
                            ></div>
                        </Accordion>
                    ))}
                </div>
                :
                <div className='text-sm ml-1'>
                    No test data found
                </div>
            }
        </div>
    )
}
