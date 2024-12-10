"use client";

import { IProjectPayload } from '@/app/_interface/project';
import { getProjectService } from '@/app/_services/project.service';
import toasterService from '@/app/_services/toaster-service';
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, Plus } from 'lucide-react'
import { useSession } from 'next-auth/react';
import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { getProjectTabs } from './_constants';

export default function ProjectLayouts({ onLoaded }: { onLoaded: () => void }) {
    const { data } = useSession();
    const [userData, setUserData] = useState<any>();
    const [roleBasedTab, setRoleBasedTab] = useState<string[]>([]);
    const [project, setProject] = useState<IProjectPayload>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { projectId } = useParams<{ projectId: string }>();
    const router = useRouter();
    const pathname = usePathname();
    const activeTab = pathname.split('/').pop();

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

    const handleTabChange = (value: string) => {
        router.push(`/private/projects/${projectId}/${value}`);
    }

    useEffect(() => {
        if (data) {
            const { user } = data;
            setUserData(user);
            const projectTabs = getProjectTabs(user);
            setRoleBasedTab(projectTabs);
        }
    }, [data]);

    if (isLoading || !project) {
        return (
            <div className='p-4'>
            </div>
        );
    }

    return (
        <div className='px-4 py-3'>
            {!isLoading ?
                <>
                    <div className='mt-1 mb-3'>
                        <div className='text-2xl text-green-600 flex items-center'>
                            <Link href={`/private/projects`}>
                                <ChevronLeft className='text-black' />
                            </Link>
                            <p className='ml-2 capitalize'>
                                {project?.title}
                            </p>
                        </div>
                    </div>
                    <DropdownMenuSeparator className="border-b" />
                    <div className='mt-4'>
                        <Tabs value={activeTab} onValueChange={handleTabChange} defaultValue="overview" className="w-fit">
                            {roleBasedTab?.length ?
                                <>
                                    <TabsList className={`flex w-full`}>
                                        {roleBasedTab?.map((tab, index) => (
                                            <TabsTrigger key={index} className="w-fit" value={tab.replace(/ /g, '-')}>
                                                {/* <div className='mr-1'>
                                                    <Plus className='w-4 h-4' />
                                                </div> */}
                                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                    {roleBasedTab?.map((tab, index) => (
                                        <TabsContent key={index} value={tab}>
                                        </TabsContent>
                                    ))}
                                </>
                                : null}
                        </Tabs>
                    </div>
                </>
                :
                <div>Loading</div>
            }
        </div>
    )
}
