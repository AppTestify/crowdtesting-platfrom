"use client";

import toasterService from "@/app/_services/toaster-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useParams } from "next/navigation";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Edit, Loader2, Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { addTestCaseStepService, deleteTestCaseStepService, getTestCaseStepService, updateTestCaseSequenceService } from "@/app/_services/test-case-step.service";
import { ITestCaseStep } from "@/app/_interface/test-case-step";
import { closestCenter, DndContext, DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ConfirmationDialog } from "@/app/_components/confirmation-dialog";
import { aditionalStepTypes, testCaseAddList } from "@/app/_constants/test-case";
import { Textarea } from "@/components/ui/text-area";
import EditTestCaseStep from "./_components/edit-test-case-step";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

export function AddTestStep({ testCaseId }: { testCaseId: string }) {
    const [selectedItem, setSelectedItem] = useState<string>("");

    const testSuiteSchema = z.object({
        description: z.string().min(1, "Required"),
        additionalSelectType: z.string().optional(),
        selectedType: z.boolean().optional(),
        expectedResult: z.string().optional()
    }).refine((data) => {
        if (selectedItem === "Steps" && (!data.expectedResult || data.expectedResult.trim() === "")) {
            return false;
        }
        return true;
    }, {
        message: "Required",
        path: ["expectedResult"],
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);
    const [testCaseSteps, setTestCaseSteps] = useState<ITestCaseStep[]>([]);
    const [testCaseStepId, setTestCaseStepId] = useState<string>("");
    const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
    const [testCaseStepEdit, setTestCaseStepEdit] = useState<ITestCaseStep | null>(null);
    const [stepLoading, setStepLoading] = useState<boolean>(false);
    const { projectId } = useParams<{ projectId: string }>();
    const [activeId, setActiveId] = useState<string | null>(null);

    const form = useForm<z.infer<typeof testSuiteSchema>>({
        resolver: zodResolver(testSuiteSchema),
        defaultValues: {
            description: "",
            additionalSelectType: "",
            selectedType: false,
            expectedResult: ""
        },
    });

    const handleSelectChange = (value: string) => {
        setSelectedItem(value);
        resetForm();
    };

    async function onSubmit(values: z.infer<typeof testSuiteSchema>) {
        setIsLoading(true);
        try {
            const response = await addTestCaseStepService(projectId, testCaseId, {
                description: values.description as string,
                additionalSelectType: values.additionalSelectType as string,
                expectedResult: values.expectedResult as string,
                selectedType: selectedItem === "Steps" ? true : false
            });
            if (response) {
                getSteps();
                unselectAdditionalStep();
                resetForm();
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    }

    const getSteps = async () => {
        setStepLoading(true);
        try {
            const response = await getTestCaseStepService(projectId, testCaseId);
            setTestCaseSteps(response);
        } catch (error) {
            toasterService.error();
        } finally {
            setStepLoading(false);
        }
    }

    const refreshTestCaseStep = () => {
        getSteps();
    }

    const deleteTestCaseStep = async () => {
        setIsDeleteLoading(true);
        try {
            const response = await deleteTestCaseStepService(projectId, testCaseId, testCaseStepId)
            if (response) {
                getSteps();
                setIsDeleteOpen(false);
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsDeleteLoading(false);
        }
    }

    useEffect(() => {
        getSteps()
    }, []);

    const unselectAdditionalStep = () => {
        setSelectedItem("");
    }

    const resetForm = () => {
        form.reset();
    };

    // for darg and drop
    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (active.id !== over?.id) {
            const activeIndex = testCaseSteps.findIndex((step) => step._id === active.id);
            const overIndex = testCaseSteps.findIndex((step) => step._id === over?.id);

            if (activeIndex === -1 || overIndex === -1) return;

            const updatedTestCaseSteps = [...testCaseSteps];
            const [removed] = updatedTestCaseSteps.splice(activeIndex, 1);
            updatedTestCaseSteps.splice(overIndex, 0, removed);

            updatedTestCaseSteps.forEach((step, index) => {
                step.order = index;
            });

            setTestCaseSteps(updatedTestCaseSteps);
            try {
                await updateTestCaseSequenceService(projectId, testCaseId, updatedTestCaseSteps as any);
            } catch (error) {
                console.error("Failed to update test case steps:", error);
            }
        }
    };

    const closeDialog = () => setIsEditOpen(false);

    const handleDelete = (id: string) => {
        setTestCaseStepId(id);
        setIsDeleteOpen(true);
        setIsDeleteLoading(false);
    };

    const editTestCaseStep = (data: ITestCaseStep) => {
        setTestCaseStepEdit(data);
        setIsEditOpen(true);
    };

    const SortableData = ({ data, index, onDelete }: { data: ITestCaseStep, index: number, onDelete: (id: string) => void; }) => {
        const { listeners, transform, transition, attributes, setNodeRef } =
            useSortable({ id: data._id });
        const style = {
            transition,
            transform: CSS.Transform.toString(transform),
            border: "1px solid #ccc",
            backgroundColor: "#fff",
            cursor: "move",
        }

        return (
            <div
                ref={setNodeRef}
                {...listeners}
                {...attributes}
                style={style}
                key={index}
                className="flex items-center justify-between mb-2 p-2 bg-gray-100 rounded-md shadow-sm"
            >
                <span>
                    <span>
                        {data?.selectedType ?
                            <span className="text-sm text-gray-800">Step {testCaseSteps.filter(step => step.selectedType).indexOf(data) + 1} : </span> :
                            <span>{data?.additionalSelectType} : </span>
                        }
                    </span>
                    {data?.description}
                    {data?.expectedResult &&
                        <div>
                            <span className="text-sm text-gray-800">Expected result: </span> {data?.expectedResult}
                        </div>
                    }
                </span>
                <div className="flex items-center gap-4 ">
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            editTestCaseStep(data);
                        }}
                        className="hover:cursor-pointer">
                        <Edit className="w-4" />
                    </div>
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(data._id);
                        }}
                        className="hover:cursor-pointer">
                        <Trash className="w-4 text-destructive" />
                    </div>
                </div>
            </div>
        )
    }

    const pointerSensor = useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
                
            },
        });

    const sensors = useSensors(pointerSensor);

    return (
        <div>
            <ConfirmationDialog
                isOpen={isDeleteOpen}
                setIsOpen={setIsDeleteOpen}
                title="Delete test case step"
                description="Are you sure you want delete this test case step?"
                isLoading={isDeleteLoading}
                successAction={deleteTestCaseStep}
                successLabel="Delete"
                successLoadingLabel="Deleting"
                successVariant={"destructive"}
            />
            <EditTestCaseStep isEditOpen={isEditOpen} closeDialog={closeDialog} testCaseStepEdit={testCaseStepEdit as ITestCaseStep} refreshTestCaseStep={refreshTestCaseStep} />
            {!stepLoading ?
                <>
                    {testCaseSteps && testCaseSteps.length > 0 && (
                        <div>
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext items={testCaseSteps.map((step) => step._id)} strategy={verticalListSortingStrategy}>
                                    {testCaseSteps.map((testCaseStep, index) => (
                                        <SortableData key={testCaseStep._id} data={testCaseStep} index={index} onDelete={handleDelete} />
                                    ))}
                                </SortableContext>

                                <DragOverlay>
                                    {activeId ? (
                                        <SortableData
                                            data={testCaseSteps.find((step) => step._id === activeId)!}
                                            index={testCaseSteps.findIndex((step) => step._id === activeId)}
                                            onDelete={handleDelete}
                                        />
                                    ) : null}
                                </DragOverlay>
                            </DndContext>
                        </div>

                    )}
                </> :
                <div>
                    {Array(3).fill(null).map((_, index) => (
                        <div className='mt-2'>
                            <Skeleton key={index} className="h-10 w-full bg-gray-200" />
                        </div>
                    ))
                    }
                </div>
            }
            <div className="grid grid-cols-1 gap-2 mt-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className="w-full" disabled={selectedItem !== ""}>
                            <Plus />
                            Select step type
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="min-w-96">
                        {testCaseAddList.map((addTestCase, index) => (
                            <DropdownMenuItem
                                key={index}
                                onSelect={() => handleSelectChange(addTestCase)}
                                className="cursor-pointer"
                            >
                                {addTestCase}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            {
                selectedItem != "" && (
                    <Form {...form} >
                        <form onSubmit={form.handleSubmit(onSubmit)} method="post">
                            {selectedItem == "Steps" ? (
                                <div className="mt-4 grid grid-cols-1 gap-2">
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Step {testCaseSteps.filter(step => step.selectedType).length + 1}</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
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
                                                <FormLabel>Expected result</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            ) :
                                (
                                    <div className="mt-4 grid grid-cols-1 gap-2">
                                        <FormField
                                            control={form.control}
                                            name="additionalSelectType"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>Severity</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                {aditionalStepTypes.map((aditionalStepType) => (
                                                                    <SelectItem value={aditionalStepType}>
                                                                        {aditionalStepType}
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
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Step {testCaseSteps.filter(step => step.selectedType).length + 1}</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}
                            <div className="mt-6 w-full flex justify-end gap-2">
                                <Button
                                    disabled={isLoading}
                                    type="button"
                                    variant={"outline"}
                                    size="lg"
                                    className="w-full md:w-fit"
                                    onClick={() => unselectAdditionalStep()}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    disabled={isLoading}
                                    type="submit"
                                    size="lg"
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
                )
            }
        </div >
    );
}
