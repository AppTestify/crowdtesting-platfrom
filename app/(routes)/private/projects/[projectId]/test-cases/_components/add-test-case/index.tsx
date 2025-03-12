"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Loader2,
    Plus,
    Trash,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ITestSuite } from "@/app/_interface/test-suite";
import { addTestCaseService, updateTestCaseService } from "@/app/_services/test-case.service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddTestStep } from "../steps";
import { TestCaseData } from "../test-case-data";
import { ITestCase, ITestCaseAttachmentDisplay } from "@/app/_interface/test-case";
import { TEST_CASE_SEVERITY_LIST, TEST_TYPE_LIST } from "@/app/_constants/test-case";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { DocumentName } from "@/app/_components/document-name";
import { ColumnDef } from "@tanstack/react-table";
import TestCaseAttachments from "../attachments/test-case-attachments";

const testSuiteSchema = z.object({
    title: z.string().min(1, "Required"),
    expectedResult: z.string().min(1, "Required"),
    projectId: z.string().optional(),
    testSuite: z.string().min(1, "Required"),
    requirements: z.array(z.string().optional()),
    testType: z.string().optional(),
    severity: z.string().optional(),
    attachments: z.array(z.instanceof(File)).optional(),
});

export function AddTestCase({ refreshTestCases, testSuites }: { refreshTestCases: () => void, testSuites: ITestSuite[] }) {
    const columns: ColumnDef<ITestCaseAttachmentDisplay[]>[] = [
        {
            accessorKey: "name",
            cell: ({ row }) => (
                <div>
                    <DocumentName document={row.getValue("name")} />
                </div>
            ),
        },
    ];
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { projectId } = useParams<{ projectId: string }>();
    const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
    const [requirementsList, setRequirementsList] = useState<IRequirement[]>([]);
    const [clear, setClear] = useState<boolean>(false);
    const [testCaseId, setTestCaseId] = useState<string>("");
    const [testCase, setTestCase] = useState<ITestCase | null>(null);
    const [activeTab, setActiveTab] = useState("test-case");
    const [attachments, setAttachments] = useState<File[]>([]);

    const form = useForm<z.infer<typeof testSuiteSchema>>({
        resolver: zodResolver(testSuiteSchema),
        defaultValues: {
            title: "",
            expectedResult: "",
            projectId: projectId,
            testSuite: "",
            requirements: [],
            testType: "",
            severity: "",
            attachments: [],
        },
    });
    useEffect(() => {
        const selectedTestSuite = testSuites.find(
            (test) => test._id === form.watch("testSuite")
        );
        setRequirementsList(selectedTestSuite?.requirements || []);
        setClear(true);

        setTimeout(() => {
            setClear(false);
        }, 0);
    }, [form.watch("testSuite")]);

    async function onSubmit(values: z.infer<typeof testSuiteSchema>) {
        setIsLoading(true);
        try {
            // updateTestCaseService
            if (testCaseId) {
                const response = await updateTestCaseService(projectId, testCaseId, {
                    ...values,
                    requirements: selectedRequirements
                });
                if (response) {
                    refreshTestCases();
                    toasterService.success(response.message);
                }
            } else {
                const response = await addTestCaseService(projectId, {
                    ...values,
                    requirements: selectedRequirements,
                });
                if (response) {
                    setTestCase(response?.data);
                    setTestCaseId(response?.id);
                    refreshTestCases();
                    setAttachments([]);
                    setActiveTab("steps");
                }
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    }

    const validateTestSuite = () => {
        if (form.formState.isValid) {
            form.handleSubmit(onSubmit)();
        }
    };

    const resetForm = () => {
        form.reset();
        setActiveTab("test-case");
        setSelectedRequirements([]);
        setTestCase(null);
        setTestCaseId("");
    };

    const defaultData = (): void => {
        form.reset({
            title: testCase?.title || "",
            expectedResult: testCase?.expectedResult || "",
            projectId: projectId,
            testSuite: typeof testCase?.testSuite === "string" ? testCase.testSuite : "",
            requirements: testCase?.requirements?.map(req => req.title) || [],
            attachments: testCase?.attachments
        });
    };

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

    useEffect(() => {
        if (testCase === null) {
            defaultData();
        }
    }, [testCase]);

    useEffect(() => {
        if (!sheetOpen) {
            setAttachments([]);
            form.setValue("attachments", []);
        }
    }, [sheetOpen]);

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
                <Button onClick={() => resetForm()} >
                    <Plus /> Add test case
                </Button>
            </SheetTrigger>
            <SheetContent
                className="w-full !max-w-full md:w-[580px] md:!max-w-[580px] overflow-y-auto"
            >
                <SheetHeader>
                    <SheetTitle className="text-left">Add new test case</SheetTitle>
                </SheetHeader>

                <Tabs defaultValue="test-case" value={activeTab} onValueChange={setActiveTab} className="mt-4">
                    <TabsList>
                        <TabsTrigger value="test-case" >Test case</TabsTrigger>
                        <TabsTrigger value="steps" disabled={!testCaseId}>Steps</TabsTrigger>
                        <TabsTrigger value="test-data" disabled={!testCaseId}>Test data</TabsTrigger>
                    </TabsList>
                    <TabsContent value="test-case">
                        <div className="mt-4">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} method="post">
                                    <div className="grid grid-cols-1 gap-2">
                                        <FormField
                                            control={form.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Test case title</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mt-4">
                                        <FormField
                                            control={form.control}
                                            name="testType"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>Test type</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value ?? undefined}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                {TEST_TYPE_LIST.map((testType) => (
                                                                    <SelectItem value={testType}>
                                                                        <div className="flex items-center">
                                                                            {testType}
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

                                        <FormField
                                            control={form.control}
                                            name="severity"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>Severity</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value ?? undefined}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                {TEST_CASE_SEVERITY_LIST.map((severity) => (
                                                                    <SelectItem value={severity}>
                                                                        <div className="flex items-center">
                                                                            {severity}
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
                                    <div className="grid grid-cols-1 gap-2 mt-4">
                                        <Label >
                                            Requirements
                                        </Label>
                                        <MultiSelect
                                            options={requirementsList?.map((requirement) => ({
                                                label: typeof requirement?.title === "string" ? requirement.title : "",
                                                value: typeof requirement?._id === "string" ? requirement._id : "",
                                            }))}
                                            onValueChange={setSelectedRequirements}
                                            defaultValue={selectedRequirements}
                                            placeholder=""
                                            disabled={requirementsList?.length === 0}
                                            variant="secondary"
                                            animation={2}
                                            maxCount={3}
                                            isClear={clear}
                                            className="mt-2"
                                        />
                                    </div>

                                    {/* Attachments */}
                                    {!testCaseId ?
                                        (<div className="grid grid-cols-1 gap-2 ">
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
                                        </div>)
                                        :
                                        (
                                            <TestCaseAttachments
                                                testCaseId={testCaseId}
                                                isUpdate={true}
                                                isView={false}
                                                setAttachmentsData={setAttachments}
                                            />
                                        )
                                    }

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
                                            {testCaseId ? (isLoading ? "Updating" : "Update") : "Continue"}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    </TabsContent>
                    <TabsContent value="steps">
                        <AddTestStep testCaseId={testCaseId} />
                    </TabsContent>
                    <TabsContent value="test-data">
                        <TestCaseData testCaseId={testCaseId} />
                    </TabsContent>
                </Tabs>

            </SheetContent>
        </Sheet>
    );
}
