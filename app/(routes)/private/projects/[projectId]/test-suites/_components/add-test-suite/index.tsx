"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Loader2,
    Plus,
    Save,
    Target,
    Info,
    Layers,
    FileText,
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useParams } from "next/navigation";
import TextEditor from "@/app/(routes)/private/projects/_components/text-editor";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { getRequirementsWithoutPaginationService } from "@/app/_services/requirement.service";
import { IRequirement } from "@/app/_interface/requirement";
import { addTestSuiteService } from "@/app/_services/test-suite.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const testSuiteSchema = z.object({
    title: z.string().min(1, "Required"),
    description: z.string().min(1, "Required"),
    projectId: z.string().optional(),
});

export function AddTestSuite({ refreshTestSuites }: { refreshTestSuites: () => void }) {

    const [dialogOpen, setDialogOpen] = useState(false);
    const [requirments, setRequirements] = useState<IRequirement[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { projectId } = useParams<{ projectId: string }>();
    const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
    const [isRequirementsLoading, setIsRequirementsLoading] = useState<boolean>(false);

    const form = useForm<z.infer<typeof testSuiteSchema>>({
        resolver: zodResolver(testSuiteSchema),
        defaultValues: {
            title: "",
            description: "",
            projectId: projectId,
        },
    });

    async function onSubmit(values: z.infer<typeof testSuiteSchema>) {
        setIsLoading(true);
        try {
            const response = await addTestSuiteService(projectId, {
                ...values,
                requirements: selectedRequirements
            });
            if (response) {
                refreshTestSuites();
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
            setDialogOpen(false);
        }
    }

    useEffect(() => {
        if (dialogOpen) {
            getRequirements();
        }
    }, [dialogOpen]);

    const getRequirements = async () => {
        try {
            setIsRequirementsLoading(true);
            const response = await getRequirementsWithoutPaginationService(projectId);
            setRequirements(response);
        } catch (error) {
            toasterService.error();
        } finally {
            setIsRequirementsLoading(false);
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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button onClick={() => resetForm()} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Test Suite
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
                {/* Balanced Header Design */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 p-6 border border-purple-100 mb-6">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-100/50 to-indigo-100/50 rounded-full -translate-y-12 translate-x-12"></div>
                    <div className="relative flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Layers className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                                <Badge variant="outline" className="bg-white/80 border-purple-200 text-purple-700">
                                    Create Mode
                                </Badge>
                            </div>
                            <DialogTitle className="text-xl font-bold text-gray-900 mb-2">
                                Add New Test Suite
                            </DialogTitle>
                            <DialogDescription className="text-gray-600 text-sm">
                                Create a new test suite with requirements and detailed description
                            </DialogDescription>
                        </div>
                    </div>
                </div>

                <div className="px-6 space-y-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} method="post">
                            {/* Basic Information Card */}
                            <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Target className="h-5 w-5 text-blue-600" />
                                        Basic Information
                                    </CardTitle>
                                    <p className="text-sm text-gray-600">
                                        Enter the test suite title and description
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-blue-500" />
                                                    Test Suite Title *
                                                </FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        {...field} 
                                                        placeholder="Enter a descriptive title for the test suite"
                                                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 h-12 text-base rounded-xl"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <Info className="h-4 w-4 text-purple-500" />
                                                    Description *
                                                </FormLabel>
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

                            {/* Requirements Card */}
                            <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Layers className="h-5 w-5 text-green-600" />
                                        Requirements
                                    </CardTitle>
                                    <p className="text-sm text-gray-600">
                                        Select requirements to associate with this test suite
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Layers className="h-4 w-4 text-green-500" />
                                            Select Requirements
                                        </Label>
                                        <MultiSelect
                                            options={requirments.map((requirment) => ({
                                                label: requirment?.title,
                                                value: requirment?.id
                                            }))}
                                            onValueChange={setSelectedRequirements}
                                            defaultValue={selectedRequirements}
                                            placeholder={isRequirementsLoading ? "Loading requirements..." : "Select requirements (optional)"}
                                            disabled={isRequirementsLoading}
                                            variant="secondary"
                                            animation={2}
                                            maxCount={3}
                                            className="w-full"
                                        />
                                        {selectedRequirements.length > 0 && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge variant="secondary" className="bg-green-100 text-green-700">
                                                    {selectedRequirements.length} requirement(s) selected
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-6 pb-4 justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setDialogOpen(false)}
                                    disabled={isLoading}
                                    className="flex-1 sm:flex-none border-gray-300 hover:bg-gray-50"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading || !form.formState.isValid}
                                    onClick={() => validateTestSuite()}
                                    className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Test Suite
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
