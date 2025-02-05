import { formatDate } from '@/app/_constants/date-formatter';
import { IReport } from '@/app/_interface/report';
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet';
import React from 'react'
import ReportAttachments from '../attachments/report-attachment';
import { Separator } from '@/components/ui/separator';
import DefaultComments from '../../../comments';
import { DBModels } from '@/app/_constants';

export default function ViewReport({ sheetOpen, setSheetOpen, report }:
    {
        sheetOpen: boolean;
        setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
        report: IReport;
    }
) {
    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="w-full !max-w-full md:w-[580px] md:!max-w-[580px] overflow-y-auto">
                <SheetHeader className="mb-4">
                    <span className="text-mute text-sm">
                        {report?.userId?.firstName ? (
                            <span>
                                Created by {report?.userId?.firstName}{" "}
                                {report?.userId?.lastName}{", "}
                            </span>
                        ) : null}
                        Created on {formatDate(report?.createdAt || "")}
                    </span>
                </SheetHeader>
                <DropdownMenuSeparator className="border-b" />
                <div className="mt-2">
                    <span className="font-semibold text-lg">Title</span>
                    <div className="ml-1">
                        {report?.title}
                    </div>
                </div>
                <div className="mt-2">
                    <span className="font-semibold text-lg">Description</span>
                    <div
                        className="text-sm leading-relaxed text-gray-700 space-y-2 rich-description"
                        dangerouslySetInnerHTML={{
                            __html: report?.description || "",
                        }}
                    />
                </div>
                <div className='mt-2'>
                    <span className="font-semibold text-lg">Attachments</span>
                    <ReportAttachments reportId={report?._id} isUpdate={false} isView={true} />
                </div>

                <div className='mt-3'>
                    <Separator />
                    <DefaultComments project={report?.projectId} entityId={report?._id} entityName={DBModels.REPORT} />
                </div>
            </SheetContent>
        </Sheet>
    )
}
