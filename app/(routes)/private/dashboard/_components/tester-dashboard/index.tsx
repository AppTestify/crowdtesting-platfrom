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

export default function TesterDashboard() {
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

  return <div></div>;
}
