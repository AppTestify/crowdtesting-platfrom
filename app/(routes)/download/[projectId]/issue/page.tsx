"use client";

import { useParams, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'

export default function IssueAtatchmentsDownload() {
    const searchParams = useSearchParams();
    const [issueId, setIssueId] = useState<string>("");
    const { projectId } = useParams<{ projectId: string }>();

    const downloadZip = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_URL}/api/project/${projectId}/issue/${issueId}/download-attachments`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ issueId: issueId })
                }
            );

            if (response.ok) {
                const blob = await response.blob();
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'images.zip';
                link.click();
            } else {
                console.error('Failed to download the file, status:', response.status);
            }
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };


    useEffect(() => {
        const tokenParam = searchParams.get("issue");
        setIssueId(tokenParam as string);
    }, [searchParams]);

    useEffect(() => {
        if (issueId) {
            downloadZip();
        }
    }, [issueId])

    return (
        <div className='flex justify-center items-center h-screen'>
            Do not close this tab, your download will start automatically.
        </div>
    )
}
