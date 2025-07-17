import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ITestSuite } from "@/app/_interface/test-suite";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/app/_constants/date-formatter";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TestSuiteTabs } from "@/app/_constants/project";
import ViewRequirement from "../../../requirements/_components/view-requirement";
import { useState } from "react";
import { IRequirement } from "@/app/_interface/requirement";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Layers, 
  FileText, 
  User, 
  Calendar, 
  Hash,
  Eye,
  Link,
  Clock,
  Tag,
  Info
} from "lucide-react";

// Helper function to strip HTML tags from text
const stripHtmlTags = (html: string): string => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, '');
};

const ViewTestSuite = ({
  testSuite,
  sheetOpen,
  setSheetOpen,
  isView
}: {
  testSuite: ITestSuite;
  sheetOpen: boolean;
  setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isView?: boolean;
}) => {
  const [isRequirementViewOpen, setIsRequirementViewOpen] = useState<boolean>(false);
  const [requirement, setRequirement] = useState<IRequirement>();

  const getRequirement = (requirement: IRequirement) => {
    setRequirement(requirement);
    setIsRequirementViewOpen(true);
  }

  return (
    <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
      <ViewRequirement
        requirement={requirement as IRequirement}
        sheetOpen={isRequirementViewOpen}
        setSheetOpen={setIsRequirementViewOpen}
      />
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-6">
          {/* Enhanced Header with Gradient Background */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border border-blue-100">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-indigo-100/50 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="relative flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Layers className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 font-mono">
                    #{testSuite?.customId}
                  </Badge>
                  <Badge variant="outline" className="bg-white/80 border-blue-200 text-blue-700">
                    Test Suite
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2">
                  {stripHtmlTags(testSuite?.title || "")}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span>Created {formatDate(testSuite?.createdAt || "")}</span>
                  </div>
                  {testSuite?.userId?.firstName && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4 text-blue-500" />
                      <span>
                        by {stripHtmlTags(testSuite?.userId?.firstName || "")}{" "}
                        {stripHtmlTags(testSuite?.userId?.lastName || "")}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Link className="h-4 w-4 text-blue-500" />
                    <span>{testSuite?.requirements?.length || 0} requirements</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-8 space-y-6">
          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-blue-500 bg-blue-50/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Description</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {testSuite?.description ? "Available" : "Not provided"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 bg-purple-50/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Link className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Requirements</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {testSuite?.requirements?.length || 0} linked
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 bg-green-50/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Created</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(testSuite?.createdAt || "")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {!isView && (
            <Tabs defaultValue={TestSuiteTabs.DESCRIPTION} className="w-full">
              <TabsList className="grid grid-cols-2 mb-6 w-full md:w-fit bg-gray-100 p-1">
                <TabsTrigger
                  value={TestSuiteTabs.DESCRIPTION}
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <FileText className="h-4 w-4" />
                  Description
                </TabsTrigger>
                <TabsTrigger
                  value={TestSuiteTabs.REQUIREMENTS}
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Link className="h-4 w-4" />
                  Requirements ({testSuite?.requirements?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={TestSuiteTabs.DESCRIPTION} className="space-y-4">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Info className="h-5 w-5 text-blue-600" />
                      Detailed Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {testSuite?.description ? (
                      <div
                        className="prose prose-sm max-w-none text-gray-700 rich-description leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: testSuite?.description || "",
                        }}
                      />
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No Description Available
                        </h3>
                        <p className="text-gray-500">
                          This test suite doesn't have a detailed description yet.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value={TestSuiteTabs.REQUIREMENTS} className="space-y-4">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Link className="h-5 w-5 text-purple-600" />
                      Linked Requirements
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Requirements associated with this test suite for traceability and testing coverage
                    </p>
                  </CardHeader>
                  <CardContent>
                    {testSuite?.requirements?.length ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {testSuite.requirements.map((requirement, index) => (
                            <Card 
                              key={index} 
                              className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-gray-200 hover:border-purple-300 bg-white hover:bg-gradient-to-br hover:from-purple-50 hover:to-white"
                              onClick={() => getRequirement(requirement)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <Badge 
                                    variant="secondary" 
                                    className="bg-purple-50 text-purple-700 border-purple-200 font-mono group-hover:bg-purple-100 transition-colors"
                                  >
                                    #{requirement.customId}
                                  </Badge>
                                  <Eye className="h-4 w-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-700 transition-colors">
                                  {stripHtmlTags(requirement.title)}
                                </h4>
                                <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                                  {stripHtmlTags(requirement.description || "No description available")}
                                </p>
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                  <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <Tag className="h-3 w-3" />
                                    <span>Click to view details</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Link className="h-10 w-10 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          No Requirements Linked
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                          This test suite doesn't have any linked requirements yet. 
                          You can link requirements to establish traceability between your test cases and requirements.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {isView && (
            <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                {testSuite?.description ? (
                  <div
                    className="prose prose-sm max-w-none text-gray-700 rich-description leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: testSuite?.description || "",
                    }}
                  />
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Description Available
                    </h3>
                    <p className="text-gray-500">
                      This test suite doesn't have a detailed description yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewTestSuite;
