import { IProjectPayload } from '@/app/_interface/project';
import { getProjectService } from '@/app/_services/project.service';
import toasterService from '@/app/_services/toaster-service';
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { ProjectTabs } from './tabs';

export default function ProjectLayouts() {
    const [project, setProject] = useState<IProjectPayload>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { projectId } = useParams<{ projectId: string }>();
    const router = useRouter();
    const pathname = usePathname();
    const activeTab = pathname.split('/').pop();
    const roleBasedTab = ProjectTabs().getRoleBasedTabs();

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
    }

    useEffect(() => {
        getProject();
    }, [projectId]);

    const handleTabChange = (value: string) => {
        router.push(`/private/projects/${projectId}/projects/${value}`);
    }

    return (
        <div className='px-6 py-3'>
            {!isLoading ?
                <>
                    <div className='mt-1 mb-3'>
                        <p className='text-2xl text-green-600 flex items-center'>
                            <Link href={`/private/projects`}>
                                <ChevronLeft className='text-black' />
                            </Link>
                            <div className='ml-2'>
                                {project?.title}
                            </div>
                        </p>
                    </div>
                    <DropdownMenuSeparator className="border-b" />
                    <div className='mt-4'>
                        <Tabs value={activeTab} onValueChange={handleTabChange} defaultValue="overview" className="w-[400px]">
                            <TabsList className="grid w-full grid-cols-2">
                                {roleBasedTab?.map((tab) => (
                                    <TabsTrigger value={tab}>
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            {roleBasedTab?.map((tab) => (
                                <TabsContent value={tab}>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>
                </>
                :
                <div>Loading</div>
            }
        </div>
    )
}
