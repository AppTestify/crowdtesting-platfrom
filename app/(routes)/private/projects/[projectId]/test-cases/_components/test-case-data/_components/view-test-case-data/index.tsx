import { ITestCaseData } from "@/app/_interface/test-case-data";
import { getTestCaseDataService } from "@/app/_services/test-case-data.service";
import toasterService from "@/app/_services/toaster-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu-icon";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BadgeCheck, NotebookPen, TriangleAlert } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function ViewTestCaseData({
  testCaseId,
}: {
  testCaseId: string;
}) {
  const { projectId } = useParams<{ projectId: string }>();
  const [testCaseData, setTestCaseData] = useState<ITestCaseData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const getTestCaseData = async () => {
    setIsLoading(true);
    try {
      const response = await getTestCaseDataService(projectId, testCaseId);
      if (response) {
        setTestCaseData(response);
      }
    } catch (error) {
      toasterService.error();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getTestCaseData();
  }, []);

  return (
    <div className="mt-4">
      {!isLoading ? (
        <div>
          {testCaseData && testCaseData.length > 0 ? (
            testCaseData.map((testCase) => (
              <div
                key={testCase._id}
                className="bg-white rounded-lg border overflow-hidden mb-3 "
              >
                <div className="p-4">
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
                </div>
              </div>
            ))
          ) : (
            <div>No test case steps available</div>
          )}
        </div>
      ) : (
        <div>
          {Array(2).fill(null).map((_, index) => (
            <div className='mt-4'>
              <Skeleton key={index} className="h-40 w-full bg-gray-200" />
            </div>
          ))
          }
        </div>
      )}
    </div>
  );
}
