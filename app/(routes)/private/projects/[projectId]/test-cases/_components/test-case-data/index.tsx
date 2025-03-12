"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash } from "lucide-react";
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
import { SheetClose } from "@/components/ui/sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TextEditor from "../../../../_components/text-editor";
import {
  TEST_CASE_DATA_LIST,
  TEST_CASE_DATA_VALIDATION_LIST,
} from "@/app/_constants/test-case";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  addTestCaseDataService,
  getTestCaseDataService,
} from "@/app/_services/test-case-data.service";
import {
  ITestCaseData,
  ITestCaseDataPayload,
} from "@/app/_interface/test-case-data";
import TestCaseDataTable from "./_components/table";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { DocumentName } from "@/app/_components/document-name";
import { ColumnDef } from "@tanstack/react-table";
import { ITestCaseAttachmentDisplay } from "@/app/_interface/test-case";

const testPlanSchema = z.object({
  testCases: z.array(
    z.object({
      name: z.string().min(1, "Name is required"),
      type: z.string().min(1, "Type is required"),
      validation: z.array(z.string()).optional(),
      inputValue: z.string().min(1, "InputValue is required"),
      description: z.string().optional(),
      attachments: z.array(z.instanceof(File)).optional(),
    })
  ),
});

export function TestCaseData({ testCaseId }: { testCaseId: string }) {
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [testCaseData, setTestCaseData] = useState<ITestCaseData[]>([]);
  const [attachments, setAttachments] = useState<{ [key: number]: File[] }>({});
  const { projectId } = useParams<{ projectId: string }>();
  const inputRef = useRef<HTMLInputElement[]>([]);

  const form = useForm<z.infer<typeof testPlanSchema>>({
    resolver: zodResolver(testPlanSchema),
    defaultValues: {
      testCases: [
        {
          name: "",
          type: "",
          validation: [],
          inputValue: "",
          description: "",
          attachments: []
        },
      ],
    },
  });

  async function onSubmit(values: z.infer<typeof testPlanSchema>) {
    setIsLoading(true);
    try {
      const payload: ITestCaseDataPayload = {
        testCases: values.testCases.map((testCase) => ({
          name: testCase.name,
          type: testCase.type,
          validation: testCase.validation || [],
          inputValue: testCase.inputValue,
          description: testCase.description || "",
          attachments: testCase.attachments || []
        })),
      };
      const response = await addTestCaseDataService(
        projectId,
        testCaseId,
        payload
      );
      if (response) {
        resetForm();
        setAttachments([]);
        getTestCaseData();
        toasterService.success(response.message);
      }
    } catch (error) {
      toasterService.error();
    } finally {
      setIsLoading(false);
    }
  }

  const getTestCaseData = async () => {
    try {
      const response = await getTestCaseDataService(projectId, testCaseId);
      if (response) {
        setTestCaseData(response);
      }
    } catch (error) {
      toasterService.error();
    }
  };

  useEffect(() => {
    getTestCaseData();
  }, []);

  const refreshTestCaseData = () => {
    getTestCaseData();
  };

  const validateTestPlan = () => {
    if (form.formState.isValid) {
      form.handleSubmit(onSubmit)();
    }
  };

  const resetForm = () => {
    form.reset();
  };

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "testCases",
  });

  const isFieldIncomplete = (index: number) => {
    const name = form.getValues(`testCases.${index}.name`);
    const type = form.getValues(`testCases.${index}.type`);
    const inputValue = form.getValues(`testCases.${index}.inputValue`);
    return !(type && name && inputValue);
  };

  // Attachment functions
  const handleFileChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      setAttachments((prevAttachments) => {
        const existingAttachments = prevAttachments[index] ?? [];

        const uniqueAttachments = newFiles.filter(
          (file) =>
            !existingAttachments.some(
              (prevFile) => prevFile.name === file.name && prevFile.size === file.size
            )
        );

        const updatedAttachments = [...existingAttachments, ...uniqueAttachments];
        form.setValue(`testCases.${index}.attachments`, updatedAttachments);

        return {
          ...prevAttachments,
          [index]: updatedAttachments,
        };
      });

      if (inputRef.current[index]) {
        inputRef.current[index]!.value = "";
      }
    }
  };


  const handleRemoveFile = (testCaseIndex: number, attachmentIndex: number) => {
    setAttachments((prevAttachments) => {
      const updatedAttachments = prevAttachments[testCaseIndex]?.filter((_, i) => i !== attachmentIndex) ?? [];

      form.setValue(`testCases.${testCaseIndex}.attachments`, updatedAttachments);

      return {
        ...prevAttachments,
        [testCaseIndex]: updatedAttachments,
      };
    });

    if (inputRef.current[testCaseIndex]) {
      inputRef.current[testCaseIndex]!.value = "";
    }
  };


  return (
    <div>
      <div>
        {testCaseData.length > 0 && (
          <TestCaseDataTable
            testCaseData={testCaseData}
            refreshTestCaseData={refreshTestCaseData}
          />
        )}
      </div>
      <div className="mt-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} method="post">
            <div className="flex flex-col gap-2 mt-4">
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
                      <Label>Validation</Label>
                      <Controller
                        name={`testCases.${index}.validation`}
                        control={form.control}
                        render={({ field }) => (
                          <MultiSelect
                            options={TEST_CASE_DATA_VALIDATION_LIST.map(
                              (validation) => ({
                                label: validation,
                                value: validation,
                              })
                            )}
                            value={field?.value as [string]}
                            onValueChange={field.onChange}
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

                    <div className="flex flex-col w-full px-4 mt-3">
                      <FormField
                        control={form.control}
                        name={`testCases.${index}.description`}
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <TextEditor
                                markup={field.value || ""}
                                onChange={(value) => {
                                  form.setValue(
                                    `testCases.${index}.description`,
                                    value
                                  );
                                  form.trigger(
                                    `testCases.${index}.description`
                                  );
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Attachments */}
                    {
                      <div className="grid grid-cols-1 gap-2 px-4">
                        <div className="w-full mt-3">
                          <Label htmlFor="attachments">Attachments</Label>
                          <Input
                            className="mt-2 opacity-0 cursor-pointer absolute w-0 h-0"
                            id={`attachments-${index}`}
                            type="file"
                            multiple
                            ref={(el) => {
                              if (el) inputRef.current[index] = el;
                            }}
                            onChange={(e) => handleFileChange(index)(e)}
                          />
                          <label
                            htmlFor={`attachments-${index}`}
                            className="flex mt-2 h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors cursor-pointer"
                          >
                            Choose Files
                          </label>
                          {attachments[index]?.length > 0 && (
                            <div className="mt-2">
                              New attachments
                              <div className="mt-4 rounded-md border">
                                <Table>
                                  <TableBody>
                                    {attachments[index]?.length ? (
                                      attachments[index].map((attachment, attachmentIndex) => (
                                        <TableRow key={`${index}-${attachmentIndex}`}>
                                          <TableCell>
                                            <DocumentName document={attachment} />
                                          </TableCell>
                                          <TableCell className="flex justify-end items-end mr-6">
                                            <Button
                                              type="button"
                                              onClick={() => handleRemoveFile(index, attachmentIndex)}
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
                      </div>
                    }

                    <div className="px-4 py-4 flex items-center">
                      {index > 0 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => remove(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex  mt-4">
                    {index === fields.length - 1 && (
                      <Button
                        type="button"
                        size="sm"
                        className="mr-4"
                        onClick={() =>
                          append({
                            name: "",
                            type: "",
                            inputValue: "",
                            validation: [""],
                            description: "",
                          })
                        }
                        disabled={isFieldIncomplete(index)}
                      >
                        <Plus /> New parameter
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
                onClick={() => validateTestPlan()}
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
    </div>
  );
}
