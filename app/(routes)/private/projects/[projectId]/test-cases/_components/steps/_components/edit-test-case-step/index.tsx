import { aditionalStepTypes } from '@/app/_constants/test-case'
import { ITestCaseStep } from '@/app/_interface/test-case-step'
import { updateTestCaseStepService } from '@/app/_services/test-case-step.service'
import toasterService from '@/app/_services/toaster-service'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/text-area'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const testSuiteSchema = z.object({
  description: z.string().min(1, "Required"),
  additionalSelectType: z.string().optional(),
  selectedType: z.boolean().optional(),
});

export default function EditTestCaseStep({ isEditOpen, closeDialog, testCaseStepEdit, refreshTestCaseStep }:
  { isEditOpen: boolean, closeDialog: () => void, testCaseStepEdit: ITestCaseStep, refreshTestCaseStep: () => void }) {

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const form = useForm<z.infer<typeof testSuiteSchema>>({
    resolver: zodResolver(testSuiteSchema),
    defaultValues: {
      description: testCaseStepEdit?.description || "",
      additionalSelectType: testCaseStepEdit?.additionalSelectType || "",
      selectedType: testCaseStepEdit?.selectedType || false
    },
  });

  useEffect(() => {
    if (testCaseStepEdit) {
      form.reset({
        description: testCaseStepEdit?.description || "",
        additionalSelectType: testCaseStepEdit?.additionalSelectType || "",
        selectedType: testCaseStepEdit?.selectedType || false
      });
    }
  }, [testCaseStepEdit, form]);

  async function onSubmit(values: z.infer<typeof testSuiteSchema>) {
    setIsLoading(true);
    try {
      const response = await updateTestCaseStepService(testCaseStepEdit?.projectId,
        testCaseStepEdit?.testCaseId, testCaseStepEdit?._id, {
        ...values,
        selectedType: testCaseStepEdit?.selectedType
      });
      if (response) {
        toasterService.success(response.message);
        refreshTestCaseStep();
        closeDialog();
      }
    } catch (error) {
      toasterService.error();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <Dialog open={isEditOpen} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit step</DialogTitle>
            <DialogDescription>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus, obcaecati.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} method="post">
              {testCaseStepEdit?.selectedType ? (
                <div className="grid grid-cols-1 gap-2">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
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
                  <div className=" grid grid-cols-1 gap-2">
                    <FormField
                      control={form.control}
                      name="additionalSelectType"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Type</FormLabel>
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
                          <FormLabel>Description</FormLabel>
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
              <DialogFooter className="mt-4">
                <Button type="submit">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {isLoading ? "Updating" : "Update"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
