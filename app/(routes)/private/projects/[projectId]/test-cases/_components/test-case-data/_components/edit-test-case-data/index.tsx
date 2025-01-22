import { TEST_CASE_DATA_LIST, TEST_CASE_DATA_VALIDATION_LIST } from '@/app/_constants/test-case';
import { ITestCaseData, ITestCaseDataPayload } from '@/app/_interface/test-case-data';
import { updateTestCaseDataService } from '@/app/_services/test-case-data.service';
import toasterService from '@/app/_services/toaster-service';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/text-area';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

const testPlanSchema = z.object({
    testCases: z.array(
        z.object({
            name: z.string().min(1, "Name is required"),
            type: z.string().min(1, "Type is required"),
            validation: z.array(z.string()).optional(),
            inputValue: z.string().min(1, "InputValue is required"),
            description: z.string().optional()
        }))
});

export default function EditTestCaseData({ testCaseDataValue, isEditOpen, setIsEditOpen, refreshTestCaseData }:
    { testCaseDataValue: ITestCaseData, isEditOpen: boolean, setIsEditOpen: (isOpen: boolean) => void, refreshTestCaseData: () => void }) {

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { projectId } = useParams<{ projectId: string }>();

    const form = useForm<z.infer<typeof testPlanSchema>>({
        resolver: zodResolver(testPlanSchema),
        defaultValues: {
            testCases: [{
                name: testCaseDataValue?.name || "",
                type: testCaseDataValue?.type || "",
                validation: testCaseDataValue?.validation || [],
                inputValue: testCaseDataValue?.inputValue || "",
                description: testCaseDataValue?.description || ""
            }],
        }
    });


    useEffect(() => {
        if (testCaseDataValue) {
            form.reset({
                testCases: [
                    {
                        name: testCaseDataValue.name || "",
                        type: testCaseDataValue.type || "",
                        validation: testCaseDataValue.validation || [],
                        inputValue: testCaseDataValue.inputValue || "",
                        description: testCaseDataValue.description || "",
                    },
                ],
            });
        }
    }, [testCaseDataValue, form]);


    const resetForm = () => {
        form.reset();
    };

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "testCases",
    });

    async function onSubmit(values: z.infer<typeof testPlanSchema>) {
        setIsLoading(true);
        try {
            const payload: ITestCaseDataPayload = {
                testCases: values.testCases.map(testCase => ({
                    name: testCase.name,
                    type: testCase.type,
                    validation: testCase.validation || [],
                    inputValue: testCase.inputValue,
                    description: testCase.description || "",
                })),
            };
            const response = await updateTestCaseDataService(projectId,
                testCaseDataValue?.testCaseId, testCaseDataValue?._id, payload);
            if (response) {
                resetForm();
                closeDialog();
                toasterService.success(response.message);
                refreshTestCaseData();
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    }

    const closeDialog = () => setIsEditOpen(false);
    return (
        <div>
            <Dialog open={isEditOpen} onOpenChange={closeDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit test case data</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} method="post">
                            <div className="flex flex-col gap-2 ">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex flex-col w-full ">
                                        <div className="border border-1 rounded-md">
                                            <div className=" grid grid-cols-2 gap-3 w-full px-4 mt-3">
                                                <FormField
                                                    control={form.control}
                                                    name={`testCases.${index}.name`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col">
                                                            <FormLabel>Name</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name={`testCases.${index}.type`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col">
                                                            <FormLabel>Type</FormLabel>
                                                            <Select
                                                                onValueChange={(value) => {
                                                                    form.setValue(`testCases.${index}.type`, value);
                                                                    form.trigger(`testCases.${index}.type`);
                                                                }}
                                                                value={field.value}
                                                            >
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectGroup>
                                                                        {TEST_CASE_DATA_LIST.map((data) => (
                                                                            <SelectItem key={data} value={data}>
                                                                                <div className="flex items-center">
                                                                                    <span className="mr-1">{data}</span>
                                                                                </div>
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectGroup>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="flex flex-col w-full px-4 mt-3">
                                                <Label>
                                                    Validation
                                                </Label>
                                                <Controller
                                                    name={`testCases.${index}.validation`}
                                                    control={form.control}
                                                    render={({ field }) => (
                                                        <MultiSelect
                                                            options={TEST_CASE_DATA_VALIDATION_LIST.map(validation => ({
                                                                label: validation,
                                                                value: validation
                                                            }))}
                                                            defaultValue={field.value || []}
                                                            onValueChange={(selected: string[]) => {
                                                                field.onChange(selected);
                                                            }}
                                                            placeholder=""
                                                            variant="secondary"
                                                            animation={2}
                                                            maxCount={3}
                                                            className="mt-2"
                                                        />
                                                    )}
                                                />
                                            </div>

                                            <div className="flex flex-col w-full px-4 mt-3">
                                                <FormField
                                                    control={form.control}
                                                    name={`testCases.${index}.inputValue`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col">
                                                            <FormLabel>Input value</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="flex flex-col w-full px-4 mt-3 mb-3">
                                                <FormField
                                                    control={form.control}
                                                    name={`testCases.${index}.description`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col">
                                                            <FormLabel>Description</FormLabel>
                                                            <FormControl>
                                                                <Textarea {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                        </div>
                                    </div>
                                ))}
                            </div>
                            <DialogFooter className="mt-4">
                                <Button type="submit">
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    {isLoading ? "Updating" : "Update"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
