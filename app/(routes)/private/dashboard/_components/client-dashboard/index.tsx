import { getDashboardService } from "@/app/_services/dashboard.service";
import toasterService from "@/app/_services/toaster-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import React, { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

const chartConfig = {
  project: {
    label: "Project",
    color: "#2563eb",
  },
  issue: {
    label: "Issue",
    color: "#60a5fa",
  },
};

export default function ClientDashboard() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dashboard, setDashboard] = useState<any>();
  const lastIndex = dashboard?.length - 1;

  const getDevices = async () => {
    try {
      setIsLoading(true);
      const response = await getDashboardService();
      setDashboard(response);
    } catch (error) {
      toasterService.error();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getDevices();
  }, []);

  return (
    <div>
      {/* <div className="w-[40%] mt-4">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Projects and issues data</CardTitle>
            <CardDescription>
              {dashboard?.[0]?.month} - {dashboard?.[lastIndex]?.month}{" "}
              {dashboard?.[0]?.year}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart accessibilityLayer data={dashboard}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="Project"
                  stackId="a"
                  fill="var(--color-project)"
                  radius={[0, 0, 4, 4]}
                />
                <Bar
                  dataKey="Issue"
                  stackId="a"
                  fill="var(--color-issue)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="leading-none text-muted-foreground">
              Showing total projects and issues for the last {dashboard?.length}{" "}
              months
            </div>
          </CardFooter>
        </Card>
      </div> */}
    </div>
  );
}
