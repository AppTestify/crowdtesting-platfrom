import { formatDate } from '@/app/_constants/date-formatter';
import { ITestExecution } from '@/app/_interface/test-execution';
import { displayDate } from '@/app/_utils/common-functionality';
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Play, 
    Calendar, 
    User, 
    FileText, 
    Clock, 
    CheckCircle, 
    AlertCircle,
    Info,
    Tag
} from 'lucide-react';
import React from 'react'

export default function TestExecutionView({ sheetOpen, setSheetOpen, testExecution }:
    {
        sheetOpen: boolean;
        setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
        testExecution: ITestExecution;
    }
) {
    const getExecutionTypeColor = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'manual':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'automated':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'regression':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'smoke':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'sanity':
                return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };



    return (
        <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Play className="h-5 w-5 text-green-600" />
                        </div>
                        Test Execution Details
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                        Comprehensive view of test execution information, status, and timeline.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-6 space-y-6">
                    {/* Basic Information Card */}
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                Basic Information
                            </CardTitle>
                            <CardDescription>
                                Essential details about this test execution
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700 min-w-[80px]">Title:</span>
                                    <span className="text-sm text-gray-900 font-medium">{testExecution?.testCycle?.title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700 min-w-[80px]">Type:</span>

                                    <Badge className={getExecutionTypeColor(testExecution?.type || "")}>
                                        {testExecution?.type || "Not specified"}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Description Card */}
                    {testExecution?.testCycle?.description && (
                        <Card className="border-l-4 border-l-green-500">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Info className="h-5 w-5 text-green-600" />
                                    Description
                                </CardTitle>
                                <CardDescription>
                                    Detailed description of the test execution
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm leading-relaxed text-gray-700">
                                    {testExecution?.testCycle?.description}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Timeline Card */}
                    <Card className="border-l-4 border-l-purple-500">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-purple-600" />
                                Timeline
                            </CardTitle>
                            <CardDescription>
                                Execution timeline and date information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700 min-w-[100px]">Created:</span>
                                <span className="text-sm text-gray-600">
                                    {formatDate(testExecution?.createdAt || "")}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700 min-w-[100px]">Duration:</span>
                                <span className="text-sm text-gray-600">
                                    {displayDate(testExecution)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Creator Information Card */}
                    <Card className="border-l-4 border-l-orange-500">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <User className="h-5 w-5 text-orange-600" />
                                Creator Information
                            </CardTitle>
                            <CardDescription>
                                Details about who created this test execution
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {testExecution?.userId?.firstName ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                        <User className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-900">
                                            {testExecution?.userId?.firstName} {testExecution?.userId?.lastName}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Created on {formatDate(testExecution?.createdAt || "")}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-500">
                                    <User className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm">Creator information not available</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Additional Details Card */}
                    <Card className="border-l-4 border-l-indigo-500">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Tag className="h-5 w-5 text-indigo-600" />
                                Additional Details
                            </CardTitle>
                            <CardDescription>
                                Additional information and metadata
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {testExecution?.testCycle?.customId && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700 min-w-[120px]">Test Cycle ID:</span>
                                    <span className="text-sm text-indigo-600 font-semibold">{testExecution?.testCycle?.customId}</span>
                                </div>
                            )}
                            
                            {testExecution?.id && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700 min-w-[120px]">Execution ID:</span>
                                    <span className="text-sm text-gray-600 font-mono">{testExecution?.id}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    )
}
