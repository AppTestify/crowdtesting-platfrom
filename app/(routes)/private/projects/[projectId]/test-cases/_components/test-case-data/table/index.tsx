"use client";

import { useEffect, useState } from "react";
import { ITestCaseData } from "@/app/_interface/test-case-data";
import { Badge } from "@/components/ui/badge";
import { TestCaseDataRowActions } from "../row-actions";

export default function TestCaseDataCard({ testCaseData, refreshTestCaseData }: { testCaseData: ITestCaseData[], refreshTestCaseData: () => void }) {
    const [isLoading, setIsLoading] = useState<boolean>(true);

    return (
        <main className="mt-3">
            <div className="w-full grid grid-cols-1 gap-4">
                {/* Render cards */}
                {testCaseData && testCaseData.length > 0 ? (
                    testCaseData.map((testCase) => (
                        <div key={testCase._id} className="bg-white rounded-lg border overflow-hidden">
                            <div className="p-4">
                                {/* Name and Type */}
                                <div className="flex  mt-2">
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

                            {/* Row Actions (commented out) */}
                            {/* <div className="p-4 border-t">
                                <TestCaseDataRowActions row={testCase} refreshTestCaseData={refreshTestCaseData} />
                            </div> */}
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center">
                        {!isLoading ? (
                            <p className="text-xl text-gray-500">No results</p>
                        ) : (
                            <p className="text-xl text-gray-500">Loading...</p>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
