import { accordionBodyColors, accrodionColors, TestCaseExecutionResult } from '@/app/_constants/test-case';
import { ITestCaseResult } from '@/app/_interface/test-case-result';
import { testModerateService } from '@/app/_services/test-execution.service';
import toasterService from '@/app/_services/toaster-service';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Sheet, SheetClose, SheetContent } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/text-area';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bomb, CircleGauge, FileCheck, Frown, Loader2, Meh, NotepadText, Smile } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const testCaseResultSchema = z.object({
    actualResult: z.string().min(1, "Required"),
    result: z.string().min(1, "Required"),
    remarks: z.string().optional(),
    isIssue: z.boolean().optional()
});

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
            isIssue: false
        }
    });

    // default is issue value set
    useEffect(() => {
        if (form.watch("result") === TestCaseExecutionResult.FAIL) {
            form.setValue("isIssue", true);
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
                }
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setSheetOpen(false);
            setIsLoading(false);
        }
    }

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="w-full !max-w-full md:w-[80%] md:!max-w-[80%] overflow-y-auto">
                <div className=" grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                    <div className="mt-4 overflow-y-auto h-full">

                        {/* test case step */}
                        <div className="">
                            <div className="text-lg font-semibold mb-4">
                                Test Step
                            </div>
                            <div className="flex flex-col space-y-4">
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
                        </div>

                        {/* test case data */}
                        <div className="mt-5">
                            <div className="text-lg font-semibold mb-2">
                                Test data
                            </div>
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
                                                    <span className="font-medium">Description:</span> {testData?.description}
                                                </p>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                    <div
                                        className={`absolute rounded-r-none rounded-lg left-0 top-0 w-1.5 h-full ${accrodionColors[index % accrodionColors.length]}`}
                                    ></div>
                                </Accordion>
                            ))}
                        </div>

                        {/* expected results */}
                        <div className='mt-5'>
                            <div className='text-lg font-semibold'>
                                Expected result
                            </div>
                            <p className="ml-2 mt-1 text-gray-700 text-[15px]">
                                {testCaseResult?.testCaseId?.expectedResult}
                            </p>
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
                                                                                variant={"outline"} size={"lg"} className={`rounded-r-none ${field.value === TestCaseExecutionResult.PASS ? 'bg-primary hover:bg-primary' : ''}`} value={TestCaseExecutionResult.PASS} aria-label={TestCaseExecutionResult.PASS}>
                                                                                <Smile className={`h-5 w-5 ${field.value === TestCaseExecutionResult.PASS ? 'text-white' : 'text-primary'} `} />
                                                                            </ToggleGroupItem>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent className='bg-black'>
                                                                            <p>{TestCaseExecutionResult.PASS}</p>
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
                                                                            <ToggleGroupItem variant={"outline"} size={"lg"} className={`rounded-none ${field.value === TestCaseExecutionResult.FAIL ? 'bg-destructive hover:bg-destructive' : ''}`} value={TestCaseExecutionResult.FAIL} aria-label={TestCaseExecutionResult.FAIL}>
                                                                                <Frown className={`h-5 w-5 ${field.value === TestCaseExecutionResult.FAIL ? 'text-white' : 'text-destructive'}`} />
                                                                            </ToggleGroupItem>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent className='bg-black'>
                                                                            <p>{TestCaseExecutionResult.FAIL}</p>
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

                                    {form.watch("result") === TestCaseExecutionResult.FAIL &&
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
                                    <div className="mx-1">
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
