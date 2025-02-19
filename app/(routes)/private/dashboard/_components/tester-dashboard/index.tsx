import { getTesterDashboardService } from "@/app/_services/dashboard.service";
import toasterService from "@/app/_services/toaster-service";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import HorizontalBarChart from "../client-dashboard/_components/horizontal-bar-chart";
import PieCharts from "../client-dashboard/_components/pie-chart";
import StatusBarChart from "../client-dashboard/_components/bar-chart";

export default function TesterDashboard() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dashboard, setDashboard] = useState<any>();

  const getTesterDashboard = async () => {
    try {
      setIsLoading(true);
      const response = await getTesterDashboardService();
      setDashboard(response);
    } catch (error) {
      toasterService.error();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getTesterDashboard();
  }, []);

  return (
    <div>
      {!isLoading && (
        <>
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
          <div className="grid gap-2 mt-1 sm:mt-2 grid-cols-1 sm:gap-4 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
            <HorizontalBarChart
              title="Severity Chart"
              description="Showing issue severity levels"
              dataKey="severity"
              chartData={dashboard?.severity || {}}
              projectId={""}
              entity={"Severity"}
            />
            <StatusBarChart
              title="Status Chart"
              description="Showing status priority levels"
              chartData={dashboard?.status || {}}
              dataKey="status"
            />
            <PieCharts
              title="Project Status Chart Sequence"
              description="Showing project sequence levels"
              chartData={dashboard?.ProjectSequence || {}}
              dataKey="project"
            />
          </div>
        </>
      )}
    </div>
  );
}
