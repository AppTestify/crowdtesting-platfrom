"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus } from "lucide-react";
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

const testPlanSchema = z.object({
  testCases: z.array(
    z.object({
      name: z.string().min(1, "Name is required"),
      type: z.string().min(1, "Type is required"),
      validation: z.array(z.string()).optional(),
      inputValue: z.string().min(1, "InputValue is required"),
      description: z.string().optional(),
    })
  ),
});

export function TestCaseData({ testCaseId }: { testCaseId: string }) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [testCaseData, setTestCaseData] = useState<ITestCaseData[]>([]);
  const { projectId } = useParams<{ projectId: string }>();

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
        })),
      };
      const response = await addTestCaseDataService(
        projectId,
        testCaseId,
        payload
      );
      if (response) {
        resetForm();
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
