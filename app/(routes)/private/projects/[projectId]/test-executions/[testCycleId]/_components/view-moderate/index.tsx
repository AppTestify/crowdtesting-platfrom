import { ITestCaseResult } from '@/app/_interface/test-case-result';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import React, { useEffect, useState } from 'react'
import TestStep from '../../_section/test-step';
import TestData from '../../_section/test-data';
import { showTestCaseResultStatusBadge } from '@/app/_utils/common-functionality';
import { ITestCaseData } from '@/app/_interface/test-case-data';
import { getSingleTestCaseDataAttachmentsService } from '@/app/_services/test-case-data.service';
import toasterService from '@/app/_services/toaster-service';
import { Skeleton } from '@/components/ui/skeleton';
import { getTestResultAttachmentsService } from '@/app/_services/test-execution.service';
import TestCasesMediaRenderer from '../../../../test-cases/_components/media-render';
import { getTestCaseAttachmentsService } from '@/app/_services/test-case.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
    FileText, 
    Eye, 
    MessageSquare, 
    CheckCircle2, 
    XCircle, 
    AlertTriangle, 
    Clock, 
    User, 
    Calendar,
    PlayCircle,
    Target,
    Paperclip,
    Image as ImageIcon,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { formatDate } from '@/app/_constants/date-formatter';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export default function ModerateView({ sheetOpen, setSheetOpen, moderate }:
    {
        sheetOpen: boolean;
        setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
        moderate: ITestCaseResult;
    }
) {
    const [attchmentsLoading, setAttachmentsLoading] = useState<boolean>(false);
    const [testCaseDataAttachments, setTestCaseDataAttachments] = useState<ITestCaseData[]>([]);
    const [testCaseResultAttachments, setTestCaseResultAttachments] = useState<ITestCaseResult[]>([]);
    const [resultAttachmentsLoading, setResultAttachmentsLoading] = useState<boolean>(false);
    const [testCaseAttachmentsLoading, setTestCaseAttachmentsLoading] = useState<boolean>(false);
    const [testCaseAttachments, setTestCaseAttachments] = useState<any[]>([]);
    const [testDataExpanded, setTestDataExpanded] = useState(true);
    const [expectedResultExpanded, setExpectedResultExpanded] = useState(true);
    const [actualResultExpanded, setActualResultExpanded] = useState(true);
    const [remarksExpanded, setRemarksExpanded] = useState(true);
    const [attachmentsExpanded, setAttachmentsExpanded] = useState(true);
    
    const testCaseId = moderate?.original?.testCaseId._id;
    const projectId = moderate?.original?.testCaseId.projectId;
    const testCaseResultId = moderate?.original?._id;

    const getInitials = (firstName?: string, lastName?: string) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    const getResultIcon = (result: string) => {
        switch (result?.toLowerCase()) {
            case 'passed': return <CheckCircle2 className="h-4 w-4" />;
            case 'failed': return <XCircle className="h-4 w-4" />;
            case 'caution': return <AlertTriangle className="h-4 w-4" />;
            case 'blocked': return <Clock className="h-4 w-4" />;
            default: return <PlayCircle className="h-4 w-4" />;
        }
    };

    const getResultColor = (result: string) => {
        switch (result?.toLowerCase()) {
            case 'passed': return 'bg-green-100 text-green-800 border-green-200';
            case 'failed': return 'bg-red-100 text-red-800 border-red-200';
            case 'caution': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'blocked': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity?.toLowerCase()) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getTestCaseResultAttachments = async () => {
        setResultAttachmentsLoading(true);
        try {
            if (projectId && testCaseResultId) {
                const response = await getTestResultAttachmentsService(projectId, testCaseResultId);
                setTestCaseResultAttachments(response);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setResultAttachmentsLoading(false);
        }
    }

    const getTestCaseDataAttachments = async () => {
        setAttachmentsLoading(true);
        try {
            if (projectId && testCaseId) {
                const response = await getSingleTestCaseDataAttachmentsService(projectId, testCaseId);
                setTestCaseDataAttachments(response);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setAttachmentsLoading(false);
        }
    }

    const getTestCaseAttachments = async () => {
        setTestCaseAttachmentsLoading(true);
        try {
            if (testCaseId && projectId) {
                const response = await getTestCaseAttachmentsService(projectId, testCaseId);
                setTestCaseAttachments(response);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setTestCaseAttachmentsLoading(false);
        }
    }

    useEffect(() => {
        if (sheetOpen) {
            getTestCaseDataAttachments();
            getTestCaseResultAttachments();
            getTestCaseAttachments();
        }
    }, [sheetOpen]);

    if (!moderate?.original) {
        return null;
    }

    const testCase = moderate.original.testCaseId;
    const executionResult = moderate.original;

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="w-full !max-w-full lg:w-[90%] lg:!max-w-[90%] xl:w-[80%] xl:!max-w-[80%] p-0">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <SheetHeader className="px-6 py-4 border-b bg-white">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <SheetTitle className="text-xl font-bold text-gray-900">
                                            {testCase?.customId}
                                        </SheetTitle>
                                        <p className="text-gray-600 text-sm mt-1">
                                            Test Case Execution Details
                                        </p>
                                    </div>
                                </div>
                                
                                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                                    {testCase?.title}
                                </h2>

                                {/* Key Information */}
                                <div className="flex flex-wrap items-center gap-4">
                                    {testCase?.severity && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">Severity:</span>
                                            <Badge className={`text-xs ${getSeverityColor(testCase.severity)}`}>
                                                {testCase.severity}
                                            </Badge>
                                        </div>
                                    )}
                                    
                                    {executionResult?.result && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">Result:</span>
                                            <Badge className={`text-xs flex items-center gap-1 ${getResultColor(executionResult.result)}`}>
                                                {getResultIcon(executionResult.result)}
                                                {executionResult.result}
                                            </Badge>
                                        </div>
                                    )}

                                    {executionResult?.updatedBy && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">Executed by:</span>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-5 w-5">
                                                    <AvatarImage src={executionResult.updatedBy?.profilePicture?.data || ""} />
                                                    <AvatarFallback className="text-xs">
                                                        {getInitials(executionResult.updatedBy?.firstName, executionResult.updatedBy?.lastName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm text-gray-900">
                                                    {`${executionResult.updatedBy.firstName || ''} ${executionResult.updatedBy.lastName || ''}`.trim() || 
                                                     executionResult.updatedBy.customId || 'Unknown User'}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {executionResult?.updatedAt && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm text-gray-600">
                                                {formatDate(executionResult.updatedAt as string)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </SheetHeader>

                    {/* Content */}
                    <ScrollArea className="flex-1">
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {/* Left Column - Test Steps and Data */}
                                <div className="space-y-6">
                                    {/* Test Steps */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <PlayCircle className="h-5 w-5 text-green-600" />
                                                Test Steps & Results
                                            </CardTitle>
                                            <CardDescription>
                                                Detailed execution steps and their results
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <TestStep testCaseResult={moderate?.original} isView={true} />
                                        </CardContent>
                                    </Card>

                                    {/* Test Data */}
                                    <Collapsible open={testDataExpanded} onOpenChange={setTestDataExpanded}>
                                        <Card>
                                            <CollapsibleTrigger asChild>
                                                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle className="flex items-center gap-2">
                                                            <FileText className="h-5 w-5 text-purple-600" />
                                                            Test Data
                                                        </CardTitle>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            {testDataExpanded ? (
                                                                <ChevronUp className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronDown className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                    <CardDescription>
                                                        Input data and parameters for test execution
                                                    </CardDescription>
                                                </CardHeader>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <CardContent>
                                                    {attchmentsLoading ? (
                                                        <div className="space-y-3">
                                                            <Skeleton className="h-[50px] w-full" />
                                                            <Skeleton className="h-[50px] w-full" />
                                                        </div>
                                                    ) : (
                                                        <TestData testCaseResult={testCaseDataAttachments as unknown as ITestCaseResult} />
                                                    )}
                                                </CardContent>
                                            </CollapsibleContent>
                                        </Card>
                                    </Collapsible>
                                </div>

                                {/* Right Column - Results and Information */}
                                <div className="space-y-6">
                                    {/* Expected Result */}
                                    <Collapsible open={expectedResultExpanded} onOpenChange={setExpectedResultExpanded}>
                                        <Card>
                                            <CollapsibleTrigger asChild>
                                                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle className="flex items-center gap-2">
                                                            <Target className="h-5 w-5 text-indigo-600" />
                                                            Expected Result
                                                        </CardTitle>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            {expectedResultExpanded ? (
                                                                <ChevronUp className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronDown className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                    <CardDescription>
                                                        What should happen when the test is executed
                                                    </CardDescription>
                                                </CardHeader>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <CardContent>
                                                    <div
                                                        className="text-sm leading-relaxed text-gray-700 space-y-2 rich-description prose prose-sm max-w-none"
                                                        dangerouslySetInnerHTML={{
                                                            __html: testCase?.expectedResult || "No expected result specified.",
                                                        }}
                                                    />
                                                </CardContent>
                                            </CollapsibleContent>
                                        </Card>
                                    </Collapsible>

                                    {/* Actual Result */}
                                    {executionResult?.actualResult && (
                                        <Collapsible open={actualResultExpanded} onOpenChange={setActualResultExpanded}>
                                            <Card>
                                                <CollapsibleTrigger asChild>
                                                    <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                                                        <div className="flex items-center justify-between">
                                                            <CardTitle className="flex items-center gap-2">
                                                                <Eye className="h-5 w-5 text-blue-600" />
                                                                Actual Result
                                                            </CardTitle>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                {actualResultExpanded ? (
                                                                    <ChevronUp className="h-4 w-4" />
                                                                ) : (
                                                                    <ChevronDown className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                        <CardDescription>
                                                            What actually happened during test execution
                                                        </CardDescription>
                                                    </CardHeader>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <CardContent>
                                                        <div className="text-sm leading-relaxed text-gray-700 space-y-2 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                                                            {executionResult.actualResult}
                                                        </div>
                                                    </CardContent>
                                                </CollapsibleContent>
                                            </Card>
                                        </Collapsible>
                                    )}

                                    {/* Remarks */}
                                    {executionResult?.remarks && (
                                        <Collapsible open={remarksExpanded} onOpenChange={setRemarksExpanded}>
                                            <Card>
                                                <CollapsibleTrigger asChild>
                                                    <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                                                        <div className="flex items-center justify-between">
                                                            <CardTitle className="flex items-center gap-2">
                                                                <MessageSquare className="h-5 w-5 text-orange-600" />
                                                                Remarks
                                                            </CardTitle>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                {remarksExpanded ? (
                                                                    <ChevronUp className="h-4 w-4" />
                                                                ) : (
                                                                    <ChevronDown className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                        <CardDescription>
                                                            Additional comments and observations
                                                        </CardDescription>
                                                    </CardHeader>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <CardContent>
                                                        <div className="text-sm leading-relaxed text-gray-700 space-y-2 bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                                                            {executionResult.remarks}
                                                        </div>
                                                    </CardContent>
                                                </CollapsibleContent>
                                            </Card>
                                        </Collapsible>
                                    )}

                                    {/* Attachments */}
                                    <Collapsible open={attachmentsExpanded} onOpenChange={setAttachmentsExpanded}>
                                        <Card>
                                            <CollapsibleTrigger asChild>
                                                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle className="flex items-center gap-2">
                                                            <Paperclip className="h-5 w-5 text-gray-600" />
                                                            Attachments & Evidence
                                                        </CardTitle>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            {attachmentsExpanded ? (
                                                                <ChevronUp className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronDown className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                    <CardDescription>
                                                        Files, screenshots, and supporting documents
                                                    </CardDescription>
                                                </CardHeader>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <CardContent className="space-y-6">
                                                    {/* Execution Result Attachments */}
                                                    {(testCaseResultAttachments?.length > 0 || resultAttachmentsLoading) && (
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                                                                <ImageIcon className="h-4 w-4 text-green-600" />
                                                                Execution Evidence
                                                            </h4>
                                                            {resultAttachmentsLoading ? (
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                    <Skeleton className="h-[140px] w-full" />
                                                                    <Skeleton className="h-[140px] w-full" />
                                                                </div>
                                                            ) : (
                                                                <TestCasesMediaRenderer
                                                                    attachments={testCaseResultAttachments || []}
                                                                    title=""
                                                                />
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Test Case Reference Attachments */}
                                                    {(testCaseAttachments?.length > 0 || testCaseAttachmentsLoading) && (
                                                        <div>
                                                            <Separator className="my-4" />
                                                            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                                                                <FileText className="h-4 w-4 text-blue-600" />
                                                                Test Case References
                                                            </h4>
                                                            {testCaseAttachmentsLoading ? (
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                    <Skeleton className="h-[140px] w-full" />
                                                                    <Skeleton className="h-[140px] w-full" />
                                                                </div>
                                                            ) : (
                                                                <TestCasesMediaRenderer
                                                                    attachments={testCaseAttachments || []}
                                                                    title=""
                                                                />
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* No Attachments State */}
                                                    {!resultAttachmentsLoading && !testCaseAttachmentsLoading && 
                                                     testCaseResultAttachments?.length === 0 && testCaseAttachments?.length === 0 && (
                                                        <div className="text-center py-8">
                                                            <Paperclip className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                                            <p className="text-gray-500 text-sm">No attachments found for this test execution</p>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </CollapsibleContent>
                                        </Card>
                                    </Collapsible>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </div>
            </SheetContent>
        </Sheet>
    )
}
