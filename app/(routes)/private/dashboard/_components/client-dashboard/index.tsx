import { getDashboardClientService, getDashboardService } from "@/app/_services/dashboard.service";
import toasterService from "@/app/_services/toaster-service";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Label } from "@/components/ui/label";
import React, { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, XAxis } from "recharts";

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
      <Card className="flex flex-col mt-4 w-[50%]">
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
          {/* <div className="flex items-center gap-2 font-medium leading-none">
            Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
          </div> */}
          <div className="leading-none text-muted-foreground">
            Showing total issue type
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
