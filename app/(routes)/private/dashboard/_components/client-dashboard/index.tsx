import { getDashboardClientService } from "@/app/_services/dashboard.service";
import toasterService from "@/app/_services/toaster-service";
import { ChartConfig } from "@/components/ui/chart";
import React, { useEffect, useState } from "react";
import HorizontalBarChart from "./_components/horizontal-bar-chart";
import PieCharts from "./_components/pie-chart";

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  functional: {
    label: "Functional",
    color: "hsl(var(--chart-1))",
  },
  ui_ux: {
    label: "UI/UX",
    color: "hsl(var(--chart-2))",
  },
  usability: {
    label: "Usability",
    color: "hsl(var(--chart-3))",
  },
  performance: {
    label: "Performance",
    color: "hsl(var(--chart-4))",
  },
  security: {
    label: "Security",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export default function ClientDashboard() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dashboard, setDashboard] = useState<any>();

  const getClientDashboard = async () => {
    try {
      setIsLoading(true);
      const response = await getDashboardClientService();
      setDashboard(response);
    } catch (error) {
      toasterService.error();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getClientDashboard();
  }, []);

  const chartData = dashboard?.issueType
    ? Object.entries(dashboard.issueType)
      .filter(([key]) => key !== "total")
      .map(([key, value]) => ({
        issueType: key,
        visitors: value,
        fill: `var(--color-${key})`,
      }))
    : [];


  return (
    <div>
      <div className="grid gap-2 mt-1 sm:mt-2 grid-cols-1 sm:gap-4 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
        <HorizontalBarChart
          title="Severity Chart"
          description="Showing issue severity levels"
          dataKey="severity"
          chartData={dashboard?.severity || {}}
        />
        <HorizontalBarChart
          title="Priority Chart"
          description="Showing issue priority levels"
          dataKey="priority"
          chartData={dashboard?.priority || {}}
        />
        <PieCharts
          title="Status Chart"
          description="Showing status priority levels"
          chartData={dashboard?.status || {}}
          dataKey="status"
        />
        {/* <Card className="w-[30%] mt-2">
        <CardHeader className="items-center pb-0">
          <CardTitle>Issue Type</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="visitors"
                nameKey="issueType"
                innerRadius={60}
                strokeWidth={5}
              >
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="leading-none text-muted-foreground">
            Showing total issue type
          </div>
        </CardFooter>
      </Card> */}
      </div>
      <div className="grid gap-2 mt-1 sm:mt-2 grid-cols-1 sm:gap-4 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">

      </div>
    </div>
  );
}
