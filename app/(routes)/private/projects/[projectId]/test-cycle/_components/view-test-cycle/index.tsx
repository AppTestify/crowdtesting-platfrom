import { formatDate, formatDateWithoutTime } from '@/app/_constants/date-formatter';
import { ITestCycle } from '@/app/_interface/test-cycle';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Play, Calendar, FileText, User, Clock, Globe, Info, Eye, Target, Settings } from 'lucide-react';
import React from 'react'
import TestCycleAttachments from '../attachments/test-cycle-attachment';

interface ViewTestCycleProps {
    testCycle: ITestCycle;
    dialogOpen: boolean;
    setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ViewTestCycle({ testCycle, dialogOpen, setDialogOpen }: ViewTestCycleProps) {
    const testCycleId = testCycle?.id;

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-6">
                    {/* Balanced Header Design */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border border-blue-100">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100/50 to-indigo-100/50 rounded-full -translate-y-12 translate-x-12"></div>
                        <div className="relative flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Eye className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 font-mono">
                                        #{testCycle?.customId}
                                    </Badge>
                                    <Badge variant="outline" className="bg-white/80 border-blue-200 text-blue-700">
                                        View Mode
                                    </Badge>
                                </div>
                                <DialogTitle className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                                    {testCycle?.title}
                                </DialogTitle>
                                <DialogDescription className="text-gray-600 text-sm">
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4 text-blue-500" />
                                            <span>Created {formatDate(testCycle?.createdAt || "")}</span>
                                        </div>
                                        {testCycle?.userId?.firstName && (
                                            <div className="flex items-center gap-1">
                                                <User className="h-4 w-4 text-blue-500" />
                                                <span>
                                                    by {testCycle?.userId?.firstName}{" "}
                                                    {testCycle?.userId?.lastName}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </DialogDescription>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="mt-6 space-y-6">
                    {/* Quick Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Start Date</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {formatDateWithoutTime(testCycle?.startDate || "")}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">End Date</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {formatDateWithoutTime(testCycle?.endDate || "")}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Duration</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {testCycle?.startDate && testCycle?.endDate ? 
                                                `${Math.ceil((new Date(testCycle.endDate).getTime() - new Date(testCycle.startDate).getTime()) / (1000 * 60 * 60 * 24))} days` : 
                                                "Not set"
                                            }
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Basic Information Card */}
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Target className="h-5 w-5 text-blue-600" />
                                Basic Information
                            </CardTitle>
                            <p className="text-sm text-gray-600">
                                Test cycle details and configuration
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {testCycle?.description && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Info className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm font-medium text-gray-700">Description</span>
                                    </div>
                                    <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed pl-6">
                                        {testCycle.description}
                                    </div>
                                </div>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm font-medium text-gray-700">Start Date</span>
                                    </div>
                                    <p className="text-gray-900 font-medium pl-6">
                                        {testCycle?.startDate ? formatDateWithoutTime(testCycle.startDate) : "Not set"}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-red-500" />
                                        <span className="text-sm font-medium text-gray-700">End Date</span>
                                    </div>
                                    <p className="text-gray-900 font-medium pl-6">
                                        {testCycle?.endDate ? formatDateWithoutTime(testCycle.endDate) : "Not set"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Creator Information */}
                    {testCycle?.userId && (
                        <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <User className="h-5 w-5 text-green-600" />
                                    Created By
                                </CardTitle>
                                <p className="text-sm text-gray-600">
                                    Test cycle creator information
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={testCycle.userId.profilePicture?.data} />
                                        <AvatarFallback className="bg-green-100 text-green-700">
                                            {testCycle.userId.firstName?.[0]}{testCycle.userId.lastName?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {testCycle.userId.firstName} {testCycle.userId.lastName}
                                        </p>
                                        <p className="text-sm text-gray-600">{testCycle.userId.email}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}



                    {/* Attachments */}
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                Attachments
                            </CardTitle>
                            <p className="text-sm text-gray-600">
                                Supporting files and documents
                            </p>
                        </CardHeader>
                        <CardContent>
                            <TestCycleAttachments
                                testCycleId={testCycleId as string}
                                isUpdate={false}
                                isView={true}
                            />
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}
