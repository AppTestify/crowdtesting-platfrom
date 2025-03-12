"use client";

import { TestCaseExecutionResult, TestCaseExecutionResultList } from '@/app/_constants/test-case';
import { ITestCaseResult } from '@/app/_interface/test-case-result';
import { getTestExecutionByIdService, testModerateService } from '@/app/_services/test-execution.service';
import toasterService from '@/app/_services/toaster-service';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/text-area';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronRight, Frown, Loader2, Meh, Smile, Trash } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react'
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

export default function Moderate() {
    const [testCaseResult, setTestCaseResult] = useState<ITestCaseResult>();
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
        testCycle: z.string().optional(),
        attachments: z.array(z.instanceof(File)).optional(),
        testSteps: z.array(
            z.object({
                index: z.number(),
                status: z.string().min(1, "Test step is required"),
            })
        ).min(testCaseResult?.testCaseStep?.length || 0, 'Required')

    }).refine(
        (data) => !(data.result === TestCaseExecutionResult.FAILED && !data.remarks?.trim()),
        {
            message: "Required",
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
    const form = useForm<z.infer<typeof testCaseResultSchema>>({
        resolver: zodResolver(testCaseResultSchema),
        defaultValues: {
            remarks: "",
            result: undefined,
            isIssue: false,
            testCycle: "",
            attachments: [],
            testSteps: Array.from({ length: testCaseResult?.testCaseStep?.length || 0 }, (_, i) => ({
                index: i,
                status: "",
            })),
        }
    });

    // default is issue value set
    useEffect(() => {
        if (form.watch("result") === TestCaseExecutionResult.FAILED) {
            form.setValue("isIssue", true);
            form.setValue("testCycle", testCaseResult?.testCycleId?._id);
        } else {
            form.setValue("isIssue", false);
        }
    }, [form.watch("result")]);

    async function onSubmit(values: z.infer<typeof testCaseResultSchema>) {
        await form.trigger('testSteps');
        setIsLoading(true);
        try {
            if (testCaseResult && testCaseResult._id) {
                const response = await testModerateService(projectId, testCaseResult._id, {
                    ...values,
                });
                if (response) {
                    toasterService.success(response.message);
                    setAttachments([]);
                    router.push(`/private/projects/${projectId}/test-executions/${testCaseResult.testExecutionId}`);
                }
            }
        } catch (error) {
            toasterService.error();
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
        const updatedResults = [...stepResults];
        updatedResults[index] = status;
        setStepResults(updatedResults);

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
        form.reset();
    }, []);

    return (
        <div className='p-3'>
            <div className="mb-2">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`/private/projects/${projectId}/test-executions/${testCaseResult?.testExecutionId}`}>
                                Test execution
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator>
                            <ChevronRight className='h-3 w-3' />
                        </BreadcrumbSeparator>
                        <BreadcrumbItem>
                            <BreadcrumbPage>{testCaseResult?.testCaseId?.title}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            {isViewLoading ?
                <div className="mt-8 flex gap-6">
                    <div className="flex-1 space-y-3">
                        <Skeleton className="h-[100px] w-full rounded-xl bg-gray-200" />
                        <Skeleton className="h-[100px] w-full rounded-xl bg-gray-200" />
                        <Skeleton className="h-[100px] w-full rounded-xl bg-gray-200" />
                    </div>

                    <div className="flex-1 space-y-3">
                        <Skeleton className="h-[50px] w-full rounded-xl bg-gray-200" />
                        <Skeleton className="h-[80px] w-full rounded-xl bg-gray-200" />
                        <Skeleton className="h-[50px] w-full rounded-xl bg-gray-200" />
                    </div>
                </div>

                :
                <div className=" grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                    <div className="mt-4 overflow-y-auto h-full">

                        {/* test case step */}
                        <TestStep testCaseResult={testCaseResult as ITestCaseResult}
                            onTestStepResult={handleTestStepResult} isAdmin={true}
                            testStepErrors={form.formState.errors.testSteps} />

                        {/* test case data */}
                        {attchmentsLoading ?
                            <div className='mt-6'>
                                <Skeleton className="h-[50px] mt-1 w-full rounded-xl bg-gray-200" />
                                <Skeleton className="h-[50px] mt-1 w-full rounded-xl bg-gray-200" />
                            </div> :
                            <TestData testCaseResult={testCaseDataAttachments as unknown as ITestCaseResult} />
                        }

                        {/* expected results */}
                        <div className='mt-5'>
                            <div className='text-lg font-semibold'>
                                Expected result
                            </div>
                            <div
                                className="text-sm leading-relaxed text-gray-700 space-y-2 rich-description"
                                dangerouslySetInnerHTML={{
                                    __html: testCaseResult?.testCaseId?.expectedResult || "",
                                }}
                            />
                        </div>
                    </div>

                    <div className="mt-3 overflow-y-auto h-full">
                        <div className="w-full">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} method="post">
                                    <div className="grid grid-cols-1 gap-2 my-2 mx-1">
                                        <FormField
                                            control={form.control}
                                            name="result"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Result</FormLabel>
                                                    <FormControl>
                                                        <div className='flex justify-start'>
                                                            {/* <ToggleGroup
                                                                value={field.value}
                                                                onValueChange={(value) => field.onChange(value)}
                                                                type="single" className='gap-0'
                                                            >
                                                                <TooltipProvider>
                                                                    <Tooltip delayDuration={200}>
                                                                        <TooltipTrigger asChild>
                                                                            <ToggleGroupItem
                                                                                variant={"outline"} size={"lg"} className={`rounded-r-none ${field.value === TestCaseExecutionResult.PASSED ? 'bg-primary hover:bg-primary' : ''}`} value={TestCaseExecutionResult.PASSED} aria-label={TestCaseExecutionResult.PASSED}>
                                                                                <Smile className={`h-5 w-5 ${field.value === TestCaseExecutionResult.PASSED ? 'text-white' : 'text-primary'} `} />
                                                                            </ToggleGroupItem>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent className='bg-black'>
                                                                            <p>{TestCaseExecutionResult.PASSED}</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>

                                                                    <Tooltip delayDuration={200}>
                                                                        <TooltipTrigger asChild>
                                                                            <ToggleGroupItem variant={"outline"} size={"lg"} className={`rounded-none ${field.value === TestCaseExecutionResult.CAUTION ? 'bg-amber-500 hover:bg-amber-500' : ''}`} value={TestCaseExecutionResult.CAUTION} aria-label={TestCaseExecutionResult.CAUTION}>
                                                                                <Meh className={`h-5 w-5 ${field.value === TestCaseExecutionResult.CAUTION ? 'text-white' : 'text-amber-500'}`} />
                                                                            </ToggleGroupItem>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent className='bg-black'>
                                                                            <p>{TestCaseExecutionResult.CAUTION}</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>

                                                                    <Tooltip delayDuration={200}>
                                                                        <TooltipTrigger asChild>
                                                                            <ToggleGroupItem variant={"outline"} size={"lg"} className={`rounded-none ${field.value === TestCaseExecutionResult.FAILED ? 'bg-destructive hover:bg-destructive' : ''}`} value={TestCaseExecutionResult.FAILED} aria-label={TestCaseExecutionResult.FAILED}>
                                                                                <Frown className={`h-5 w-5 ${field.value === TestCaseExecutionResult.FAILED ? 'text-white' : 'text-destructive'}`} />
                                                                            </ToggleGroupItem>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent className='bg-black'>
                                                                            <p>{TestCaseExecutionResult.FAILED}</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>

                                                                    <Tooltip delayDuration={200}>
                                                                        <TooltipTrigger asChild>
                                                                            <ToggleGroupItem variant={"outline"} size={"lg"} className={`rounded-l-none ${field.value === TestCaseExecutionResult.BLOCKED ? 'bg-black hover:bg-black' : ''}`} value={TestCaseExecutionResult.BLOCKED} aria-label={TestCaseExecutionResult.BLOCKED}>
                                                                                <Bomb className={`h-5 w-5 ${field.value === TestCaseExecutionResult.BLOCKED ? 'text-white' : 'text-black'}`} />
                                                                            </ToggleGroupItem>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent className='bg-black'>
                                                                            <p>{TestCaseExecutionResult.BLOCKED}</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            </ToggleGroup> */}
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
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectGroup>
                                                                        {TestCaseExecutionResultList.map((result) => (
                                                                            <SelectItem value={result}>
                                                                                <div className="flex items-center">
                                                                                    {capitalizeFirstLetter(result)}
                                                                                </div>
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectGroup>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {form.watch("result") === TestCaseExecutionResult.FAILED &&
                                        <div className="mx-1 my-4">
                                            <FormField
                                                control={form.control}
                                                name="isIssue"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <div className="flex items-center space-x-2">
                                                                <Checkbox checked={field.value} defaultChecked
                                                                    id="issue" onCheckedChange={(checked: boolean) => field.onChange(checked)} />
                                                                <label
                                                                    htmlFor="issue"
                                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                                >
                                                                    Create issue for this test case
                                                                </label>
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    }

                                    <div className="mx-1 mt-2">
                                        <FormField
                                            control={form.control}
                                            name="remarks"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Remarks</FormLabel>
                                                    <FormControl>
                                                        <Textarea  {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 ">
                                        <div className="w-full mt-3">
                                            <Label htmlFor="attachments">Attachments</Label>
                                            <Input
                                                className="mt-2 opacity-0 cursor-pointer absolute w-0 h-0"
                                                id="attachments"
                                                type="file"
                                                multiple
                                                ref={inputRef}
                                                onChange={handleFileChange}
                                            />
                                            <label
                                                htmlFor="attachments"
                                                className="flex mt-2 h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors cursor-pointer"
                                            >
                                                Choose Files
                                            </label>
                                            {attachments?.length > 0 && (
                                                <div className="mt-2">
                                                    New attachments
                                                    <div className="mt-4 rounded-md border">
                                                        <Table>
                                                            <TableBody>
                                                                {attachments?.length ? (
                                                                    attachments.map((attachment, index) => (
                                                                        <TableRow key={index}>
                                                                            <TableCell>
                                                                                <DocumentName document={attachment} />
                                                                            </TableCell>
                                                                            <TableCell className="flex justify-end items-end mr-6">
                                                                                <Button
                                                                                    type="button"
                                                                                    onClick={() => handleRemoveFile(index)}
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                >
                                                                                    <Trash className="h-4 w-4 text-destructive" />
                                                                                </Button>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))
                                                                ) : (
                                                                    <TableRow>
                                                                        <TableCell
                                                                            colSpan={columns.length}
                                                                            className="h-24 text-center"
                                                                        >
                                                                            No attachments found
                                                                        </TableCell>
                                                                    </TableRow>
                                                                )}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {testCaseAttachmentsLoading ?
                                        <div className='mt-5 grid grid-cols-1 md:grid-cols-2 gap-2'>
                                            <Skeleton className="h-[140px] mt-1 w-[240px] rounded-xl bg-gray-200" />
                                            <Skeleton className="h-[140px] mt-1 w-[240px] rounded-xl bg-gray-200" />
                                        </div> :
                                        <div>
                                            <TestCasesMediaRenderer
                                                attachments={testCaseAttachments || []}
                                                title={"Attachments"}
                                            />
                                        </div>
                                    }

                                    <div className='mt-4 flex justify-end'>
                                        <Button
                                            disabled={isLoading}
                                            type="button"
                                            variant={"outline"}
                                            size="lg"
                                            className="w-full md:w-fit"
                                            onClick={handleCancelClick}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            disabled={isLoading}
                                            type="submit"
                                            size="lg"
                                            className="w-full md:w-fit ml-4"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : null}
                                            {isLoading ? "Updating" : "Update"}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}
