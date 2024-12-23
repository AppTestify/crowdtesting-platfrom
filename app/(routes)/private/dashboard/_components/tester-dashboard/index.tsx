import { getDashboardService, getTesterDashboardService } from "@/app/_services/dashboard.service";
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
import HorizontalBarChart from "../client-dashboard/_components/horizontal-bar-chart";
import PieCharts from "../client-dashboard/_components/pie-chart";

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

export default function TesterDashboard() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dashboard, setDashboard] = useState<any>();
  const lastIndex = dashboard?.length - 1;

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
      <div className="grid gap-2 mt-1 sm:mt-2 grid-cols-1 sm:gap-4 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
        <HorizontalBarChart
          title="Severity Chart"
          description="Showing issue severity levels"
          dataKey="severity"
          chartData={dashboard?.severity || {}}
        />
        <PieCharts
          title="Status Chart"
          description="Showing status priority levels"
          chartData={dashboard?.status || {}}
          dataKey="status"
        />
        <PieCharts
          title="Project Chart Sequence"
          description="Showing project sequence levels"
          chartData={dashboard?.ProjectSequence || {}}
          dataKey="project"
        />
      </div>
    </div>
  );
}
