"use client";

import React, { useEffect, useState } from "react";
import { Loader2, FileText, Settings, User, Paperclip, TestTube, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
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
import { addTestCaseAttachmentsService, updateTestCaseService } from "@/app/_services/test-case.service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddTestStep } from "../steps";
import { TestCaseData } from "../test-case-data";
import { TEST_CASE_SEVERITY_LIST, TEST_TYPE_LIST } from "@/app/_constants/test-case";
import TestCaseAttachments from "../attachments/test-case-attachments";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

const testSuiteSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
    expectedResult: z.string().min(1, "Expected result is required"),
    precondition: z.string().optional(),
    projectId: z.string().optional(),
    testSuite: z.string().min(1, "Test suite is required"),
    requirements: z.array(z.string().optional()),
    testType: z.string().optional(),
    severity: z.string().optional(),
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
    const testCaseId = testCases?.id;
    const { title, expectedResult, precondition, projectId, testSuite, requirements, testType, severity } = testCases;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [requirementsList, setRequirementsList] = useState<IRequirement[]>(requirements || []);
    const [clear, setClear] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState("test-case");
    const [selectedRequirements, setSelectedRequirements] = useState<string[]>(
        requirements?.map((requirement) => requirement._id) as string[]
    );
    const [attachments, setAttachments] = useState<File[]>([]);

    const form = useForm<z.infer<typeof testSuiteSchema>>({
        resolver: zodResolver(testSuiteSchema),
        defaultValues: {
            title: title || "",
            expectedResult: expectedResult || "",
            precondition: precondition || "",
            projectId: projectId,
            testSuite: "",
            requirements: [],
            testType: "",
            severity: "",
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
                await uploadAttachment();
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
            precondition: precondition || "",
            testSuite: testSuite?._id || "",
            requirements: [],
            testType: testType || "",
            severity: severity || ""
        });
    };

    const uploadAttachment = async () => {
        setIsLoading(true);
        try {
            await addTestCaseAttachmentsService(projectId as string, testCaseId, {
                attachments,
            });
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
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
            setActiveTab("test-case");
            resetForm();
        }
    }, [sheetOpen]);

    return (
        <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <TestTube className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-bold text-gray-900">
                                    Edit Test Case
                                </DialogTitle>
                                <DialogDescription className="text-gray-600">
                                    Update test case details and configuration.
                                </DialogDescription>
                            </div>
                        </div>
                        <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                            #{testCases?.customId}
                        </Badge>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="test-case" value={activeTab} onValueChange={setActiveTab} className="mt-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="test-case" className="flex items-center gap-2">
                            <TestTube className="h-4 w-4" />
                            Test Case
                        </TabsTrigger>
                        <TabsTrigger value="steps" className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Steps
                        </TabsTrigger>
                        <TabsTrigger value="test-data" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Test Data
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="test-case" className="space-y-6 mt-6">
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
                                            Update the essential details for this test case
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
                                            Update test suite association and related requirements
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
                                                placeholder="Select requirements..."
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
                                            Update preconditions and expected results for this test case
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

                                {/* Attachments Card */}
                                <Card className="border-l-4 border-l-orange-500">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <Paperclip className="h-5 w-5 text-orange-600" />
                                            Attachments
                                        </CardTitle>
                                        <CardDescription>
                                            Manage supporting documents, screenshots, or test data files
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <TestCaseAttachments
                                            testCaseId={testCaseId}
                                            isUpdate={true}
                                            isView={false}
                                            setAttachmentsData={setAttachments}
                                        />
                                    </CardContent>
                                </Card>

                                <Separator />

                                {/* Action Buttons */}
                                <DialogFooter className="flex justify-end gap-3 pt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setSheetOpen(false)}
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
                                                Updating...
                                            </>
                                        ) : (
                                            "Update"
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </TabsContent>

                    <TabsContent value="steps">
                        <AddTestStep testCaseId={testCaseId} />
                    </TabsContent>

                    <TabsContent value="test-data">
                        <TestCaseData testCaseId={testCaseId} />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
