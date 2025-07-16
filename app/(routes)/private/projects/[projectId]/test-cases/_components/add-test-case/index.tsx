"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Loader2,
    Plus,
    FileText,
    Settings,
    User,
    Paperclip,
    TestTube,
    CheckCircle,
    List,
    Database,
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { useParams } from "next/navigation";
import TextEditor from "@/app/(routes)/private/projects/_components/text-editor";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { IRequirement } from "@/app/_interface/requirement";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ITestSuite } from "@/app/_interface/test-suite";
import { addTestCaseService } from "@/app/_services/test-case.service";
import { addTestCaseStepService } from "@/app/_services/test-case-step.service";
import { addTestCaseDataService } from "@/app/_services/test-case-data.service";
import { ITestCase } from "@/app/_interface/test-case";
import { TEST_CASE_SEVERITY_LIST, TEST_TYPE_LIST, TEST_CASE_DATA_LIST, TEST_CASE_DATA_VALIDATION_LIST } from "@/app/_constants/test-case";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import TestCaseAttachments from "../attachments/test-case-attachments";
import { Textarea } from "@/components/ui/text-area";

// Schema for test steps
const testStepSchema = z.object({
    description: z.string().min(1, "Step description is required"),
    expectedResult: z.string().min(1, "Expected result is required"),
});

// Schema for test data
const testDataSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.string().min(1, "Type is required"),
    validation: z.array(z.string()).optional(),
    inputValue: z.string().min(1, "Input value is required"),
    description: z.string().optional(),
});

const testCaseSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
    expectedResult: z.string().min(1, "Expected result is required"),
    precondition: z.string().optional(),
    projectId: z.string().optional(),
    testSuite: z.string().min(1, "Test suite is required"),
    requirements: z.array(z.string().optional()),
    testType: z.string().optional(),
    severity: z.string().optional(),
    attachments: z.array(z.instanceof(File)).optional(),
    steps: z.array(testStepSchema).optional(),
    testData: z.array(testDataSchema).optional(),
});

export function AddTestCase({ refreshTestCases, testSuites }: { refreshTestCases: () => void, testSuites: ITestSuite[] }) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [creationStep, setCreationStep] = useState<string>("");
    const { projectId } = useParams<{ projectId: string }>();
    const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
    const [requirementsList, setRequirementsList] = useState<IRequirement[]>([]);
    const [clear, setClear] = useState<boolean>(false);
    const [testCaseId, setTestCaseId] = useState<string>("");
    const [testCase, setTestCase] = useState<ITestCase | null>(null);
    const [attachments, setAttachments] = useState<File[]>([]);

    const form = useForm<z.infer<typeof testCaseSchema>>({
        resolver: zodResolver(testCaseSchema),
        defaultValues: {
            title: "",
            expectedResult: "",
            precondition: "",
            projectId: projectId,
            testSuite: "",
            requirements: [],
            testType: "",
            severity: "",
            attachments: [],
            steps: [],
            testData: [],
        },
    });

    // Field arrays for steps and test data
    const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
        control: form.control,
        name: "steps",
    });

    const { fields: testDataFields, append: appendTestData, remove: removeTestData } = useFieldArray({
        control: form.control,
        name: "testData",
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

    async function onSubmit(values: z.infer<typeof testCaseSchema>) {
        setIsLoading(true);
        setCreationStep("Creating test case...");
        try {
            // Step 1: Create the test case first
            const testCaseResponse = await addTestCaseService(projectId, {
                title: values.title,
                expectedResult: values.expectedResult,
                precondition: values.precondition || "",
                projectId: projectId,
                testSuite: values.testSuite,
                requirements: selectedRequirements,
                testType: values.testType || "",
                severity: values.severity || "",
                attachments: values.attachments || [],
            });

            if (!testCaseResponse?.id) {
                throw new Error("Failed to create test case");
            }

            const testCaseId = testCaseResponse.id;
            setTestCase(testCaseResponse?.data);
            setTestCaseId(testCaseId);

            // Step 2: Add test steps if any
            if (values.steps && values.steps.length > 0) {
                setCreationStep(`Adding ${values.steps.length} test step(s)...`);
                for (const step of values.steps) {
                    await addTestCaseStepService(projectId, testCaseId, {
                        description: step.description,
                        expectedResult: step.expectedResult,
                        additionalSelectType: "",
                        selectedType: true
                    });
                }
            }

            // Step 3: Add test data if any
            if (values.testData && values.testData.length > 0) {
                setCreationStep(`Adding ${values.testData.length} test data field(s)...`);
                const testDataPayload = {
                    testCases: values.testData.map(data => ({
                        name: data.name,
                        type: data.type,
                        validation: data.validation || [],
                        inputValue: data.inputValue,
                        description: data.description || "",
                        attachments: []
                    }))
                };
                await addTestCaseDataService(projectId, testCaseId, testDataPayload);
            }

            setCreationStep("Finalizing...");
            refreshTestCases();
            toasterService.success("Test case created successfully with all details!");
            setDialogOpen(false);
            resetForm();
        } catch (error) {
            console.error("Error creating test case:", error);
            toasterService.error("Failed to create test case. Please try again.");
        } finally {
            setIsLoading(false);
            setCreationStep("");
        }
    }

    const resetForm = () => {
        form.reset();
        setSelectedRequirements([]);
        setTestCase(null);
        setTestCaseId("");
        setAttachments([]);
        setCreationStep("");
    };

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

    // Add new step
    const addStep = () => {
        appendStep({
            description: "",
            expectedResult: "",
        });
    };

    // Add new test data
    const addTestData = () => {
        appendTestData({
            name: "",
            type: "",
            validation: [],
            inputValue: "",
            description: "",
        });
    };

    useEffect(() => {
        if (dialogOpen) {
            resetForm();
        }
    }, [dialogOpen]);

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 transition-colors">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Test Case
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <TestTube className="h-5 w-5 text-blue-600" />
                        </div>
                        Create New Test Case
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                        Add a comprehensive test case with all details, steps, and test data in one place.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-6 space-y-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Basic Information Card */}
                            <Card className="border-l-4 border-l-blue-500">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                        Basic Information
                                    </CardTitle>
                                    <CardDescription>
                                        Provide the essential details for this test case
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium text-gray-700">
                                                    Test Case Title *
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter test case title..."
                                                        {...field}
                                                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="testType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium text-gray-700">
                                                        Test Type
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                                                        <FormControl>
                                                            <SelectTrigger className="border-gray-300 focus:border-blue-500">
                                                                <SelectValue placeholder="Select test type..." />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                {TEST_TYPE_LIST.map((testType) => (
                                                                    <SelectItem key={testType} value={testType}>
                                                                        <div className="flex items-center gap-2">
                                                                            <Settings className="h-4 w-4 text-blue-500" />
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
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium text-gray-700">
                                                        Severity
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                                                        <FormControl>
                                                            <SelectTrigger className="border-gray-300 focus:border-blue-500">
                                                                <SelectValue placeholder="Select severity..." />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                {TEST_CASE_SEVERITY_LIST.map((severity) => (
                                                                    <SelectItem key={severity} value={severity}>
                                                                        <div className="flex items-center gap-2">
                                                                            <div className={`w-3 h-3 rounded-full ${
                                                                                severity === 'High' ? 'bg-red-500' :
                                                                                severity === 'Medium' ? 'bg-yellow-500' :
                                                                                'bg-green-500'
                                                                            }`}></div>
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
                                </CardContent>
                            </Card>

                            {/* Test Suite & Requirements Card */}
                            <Card className="border-l-4 border-l-green-500">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <User className="h-5 w-5 text-green-600" />
                                        Test Suite & Requirements
                                    </CardTitle>
                                    <CardDescription>
                                        Associate this test case with a test suite and related requirements
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="testSuite"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium text-gray-700">
                                                    Test Suite *
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="border-gray-300 focus:border-blue-500">
                                                            <SelectValue placeholder="Select test suite..." />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {testSuites.map((testSuite) => (
                                                                <SelectItem key={testSuite._id} value={testSuite._id as string}>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                                                            {testSuite.title?.[0]?.toUpperCase()}
                                                                        </div>
                                                                        {testSuite.title}
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

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700">
                                            Requirements
                                        </Label>
                                        <MultiSelect
                                            options={requirementsList?.map((requirement) => ({
                                                label: typeof requirement?.title === "string" ? requirement.title : "",
                                                value: typeof requirement?._id === "string" ? requirement._id : "",
                                            }))}
                                            onValueChange={setSelectedRequirements}
                                            defaultValue={selectedRequirements}
                                            placeholder="Select requirements..."
                                            disabled={requirementsList?.length === 0}
                                            variant="secondary"
                                            animation={2}
                                            maxCount={3}
                                            isClear={clear}
                                            className="border-gray-300 focus:border-blue-500"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Test Details Card */}
                            <Card className="border-l-4 border-l-purple-500">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-purple-600" />
                                        Test Details
                                    </CardTitle>
                                    <CardDescription>
                                        Define preconditions and expected results for this test case
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="precondition"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium text-gray-700">
                                                    Precondition
                                                </FormLabel>
                                                <FormControl>
                                                    <TextEditor
                                                        markup={field.value || ""}
                                                        onChange={(value) => {
                                                            form.setValue("precondition", value);
                                                            form.trigger("precondition");
                                                        }}
                                                        placeholder="Describe the conditions that must be met before executing this test..."
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="expectedResult"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium text-gray-700">
                                                    Expected Result *
                                                </FormLabel>
                                                <FormControl>
                                                    <TextEditor
                                                        markup={field.value || ""}
                                                        onChange={(value) => {
                                                            form.setValue("expectedResult", value);
                                                            form.trigger("expectedResult");
                                                        }}
                                                        placeholder="Describe the expected outcome when this test is executed..."
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Test Steps Card */}
                            <Card className="border-l-4 border-l-indigo-500">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                                <List className="h-5 w-5 text-indigo-600" />
                                                Test Steps
                                            </CardTitle>
                                            <CardDescription>
                                                Define the step-by-step execution process for this test case
                                            </CardDescription>
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={addStep}
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add Step
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {stepFields.length === 0 ? (
                                        <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                            <div className="text-center">
                                                <List className="mx-auto h-12 w-12 text-gray-400" />
                                                <h3 className="mt-2 text-sm font-medium text-gray-900">No Test Steps</h3>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Click "Add Step" to define the test execution steps.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {stepFields.map((field, index) => (
                                                <div key={field.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="text-sm font-medium text-gray-900">
                                                            Step {index + 1}
                                                        </h4>
                                                        <Button
                                                            type="button"
                                                            onClick={() => removeStep(index)}
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <FormField
                                                            control={form.control}
                                                            name={`steps.${index}.description`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-sm font-medium text-gray-700">
                                                                        Step Description *
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Textarea
                                                                            placeholder="Describe what action to perform..."
                                                                            {...field}
                                                                            className="border-gray-300 focus:border-blue-500"
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name={`steps.${index}.expectedResult`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-sm font-medium text-gray-700">
                                                                        Expected Result *
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Textarea
                                                                            placeholder="Describe the expected outcome..."
                                                                            {...field}
                                                                            className="border-gray-300 focus:border-blue-500"
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Test Data Card */}
                            <Card className="border-l-4 border-l-teal-500">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                                <Database className="h-5 w-5 text-teal-600" />
                                                Test Data
                                            </CardTitle>
                                            <CardDescription>
                                                Define input data and validation rules for test execution
                                            </CardDescription>
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={addTestData}
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add Test Data
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {testDataFields.length === 0 ? (
                                        <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                            <div className="text-center">
                                                <Database className="mx-auto h-12 w-12 text-gray-400" />
                                                <h3 className="mt-2 text-sm font-medium text-gray-900">No Test Data</h3>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Click "Add Test Data" to define input data and validation rules.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {testDataFields.map((field, index) => (
                                                <div key={field.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="text-sm font-medium text-gray-900">
                                                            Test Data {index + 1}
                                                        </h4>
                                                        <Button
                                                            type="button"
                                                            onClick={() => removeTestData(index)}
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <FormField
                                                            control={form.control}
                                                            name={`testData.${index}.name`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-sm font-medium text-gray-700">
                                                                        Name *
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="Enter field name..."
                                                                            {...field}
                                                                            className="border-gray-300 focus:border-blue-500"
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name={`testData.${index}.type`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-sm font-medium text-gray-700">
                                                                        Type *
                                                                    </FormLabel>
                                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                                        <FormControl>
                                                                            <SelectTrigger className="border-gray-300 focus:border-blue-500">
                                                                                <SelectValue placeholder="Select type..." />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            <SelectGroup>
                                                                                {TEST_CASE_DATA_LIST.map((type) => (
                                                                                    <SelectItem key={type} value={type}>
                                                                                        {type}
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
                                                    <div className="mt-3">
                                                        <FormField
                                                            control={form.control}
                                                            name={`testData.${index}.inputValue`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-sm font-medium text-gray-700">
                                                                        Input Value *
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="Enter test value..."
                                                                            {...field}
                                                                            className="border-gray-300 focus:border-blue-500"
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                    <div className="mt-3">
                                                        <FormField
                                                            control={form.control}
                                                            name={`testData.${index}.description`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-sm font-medium text-gray-700">
                                                                        Description
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Textarea
                                                                            placeholder="Describe this test data field..."
                                                                            {...field}
                                                                            className="border-gray-300 focus:border-blue-500"
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Attachments Card */}
                            <Card className="border-l-4 border-l-orange-500">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Paperclip className="h-5 w-5 text-orange-600" />
                                        Attachments
                                    </CardTitle>
                                    <CardDescription>
                                        Upload supporting documents, screenshots, or test data files
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-center w-full">
                                            <label htmlFor="attachments" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-colors">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <Paperclip className="w-8 h-8 mb-4 text-gray-500" />
                                                    <p className="mb-2 text-sm text-gray-500">
                                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                                    </p>
                                                    <p className="text-xs text-gray-500">PNG, JPG, PDF, DOC (MAX. 10MB)</p>
                                                </div>
                                                <input
                                                    id="attachments"
                                                    type="file"
                                                    multiple
                                                    ref={inputRef}
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                        
                                        {attachments?.length > 0 && (
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-gray-700">
                                                    Selected Files ({attachments.length})
                                                </Label>
                                                <div className="grid gap-2">
                                                    {attachments.map((file, index) => (
                                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                                    <FileText className="h-4 w-4 text-blue-600" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                                                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveFile(index)}
                                                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                                            >
                                                                Remove
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Separator />

                            {/* Action Buttons */}
                            <DialogFooter className="flex justify-end gap-3 pt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setDialogOpen(false)}
                                    disabled={isLoading}
                                    className="px-6"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-6 bg-green-600 hover:bg-green-700"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {creationStep || "Creating Test Case..."}
                                        </>
                                    ) : (
                                        "Create Test Case"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}