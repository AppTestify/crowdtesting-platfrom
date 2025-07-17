import React, { useEffect, useState } from "react";
import { Loader2, Plus, FileText, Layers, X, Save, Link, Info, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
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
import { getRequirementsWithoutPaginationService } from "@/app/_services/requirement.service";
import { IRequirement } from "@/app/_interface/requirement";
import { updateTestSuiteService } from "@/app/_services/test-suite.service";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const deviceSchema = z.object({
    title: z.string().min(1, "Required"),
    description: z.string().min(1, "Required"),
    projectId: z.string().optional()
});

export function EditTestSuite({
    testSuite,
    sheetOpen,
    setSheetOpen,
    refreshTestSuites,
}: {
    testSuite: ITestSuite;
    sheetOpen: boolean;
    setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
    refreshTestSuites: () => void;
}) {
    const testSuiteId = testSuite.id;
    const [selectedRequirements, setSelectedRequirements] = useState<string[]>(
        testSuite?.requirements?.map((requirement) => requirement._id) as string[]
    );
    const { title, description } = testSuite;
    const { projectId } = useParams<{ projectId: string }>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isRequirementLoading, setIsRequirementLoading] = useState<boolean>(false);
    const [requirments, setRequirements] = useState<IRequirement[]>([]);
    const form = useForm<z.infer<typeof deviceSchema>>({
        resolver: zodResolver(deviceSchema),
        defaultValues: {
            title: title || "",
            description: description || "",
        },
    });

    async function onSubmit(values: z.infer<typeof deviceSchema>) {
        setIsLoading(true);
        try {
            const response = await updateTestSuiteService(projectId, testSuiteId, {
                ...values,
                requirements: selectedRequirements,
                projectId: projectId
            });
            if (response) {
                refreshTestSuites();
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
            description: description || "",
        });
        setSelectedRequirements(testSuite?.requirements?.map((requirement) => requirement._id) as string[]);
    };

    useEffect(() => {
        if (sheetOpen) {
            getRequirements();
        }
    }, [sheetOpen]);

    const getRequirements = async () => {
        try {
            setIsRequirementLoading(true);
            const response = await getRequirementsWithoutPaginationService(projectId);
            setRequirements(response);
        } catch (error) {
            toasterService.error();
        } finally {
            setIsRequirementLoading(false);
        }
    }

    useEffect(() => {
        if (sheetOpen) {
            resetForm();
        }
    }, [sheetOpen]);

    return (
        <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-6">
                    {/* Enhanced Header with Gradient Background */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-6 border border-green-100">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100/50 to-emerald-100/50 rounded-full -translate-y-16 translate-x-16"></div>
                        <div className="relative flex items-start gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Settings className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 font-mono">
                                        #{testSuite?.customId}
                                    </Badge>
                                    <Badge variant="outline" className="bg-white/80 border-green-200 text-green-700">
                                        Edit Mode
                                    </Badge>
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                                    Edit Test Suite
                                </h1>
                                <p className="text-gray-600">
                                    Update test suite information and linked requirements
                                </p>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="mt-8">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} method="post" className="space-y-6">
                            {/* Basic Information Card */}
                            <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                        Basic Information
                                    </CardTitle>
                                    <p className="text-sm text-gray-600">
                                        Update the title and description of your test suite
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium text-gray-700">
                                                    Test Suite Title *
                                                </FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        {...field} 
                                                        placeholder="Enter test suite title"
                                                        className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Requirements Management Card */}
                            <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Link className="h-5 w-5 text-purple-600" />
                                        Requirements Management
                                    </CardTitle>
                                    <p className="text-sm text-gray-600">
                                        Link requirements to establish traceability
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700">
                                            Linked Requirements
                                        </Label>
                                        <MultiSelect
                                            options={
                                                !isRequirementLoading
                                                    ? requirments?.map((requirement) => ({
                                                        label: requirement?.title,
                                                        value: requirement?.id,
                                                    }))
                                                    : []
                                            }
                                            onValueChange={setSelectedRequirements}
                                            defaultValue={selectedRequirements}
                                            placeholder={isRequirementLoading ? "Loading requirements..." : "Select requirements to link"}
                                            variant="secondary"
                                            animation={2}
                                            maxCount={5}
                                            className="mt-2"
                                        />
                                        <p className="text-xs text-gray-500">
                                            Select requirements to link with this test suite
                                        </p>
                                    </div>

                                    {selectedRequirements.length > 0 && (
                                        <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Link className="h-4 w-4 text-purple-600" />
                                                <span className="text-sm font-medium text-purple-700">
                                                    Selected Requirements ({selectedRequirements.length})
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedRequirements.map((reqId) => {
                                                    const req = requirments.find(r => r.id === reqId);
                                                    return req ? (
                                                        <Badge 
                                                            key={reqId} 
                                                            variant="secondary"
                                                            className="bg-purple-100 text-purple-700 border-purple-200"
                                                        >
                                                            #{req.customId} {req.title}
                                                        </Badge>
                                                    ) : null;
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Description Card */}
                            <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Info className="h-5 w-5 text-blue-600" />
                                        Description *
                                    </CardTitle>
                                    <p className="text-sm text-gray-600">
                                        Provide a detailed description of your test suite
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <TextEditor
                                                        markup={field.value || ""}
                                                        onChange={(value) => {
                                                            form.setValue("description", value);
                                                            form.trigger("description");
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Summary Card */}
                            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Layers className="h-5 w-5 text-green-600" />
                                        Update Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
                                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                                <FileText className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Title</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {form.watch("title") || "Not set"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
                                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <Link className="h-4 w-4 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Requirements</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {selectedRequirements.length} selected
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Info className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Description</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {form.watch("description") ? "Available" : "Not set"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6">
                                <DialogClose asChild>
                                    <Button
                                        disabled={isLoading}
                                        type="button"
                                        variant="outline"
                                        size="lg"
                                        className="w-full sm:w-auto border-gray-300 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button
                                    disabled={isLoading}
                                    type="submit"
                                    size="lg"
                                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                                >
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    {isLoading ? "Updating..." : "Update Test Suite"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
