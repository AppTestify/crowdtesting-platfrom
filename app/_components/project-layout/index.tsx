import { formatDate } from '@/app/_constants/date-formatter';
import { IProjectPayload } from '@/app/_interface/project';
import { getProjectService } from '@/app/_services/project.service';
import toasterService from '@/app/_services/toaster-service';
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronsRight } from 'lucide-react'
import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

export default function ProjectLayouts() {
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
            <div>
                <Link href={`/private/projects`}>
                    <p className="flex items-center tracking-wide text-lg text-[#215077] hover:text-[#0665b3]">
                        Manage Projects
                        <ChevronsRight className="w-4 ml-1" />
                    </p>
                </Link>
            </div>
            {!isLoading ?
                <>
                    <div className='mt-1'>
                        <p className='text-2xl text-[#545454]'>{project?.title} -
                            <span className='ml-2 text-lg text-[#777789]'>
                                Due Date: {formatDate(project?.createdAt as string)}</span>
                        </p>
                    </div>
                    <DropdownMenuSeparator className="border-b" />
                    <div className='mt-2'>
                        <div className='text-[#215077] hover:text-[#0665b3] text-lg font-semibold'>
                            Description
                        </div>
                        <Tabs value={activeTab} onValueChange={handleTabChange} defaultValue="dashboard" className="w-[400px]">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                                <TabsTrigger value="users">Users</TabsTrigger>
                                <TabsTrigger value="issues">Issues</TabsTrigger>
                            </TabsList>
                            <TabsContent value="dashboard">
                            </TabsContent>
                            <TabsContent value="users">
                            </TabsContent>
                            <TabsContent value="issues">
                            </TabsContent>
                        </Tabs>
                    </div>
                </>
                :
                <div>Loading</div>
            }
        </div>
    )
}
