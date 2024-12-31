"use client";

import { IProjectPayload } from "@/app/_interface/project";
import { getProjectService } from "@/app/_services/project.service";
import toasterService from "@/app/_services/toaster-service";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardClientService, getTesterDashboardService } from "@/app/_services/dashboard.service";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import HorizontalBarChart from "../../../dashboard/_components/client-dashboard/_components/horizontal-bar-chart";
import { DonutChart } from "../../../dashboard/_components/client-dashboard/_components/donut-chart";
import StatusBarChart from "../../../dashboard/_components/client-dashboard/_components/bar-chart";
import DeviceChart from "../../../dashboard/_components/client-dashboard/_components/devices-chart";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";
import PieCharts from "../../../dashboard/_components/client-dashboard/_components/pie-chart";

export default function Projects() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [project, setProject] = useState<IProjectPayload>();
  const { projectId } = useParams<{ projectId: string }>();
  const [dashboard, setDashboard] = useState<any>();
  const [userData, setUserData] = useState<any>();
  const { data } = useSession();

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

  const getTesterDashboard = async () => {
    try {
      setIsLoading(true);
      const response = await getTesterDashboardService(projectId);
      setDashboard(response);
    } catch (error) {
      toasterService.error();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (data) {
      const { user } = data;
      setUserData(user);
    }
  }, [data]);

  useEffect(() => {
    if (userData?.role === UserRoles.CLIENT) {
      getClientDashboard();
    } else if (userData?.role === UserRoles.TESTER) {
      getTesterDashboard();
    }
    getProject();
  }, [projectId, userData?.role]);

  return (
    <div className="mt-2 mx-4">
      {!isLoading ? (
        <div className="mb-10">
          {userData?.role === UserRoles.CLIENT ?
            <div className="grid">
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
              <div className="mt-1 sm:mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2">
                <HorizontalBarChart
                  title="Issues by severity"
                  description="Showing issue severity levels"
                  dataKey="severity"
                  chartData={dashboard?.severity || {}}
                />
                <HorizontalBarChart
                  title="Issues by priority"
                  description="Showing issue priority levels"
                  dataKey="priority"
                  chartData={dashboard?.priority || {}}
                />
              </div>
              <div className="grid gap-2 mt-1 sm:mt-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
                <DonutChart chartData={dashboard?.issueType} dataKey={"issueType"} />
                <StatusBarChart
                  title="Issues by status"
                  description="Showing status priority levels"
                  chartData={dashboard?.status || {}}
                  dataKey="status"
                />

              </div>

              <div className="w-full sm:w-[60%] flex justify-center mt-1 mb-2">
                <DeviceChart
                  title="Issues by device"
                  description="Showing top 10 most devices"
                  dataKey="device"
                  chartData={dashboard?.topDevices || {}}
                />
              </div>
            </div> :
            userData?.role === UserRoles.TESTER ?
              <div>
                <div className="w-full mt-4 mb-2">
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
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            Test Cycles</span>
                          <span className="text-lg font-bold leading-none sm:text-3xl">
                            {dashboard?.testCycle}
                          </span>
                        </div>

                        <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                        >
                          <span className="text-xs text-muted-foreground">Issues</span>
                          <span className="text-lg font-bold leading-none sm:text-3xl">
                            {dashboard?.issue}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </div>
                <div className="grid gap-2 mt-1 sm:mt-2 grid-cols-1 sm:gap-4 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
                  <HorizontalBarChart
                    title="Severity Chart"
                    description="Showing issue severity levels"
                    dataKey="severity"
                    chartData={dashboard?.severity || {}}
                  />
                  <StatusBarChart
                    title="Issues by status"
                    description="Showing status priority levels"
                    chartData={dashboard?.status || {}}
                    dataKey="status"
                  />
                </div>
              </div>
              :
              <div
                className="text-sm leading-relaxed text-gray-700 space-y-2 rich-description"
                dangerouslySetInnerHTML={{
                  __html: project?.description || "",
                }}
              />
          }
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          <Skeleton className="bg-gray-200 h-[225px] w-full rounded-xl" />
        </div>
      )}
    </div>
  );
}
