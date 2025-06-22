"use client";

import { TestCaseExecutionResult, TestCaseExecutionResultList } from '@/app/_constants/test-case';
import { ITestCaseResult } from '@/app/_interface/test-case-result';
import { getTestExecutionByIdService, testModerateService } from '@/app/_services/test-execution.service';
import { getIssuesWithoutPaginationService } from '@/app/_services/issue.service';
import toasterService from '@/app/_services/toaster-service';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/text-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronRight, Frown, Loader2, Meh, Smile, Trash, PlayCircle, CheckCircle2, XCircle, AlertTriangle, Clock, FileText, Upload, Download, Eye, ArrowLeft, Save, ChevronUp, ChevronDown, Link, Plus } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import TestStep from '../../../../projects/[projectId]/test-executions/[testCycleId]/_section/test-step';
import TestData from '../../../../projects/[projectId]/test-executions/[testCycleId]/_section/test-data';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { getSingleTestCaseDataAttachmentsService } from '@/app/_services/test-case-data.service';
import { ITestCaseData } from '@/app/_interface/test-case-data';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getTestCaseAttachmentsService } from '@/app/_services/test-case.service';
import TestCasesMediaRenderer from '@/app/(routes)/private/projects/[projectId]/test-cases/_components/media-render';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { DocumentName } from '@/app/_components/document-name';
import { ColumnDef } from '@tanstack/react-table';
import { IIssueAttachmentDisplay } from '@/app/_interface/issue';
import { Label } from '@/components/ui/label';
import { capitalizeFirstLetter } from '@/app/_constants/capitalize';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, Search } from 'lucide-react';

export default function Moderate() {
    const [testCaseResult, setTestCaseResult] = useState<ITestCaseResult>();
    const [existingIssues, setExistingIssues] = useState<any[]>([]);
    const [issuesLoading, setIssuesLoading] = useState<boolean>(false);
    const [issueAction, setIssueAction] = useState<'create' | 'link'>('create');
    const [issueComboboxOpen, setIssueComboboxOpen] = useState<boolean>(false);
    
    const columns: ColumnDef<IIssueAttachmentDisplay[]>[] = [
        {
            accessorKey: "name",
            cell: ({ row }) => (
                <div>
                    <DocumentName document={row.getValue("name")} />
                </div>
            ),
        },
    ];

    const testCaseResultSchema = z.object({
        result: z.enum([TestCaseExecutionResult.PASSED, TestCaseExecutionResult.FAILED, TestCaseExecutionResult.CAUTION, TestCaseExecutionResult.BLOCKED], {
            errorMap: () => ({ message: "Result is required" }),
        }),
        remarks: z.string().optional(),
        isIssue: z.boolean().optional(),
        linkedIssueId: z.string().optional(),
        testCycle: z.string().optional(),
        attachments: z.array(z.instanceof(File)).optional(),
        testSteps: z.array(
            z.object({
                index: z.number(),
                status: z.string(),
            })
        ).optional()
    }).refine(
        (data) => !(data.result === TestCaseExecutionResult.FAILED && !data.remarks?.trim()),
        {
            message: "Remarks are required when test result is Failed",
            path: ["remarks"],
        }
    );

    const router = useRouter();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isViewLoading, setIsViewLoading] = useState<boolean>(false);
    const [testCaseDataAttachments, setTestCaseDataAttachments] = useState<ITestCaseData[]>([]);
    const { projectId, testExecutionId } = useParams<{ projectId: string, testExecutionId: string }>();
    const [stepResults, setStepResults] = useState<string[]>([]);
    const [testCaseAttachments, setTestCaseAttachments] = useState<any[]>([]);
    const [testCaseAttachmentsLoading, setTestCaseAttachmentsLoading] = useState<boolean>(false);
    const [attchmentsLoading, setAttachmentsLoading] = useState<boolean>(false);
    const [attachments, setAttachments] = useState<File[]>([]);
    const [userManuallyChangedResult, setUserManuallyChangedResult] = useState(false);
    const [testDataExpanded, setTestDataExpanded] = useState(false);
    const [expectedResultExpanded, setExpectedResultExpanded] = useState(false);
    const [attachmentsExpanded, setAttachmentsExpanded] = useState(false);
    
    const form = useForm<z.infer<typeof testCaseResultSchema>>({
        resolver: zodResolver(testCaseResultSchema),
        defaultValues: {
            remarks: "",
            result: undefined,
            isIssue: false,
            linkedIssueId: "",
            testCycle: "",
            attachments: [],
            testSteps: Array.from({ length: testCaseResult?.testCaseStep?.length || 0 }, (_, i) => ({
                index: i,
                status: "",
            })),
        }
    });

    // Progress calculation
    const progress = useMemo(() => {
        const totalSteps = testCaseResult?.testCaseStep?.length || 0;
        const completedSteps = stepResults.filter(result => result !== "").length;
        const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
        
        console.log('Progress calculation:', {
            totalSteps,
            stepResults,
            completedSteps,
            percentage
        });
        
        return {
            total: totalSteps,
            completed: completedSteps,
            percentage
        };
    }, [stepResults, testCaseResult?.testCaseStep?.length]);

    // Get result status color
    const getResultColor = (result: string) => {
        switch (result?.toLowerCase()) {
            case 'passed': return 'bg-green-100 text-green-800 border-green-200';
            case 'failed': return 'bg-red-100 text-red-800 border-red-200';
            case 'caution': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'blocked': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    // Get result icon
    const getResultIcon = (result: string) => {
        switch (result?.toLowerCase()) {
            case 'passed': return <CheckCircle2 className="h-4 w-4" />;
            case 'failed': return <XCircle className="h-4 w-4" />;
            case 'caution': return <AlertTriangle className="h-4 w-4" />;
            case 'blocked': return <Clock className="h-4 w-4" />;
            default: return <PlayCircle className="h-4 w-4" />;
        }
    };

    // Fetch existing issues when result is failed
    const getExistingIssues = async () => {
        setIssuesLoading(true);
        try {
            const response = await getIssuesWithoutPaginationService(projectId);
            console.log('Fetched issues:', response); // Debug log
            console.log('Issues array:', response?.issues || response); // Debug log
            console.log('First issue structure:', response?.issues?.[0] || response?.[0]); // Debug log
            setExistingIssues(response?.issues || response || []);
        } catch (error) {
            console.error('Error fetching issues:', error); // Debug log
            toasterService.error("Failed to fetch existing issues");
        } finally {
            setIssuesLoading(false);
        }
    };

    // default is issue value set
    useEffect(() => {
        if (form.watch("result") === TestCaseExecutionResult.FAILED) {
            form.setValue("isIssue", true);
            form.setValue("testCycle", testCaseResult?.testCycleId?._id);
            // Fetch existing issues when test fails
            getExistingIssues();
        } else {
            form.setValue("isIssue", false);
            form.setValue("linkedIssueId", "");
            setIssueAction('create');
        }
    }, [form.watch("result")]);

    // Reset linked issue when switching between create/link
    useEffect(() => {
        if (issueAction === 'create') {
            form.setValue("linkedIssueId", "");
        }
    }, [issueAction]);

    async function onSubmit(values: z.infer<typeof testCaseResultSchema>) {
        console.log('Form submission started with values:', values);
        console.log('Issue action:', issueAction);
        console.log('Test case result:', testCaseResult);
        console.log('Form errors:', form.formState.errors);
        console.log('Form is valid:', form.formState.isValid);
        
        // Check if form is valid
        const isFormValid = await form.trigger();
        console.log('Overall form validation result:', isFormValid);
        
        if (!isFormValid) {
            console.log('Form validation failed, not submitting');
            console.log('Validation errors:', form.formState.errors);
            toasterService.error('Please fill in all required fields');
            return;
        }
        
        setIsLoading(true);
        
        try {
            if (!testCaseResult || !testCaseResult._id) {
                throw new Error('Test case result not found');
            }

            if (!projectId) {
                throw new Error('Project ID not found');
            }

            // Filter out empty test steps for submission
            const filteredTestSteps = values.testSteps?.filter(step => step.status && step.status.trim() !== '') || [];

            const submitData = {
                ...values,
                testSteps: filteredTestSteps, // Only send test steps that have results
                // Only include linkedIssueId if we're linking an existing issue
                ...(issueAction === 'link' && values.linkedIssueId ? { linkedIssueId: values.linkedIssueId } : {}),
                // Set isIssue to false if we're linking existing issue (don't create new one)
                isIssue: issueAction === 'create' && values.isIssue,
            };
            
            console.log('Submitting data:', submitData);
            
            const response = await testModerateService(projectId, testCaseResult._id, submitData);
            console.log('Response from service:', response);
            
            if (response) {
                toasterService.success(response.message || 'Test execution result saved successfully');
                setAttachments([]);
                router.push(`/private/projects/${projectId}/test-executions/${testCaseResult.testExecutionId}`);
            } else {
                throw new Error('No response received from server');
            }
        } catch (error) {
            console.error('Error saving execution result:', error);
            toasterService.error(error instanceof Error ? error.message : 'Failed to save execution result');
        } finally {
            setIsLoading(false);
        }
    }

    const getTestExecution = async () => {
        setIsViewLoading(true);
        try {
            const response = await getTestExecutionByIdService(projectId, testExecutionId);
            setTestCaseResult(response?.testExecution);
        } catch (error) {
            toasterService.error();
        } finally {
            setIsViewLoading(false);
        }
    };

    const getTestCaseAttachments = async () => {
        setTestCaseAttachmentsLoading(true);
        try {
            if (testCaseResult?.testCaseId?._id) {
                const response = await getTestCaseAttachmentsService(projectId, testCaseResult.testCaseId._id);
                setTestCaseAttachments(response);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setTestCaseAttachmentsLoading(false);
        }
    }

    const getTestCaseDataAttachments = async () => {
        setAttachmentsLoading(true);
        try {
            if (testCaseResult?.testCaseId?._id) {
                const response = await getSingleTestCaseDataAttachmentsService(projectId, testCaseResult.testCaseId._id);
                setTestCaseDataAttachments(response);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setAttachmentsLoading(false);
        }
    }

    const handleTestStepResult = async (index: number, status: string) => {
        console.log(`Updating test step ${index} to status: ${status}`);
        const updatedResults = [...stepResults];
        updatedResults[index] = status;
        setStepResults(updatedResults);
        console.log('Updated stepResults:', updatedResults);

        const totalSteps = testCaseResult?.testCaseStep?.length || 0;
        const allFilled = updatedResults.length === totalSteps && updatedResults.every((s) => s !== "");

        const allPassed = allFilled && updatedResults.every((s) => s === "Passed");
        const anyFailed = updatedResults.includes("Failed");

        if (allFilled && !userManuallyChangedResult) {
            const newResult = anyFailed
                ? TestCaseExecutionResult.FAILED
                : allPassed
                    ? TestCaseExecutionResult.PASSED
                    : "";

            form.setValue("result", newResult as TestCaseExecutionResult, { shouldValidate: true });

            await form.trigger("result");

        }

        const updatedTestSteps = updatedResults.map((s, i) => ({
            index: i,
            status: s || "",
        }));

        form.setValue("testSteps", updatedTestSteps, {
            shouldValidate: true,
            shouldTouch: true,
            shouldDirty: true,
        });

        await form.trigger(`testSteps.${index}.status`);
    }

    // Bulk update function for handling multiple test step updates efficiently
    const handleBulkTestStepUpdate = async (statusMap: { [key: number]: string }) => {
        console.log('Bulk updating test steps:', statusMap);
        const updatedResults = [...stepResults];
        
        // Update all statuses at once
        Object.entries(statusMap).forEach(([indexStr, status]) => {
            const index = parseInt(indexStr);
            updatedResults[index] = status;
        });
        
        setStepResults(updatedResults);
        console.log('Bulk updated stepResults:', updatedResults);

        const totalSteps = testCaseResult?.testCaseStep?.length || 0;
        const allFilled = updatedResults.length === totalSteps && updatedResults.every((s) => s !== "");

        const allPassed = allFilled && updatedResults.every((s) => s === "Passed");
        const anyFailed = updatedResults.includes("Failed");

        if (allFilled && !userManuallyChangedResult) {
            const newResult = anyFailed
                ? TestCaseExecutionResult.FAILED
                : allPassed
                    ? TestCaseExecutionResult.PASSED
                    : "";

            form.setValue("result", newResult as TestCaseExecutionResult, { shouldValidate: true });
            await form.trigger("result");
        }

        const updatedTestSteps = updatedResults.map((s, i) => ({
            index: i,
            status: s || "",
        }));

        form.setValue("testSteps", updatedTestSteps, {
            shouldValidate: true,
            shouldTouch: true,
            shouldDirty: true,
        });
    }

    // Attachment functions
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);

            setAttachments((prevAttachments = []) => {
                const uniqueAttachments = newFiles.filter(
                    (file) =>
                        !prevAttachments.some(
                            (prevFile) => prevFile.name === file.name && prevFile.size === file.size
                        )
                );

                const updatedAttachments = [...prevAttachments, ...uniqueAttachments];
                form.setValue("attachments", updatedAttachments);

                return updatedAttachments;
            });

        }
    };

    const handleRemoveFile = (index: number) => {
        setAttachments((prevAttachments) => {
            const updatedAttachments = prevAttachments?.filter((_, i) => i !== index);
            form.setValue("attachments", updatedAttachments);

            return updatedAttachments;
        });

        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const handleCancelClick = () => {
        if (!projectId || !testCaseResult?.testExecutionId) return;
        router.push(`/private/projects/${projectId}/test-executions/${testCaseResult.testExecutionId}`);
    };

    useEffect(() => {
        getTestCaseDataAttachments();
        getTestCaseAttachments();
    }, [testCaseResult?.testCaseId?._id]);

    useEffect(() => {
        getTestExecution();
    }, []);

    // Initialize form when testCaseResult is loaded
    useEffect(() => {
        if (testCaseResult) {
            console.log('Initializing form with test case result:', testCaseResult);
            const testStepsLength = testCaseResult?.testCaseStep?.length || 0;
            console.log('Test steps length:', testStepsLength);
            
            form.reset({
                remarks: "",
                result: undefined,
                isIssue: false,
                linkedIssueId: "",
                testCycle: "",
                attachments: [],
                testSteps: Array.from({ length: testStepsLength }, (_, i) => ({
                    index: i,
                    status: "",
                })),
            });
            
            // Initialize stepResults array
            setStepResults(new Array(testStepsLength).fill(""));
        }
    }, [testCaseResult]);

    return (
        <div className="w-full min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-7xl mx-auto">
                    <Breadcrumb className="mb-3">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href={`/private/projects/${projectId}/test-executions/${testCaseResult?.testExecutionId}`}>
                                    Test Executions
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator>
                                <ChevronRight className='h-3 w-3' />
                            </BreadcrumbSeparator>
                            <BreadcrumbItem>
                                <BreadcrumbPage className="font-medium">
                                    {testCaseResult?.testCaseId?.title || 'Test Case Execution'}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <PlayCircle className="h-6 w-6 text-blue-600" />
                                Test Case Execution
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Execute test steps and provide results for this test case
                            </p>
                        </div>
                        
                        <Button
                            variant="outline"
                            onClick={handleCancelClick}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to List
                        </Button>
                    </div>
                </div>
            </div>

            {isViewLoading ? (
                <div className="max-w-7xl mx-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <Skeleton className="h-[200px] w-full rounded-lg" />
                            <Skeleton className="h-[300px] w-full rounded-lg" />
                            <Skeleton className="h-[200px] w-full rounded-lg" />
                        </div>
                        <div className="space-y-6">
                            <Skeleton className="h-[150px] w-full rounded-lg" />
                            <Skeleton className="h-[250px] w-full rounded-lg" />
                            <Skeleton className="h-[100px] w-full rounded-lg" />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Test Case Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Test Case Info */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <FileText className="h-5 w-5 text-blue-600" />
                                                {testCaseResult?.testCaseId?.customId}
                                            </CardTitle>
                                            <CardDescription className="mt-1">
                                                {testCaseResult?.testCaseId?.title}
                                            </CardDescription>
                                        </div>
                                        
                                        {testCaseResult?.testCaseId?.severity && (
                                            <Badge className={`${
                                                testCaseResult.testCaseId.severity?.toLowerCase() === 'critical' ? 'bg-red-100 text-red-800 border-red-200' :
                                                testCaseResult.testCaseId.severity?.toLowerCase() === 'high' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                                testCaseResult.testCaseId.severity?.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                'bg-blue-100 text-blue-800 border-blue-200'
                                            }`}>
                                                {testCaseResult.testCaseId.severity}
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                
                                <CardContent>
                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">Execution Progress</span>
                                            <span className="text-sm text-gray-600">
                                                {progress.completed}/{progress.total} steps completed
                                            </span>
                                        </div>
                                        <Progress value={progress.percentage} className="h-2" />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Test Data */}
                            {attchmentsLoading ? (
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="space-y-3">
                                            <Skeleton className="h-[50px] w-full" />
                                            <Skeleton className="h-[50px] w-full" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card>
                                    <CardHeader 
                                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => setTestDataExpanded(!testDataExpanded)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2">
                                                <FileText className="h-5 w-5 text-purple-600" />
                                                Test Data
                                            </CardTitle>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                {testDataExpanded ? (
                                                    <ChevronUp className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    {testDataExpanded && (
                                        <CardContent>
                                            <TestData testCaseResult={testCaseDataAttachments as unknown as ITestCaseResult} />
                                        </CardContent>
                                    )}
                                </Card>
                            )}

                            {/* Expected Results */}
                            <Card>
                                <CardHeader 
                                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => setExpectedResultExpanded(!expectedResultExpanded)}
                                >
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <Eye className="h-5 w-5 text-indigo-600" />
                                            Expected Result
                                        </CardTitle>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            {expectedResultExpanded ? (
                                                <ChevronUp className="h-4 w-4" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </CardHeader>
                                {expectedResultExpanded && (
                                    <CardContent>
                                        <div
                                            className="text-sm leading-relaxed text-gray-700 space-y-2 rich-description prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{
                                                __html: testCaseResult?.testCaseId?.expectedResult || "No expected result specified.",
                                            }}
                                        />
                                    </CardContent>
                                )}
                            </Card>

                            {/* Test Steps */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        Test Steps
                                    </CardTitle>
                                    <CardDescription>
                                        Execute each test step and mark the result
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <TestStep 
                                        testCaseResult={testCaseResult as ITestCaseResult}
                                        onTestStepResult={handleTestStepResult} 
                                        onBulkTestStepUpdate={handleBulkTestStepUpdate}
                                        isAdmin={true}
                                        testStepErrors={form.formState.errors.testSteps} 
                                    />
                                </CardContent>
                            </Card>

                            {/* Test Case Attachments */}
                            {testCaseAttachmentsLoading ? (
                                <Card>
                                    <CardContent className="p-6">
                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                            <Skeleton className="h-[140px] w-full" />
                                            <Skeleton className="h-[140px] w-full" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : testCaseAttachments && testCaseAttachments.length > 0 && (
                                <Card>
                                    <CardHeader 
                                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => setAttachmentsExpanded(!attachmentsExpanded)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Download className="h-5 w-5 text-gray-600" />
                                                    Reference Attachments
                                                </CardTitle>
                                                <CardDescription>
                                                    Additional files related to this test case
                                                </CardDescription>
                                            </div>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                {attachmentsExpanded ? (
                                                    <ChevronUp className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    {attachmentsExpanded && (
                                        <CardContent>
                                            <TestCasesMediaRenderer
                                                attachments={testCaseAttachments || []}
                                                title={""}
                                            />
                                        </CardContent>
                                    )}
                                </Card>
                            )}
                        </div>

                        {/* Right Column - Execution Form */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Save className="h-5 w-5 text-green-600" />
                                        Execution Result
                                    </CardTitle>
                                    <CardDescription>
                                        Provide the execution result and any additional details
                                    </CardDescription>
                                </CardHeader>
                                
                                <CardContent>
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                            {/* Result Selection */}
                                            <FormField
                                                control={form.control}
                                                name="result"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-base font-medium">Test Result</FormLabel>
                                                        <FormControl>
                                                            <Select
                                                                onOpenChange={(isOpen) => {
                                                                    if (isOpen && !userManuallyChangedResult) {
                                                                        setUserManuallyChangedResult(true);
                                                                    }
                                                                }}
                                                                onValueChange={(value) => {
                                                                    field.onChange(value);
                                                                }}
                                                                value={field.value}
                                                            >
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Select test result" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectGroup>
                                                                        {TestCaseExecutionResultList.map((result) => (
                                                                            <SelectItem key={result} value={result}>
                                                                                <div className="flex items-center gap-2">
                                                                                    {getResultIcon(result)}
                                                                                    {capitalizeFirstLetter(result)}
                                                                                </div>
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectGroup>
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Current Result Display */}
                                            {form.watch("result") && (
                                                <div className="p-3 rounded-lg border bg-gray-50">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-gray-700">Current Result:</span>
                                                        <Badge className={getResultColor(form.watch("result"))}>
                                                            {getResultIcon(form.watch("result"))}
                                                            <span className="ml-1">{capitalizeFirstLetter(form.watch("result"))}</span>
                                                        </Badge>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Issue Creation/Linking Options */}
                                            {form.watch("result") === TestCaseExecutionResult.FAILED && (
                                                <div className="space-y-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="isIssue"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <div className="flex items-center space-x-2 p-3 rounded-lg border bg-red-50">
                                                                        <Checkbox 
                                                                            checked={field.value} 
                                                                            defaultChecked
                                                                            id="issue" 
                                                                            onCheckedChange={(checked: boolean) => field.onChange(checked)} 
                                                                        />
                                                                        <label
                                                                            htmlFor="issue"
                                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                                        >
                                                                            Handle issue for this failed test case
                                                                        </label>
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    {/* Issue Action Selection */}
                                                    {form.watch("isIssue") && (
                                                        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                                                            <Label className="text-sm font-medium text-gray-700">
                                                                Choose Issue Action
                                                            </Label>
                                                            <RadioGroup
                                                                value={issueAction}
                                                                onValueChange={(value: 'create' | 'link') => setIssueAction(value)}
                                                                className="flex flex-col space-y-3"
                                                            >
                                                                <div className="flex items-center space-x-3">
                                                                    <RadioGroupItem value="create" id="create-issue" />
                                                                    <Label htmlFor="create-issue" className="flex items-center gap-2 cursor-pointer text-sm">
                                                                        <Plus className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                                        <span>Create new issue</span>
                                                                    </Label>
                                                                </div>
                                                                <div className="flex items-center space-x-3">
                                                                    <RadioGroupItem value="link" id="link-issue" />
                                                                    <Label htmlFor="link-issue" className="flex items-center gap-2 cursor-pointer text-sm">
                                                                        <Link className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                                                        <span>Link to existing issue</span>
                                                                    </Label>
                                                                </div>
                                                            </RadioGroup>

                                                            {/* Existing Issues Selection */}
                                                            {issueAction === 'link' && (
                                                                <FormField
                                                                    control={form.control}
                                                                    name="linkedIssueId"
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel>Select Existing Issue</FormLabel>
                                                                            <FormControl>
                                                                                <Popover open={issueComboboxOpen} onOpenChange={setIssueComboboxOpen}>
                                                                                    <PopoverTrigger asChild>
                                                                                        <Button
                                                                                            variant="outline"
                                                                                            role="combobox"
                                                                                            aria-expanded={issueComboboxOpen}
                                                                                            className="w-full justify-between text-left h-auto min-h-[40px] px-3 py-2"
                                                                                            disabled={issuesLoading}
                                                                                        >
                                                                                            {field.value ? (
                                                                                                (() => {
                                                                                                    const selectedIssue = existingIssues.find(
                                                                                                        issue => (issue._id || issue.id) === field.value
                                                                                                    );
                                                                                                    return selectedIssue ? (
                                                                                                        <div className="flex items-center gap-2 truncate w-full">
                                                                                                            <Badge variant="outline" className="text-xs flex-shrink-0">
                                                                                                                {selectedIssue.customId || selectedIssue._id?.slice(-6)}
                                                                                                            </Badge>
                                                                                                            <Badge className={`text-xs flex-shrink-0 ${
                                                                                                                selectedIssue.severity?.toLowerCase() === 'critical' ? 'bg-red-100 text-red-800' :
                                                                                                                selectedIssue.severity?.toLowerCase() === 'high' ? 'bg-orange-100 text-orange-800' :
                                                                                                                selectedIssue.severity?.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                                                                'bg-blue-100 text-blue-800'
                                                                                                            }`}>
                                                                                                                {selectedIssue.severity}
                                                                                                            </Badge>
                                                                                                            <span className="truncate flex-1 min-w-0">{selectedIssue.title}</span>
                                                                                                        </div>
                                                                                                    ) : "Issue not found";
                                                                                                })()
                                                                                            ) : (
                                                                                                <span className="text-muted-foreground">
                                                                                                    {issuesLoading ? "Loading issues..." : "Search and select an issue..."}
                                                                                                </span>
                                                                                            )}
                                                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                                        </Button>
                                                                                    </PopoverTrigger>
                                                                                    <PopoverContent className="w-full min-w-[300px] max-w-[500px] p-0" align="start" side="bottom">
                                                                                        <Command className="w-full">
                                                                                            <CommandInput 
                                                                                                placeholder="Search issues by ID, title, or severity..." 
                                                                                                className="h-9" 
                                                                                            />
                                                                                            <CommandList className="max-h-[200px] overflow-y-auto">
                                                                                                <CommandEmpty>
                                                                                                    {issuesLoading ? (
                                                                                                        <div className="flex items-center justify-center py-6">
                                                                                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                                                                            Loading issues...
                                                                                                        </div>
                                                                                                    ) : (
                                                                                                        "No issues found."
                                                                                                    )}
                                                                                                </CommandEmpty>
                                                                                                <CommandGroup>
                                                                                                    {existingIssues
                                                                                                        .filter(issue => issue && (issue._id || issue.id))
                                                                                                        .map((issue) => (
                                                                                                            <CommandItem
                                                                                                                key={issue._id || issue.id}
                                                                                                                value={`${issue.customId || issue._id} ${issue.title} ${issue.severity}`}
                                                                                                                onSelect={() => {
                                                                                                                    console.log('Issue selected via combobox:', issue);
                                                                                                                    field.onChange(issue._id || issue.id);
                                                                                                                    setIssueComboboxOpen(false);
                                                                                                                }}
                                                                                                                className="flex items-center gap-2 p-3 cursor-pointer"
                                                                                                            >
                                                                                                                <Check
                                                                                                                    className={`h-4 w-4 flex-shrink-0 ${
                                                                                                                        field.value === (issue._id || issue.id)
                                                                                                                            ? "opacity-100"
                                                                                                                            : "opacity-0"
                                                                                                                    }`}
                                                                                                                />
                                                                                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                                                                    <Badge variant="outline" className="text-xs font-mono flex-shrink-0">
                                                                                                                        {issue.customId || `#${issue._id?.slice(-6)}`}
                                                                                                                    </Badge>
                                                                                                                    <Badge className={`text-xs flex-shrink-0 ${
                                                                                                                        issue.severity?.toLowerCase() === 'critical' ? 'bg-red-100 text-red-800' :
                                                                                                                        issue.severity?.toLowerCase() === 'high' ? 'bg-orange-100 text-orange-800' :
                                                                                                                        issue.severity?.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                                                                        'bg-blue-100 text-blue-800'
                                                                                                                    }`}>
                                                                                                                        {issue.severity || 'Unknown'}
                                                                                                                    </Badge>
                                                                                                                    <span className="truncate text-sm flex-1 min-w-0">
                                                                                                                        {issue.title || 'Untitled Issue'}
                                                                                                                    </span>
                                                                                                                </div>
                                                                                                            </CommandItem>
                                                                                                        ))}
                                                                                                </CommandGroup>
                                                                                            </CommandList>
                                                                                        </Command>
                                                                                    </PopoverContent>
                                                                                </Popover>
                                                                            </FormControl>
                                                                            {/* Selected Issue Info */}
                                                                            {field.value && (
                                                                                <div className="text-xs text-gray-500 mt-2 p-3 bg-gray-50 rounded border">
                                                                                    {(() => {
                                                                                        const selectedIssue = existingIssues.find(issue => (issue._id || issue.id) === field.value);
                                                                                        return selectedIssue ? (
                                                                                            <div className="space-y-2">
                                                                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                                                                                    <strong className="text-gray-700 min-w-0 flex-shrink-0">ID:</strong> 
                                                                                                    <span className="font-mono text-xs bg-white px-2 py-1 rounded border truncate">
                                                                                                        {selectedIssue.customId || selectedIssue._id}
                                                                                                    </span>
                                                                                                </div>
                                                                                                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                                                                                                    <strong className="text-gray-700 min-w-0 flex-shrink-0">Title:</strong> 
                                                                                                    <span className="break-words">{selectedIssue.title}</span>
                                                                                                </div>
                                                                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                                                                                    <strong className="text-gray-700 min-w-0 flex-shrink-0">Severity:</strong> 
                                                                                                    <Badge className={`text-xs w-fit ${
                                                                                                        selectedIssue.severity?.toLowerCase() === 'critical' ? 'bg-red-100 text-red-800' :
                                                                                                        selectedIssue.severity?.toLowerCase() === 'high' ? 'bg-orange-100 text-orange-800' :
                                                                                                        selectedIssue.severity?.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                                                        'bg-blue-100 text-blue-800'
                                                                                                    }`}>
                                                                                                        {selectedIssue.severity}
                                                                                                    </Badge>
                                                                                                </div>
                                                                                                {selectedIssue.priority && (
                                                                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                                                                                        <strong className="text-gray-700 min-w-0 flex-shrink-0">Priority:</strong> 
                                                                                                        <span>{selectedIssue.priority}</span>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                        ) : "Issue details not found";
                                                                                    })()}
                                                                                </div>
                                                                            )}
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Remarks */}
                                            <FormField
                                                control={form.control}
                                                name="remarks"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Remarks</FormLabel>
                                                        <FormControl>
                                                            <Textarea 
                                                                {...field} 
                                                                placeholder="Add any additional comments or observations..."
                                                                className="min-h-[100px]"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Attachments */}
                                            <div className="space-y-3">
                                                <Label htmlFor="attachments" className="text-base font-medium">
                                                    Evidence Attachments
                                                </Label>
                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                                                    <Input
                                                        className="hidden"
                                                        id="attachments"
                                                        type="file"
                                                        multiple
                                                        ref={inputRef}
                                                        onChange={handleFileChange}
                                                    />
                                                    <label
                                                        htmlFor="attachments"
                                                        className="flex flex-col items-center justify-center cursor-pointer"
                                                    >
                                                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                                        <span className="text-sm font-medium text-gray-700">
                                                            Click to upload files
                                                        </span>
                                                        <span className="text-xs text-gray-500 mt-1">
                                                            Screenshots, logs, or other evidence
                                                        </span>
                                                    </label>
                                                </div>

                                                {/* Uploaded Files */}
                                                {attachments?.length > 0 && (
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium text-gray-700">
                                                            Uploaded Files ({attachments.length})
                                                        </Label>
                                                        <div className="border rounded-lg">
                                                            <Table>
                                                                <TableBody>
                                                                    {attachments.map((attachment, index) => (
                                                                        <TableRow key={index}>
                                                                            <TableCell className="py-2">
                                                                                <DocumentName document={attachment} />
                                                                            </TableCell>
                                                                            <TableCell className="py-2 w-12">
                                                                                <Button
                                                                                    type="button"
                                                                                    onClick={() => handleRemoveFile(index)}
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    className="h-8 w-8 p-0"
                                                                                >
                                                                                    <Trash className="h-4 w-4 text-red-500" />
                                                                                </Button>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <Separator />

                                            {/* Action Buttons */}
                                            <div className="flex flex-col gap-3">
                                                <Button
                                                    disabled={isLoading}
                                                    type="submit"
                                                    size="lg"
                                                    className="w-full"
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Saving Result...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save className="mr-2 h-4 w-4" />
                                                            Save Execution Result
                                                        </>
                                                    )}
                                                </Button>
                                                
                                                <Button
                                                    disabled={isLoading}
                                                    type="button"
                                                    variant="outline"
                                                    size="lg"
                                                    className="w-full"
                                                    onClick={handleCancelClick}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
