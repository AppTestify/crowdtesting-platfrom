import { DB_CONNECTION_ERROR_MESSAGE, USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { Requirement } from "@/app/_models/requirement.model";
import { errorHandler } from "@/app/_utils/error-handler";

// Utility function to wrap text to specified width
function wrapText(text: string, maxWidth: number): string {
    if (!text) return '';
    
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
        // If adding this word would exceed the width, start a new line
        if (currentLine.length + word.length + 1 > maxWidth) {
            if (currentLine) {
                lines.push(currentLine.trim());
                currentLine = word;
            } else {
                // Word itself is longer than maxWidth, break it
                lines.push(word.substring(0, maxWidth));
                currentLine = word.substring(maxWidth);
            }
        } else {
            currentLine += (currentLine ? ' ' : '') + word;
        }
    }
    
    if (currentLine) {
        lines.push(currentLine.trim());
    }
    
    return lines.join('\n');
}

export async function GET(
    req: Request,
    { params }: { params: { projectId: string } }
) {
    try {
        const session = await verifySession();
        if (!session) {
            return Response.json(
                { message: USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE },
                { status: HttpStatusCode.UNAUTHORIZED }
            );
        }

        const isDBConnected = await connectDatabase();
        if (!isDBConnected) {
            return Response.json(
                {
                    message: DB_CONNECTION_ERROR_MESSAGE,
                },
                { status: HttpStatusCode.INTERNAL_SERVER_ERROR }
            );
        }

        const { projectId } = params;
        const { searchParams } = new URL(req.url);
        const format = searchParams.get('format') || 'json';

        // Get all requirements for the project with populated fields
        const requirements = await Requirement.find({ projectId })
            .populate("userId", "firstName lastName email")
            .populate("assignedTo", "firstName lastName email")
            .populate("attachments")
            .sort({ createdAt: -1 })
            .lean();

        // Transform data for export
        const exportData = requirements.map((req: any) => ({
            id: req.customId,
            title: wrapText(req.title, 50), // Wrap title to 50 characters
            description: wrapText(req.description?.replace(/<[^>]*>/g, '') || '', 80), // Strip HTML and wrap to 80 characters
            status: req.status,
            createdBy: req.userId ? `${req.userId.firstName} ${req.userId.lastName}` : '',
            assignedTo: req.assignedTo ? `${req.assignedTo.firstName} ${req.assignedTo.lastName}` : 'Unassigned',
            assignedToEmail: req.assignedTo?.email || '',
            startDate: req.startDate ? new Date(req.startDate).toLocaleDateString() : '',
            endDate: req.endDate ? new Date(req.endDate).toLocaleDateString() : '',
            createdAt: new Date(req.createdAt).toLocaleDateString(),
            updatedAt: new Date(req.updatedAt).toLocaleDateString(),
            attachmentsCount: req.attachments?.length || 0,
            attachments: req.attachments?.length > 0 
                ? `${process.env.NEXT_PUBLIC_URL}/download/${projectId}/requirement?requirement=${req._id}`
                : ''
        }));

        if (format === 'csv') {
            // Generate CSV format
            const headers = [
                'ID',
                'Title',
                'Description',
                'Status',
                'Created By',
                'Assigned To',
                'Assignee Email',
                'Start Date',
                'End Date',
                'Created Date',
                'Updated Date',
                'Attachments Count',
                'Attachments Link'
            ];

            const csvRows = [
                headers.join(','),
                ...exportData.map(row => [
                    row.id,
                    `"${row.title.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
                    `"${row.description.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
                    row.status,
                    `"${row.createdBy}"`,
                    `"${row.assignedTo}"`,
                    row.assignedToEmail,
                    row.startDate,
                    row.endDate,
                    row.createdAt,
                    row.updatedAt,
                    row.attachmentsCount,
                    row.attachments
                ].join(','))
            ];

            const csvContent = csvRows.join('\n');
            
            return new Response(csvContent, {
                status: HttpStatusCode.OK,
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="requirements-export-${new Date().toISOString().split('T')[0]}.csv"`
                }
            });
        }

        return Response.json(
            {
                message: "Requirements exported successfully",
                data: exportData,
                headers: [
                    'ID',
                    'Title',
                    'Description',
                    'Status',
                    'Created By',
                    'Assigned To',
                    'Assignee Email',
                    'Start Date',
                    'End Date',
                    'Created Date',
                    'Updated Date',
                    'Attachments Count',
                    'Attachments Link'
                ]
            },
            { status: HttpStatusCode.OK }
        );
    } catch (error) {
        return errorHandler(error);
    }
} 