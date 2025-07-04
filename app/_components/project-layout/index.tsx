"use client";

import { IProjectPayload } from '@/app/_interface/project';
import { getProjectService, updateProjectTabAccessService } from '@/app/_services/project.service';
import toasterService from '@/app/_services/toaster-service';
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, Settings2, BarChart3, FileText, Users, Target, FlaskConical, TestTube, Play, Bug, CheckSquare, Repeat, FileBarChart, GitBranch, Badge, Activity } from 'lucide-react'
import { useSession } from 'next-auth/react';
import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { getProjectTabs, getTabIconComponent } from './_constants';
import { Checkbox } from '@/components/ui/checkbox';
import { UserRoles } from '@/app/_constants/user-roles';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

    const projectTitle = extractTextContent(project?.title || '');

    return (
        <div className='bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 shadow-sm'>
            <div className='px-6 pt-1 pb-4'>
                {!isLoading && (
                    <>
                        {/* Enhanced Header Section */}
                        <div className='flex items-center justify-between mb-3'>
                            <div className='flex items-center space-x-4'>
                                <Link 
                                    href={`/private/projects`}
                                    className='flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors duration-200 group'
                                >
                                    <ChevronLeft className='h-5 w-5 text-gray-600 group-hover:text-gray-900 transition-colors' />
                                </Link>
                                
                                <div className='flex items-center space-x-3'>
                                    <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg'>
                                        <FileText className='h-6 w-6 text-white' />
                                    </div>
                                    <div>
                                        <h1 className='text-2xl font-bold text-gray-900 tracking-tight leading-tight'>
                                            {projectTitle}
                                        </h1>
                                        <p className='text-sm text-gray-500 font-medium mt-0.5'>
                                            Project Overview & Management
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Tab Access Control */}
                            {userData?.role === UserRoles.ADMIN && (
                                <div className='flex items-center space-x-2'>
                                    <Popover>
                                        <TooltipProvider>
                                            <Tooltip delayDuration={100}>
                                                <TooltipTrigger asChild>
                                                    <PopoverTrigger asChild>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            className="hover:bg-gray-50 border-gray-200 shadow-sm"
                                                        >
                                                            <Settings2 className="h-4 w-4 mr-2 text-gray-600" />
                                                            Tab Access
                                                        </Button>
                                                    </PopoverTrigger>
                                                </TooltipTrigger>
                                                <TooltipContent side="bottom">
                                                    <p>Configure tab visibility and access permissions</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        <PopoverContent className="w-80 max-h-96 overflow-y-auto rounded-xl shadow-xl bg-white border border-gray-200" align="end">
                                            <div className="p-4">
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <Settings2 className="h-5 w-5 text-gray-700" />
                                                    <h3 className="font-semibold text-gray-900">Tab Access Control</h3>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-4">
                                                    Manage which tabs are visible to team members
                                                </p>
                                                
                                                <div className="space-y-3">
                                                    {accessTabs?.map((tab: any, index: number) => {
                                                        const IconComponent = getTabIconComponent(tab.label);
                                                        return (
                                                            <div
                                                                key={index}
                                                                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors duration-150"
                                                            >
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-50">
                                                                        <IconComponent className="h-4 w-4 text-blue-600" />
                                                                    </div>
                                                                    <Label 
                                                                        htmlFor={`checkbox-${index}`} 
                                                                        className="font-medium text-gray-800 cursor-pointer"
                                                                    >
                                                                        {tab.label}
                                                                    </Label>
                                                                </div>
                                                                <Checkbox
                                                                    id={`checkbox-${index}`}
                                                                    className="h-5 w-5 border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                                    checked={tab?.access}
                                                                    onCheckedChange={(isChecked) => handleCheckboxChange(tab, isChecked as boolean)}
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            )}
                        </div>

                        {/* Separator */}
                        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4"></div>

                        {/* Enhanced Tabs */}
                        <div className=''>
                            <Tabs value={activeTab} onValueChange={handleTabChange} defaultValue="dashboard" className="w-full">
                                {accessTabs?.length ? (
                                    <>
                                        <TabsList className="bg-gray-100/80 p-1 rounded-xl border border-gray-200 shadow-sm backdrop-blur-sm w-full h-auto flex-wrap gap-1 justify-start">
                                            {accessTabs
                                                ?.filter((tab: any) => {
                                                    // For admin, show all tabs they have roles for
                                                    if (userData?.role === UserRoles.ADMIN) {
                                                        return tab.roles.includes(userData?.role);
                                                    }
                                                    
                                                    // For tester and crowd tester, show tabs that are accessible
                                                    // Check if user is a tester (either normal or crowd)
                                                    const isTester = userData?.role === UserRoles.TESTER || userData?.role === UserRoles.CROWD_TESTER;
                                                    
                                                    if (isTester) {
                                                        // For testers, check if tab has tester role OR crowd tester role, and access is true
                                                        return (tab.roles.includes(UserRoles.TESTER) || tab.roles.includes(UserRoles.CROWD_TESTER)) && tab.access === true;
                                                    }
                                                    
                                                    // For other roles, check their specific role and access
                                                    return tab.roles.includes(userData?.role) && tab.access === true;
                                                }).map((tab: any, index: number) => {
                                                    const tabValue = tab?.label === "RTM" ? "RTM" : tab?.label.toLowerCase().replace(/ /g, '-');
                                                    const isActive = activeTab === tabValue;
                                                    const IconComponent = getTabIconComponent(tab.label);
                                                    
                                                    return (
                                                        <TooltipProvider key={index}>
                                                            <Tooltip delayDuration={200}>
                                                                <TooltipTrigger asChild>
                                                                    <TabsTrigger 
                                                                        value={tabValue}
                                                                        className={`
                                                                            flex items-center justify-center min-w-0 transition-all duration-200
                                                                            ${isActive 
                                                                                ? 'bg-white text-blue-700 shadow-md border border-blue-100' 
                                                                                : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                                                                            }
                                                                            sm:space-x-2 sm:px-3 sm:py-2 sm:rounded-lg
                                                                            px-2 py-2 rounded-md
                                                                        `}
                                                                    >
                                                                        <span className={`transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                                                                            <IconComponent className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                                                                        </span>
                                                                        <span className="hidden lg:inline text-xs font-medium whitespace-nowrap">
                                                                            {tab?.label}
                                                                        </span>
                                                                    </TabsTrigger>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="bottom" className="lg:hidden">
                                                                    <p className="text-xs">{tab?.label}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    );
                                                })}
                                        </TabsList>
                                        {roleBasedTab?.map((tab, index) => (
                                            <TabsContent key={index} value={tab} className="mt-0">
                                            </TabsContent>
                                        ))}
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="text-center">
                                            <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-500 text-sm">No tabs available</p>
                                        </div>
                                    </div>
                                )}
                            </Tabs>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
