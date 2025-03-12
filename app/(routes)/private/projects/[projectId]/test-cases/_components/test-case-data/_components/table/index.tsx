"use client";

import { useEffect, useState } from "react";
import { ITestCaseData } from "@/app/_interface/test-case-data";
import { Badge } from "@/components/ui/badge";
import { BadgeCheck, Edit, Loader2, NotebookPen, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/app/_components/confirmation-dialog";
import { deleteTestCaseDataService } from "@/app/_services/test-case-data.service";
import toasterService from "@/app/_services/toaster-service";
import { useParams } from "next/navigation";
import EditTestCaseData from "../edit-test-case-data";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu-icon";
import TestCaseDataAttachments from "../attachments/test-case-data-attachments";

export default function TestCaseDataCard({
  testCaseData,
  refreshTestCaseData,
}: {
  testCaseData: ITestCaseData[];
  refreshTestCaseData: () => void;
}) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { projectId } = useParams<{ projectId: string }>();
  const [testCaseDataValue, setTestCaseData] = useState<ITestCaseData | null>(
    null
  );

  const deleteTestCaseData = async () => {
    try {
      setIsLoading(true);
      const response = await deleteTestCaseDataService(
        projectId,
        testCaseData[0]?.testCaseId,
        testCaseDataValue?._id as string
      );

      if (response?.message) {
        setIsLoading(false);
        refreshTestCaseData();
        setIsDeleteOpen(false);
        toasterService.success(response.message);
      }
    } catch (error) {
      toasterService.error();
      setIsDeleteOpen(false);
      console.log("Error > deleteTestCaseData", error);
    }
  };

  return (
    <main className="mt-3">
      {/* Delete */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        title="Delete test case data"
        description="Are you sure you want delete this test case data?"
        isLoading={isLoading}
        successAction={deleteTestCaseData}
        successLabel="Delete"
        successLoadingLabel="Deleting"
        successVariant={"destructive"}
      />

      {/* Edit */}
      <EditTestCaseData
        testCaseDataValue={testCaseDataValue as ITestCaseData}
        isEditOpen={isEditOpen}
        setIsEditOpen={setIsEditOpen}
        refreshTestCaseData={refreshTestCaseData}
      />

      <div className="w-full grid grid-cols-1 gap-4">
        {/* Render cards */}
        {testCaseData && testCaseData.length > 0 ? (
          testCaseData.map((testCase) => (
            <div
              key={testCase._id}
              className="bg-white rounded-lg border overflow-hidden"
            >
              <div className="p-4">
                <div key={testCase._id} className="overflow-hidden mb-3">
                  {/* Name and Type */}
                  <div className="flex gap-2 items-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>{testCase.name}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Data name</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Badge variant="default" className="font-normal">
                              {testCase.type}
                            </Badge>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Data type</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {/* Validation */}
                  <div className="mt-4">
                    <div className="flex items-center justify-start w-full flex-wrap gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <BadgeCheck className="h-5 w-5" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Data Validations</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {testCase.validation?.map((validation, index) => (
                        <Badge variant="outline" className="font-normal">
                          {validation}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-start w-full flex-wrap gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <NotebookPen className="h-5 w-5" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Input value</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <span className="text-sm text-gray-700">
                        {testCase.inputValue}
                      </span>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="border-b my-4" />
                  <div
                    className="text-sm leading-relaxed text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: testCase?.description || "",
                    }}
                  />

                  <div className="mt-2">
                    Attachments
                    <TestCaseDataAttachments
                      testCaseId={testCase.testCaseId}
                      testCaseDataId={testCase._id}
                      isUpdate={false}
                      isView={true}
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <Button
                    type="button"
                    className="my-1 hover:bg-primary bg-primary"
                    onClick={() => {
                      setIsLoading(false);
                      setIsEditOpen(true);
                      setTestCaseData(testCase);
                    }}
                  >
                    <Edit className="h-2 w-2" />{" "}
                    <span className=""> Edit </span>
                  </Button>
                  <Button
                    type="button"
                    className="my-1 ml-4 hover:bg-destructive bg-destructive"
                    onClick={() => {
                      setIsDeleteOpen(true);
                      setIsLoading(false);
                      setTestCaseData(testCase);
                    }}
                  >
                    <Trash className="h-2 w-2 " />{" "}
                    <span className=""> Delete </span>
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center">
            {!isLoading ? (
              <p className="text-xl text-gray-500">No results</p>
            ) : (
              <p className="text-xl text-gray-500">Loading</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
