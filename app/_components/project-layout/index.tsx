"use client";

import { IProjectPayload } from '@/app/_interface/project';
import { getProjectService, updateProjectTabAccessService } from '@/app/_services/project.service';
import toasterService from '@/app/_services/toaster-service';
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, GalleryVertical } from 'lucide-react'
import { useSession } from 'next-auth/react';
import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { getProjectTabs } from './_constants';
import { Checkbox } from '@/components/ui/checkbox';
import { UserRoles } from '@/app/_constants/user-roles';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function ProjectLayouts({ onLoaded }: { onLoaded: () => void }) {
    const { data } = useSession();
    const [userData, setUserData] = useState<any>();
    const [roleBasedTab, setRoleBasedTab] = useState<string[]>([]);
    const [project, setProject] = useState<IProjectPayload>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [accessTabs, setAccessTabs] = useState<any>([]);
    const { projectId } = useParams<{ projectId: string }>();
    const router = useRouter();
    const pathname = usePathname();
    const activeTab = pathname.split('/').pop();

    const getProject = async () => {
        setIsLoading(true);
        try {
            const response = await getProjectService(projectId);
            setAccessTabs(response?.projectTabAccess?.tabAccess);

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

    const handleCheckboxChange = async (tab: any, isChecked: boolean) => {
        const updatedTabs = accessTabs.map((t: any) =>
            t._id === tab._id ? { ...t, access: isChecked } : t
        );

        setAccessTabs(updatedTabs);
        try {
            const response = await updateProjectTabAccessService(projectId, tab._id, { access: isChecked });
            if (response) {
                toasterService.success(response.message);
                await getProject();
            }
        } catch (error) {
            console.error("handleCheckboxChange", handleCheckboxChange);
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
                            <div className='flex justify-end items-end ml-2'>
                                {userData?.role === UserRoles.ADMIN && (
                                    <Popover>
                                        <TooltipProvider>
                                            <Tooltip delayDuration={10}>
                                                <TooltipTrigger asChild>
                                                    <PopoverTrigger asChild>
                                                        <Button variant={"ghost"} size={"icon"}>
                                                            <GalleryVertical className="h-4 w-4 text-black" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Tab access</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        <PopoverContent className="w-auto h-72 overflow-y-auto rounded-lg shadow-lg bg-white" align="start">
                                            <div className="flex flex-col p-0">
                                                {accessTabs?.map((tab: any, index: number) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-gray-100 transition duration-200 cursor-pointer"
                                                    >
                                                        <Checkbox
                                                            id={`checkbox-${index}`}
                                                            className="h-5 w-5 border-gray-300 rounded-md"
                                                            checked={tab?.access}
                                                            onCheckedChange={(isChecked) => handleCheckboxChange(tab, isChecked as boolean)}
                                                        />
                                                        <Label htmlFor={`checkbox-${index}`} className="w-full text-center text-sm text-gray-600">
                                                            {tab.label}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                )}
                            </div>
                        </div>
                    </div>
                    <DropdownMenuSeparator className="border-b" />
                    <div className='mt-4'>
                        <Tabs value={activeTab} onValueChange={handleTabChange} defaultValue="overview" className="w-fit">
                            {accessTabs?.length ?
                                <>
                                    <TabsList className={`flex w-full`}>
                                        {accessTabs
                                            ?.filter((tab: any) =>
                                                userData?.role === UserRoles.ADMIN
                                                    ? tab.roles.includes(userData?.role)
                                                    : tab.roles.includes(userData?.role) && tab.access === true
                                            ).map((tab: any, index: number) => (
                                                <TabsTrigger key={index} className="w-fit" value={tab?.label === "RTM" ? "RTM" : tab?.label.toLowerCase().replace(/ /g, '-')}>
                                                    {tab?.label}
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
