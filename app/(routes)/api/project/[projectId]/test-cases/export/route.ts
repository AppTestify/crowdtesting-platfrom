import { NextRequest, NextResponse } from "next/server";
import { TestCase } from "@/app/_models/test-case.model";
import { TestCaseStep } from "@/app/_models/test-case-step.model";
import { TestCaseData } from "@/app/_models/test-case-data";
import { TestSuite } from "@/app/_models/test-suite.model";
import { Requirement } from "@/app/_models/requirement.model";
import { User } from "@/app/_models/user.model";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { verifySession } from "@/app/_lib/dal";
import { connectDatabase } from "@/app/_db";
import { errorHandler } from "@/app/_utils/error-handler";
import { DB_CONNECTION_ERROR_MESSAGE, USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE } from "@/app/_constants/errors";

export async function GET(
    req: NextRequest,
    { params }: { params: { projectId: string } }
) {
    try {
        const session = await verifySession();
        if (!session.isAuth) {
            return NextResponse.json(
                { message: USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE },
                { status: HttpStatusCode.UNAUTHORIZED }
            );
        }

        const isDBConnected = await connectDatabase();
        if (!isDBConnected) {
            return NextResponse.json(
                {
                    message: DB_CONNECTION_ERROR_MESSAGE,
                },
                { status: HttpStatusCode.INTERNAL_SERVER_ERROR }
            );
        }

        const { searchParams } = new URL(req.url);
        const format = searchParams.get('format') || 'excel';

        // Get all test cases for the project with related data
        const testCases = await TestCase.find({ projectId: params.projectId })
            .populate('testSuite', 'title')
            .populate('requirements', 'title customId')
            .populate('userId', 'firstName lastName customId')
            .lean();

        // Get steps and test data for each test case
        const exportData = await Promise.all(
            testCases.map(async (testCase) => {
                const steps = await TestCaseStep.find({ testCaseId: testCase._id })
                    .sort({ order: 1 })
                    .lean();

                const testData = await TestCaseData.find({ testCaseId: testCase._id })
                    .lean();

                return {
                    id: testCase.customId || '',
                    title: testCase.title || '',
                    description: testCase.expectedResult || '',
                    precondition: testCase.precondition || '',
                    testType: testCase.testType || '',
                    severity: testCase.severity || '',
                    testSuite: testCase.testSuite?.title || '',
                    requirements: testCase.requirements?.map((req: any) => req.customId).join(', ') || '',
                    createdBy: testCase.userId ? `${testCase.userId.firstName || ''} ${testCase.userId.lastName || ''}`.trim() : '',
                    createdByEmail: testCase.userId?.customId || '',
                    createdAt: testCase.createdAt ? new Date(testCase.createdAt).toLocaleDateString() : '',
                    updatedAt: testCase.updatedAt ? new Date(testCase.updatedAt).toLocaleDateString() : '',
                    steps: steps.map((step, index) => `${index + 1}. ${step.description} | Expected: ${step.expectedResult}`).join('\n'),
                    testData: testData.map((data, index) => `${index + 1}. ${data.name} (${data.type}): ${data.inputValue}`).join('\n'),
                    attachmentsCount: testCase.attachments?.length || 0,
                    attachments: testCase.attachments?.map((att: any) => att.name).join(', ') || ''
                };
            })
        );

        if (format === 'csv') {
            // Generate CSV format
            const headers = [
                'ID',
                'Title',
                'Expected Result',
                'Precondition',
                'Test Type',
                'Severity',
                'Test Suite',
                'Requirements',
                'Created By',
                'Created By Email',
                'Created Date',
                'Updated Date',
                'Test Steps',
                'Test Data',
                'Attachments Count',
                'Attachments'
            ];

            const csvRows = [
                headers.join(','),
                ...exportData.map(row => [
                    row.id,
                    `"${row.title.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
                    `"${row.description.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
                    `"${row.precondition.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
                    row.testType,
                    row.severity,
                    `"${row.testSuite}"`,
                    `"${row.requirements}"`,
                    `"${row.createdBy}"`,
                    row.createdByEmail,
                    row.createdAt,
                    row.updatedAt,
                    `"${row.steps.replace(/"/g, '""').replace(/\n/g, ' | ')}"`,
                    `"${row.testData.replace(/"/g, '""').replace(/\n/g, ' | ')}"`,
                    row.attachmentsCount,
                    `"${row.attachments}"`
                ].join(','))
            ];

            const csvContent = csvRows.join('\n');
            
            return new Response(csvContent, {
                status: HttpStatusCode.OK,
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="test-cases-export-${new Date().toISOString().split('T')[0]}.csv"`
                }
            });
        }

        // Return Excel data
        return NextResponse.json({
            headers: [
                'ID',
                'Title',
                'Expected Result',
                'Precondition',
                'Test Type',
                'Severity',
                'Test Suite',
                'Requirements',
                'Created By',
                'Created By Email',
                'Created Date',
                'Updated Date',
                'Test Steps',
                'Test Data',
                'Attachments Count',
                'Attachments'
            ],
            data: exportData.map(row => [
                row.id,
                row.title,
                row.description,
                row.precondition,
                row.testType,
                row.severity,
                row.testSuite,
                row.requirements,
                row.createdBy,
                row.createdByEmail,
                row.createdAt,
                row.updatedAt,
                row.steps,
                row.testData,
                row.attachmentsCount,
                row.attachments
            ])
        });

    } catch (error) {
        return errorHandler(error);
    }
} 