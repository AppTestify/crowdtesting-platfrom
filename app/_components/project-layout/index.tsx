"use client";

import { IProjectPayload } from '@/app/_interface/project';
import { getProjectService } from '@/app/_services/project.service';
import toasterService from '@/app/_services/toaster-service';
import { useSession } from 'next-auth/react';
import { useParams, usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

// Function to extract text content from HTML strings
const extractTextContent = (htmlString: string): string => {
    if (!htmlString) return '';
    // Remove HTML tags and decode HTML entities
    return htmlString
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
        .replace(/&amp;/g, '&')  // Replace &amp; with &
        .replace(/&lt;/g, '<')   // Replace &lt; with <
        .replace(/&gt;/g, '>')   // Replace &gt; with >
        .replace(/&quot;/g, '"') // Replace &quot; with "
        .trim();
};

export default function ProjectLayouts({ onLoaded }: { onLoaded: () => void }) {
    const { data } = useSession();
    const [userData, setUserData] = useState<any>();
    const [project, setProject] = useState<IProjectPayload>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { projectId } = useParams<{ projectId: string }>();
    const router = useRouter();
    const pathname = usePathname();

    const getProject = async () => {
        setIsLoading(true);
        try {
            const response = await getProjectService(projectId);

            if (response) {
                setProject(response);
                onLoaded();
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getProject();
    }, [projectId]);

    useEffect(() => {
        if (data) {
            const { user } = data;
            setUserData(user);
        }
    }, [data]);

    if (isLoading || !project) {
        return (
            <div className='p-6'>
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded-lg w-1/3 mb-4"></div>
                    <div className="h-px bg-gray-200 mb-4"></div>
                    <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-10 bg-gray-200 rounded-lg w-24"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 shadow-sm'>
            <div className='px-6 pt-1 pb-4'>
                {!isLoading && (
                    <>
                        {/* Separator */}
                        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4"></div>
                    </>
                )}
            </div>
        </div>
    )
}
