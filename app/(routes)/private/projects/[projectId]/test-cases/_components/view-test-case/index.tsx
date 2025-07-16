import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Layers, 
  Target, 
  Paperclip,
  Calendar,
  User,
  Tag
} from "lucide-react";

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

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTestTypeColor = (testType: string) => {
    switch (testType?.toLowerCase()) {
      case 'functional':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'non-functional':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'regression':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'smoke':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
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

      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            Test Case Details
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Comprehensive view of test case information, steps, data, and related components.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          <Tabs
            defaultValue="test-case"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1">
              <TabsTrigger value="test-case" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <FileText className="h-4 w-4 mr-2" />
                Test Case
              </TabsTrigger>
              <TabsTrigger value="steps" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Layers className="h-4 w-4 mr-2" />
                Steps
              </TabsTrigger>
              <TabsTrigger value="test-data" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Target className="h-4 w-4 mr-2" />
                Test Data
              </TabsTrigger>
            </TabsList>

            <TabsContent value="test-case" className="mt-6 space-y-6">
              {/* Basic Information Card */}
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Essential details about this test case
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 min-w-[100px]">ID:</span>
                      <span className="text-sm text-blue-600 font-semibold">{testCase?.customId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 min-w-[100px]">Title:</span>
                      <span className="text-sm text-gray-900 font-medium">{testCase?.title}</span>
                    </div>
                  </div>
                  
                  {testCase?.testType && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 min-w-[100px]">Test Type:</span>
                      <Badge className={getTestTypeColor(testCase.testType)}>
                        {testCase.testType}
                      </Badge>
                    </div>
                  )}
                  
                  {testCase?.severity && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 min-w-[100px]">Severity:</span>
                      <Badge className={getSeverityColor(testCase.severity)}>
                        {testCase.severity}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Expected Result Card */}
              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Expected Result
                  </CardTitle>
                  <CardDescription>
                    The expected outcome when this test case is executed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="text-sm leading-relaxed text-gray-700 rich-description"
                    dangerouslySetInnerHTML={{
                      __html: testCase?.expectedResult || "",
                    }}
                  />
                </CardContent>
              </Card>

              {/* Test Suite Card */}
              <Card className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Layers className="h-5 w-5 text-purple-600" />
                    Test Suite
                  </CardTitle>
                  <CardDescription>
                    The test suite this test case belongs to
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {testCase?.testSuite ? (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Layers className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {testCase?.testSuite?.customId}
                            </div>
                            <div className="text-sm text-gray-600">
                              {testCase?.testSuite?.title}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setIsTestSuiteOpen(true)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Layers className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No test suite assigned</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Requirements Card */}
              <Card className="border-l-4 border-l-orange-500">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-600" />
                    Requirements
                  </CardTitle>
                  <CardDescription>
                    Requirements associated with this test case
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {testCase?.requirements?.length ? (
                    <div className="space-y-3">
                      {testCase.requirements.map((requirement, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                <Target className="h-4 w-4 text-orange-600" />
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {requirement.customId}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {requirement.title}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => viewRequirements(requirement)}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No requirements found</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Attachments Card */}
              <Card className="border-l-4 border-l-indigo-500">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Paperclip className="h-5 w-5 text-indigo-600" />
                    Attachments
                  </CardTitle>
                  <CardDescription>
                    Files and documents related to this test case
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TestCaseAttachments
                    testCaseId={testCaseId}
                    isUpdate={false}
                    isView={true}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="steps" className="mt-6">
              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Layers className="h-5 w-5 text-green-600" />
                    Test Steps
                  </CardTitle>
                  <CardDescription>
                    Step-by-step instructions for executing this test case
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TestCaseStepView testCaseId={testCase?.id} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="test-data" className="mt-6">
              <Card className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    Test Data
                  </CardTitle>
                  <CardDescription>
                    Data sets and parameters used for testing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ViewTestCaseData testCaseId={testCase?.id} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewTestCase;
