import { ITestCaseResult } from '@/app/_interface/test-case-result';
import { Sheet, SheetContent } from '@/components/ui/sheet'
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
    const testCaseId = moderate?.original?.testCaseId._id;
    const projectId = moderate?.original?.testCaseId.projectId;
    const testCaseResultId = moderate?.original?._id;

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
    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="w-full !max-w-full md:w-[65%] md:!max-w-[65%] overflow-y-auto">
                <div className=' grid grid-cols-1 md:grid-cols-2 gap-4 h-full'>
                    <div>
                        <TestStep testCaseResult={moderate?.original} isView={true} />
                        {attchmentsLoading ?
                            <div className='mt-6'>
                                <Skeleton className="h-[50px] mt-1 w-full rounded-xl bg-gray-200" />
                                <Skeleton className="h-[50px] mt-1 w-full rounded-xl bg-gray-200" />
                            </div> :
                            <TestData testCaseResult={testCaseDataAttachments as unknown as ITestCaseResult} />
                        }
                    </div>
                    <div>
                        <div className='mt-5'>
                            <div className='text-lg font-semibold'>
                                Expected result
                            </div>
                            <div
                                className="text-sm leading-relaxed text-gray-700 space-y-2 rich-description"
                                dangerouslySetInnerHTML={{
                                    __html: moderate?.original?.testCaseId?.expectedResult || "",
                                }}
                            />
                        </div>
                        {moderate && moderate?.original?.actualResult &&
                            <div className='mt-5'>
                                <div className='text-lg font-semibold'>
                                    Actual result
                                </div>
                                <div className=" leading-relaxed text-gray-700 space-y-2 rich-description">
                                    {moderate?.original?.actualResult}
                                </div>
                            </div>
                        }
                        {moderate && moderate?.original?.remarks &&
                            <div className='mt-5'>
                                <div className='text-lg font-semibold'>
                                    Remarks
                                </div>
                                <div className="leading-relaxed text-gray-700 space-y-2 rich-description">
                                    {moderate?.original?.remarks}
                                </div>
                            </div>
                        }
                        {moderate && moderate?.original?.result &&
                            <div className='mt-5'>
                                <div className=''>
                                    <span className='text-lg font-semibold'>Result:</span>
                                    <span className='leading-relaxed text-gray-700 space-y-2 rich-description ml-4'>
                                        {showTestCaseResultStatusBadge(moderate?.original?.result as string)}
                                    </span>
                                </div>
                            </div>
                        }

                        <div>
                            {resultAttachmentsLoading ?
                                <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-2'>
                                    <Skeleton className="h-[140px] mt-1 w-[200px] rounded-xl bg-gray-200" />
                                    <Skeleton className="h-[140px] mt-1 w-[200px] rounded-xl bg-gray-200" />
                                </div> :
                                <TestCasesMediaRenderer
                                    attachments={testCaseResultAttachments || []}
                                    title={"Actual results"}
                                />
                            }
                        </div>

                        <div>
                            {testCaseAttachmentsLoading ?
                                <div className='mt-5 grid grid-cols-1 md:grid-cols-2 gap-2'>
                                    <Skeleton className="h-[140px] mt-1 w-[200px] rounded-xl bg-gray-200" />
                                    <Skeleton className="h-[140px] mt-1 w-[200px] rounded-xl bg-gray-200" />
                                </div> :
                                <div>
                                    <TestCasesMediaRenderer
                                        attachments={testCaseAttachments || []}
                                        title={"Test Case"}
                                    />
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
