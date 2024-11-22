"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Loader2,
    Plus,
} from "lucide-react";
import { useEffect, useState } from "react";

import toasterService from "@/app/_services/toaster-service";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useParams } from "next/navigation";
import TextEditor from "@/app/(routes)/private/projects/_components/text-editor";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { IRequirement } from "@/app/_interface/requirement";
import { getTestWithoutPaginationSuiteService } from "@/app/_services/test-suite.service";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const testSuiteSchema = z.object({
    title: z.string().min(1, "Required"),
    expectedResult: z.string().min(1, "Required"),
    projectId: z.string().optional(),
    testSuite: z.string().min(1, "Required"),
    requirements: z.array(z.string().optional()),
});

export function AddTestCase({ refreshTestCases }: { refreshTestCases: () => void }) {

    const [sheetOpen, setSheetOpen] = useState(false);
    const [testSuites, setTestSuites] = useState<IRequirement[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { projectId } = useParams<{ projectId: string }>();
    const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
    const [isTestSuiteLoading, setIsTestSuiteLoading] = useState<boolean>(false);

    const form = useForm<z.infer<typeof testSuiteSchema>>({
        resolver: zodResolver(testSuiteSchema),
        defaultValues: {
            title: "",
            expectedResult: "",
            projectId: projectId,
            testSuite: "",
            requirements: []
        },
    });

    async function onSubmit(values: z.infer<typeof testSuiteSchema>) {
        setIsLoading(true);
        try {
            // const response = await addTestSuiteService(projectId, {
            //     ...values,
            //     requirements: selectedRequirements
            // });
            // if (response) {
            //     refreshTestCases();
            //     toasterService.success(response.message);
            // }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
            setSheetOpen(false);
        }
    }

    useEffect(() => {
        if (sheetOpen) {
            getTestSuites();
        }
    }, [sheetOpen]);

    const getTestSuites = async () => {
        try {
            setIsTestSuiteLoading(true);
            const response = await getTestWithoutPaginationSuiteService(projectId);
            console.log("res", response);
            setTestSuites(response);
        } catch (error) {
            toasterService.error();
        } finally {
            setIsTestSuiteLoading(false);
        }
    }

    const validateTestSuite = () => {
        if (form.formState.isValid) {
            form.handleSubmit(onSubmit)();
        }
    };

    const resetForm = () => {
        form.reset();
        setSelectedRequirements([]);
    };

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
                <Button onClick={() => resetForm()}>
                    <Plus /> Add test case
                </Button>
            </SheetTrigger>
            <SheetContent
                className="w-full !max-w-full md:w-[580px] md:!max-w-[580px] overflow-y-auto"
            >
                <SheetHeader>
                    <SheetTitle className="text-left">Add new test case</SheetTitle>
                    <SheetDescription className="text-left">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Perspiciatis,
                        ut deleniti excepturi, quo nemo! Quisquam, saepe quo.
                    </SheetDescription>
                </SheetHeader>

                <div>
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
                            {/* <div className="grid grid-cols-1 gap-2 mt-4">
                                <Label >
                                    Requirements
                                </Label>
                                <MultiSelect
                                    options={testSuites.map((requirment) => ({
                                        label: requirment?.title,
                                        value: requirment?.id
                                    }))}
                                    onValueChange={setSelectedRequirements}
                                    defaultValue={selectedRequirements}
                                    placeholder=""
                                    variant="secondary"
                                    animation={2}
                                    maxCount={3}
                                    className="mt-2"
                                />
                            </div> */}

                            <div className="mt-6 w-full flex justify-end gap-2">
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
                                    onClick={() => validateTestSuite()}
                                    className="w-full md:w-fit"
                                >
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    {isLoading ? "Saving" : "Save"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>

            </SheetContent>
        </Sheet>
    );
}
