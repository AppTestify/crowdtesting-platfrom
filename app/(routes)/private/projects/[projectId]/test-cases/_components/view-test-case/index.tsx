import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ITestCase } from "@/app/_interface/test-case";
import { formatDate } from "@/app/_constants/date-formatter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import TestCaseStepView from "../steps/_components/view-test-case-step";
import ViewTestCaseData from "../test-case-data/_components/view-test-case-data";
import ViewTestSuite from "../../../test-suites/_components/view-test-suite";
import { ITestSuite } from "@/app/_interface/test-suite";
import ViewRequirement from "../../../requirements/_components/view-requirement";
import { IRequirement } from "@/app/_interface/requirement";
import TestCaseAttachments from "../attachments/test-case-attachments";

const ViewTestCase = ({
  testCase,
  sheetOpen,
  setSheetOpen,
}: {
  testCase: ITestCase;
  sheetOpen: boolean;
  setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const testCaseId = testCase?.id;
  const [activeTab, setActiveTab] = useState("test-case");
  const [isTestSuiteOpen, setIsTestSuiteOpen] = useState<boolean>(false);
  const [isRequirementOpen, setIsRequirementOpen] = useState<boolean>(false);
  const [requirement, setRequirement] = useState<IRequirement>();

  useEffect(() => {
    if (sheetOpen) {
      setActiveTab("test-case");
    }
  }, [sheetOpen]);

  const viewRequirements = (requirement: IRequirement) => {
    setRequirement(requirement);
    setIsRequirementOpen(true);
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      {/* test suite */}
      <ViewTestSuite
        sheetOpen={isTestSuiteOpen}
        setSheetOpen={setIsTestSuiteOpen}
        testSuite={testCase?.testSuite as ITestSuite}
        isView={true}
      />

      {/* requirement */}
      <ViewRequirement
        sheetOpen={isRequirementOpen}
        setSheetOpen={setIsRequirementOpen}
        requirement={requirement as IRequirement}
      />
      <SheetContent className="w-full !max-w-full md:w-[580px] md:!max-w-[580px] overflow-y-auto">
        <SheetHeader className="mb-4">
          <div className="flex justify-between items-center mt-4">
            <p className="text-xl font-medium capitalize">
              <span className="mr-2 text-primary">{testCase?.customId}:</span>
              {testCase?.title}
            </p>
          </div>
          <span className="text-mute text-sm">
            {testCase?.userId?.firstName ? (
              <span>
                Created by {testCase?.userId?.firstName}{" "}
                {testCase?.userId?.lastName}
                {", "}
              </span>
            ) : null}
            Created on {formatDate(testCase?.createdAt || "")}
          </span>
        </SheetHeader>
        <DropdownMenuSeparator className="border-b" />

        <Tabs
          defaultValue="test-case"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-4"
        >
          <TabsList>
            <TabsTrigger value="test-case">Test case</TabsTrigger>
            <TabsTrigger value="steps">Steps</TabsTrigger>
            <TabsTrigger value="test-data">Test data</TabsTrigger>
          </TabsList>
          <TabsContent value="test-case">
            <div className="ml-[2px]">
              <div className="mt-3">
                <span>Expecetd result</span>
                <div
                  className="text-sm leading-relaxed text-gray-700"
                  dangerouslySetInnerHTML={{
                    __html: testCase?.expectedResult || "",
                  }}
                />
              </div>

              {/* test type */}
              {testCase?.testType &&
                <div className="mt-3">
                  <span>Test type</span>
                  <div className="text-sm leading-relaxed text-gray-700">
                    {testCase?.testType}
                  </div>
                </div>
              }

              {/* severity */}
              {testCase?.severity &&
                <div className="mt-3">
                  <span>Severity</span>
                  <div className="text-sm leading-relaxed text-gray-700">
                    {testCase?.severity}
                  </div>
                </div>
              }

              {/* testSuite */}
              <div className="mt-4">
                Test suite
                <div className="mt-2 rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Title</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {testCase?.testSuite ? (
                        <TableRow>
                          <TableCell className="hover:text-primary hover:cursor-pointer" onClick={() => setIsTestSuiteOpen(true)}>
                            {testCase?.testSuite?.customId}
                          </TableCell>
                          <TableCell>{testCase?.testSuite?.title}</TableCell>
                        </TableRow>
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center">
                            No test suite found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* test suite requirements */}
              <div className="mt-4">
                Requirements
                <div className="mt-2 rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Title</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {testCase?.requirements?.length ? (
                        testCase.requirements.map((requirement, index) => (
                          <TableRow key={index}>
                            <TableCell className="hover:text-primary hover:cursor-pointer" onClick={() => viewRequirements(requirement)}>
                              {requirement.customId}
                            </TableCell>
                            <TableCell>{requirement.title}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center">
                            No requirements found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="mt-4">
                Attachments
                <TestCaseAttachments
                  testCaseId={testCaseId}
                  isUpdate={false}
                  isView={true}
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="steps">
            <TestCaseStepView testCaseId={testCase?.id} />
          </TabsContent>
          <TabsContent value="test-data">
            <ViewTestCaseData testCaseId={testCase?.id} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default ViewTestCase;
