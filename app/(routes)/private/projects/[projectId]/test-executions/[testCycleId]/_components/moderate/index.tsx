import { TestCaseExecutionResult } from '@/app/_constants/test-case';
import { ITestCaseResult } from '@/app/_interface/test-case-result';
import { testModerateService } from '@/app/_services/test-execution.service';
import toasterService from '@/app/_services/toaster-service';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Sheet, SheetClose, SheetContent } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/text-area';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bomb, Frown, Loader2, Meh, Smile } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import TestStep from '../../_section/test-step';
import TestData from '../../_section/test-data';

const testCaseResultSchema = z.object({
    actualResult: z.string().min(1, "Required"),
    result: z.string().min(1, "Required"),
    remarks: z.string().optional(),
    isIssue: z.boolean().optional(),
    testCycle: z.string().optional()
}).refine(
    (data) => !(data.result === TestCaseExecutionResult.FAILED && !data.remarks?.trim()),
    {
        message: "Required",
        path: ["remarks"],
    }
);

export default function Moderate({
    sheetOpen,
    setSheetOpen,
    testCaseResult,
    refershTestExecution
}: {
    sheetOpen: boolean;
    setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
    testCaseResult: ITestCaseResult | null;
    refershTestExecution: () => void;
}) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { projectId } = useParams<{ projectId: string }>();
    const form = useForm<z.infer<typeof testCaseResultSchema>>({
        resolver: zodResolver(testCaseResultSchema),
        defaultValues: {
            actualResult: "",
            remarks: "",
            result: "",
            isIssue: false,
            testCycle: ""
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
        setIsLoading(true);
        try {
            if (testCaseResult && testCaseResult._id) {
                const response = await testModerateService(projectId, testCaseResult._id, {
                    ...values,
                });
                if (response) {
                    refershTestExecution();
                    toasterService.success(response.message);
                    form.reset();
                }
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setSheetOpen(false);
            setIsLoading(false);
        }
    }

    useEffect(() => {
        form.reset();
    }, [sheetOpen])

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="w-full !max-w-full md:w-[80%] md:!max-w-[80%] overflow-y-auto">
                <div className=" grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                    <div className="mt-4 overflow-y-auto h-full">

                        {/* test case step */}
                        <TestStep testCaseResult={testCaseResult as ITestCaseResult} />

                        {/* test case data */}
                        <TestData testCaseResult={testCaseResult as ITestCaseResult} />

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
                                                            <ToggleGroup
                                                                value={field.value}
                                                                onValueChange={(value) => field.onChange(value)}
                                                                type="single" className='gap-0'
                                                            >
                                                                <TooltipProvider>
                                                                    {/* Pass */}
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

                                                                    {/* Caution */}
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

                                                                    {/* Fail */}
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

                                                                    {/* Blocked */}
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
                                                            </ToggleGroup>
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

                                    <div className="mx-1">
                                        <FormField
                                            control={form.control}
                                            name="actualResult"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Actual result</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            className="h-10 min-h-[3rem] resize-y"
                                                            {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
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
                                    <div className='mt-4 flex justify-end'>
                                        <SheetClose asChild>
                                            <Button
                                                disabled={isLoading}
                                                type="button"
                                                variant={"outline"}
                                                size="lg"
                                                className="w-full md:w-fit"
                                            >
                                                Cancel
                                            </Button>
                                        </SheetClose>
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
            </SheetContent>
        </Sheet >
    )
}
