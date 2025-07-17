import { formatDate } from '@/app/_constants/date-formatter';
import { IReport } from '@/app/_interface/report';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Eye, FileText, User, Calendar, Info, MessageSquare } from 'lucide-react';
import React from 'react'
import ReportAttachments from '../attachments/report-attachment';
import DefaultComments from '../../../comments';
import { DBModels } from '@/app/_constants';

export default function ViewReport({ dialogOpen, setDialogOpen, report }:
    {
        dialogOpen: boolean;
        setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
        report: IReport;
    }
) {
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
                                    <Badge variant="outline" className="bg-white/80 border-blue-200 text-blue-700">
                                        View Mode
                                    </Badge>
                                </div>
                                <DialogTitle className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                                    {report?.title}
                                </DialogTitle>
                                <DialogDescription className="text-gray-600 text-sm">
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4 text-blue-500" />
                                            <span>Created {formatDate(report?.createdAt || "")}</span>
                                        </div>
                                        {report?.userId?.firstName && (
                                            <div className="flex items-center gap-1">
                                                <User className="h-4 w-4 text-blue-500" />
                                                <span>
                                                    by {report?.userId?.firstName}{" "}
                                                    {report?.userId?.lastName}
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
                    {/* Basic Information Card */}
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Info className="h-5 w-5 text-blue-600" />
                                Report Details
                            </CardTitle>
                            <p className="text-sm text-gray-600">
                                Report information and description
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm font-medium text-gray-700">Title</span>
                                </div>
                                <p className="text-gray-900 font-medium pl-6">
                                    {report?.title}
                                </p>
                            </div>

                            {report?.description && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Info className="h-4 w-4 text-purple-500" />
                                        <span className="text-sm font-medium text-gray-700">Description</span>
                                    </div>
                                    <div 
                                        className="prose prose-sm max-w-none text-gray-700 leading-relaxed pl-6 rich-description"
                                        dangerouslySetInnerHTML={{
                                            __html: report?.description || "",
                                        }}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Creator Information */}
                    {report?.userId && (
                        <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <User className="h-5 w-5 text-green-600" />
                                    Created By
                                </CardTitle>
                                <p className="text-sm text-gray-600">
                                    Report creator information
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={report.userId.profilePicture?.data} />
                                        <AvatarFallback className="bg-green-100 text-green-700">
                                            {report.userId.firstName?.[0]}{report.userId.lastName?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {report.userId.firstName} {report.userId.lastName}
                                        </p>
                                        <p className="text-sm text-gray-600">{report.userId.email}</p>
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
                            <ReportAttachments reportId={report?._id} isUpdate={false} isView={true} />
                        </CardContent>
                    </Card>

                    {/* Comments */}
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-purple-600" />
                                Comments
                            </CardTitle>
                            <p className="text-sm text-gray-600">
                                Discussion and feedback on this report
                            </p>
                        </CardHeader>
                        <CardContent>
                            <DefaultComments project={report?.projectId} entityId={report?._id} entityName={DBModels.REPORT} />
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    )
}
