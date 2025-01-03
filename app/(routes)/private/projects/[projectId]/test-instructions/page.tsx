"use client";

import { IProject } from '@/app/_interface/project';
import { getProjectService } from '@/app/_services/project.service';
import toasterService from '@/app/_services/toaster-service';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'

export default function TestInstruction() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [project, setProject] = useState<IProject>();
    const { projectId } = useParams<{ projectId: string }>();

    const getProject = async () => {
        setIsLoading(true);
        try {
            const response = await getProjectService(projectId);
            if (response) {
                setProject(response);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getProject();
    }, [projectId]);

    return (
        <div className="mt-2 mx-4">
            {!isLoading ? (
                <div
                    className="text-sm leading-relaxed text-gray-700 space-y-2 rich-description"
                    dangerouslySetInnerHTML={{
                        __html: project?.description || "",
                    }}
                />
            ) : (
                <div className="flex flex-col space-y-3">
                    <Skeleton className="bg-gray-200 h-[225px] w-full rounded-xl" />
                </div>
            )}
        </div>
    )
}
