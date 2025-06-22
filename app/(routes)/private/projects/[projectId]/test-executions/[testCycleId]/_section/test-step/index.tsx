import { ITestCaseResult } from '@/app/_interface/test-case-result'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, XCircle, CircleGauge, FileCheck, NotepadText, Zap } from 'lucide-react'
import React, { useState } from 'react'

interface TestStepProps {
    testCaseResult: ITestCaseResult,
    onTestStepResult?: (index: number, status: string) => void,
    onBulkTestStepUpdate?: (statusMap: { [key: number]: string }) => void,
    isAdmin?: boolean,
    testStepErrors?: any
    isView?: boolean
}

export default function TestStep({ testCaseResult, onTestStepResult, onBulkTestStepUpdate, isAdmin, testStepErrors, isView }: TestStepProps) {
    const [selectedStatuses, setSelectedStatuses] = useState<{ [key: number]: string }>({});

    const handleStatusChange = (index: number, value: string) => {
        setSelectedStatuses(prev => ({ ...prev, [index]: value }));
        onTestStepResult?.(index, value);
    };

    // Bulk actions
    const handleMarkAllPassed = () => {
        if (!testCaseResult?.testCaseStep) return;
        
        const newStatuses: { [key: number]: string } = {};
        testCaseResult.testCaseStep.forEach((_, index) => {
            newStatuses[index] = "Passed";
            // Only call individual callback if bulk update is not available
            if (!onBulkTestStepUpdate) {
                onTestStepResult?.(index, "Passed");
            }
        });
        setSelectedStatuses(newStatuses);
        
        // Use bulk update if available, otherwise fall back to individual updates
        if (onBulkTestStepUpdate) {
            onBulkTestStepUpdate(newStatuses);
        }
    };

    const handleMarkAllFailed = () => {
        if (!testCaseResult?.testCaseStep) return;
        
        const newStatuses: { [key: number]: string } = {};
        testCaseResult.testCaseStep.forEach((_, index) => {
            newStatuses[index] = "Failed";
            // Only call individual callback if bulk update is not available
            if (!onBulkTestStepUpdate) {
                onTestStepResult?.(index, "Failed");
            }
        });
        setSelectedStatuses(newStatuses);
        
        // Use bulk update if available, otherwise fall back to individual updates
        if (onBulkTestStepUpdate) {
            onBulkTestStepUpdate(newStatuses);
        }
    };

    const getStepIcon = (additionalSelectType?: string) => {
        switch (additionalSelectType) {
            case "Impact": return <CircleGauge className='h-3 w-3' />;
            case "Notes": return <NotepadText className='h-3 w-3' />;
            case "Condition": return <FileCheck className='h-3 w-3' />;
            default: return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Passed": return "bg-green-100 text-green-800 border-green-200";
            case "Failed": return "bg-red-100 text-red-800 border-red-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    return (
        <div className='space-y-4'>
            {/* Bulk Actions */}
            {isAdmin && testCaseResult?.testCaseStep?.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 flex-1">
                        <Zap className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Quick Actions:</span>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleMarkAllPassed}
                            className="flex items-center gap-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-800"
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            Mark All Passed
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleMarkAllFailed}
                            className="flex items-center gap-2 bg-red-50 hover:bg-red-100 border-red-200 text-red-800"
                        >
                            <XCircle className="h-4 w-4" />
                            Mark All Failed
                        </Button>
                    </div>
                </div>
            )}

            {/* Test Steps */}
            {testCaseResult?.testCaseStep?.length > 0 ? (
                <div className="space-y-3">
                    {testCaseResult.testCaseStep.map((testStep, index) => {
                        const stepNumber = testCaseResult.testCaseStep
                            .filter(step => !step?.additionalSelectType)
                            .indexOf(testStep) + 1;
                        
                        const currentStatus = selectedStatuses[index] || testCaseResult?.testSteps?.[index]?.status;

                        return (
                            <Card key={index} className={`transition-all duration-200 ${
                                currentStatus === "Passed" ? "border-green-200 bg-green-50" :
                                currentStatus === "Failed" ? "border-red-200 bg-red-50" :
                                "border-gray-200 hover:border-gray-300"
                            }`}>
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        {/* Step Number/Icon */}
                                        <div className="flex-shrink-0">
                                            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-medium ${
                                                currentStatus === "Passed" ? "bg-green-600" :
                                                currentStatus === "Failed" ? "bg-red-600" :
                                                "bg-blue-600"
                                            }`}>
                                                {testStep?.additionalSelectType ? 
                                                    getStepIcon(testStep.additionalSelectType) : 
                                                    stepNumber
                                                }
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-3">
                                            {/* Step Description */}
                                            <div>
                                                {testStep?.additionalSelectType && (
                                                    <Badge variant="outline" className="mb-2 text-xs">
                                                        {testStep.additionalSelectType}
                                                    </Badge>
                                                )}
                                                <p className="text-gray-900 text-sm leading-relaxed">
                                                    {testStep?.description}
                                                </p>
                                            </div>

                                            {/* Expected Result */}
                                            {testStep?.expectedResult && (
                                                <div className="bg-gray-50 rounded-md p-3 border-l-4 border-blue-500">
                                                    <p className="text-xs font-medium text-gray-600 mb-1">Expected Result:</p>
                                                    <p className="text-sm text-gray-800">{testStep.expectedResult}</p>
                                                </div>
                                            )}

                                            {/* Status Display for View Mode */}
                                            {isView && currentStatus && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-600">Status:</span>
                                                    <Badge className={getStatusColor(currentStatus)}>
                                                        {currentStatus === "Passed" ? (
                                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                                        ) : currentStatus === "Failed" ? (
                                                            <XCircle className="h-3 w-3 mr-1" />
                                                        ) : null}
                                                        {currentStatus}
                                                    </Badge>
                                                </div>
                                            )}

                                            {/* Status Selection for Admin Mode */}
                                            {isAdmin && (
                                                <div className="pt-2 border-t border-gray-200">
                                                    <RadioGroup
                                                        value={selectedStatuses[index] || ""}
                                                        onValueChange={(value) => handleStatusChange(index, value)}
                                                        className="flex gap-6"
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem 
                                                                value="Passed" 
                                                                id={`passed-${index}`}
                                                                className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                                            />
                                                            <Label 
                                                                htmlFor={`passed-${index}`}
                                                                className="text-sm font-medium text-green-700 cursor-pointer"
                                                            >
                                                                Passed
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem 
                                                                value="Failed" 
                                                                id={`failed-${index}`}
                                                                className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                                                            />
                                                            <Label 
                                                                htmlFor={`failed-${index}`}
                                                                className="text-sm font-medium text-red-700 cursor-pointer"
                                                            >
                                                                Failed
                                                            </Label>
                                                        </div>
                                                    </RadioGroup>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}

                    {/* Error Messages */}
                    {!Array.isArray(testStepErrors) && testStepErrors?.message && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-700 text-sm">{testStepErrors.message}</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-8">
                    <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No test steps found for this test case</p>
                </div>
            )}
        </div>
    )
}
