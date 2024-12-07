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

const ViewTestCase = ({
  testCase,
  sheetOpen,
  setSheetOpen,
}: {
  testCase: ITestCase;
  sheetOpen: boolean;
  setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [activeTab, setActiveTab] = useState("test-case");

  useEffect(() => {
    if (sheetOpen) {
      setActiveTab("test-case");
    }
  }, [sheetOpen]);
  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
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
                          <TableCell>{testCase?.testSuite?.customId}</TableCell>
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
                            <TableCell>{requirement.customId}</TableCell>
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
