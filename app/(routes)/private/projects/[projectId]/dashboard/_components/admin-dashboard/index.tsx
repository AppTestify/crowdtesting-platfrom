import AssigneeUser from '@/app/(routes)/private/dashboard/_components/client-dashboard/_components/assignee-user';
import StatusBarChart from '@/app/(routes)/private/dashboard/_components/client-dashboard/_components/bar-chart';
import DeviceChart from '@/app/(routes)/private/dashboard/_components/client-dashboard/_components/devices-chart';
import { DonutChart } from '@/app/(routes)/private/dashboard/_components/client-dashboard/_components/donut-chart';
import HorizontalBarChart from '@/app/(routes)/private/dashboard/_components/client-dashboard/_components/horizontal-bar-chart';
import { getDashboardClientService } from '@/app/_services/dashboard.service';
import toasterService from '@/app/_services/toaster-service';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'

export default function ProjectAdminDashboard() {
    const [dashboard, setDashboard] = useState<any>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { projectId } = useParams<{ projectId: string }>();

    const getClientDashboard = async () => {
        try {
            setIsLoading(true);
            const response = await getDashboardClientService(projectId);
            setDashboard(response);
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getClientDashboard();
    }, [projectId]);

    return (
        <div className="grid">
            {!isLoading && (
                <>
                    <div className="w-full mt-4">
                        <Card>
                            <CardHeader className=" rounded-none flex flex-col space-y-0 p-0 sm:flex-row">
                                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6 w-40">
                                    <CardTitle>Total data</CardTitle>
                                    <CardDescription>
                                        Showing total data
                                    </CardDescription>
                                </div>
                                <div className="flex">
                                    <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:mx-6 sm:py-6"
                                    >
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">Test Cycles</span>
                                        <span className="text-lg font-bold leading-none sm:text-3xl">
                                            {dashboard?.totalTestCycle}
                                        </span>
                                    </div>

                                    <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                                    >
                                        <span className="text-xs text-muted-foreground">Issues</span>
                                        <span className="text-lg font-bold leading-none sm:text-3xl">
                                            {dashboard?.totalIssues}
                                        </span>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    </div>
                    <div className="mt-1 sm:mt-2 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-2">
                        <HorizontalBarChart
                            title="Issues by severity"
                            description="Showing issue severity levels"
                            dataKey="severity"
                            chartData={dashboard?.severity || {}}
                            projectId={projectId}
                            entity={"Severity"}
                        />
                        <HorizontalBarChart
                            title="Issues by priority"
                            description="Showing issue priority levels"
                            dataKey="priority"
                            chartData={dashboard?.priority || {}}
                            projectId={projectId}
                            entity={"Priority"}
                        />
                        <DonutChart chartData={dashboard?.issueType} dataKey={"issueType"} title={"Issue Type"}
                            description={"Showing issue type levels"}
                            headerTitle={"Issue by type"} />
                    </div>
                    <div className="grid gap-2 mt-1 sm:mt-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
                        <StatusBarChart
                            title="Issues by status"
                            description="Showing status priority levels"
                            chartData={dashboard?.status || {}}
                            dataKey="status"
                        />
                        <DonutChart chartData={dashboard?.task} dataKey={"issueType"} title={"Task"}
                            description={"Showing task status levels"}
                            headerTitle={"Task by status"} />
                    </div>
                    <div className="grid grid-cols-[60%,40%] gap-2 mt-1 mb-2">
                        <DeviceChart
                            title="Issues by device"
                            description="Showing top 10 most devices"
                            dataKey="device"
                            chartData={dashboard?.topDevices || {}}
                        />
                        <DonutChart chartData={dashboard?.requirementStatus} dataKey={"issueType"} title={"Requirement"}
                            description={"Showing requirement status levels"}
                            headerTitle={"Requirement by status"} />
                    </div>

                    <div className='grid grid-cols-[60%]'>
                        <AssigneeUser assignedUser={dashboard?.assignedIssueCounts} />
                    </div>
                </>
            )}
        </div>
    )
}
