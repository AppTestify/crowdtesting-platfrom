import { ITestCaseResult } from '@/app/_interface/test-case-result';
import toasterService from '@/app/_services/toaster-service';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/text-area';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bomb, CircleGauge, FileCheck, Frown, Loader2, NotepadText, Smile } from 'lucide-react';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const testCaseResultSchema = z.object({
    actualResult: z.string().min(1, "Required"),
    result: z.string().min(1, "Required"),
    remarks: z.string().min(1, 'Required')
});

export default function Moderate({
    sheetOpen,
    setSheetOpen,
    testCaseResult
}: {
    sheetOpen: boolean;
    setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
    testCaseResult: ITestCaseResult | null;
}) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedValue, setSelectedValue] = useState('');
    console.log("selectedValue", selectedValue);
    const form = useForm<z.infer<typeof testCaseResultSchema>>({
        resolver: zodResolver(testCaseResultSchema),
        defaultValues: {
            actualResult: "",
            remarks: "",
            result: ""
        }
    });

    console.log("testCaseResult", testCaseResult);

    async function onSubmit(values: z.infer<typeof testCaseResultSchema>) {
        setIsLoading(true);
        try {
            // const response = await updateTestCycleService(projectId as string, testCycleId, {
            //     ...values,
            // });
            // if (response) {
            //     refreshTestCycle();
            //     toasterService.success(response.message);
            // }
        } catch (error) {
            toasterService.error();
        } finally {
            setSheetOpen(false);
            setIsLoading(false);
        }
    }

    const colors = ["bg-purple-300", "bg-orange-300", "bg-pink-300", "bg-blue-300", "bg-green-300"];
    const bodyColors = ["bg-purple-50", "bg-orange-50", "bg-pink-50", "bg-blue-50", "bg-green-50"];

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="w-full !max-w-full md:w-[80%] md:!max-w-[80%] ">
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                    <div className="overflow-y-auto h-full">

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
                                <Accordion type="single" collapsible className={`mb-2 rounded-lg w-[95%] ${bodyColors[index % bodyColors.length]} relative`}>
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
                                        className={`absolute rounded-r-none rounded-lg left-0 top-0 w-1.5 h-full ${colors[index % colors.length]}`}
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

                    <div className="overflow-y-auto h-full">
                        <div className="w-full">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} method="post">
                                    <div className="grid grid-cols-1 gap-2 my-2 mx-1">
                                        <FormField
                                            control={form.control}
                                            name="result"
                                            render={({ field }) => (
                                                <FormItem>
                                                    {/* <FormLabel>Actual result</FormLabel> */}
                                                    <FormControl>
                                                        <div className='flex justify-start'>
                                                            <ToggleGroup
                                                                value={selectedValue}
                                                                onValueChange={setSelectedValue}
                                                                type="single" className='gap-0'
                                                            >
                                                                <TooltipProvider>
                                                                    {/* Pass */}
                                                                    <Tooltip delayDuration={200}>
                                                                        <TooltipTrigger asChild>
                                                                            <ToggleGroupItem
                                                                                variant={"outline"} size={"lg"} className={`rounded-r-none ${selectedValue === 'pass' ? 'bg-primary hover:bg-primary' : ''}`} value="pass" aria-label="pass">
                                                                                <Smile className={`h-5 w-5 ${selectedValue === 'pass' ? 'text-white' : 'text-primary'} `} />
                                                                            </ToggleGroupItem>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent className='bg-black'>
                                                                            <p>Pass</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>

                                                                    {/* Fail */}
                                                                    <Tooltip delayDuration={200}>
                                                                        <TooltipTrigger asChild>
                                                                            <ToggleGroupItem variant={"outline"} size={"lg"} className={`rounded-none ${selectedValue === 'fail' ? 'bg-destructive hover:bg-destructive' : ''}`} value="fail" aria-label="fail">
                                                                                <Frown className={`h-5 w-5 ${selectedValue === 'fail' ? 'text-white' : 'text-destructive'}`} />
                                                                            </ToggleGroupItem>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent className='bg-black'>
                                                                            <p>Fail</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>

                                                                    {/* Blocked */}
                                                                    <Tooltip delayDuration={200}>
                                                                        <TooltipTrigger asChild>
                                                                            <ToggleGroupItem variant={"outline"} size={"lg"} className={`rounded-l-none ${selectedValue === 'blocked' ? 'bg-black hover:bg-black' : ''}`} value="blocked" aria-label="blocked">
                                                                                <Bomb className={`h-5 w-5 ${selectedValue === 'blocked' ? 'text-white' : 'text-black'}`} />
                                                                            </ToggleGroupItem>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent className='bg-black'>
                                                                            <p>Blocked</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            </ToggleGroup>
                                                        </div>
                                                        {/* <Textarea
                                                            className="h-10 min-h-[3rem] resize-y"
                                                            {...field} /> */}
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

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
                                </form>
                            </Form>
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
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet >
    )
}
