import { IRequirement } from '@/app/_interface/requirement';
import { ITestSuite } from '@/app/_interface/test-suite';
import { displayRTMStatus } from '@/app/_utils/common-functionality';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckIcon, X, ArrowRight, Hash, FileText, Target, ChevronLeft, ChevronRight, Grid3X3, List, Eye } from 'lucide-react';
import React, { useState, useMemo } from 'react';

export default function RtmTable({
    testCycle,
    testSuite,
    requirements,
    testCasesToDisplay,
    customIdCounts
}: {
    testCycle: any;
    testSuite: ITestSuite;
    requirements: IRequirement[],
    testCasesToDisplay: any[],
    customIdCounts: any
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [selectedView, setSelectedView] = useState<'summary' | 'matrix' | 'detailed'>('summary');

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'passed': return 'bg-green-100 text-green-800 border-green-200';
            case 'failed': return 'bg-red-100 text-red-800 border-red-200';
            case 'blocked': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'skipped': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    // Pagination logic
    const totalPages = Math.ceil(testCasesToDisplay.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentTestCases = testCasesToDisplay.slice(startIndex, endIndex);

    // Requirements pagination
    const requirementsPerPage = 8;
    const [requirementsPage, setRequirementsPage] = useState(1);
    const totalRequirementsPages = Math.ceil(requirements.length / requirementsPerPage);
    const currentRequirements = requirements.slice(
        (requirementsPage - 1) * requirementsPerPage,
        requirementsPage * requirementsPerPage
    );

    return (
        <div className="space-y-4">
            {/* Compact Project Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span><strong>Project:</strong> {requirements[0]?.projectId?.title || 'N/A'}</span>
                    <span>•</span>
                    <span><strong>Execution:</strong> {testCycle?.testCycle?.title || 'N/A'}</span>
                    <span>•</span>
                    <span><strong>Suite:</strong> {testSuite?.title || 'N/A'}</span>
                </div>
            </div>

            {/* View Selector */}
            <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="summary" className="flex items-center gap-2">
                        <List className="h-4 w-4" />
                        Summary
                    </TabsTrigger>
                    <TabsTrigger value="matrix" className="flex items-center gap-2">
                        <Grid3X3 className="h-4 w-4" />
                        Matrix
                    </TabsTrigger>
                    <TabsTrigger value="detailed" className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Detailed
                    </TabsTrigger>
                </TabsList>

                {/* Summary View */}
                <TabsContent value="summary" className="mt-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Requirements Coverage Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                                {requirements?.slice(0, 16).map((requirement) => (
                                    <div
                                        key={requirement.customId}
                                        className="bg-gray-50 rounded-md p-2 border border-gray-200 text-center"
                                    >
                                        <div className="text-xs font-medium text-gray-900 mb-1">
                                            {requirement.customId}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            {customIdCounts[requirement.customId] || 0} TCs
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {requirements.length > 16 && (
                                <div className="mt-3 text-center">
                                    <Badge variant="outline" className="text-xs">
                                        +{requirements.length - 16} more requirements
                                    </Badge>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Matrix View */}
                <TabsContent value="matrix" className="mt-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Traceability Matrix</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setRequirementsPage(Math.max(1, requirementsPage - 1))}
                                        disabled={requirementsPage === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm text-gray-600">
                                        Reqs {(requirementsPage - 1) * requirementsPerPage + 1}-{Math.min(requirementsPage * requirementsPerPage, requirements.length)} of {requirements.length}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setRequirementsPage(Math.min(totalRequirementsPages, requirementsPage + 1))}
                                        disabled={requirementsPage === totalRequirementsPages}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table className="table-fixed min-w-full">
                                    <TableHeader>
                                        <TableRow>
                                            <TableCell className="w-24 text-xs font-semibold bg-gray-50 sticky left-0 z-10">
                                                Test Case
                                            </TableCell>
                                            <TableCell className="w-20 text-xs font-semibold bg-gray-50">
                                                Status
                                            </TableCell>
                                            {currentRequirements.map((requirement) => (
                                                <TableCell
                                                    key={requirement.customId}
                                                    className="w-16 text-xs font-semibold bg-gray-50 text-center"
                                                >
                                                    {requirement.customId}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentTestCases.map((testCaseResult, index) => {
                                            const status = testCaseResult?.result || 'New';
                                            const mappedRequirements = testCaseResult?.testCaseId?.requirements || [];
                                            
                                            return (
                                                <TableRow key={index} className="hover:bg-gray-50">
                                                    <TableCell className="text-xs sticky left-0 bg-white z-10 border-r font-medium">
                                                        {testCaseResult?.testCaseId?.customId}
                                                    </TableCell>
                                                    <TableCell className="text-xs">
                                                        <Badge className={`text-xs ${getStatusColor(status)}`}>
                                                            {status}
                                                        </Badge>
                                                    </TableCell>
                                                    {currentRequirements.map((requirement) => (
                                                        <TableCell key={requirement.customId} className="text-center">
                                                            {mappedRequirements.some(
                                                                (req: IRequirement) => req.customId === requirement.customId
                                                            ) ? (
                                                                <CheckIcon className="h-4 w-4 text-green-600 mx-auto" />
                                                            ) : (
                                                                <X className="h-4 w-4 text-gray-300 mx-auto" />
                                                            )}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Test Cases Pagination */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <div className="text-sm text-gray-600">
                                    Showing {startIndex + 1}-{Math.min(endIndex, testCasesToDisplay.length)} of {testCasesToDisplay.length} test cases
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>
                                    <span className="text-sm text-gray-600">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Detailed View */}
                <TabsContent value="detailed" className="mt-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Detailed Test Case Mapping</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {currentTestCases.map((testCaseResult, index) => {
                                    const status = testCaseResult?.result || 'New';
                                    const mappedRequirements = testCaseResult?.testCaseId?.requirements || [];
                                    
                                    return (
                                        <div
                                            key={index}
                                            className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {testCaseResult?.testCaseId?.customId}
                                                    </span>
                                                    <Badge className={`text-xs ${getStatusColor(status)}`}>
                                                        {status}
                                                    </Badge>
                                                </div>
                                                <span className="text-xs text-gray-600">
                                                    {mappedRequirements.length} requirements
                                                </span>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-1">
                                                {mappedRequirements.map((req: IRequirement) => (
                                                    <Badge
                                                        key={req.customId}
                                                        variant="outline"
                                                        className="text-xs bg-green-50 text-green-700 border-green-200"
                                                    >
                                                        {req.customId}
                                                    </Badge>
                                                ))}
                                                {mappedRequirements.length === 0 && (
                                                    <span className="text-xs text-gray-500 italic">No requirements mapped</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination for detailed view */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <div className="text-sm text-gray-600">
                                    Showing {startIndex + 1}-{Math.min(endIndex, testCasesToDisplay.length)} of {testCasesToDisplay.length} test cases
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>
                                    <span className="text-sm text-gray-600">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
