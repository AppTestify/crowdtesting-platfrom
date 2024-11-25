import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MultiSelect } from "@/components/ui/multi-select";
import toasterService from "@/app/_services/toaster-service";
import { ITestSuite } from "@/app/_interface/test-suite";
import TextEditor from "../../../../_components/text-editor";
import { IRequirement } from "@/app/_interface/requirement";
import { ITestCase } from "@/app/_interface/test-case";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateTestCaseService } from "@/app/_services/test-case.service";

const testSuiteSchema = z.object({
    title: z.string().min(1, "Required"),
    expectedResult: z.string().min(1, "Required"),
    projectId: z.string().optional(),
    testSuite: z.string().min(1, "Required"),
    requirements: z.array(z.string().optional()),
});

export function EditTestCase({
    testCases,
    sheetOpen,
    setSheetOpen,
    testSuites,
    refreshTestCases,
}: {
    testCases: ITestCase;
    sheetOpen: boolean;
    setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
    testSuites: ITestSuite[];
    refreshTestCases: () => void;
}) {
    const testCaseId = testCases.id;
    const { title, expectedResult, projectId, testSuite, requirements } = testCases;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [requirementsList, setRequirementsList] = useState<IRequirement[]>(requirements || []);
    const [clear, setClear] = useState<boolean>(false);
    const [selectedRequirements, setSelectedRequirements] = useState<string[]>(
        requirements?.map((requirement) => requirement._id) as string[]
    );
    const form = useForm<z.infer<typeof testSuiteSchema>>({
        resolver: zodResolver(testSuiteSchema),
        defaultValues: {
            title: title || "",
            expectedResult: expectedResult || "",
            projectId: projectId,
            testSuite: "",
            requirements: []
        },
    });

    async function onSubmit(values: z.infer<typeof testSuiteSchema>) {
        setIsLoading(true);
        try {
            const response = await updateTestCaseService(projectId as string, testCaseId, {
                ...values,
                requirements: selectedRequirements,
                projectId: projectId
            });
            if (response) {
                refreshTestCases();
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setSheetOpen(false);
            setIsLoading(false);
        }
    }
    const resetForm = () => {
        form.reset({
            title: title || "",
            expectedResult: expectedResult || "",
            testSuite: testSuite?._id || "",
            requirements: []
        });
    };

    useEffect(() => {
        const testSuiteId = form.watch("testSuite");
        if (testSuiteId) {
            const selectedTestSuite = testSuites.find(test => test._id === testSuiteId);

            if (selectedTestSuite) {
                setRequirementsList(selectedTestSuite?.requirements || []);
                if (testSuite?._id != form.watch("testSuite")) {
                    setSelectedRequirements([]);
                    setClear(true);

                    setTimeout(() => {
                        setClear(false);
                    }, 0);
                }
            }
        }
    }, [form.watch("testSuite")]);

    useEffect(() => {
        if (sheetOpen) {
            resetForm();
        }
    }, [sheetOpen]);

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="w-full !max-w-full md:w-[550px] md:!max-w-[550px]">
                <SheetHeader>
                    <SheetTitle className="text-left">Edit testSuite</SheetTitle>
                    <SheetDescription className="text-left">
                        Keep your device inventory updated! The more up to date your devices
                        are, the greater your chances of receiving project recommendations.
                    </SheetDescription>
                </SheetHeader>
                <div className="mt-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} method="post">
                            <div className="grid grid-cols-1 gap-2">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Test suite title</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-2 mt-4">
                                <FormField
                                    control={form.control}
                                    name="expectedResult"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Expected result</FormLabel>
                                            <FormControl>
                                                <TextEditor
                                                    markup={field.value || ""}
                                                    onChange={(value) => {
                                                        form.setValue("expectedResult", value);
                                                        form.trigger("expectedResult");
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-2 mt-4">
                                <FormField
                                    control={form.control}
                                    name="testSuite"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Test suite</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {testSuites.map((testSuite) => (
                                                            <SelectItem value={testSuite._id as string}>
                                                                {testSuite.title}
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
                            <div className="my-2">
                                <Label>Requirements</Label>
                                <MultiSelect
                                    options={
                                        requirementsList?.map((requirement) => ({
                                            label: typeof requirement?.title === "string" ? requirement?.title : "",
                                            value: typeof requirement?._id === "string" ? requirement?._id : "",
                                        }))
                                    }
                                    onValueChange={(selectedValues) => {
                                        setSelectedRequirements(selectedValues);
                                    }}
                                    defaultValue={selectedRequirements}
                                    placeholder={"Select Requirements"}
                                    variant="secondary"
                                    animation={2}
                                    maxCount={3}
                                    isClear={clear}
                                    className="mt-2"
                                />
                            </div>

                            <div className="mt-8 w-full flex justify-end gap-2">
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
                                    className="w-full md:w-fit"
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
            </SheetContent>
        </Sheet>
    );
}
