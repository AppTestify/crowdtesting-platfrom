import { ISSUE_STATUS_LIST, Priority, Severity } from '@/app/_constants/issue';
import { TEST_CASE_SEVERITY } from '@/app/_constants/test-case';
import { getTesterPriorityDashboardService, getTesterSeverityDashboardService } from '@/app/_services/dashboard.service';
import toasterService from '@/app/_services/toaster-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React, { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis } from 'recharts';

const chartConfig = {
    [Priority.LOW]: {
        color: "hsl(var(--chart-2))",
    },
    [Priority.NORMAL]: {
        color: "hsl(var(--chart-4))",
    },
    [Priority.HIGH]: {
        color: "hsl(var(--chart-1))",
    },
    [Severity.MINOR]: {
        color: "hsl(var(--chart-2))",
    },
    [Severity.MAJOR]: {
        color: "hsl(var(--chart-4))",
    },
    [Severity.CRITICAL]: {
        color: "hsl(var(--chart-1))",
    },
    [Severity.BLOCKER]: {
        color: "hsl(var(--chart-3))",
    },
    Severity: {
        label: "Severity",
        color: 'hsl(var(--primary))'
    },
    [TEST_CASE_SEVERITY.MEDIUM]: {
        color: "hsl(var(--chart-4))",
    }
} satisfies ChartConfig;
type PriorityType = "Low" | "Normal" | "High" | "Severity";

const getColorForPriority = (level: string) => {
    switch (level) {
        case Priority.LOW:
            return 'hsl(var(--chart-2))';
        case Priority.NORMAL:
            return 'hsl(var(--chart-4))';
        case Priority.HIGH:
            return 'hsl(var(--chart-1))';
        case Severity.MINOR:
            return 'hsl(var(--chart-2))';
        case Severity.MAJOR:
            return 'hsl(var(--chart-4))';
        case Severity.CRITICAL:
            return 'hsl(var(--chart-1))';
        case Severity.BLOCKER:
            return 'hsl(var(--chart-3))';
        case TEST_CASE_SEVERITY.MEDIUM:
            return 'hsl(var(--chart-4))';
        default:
            return 'hsl(var(--primary))';
    }
};

interface HorizontalBarChartProps {
    title: string;
    description: string;
    dataKey: string;
    chartData: Record<string, number>;
    projectId?: string;
    entity?: string;
    isDropdown?: boolean;
}

export default function HorizontalBarChart({ title, description, dataKey, chartData, projectId, entity, isDropdown = true }: HorizontalBarChartProps) {
    const [status, setStatus] = useState<string>("");
    const [severity, setSeverity] = useState([]);

    const formattedData = status
        ? severity && typeof severity === 'object' && !Array.isArray(severity)
            ? Object.entries(severity).map(([key, value]) => ({
                level: (key || '').charAt(0).toUpperCase() + (key || '').slice(1),
                [dataKey]: value,
                color: getColorForPriority(key),
            }))
            : []
        : chartData && typeof chartData === 'object' && !Array.isArray(chartData)
            ? Object.entries(chartData).map(([key, value]) => ({
                level: (key || '').charAt(0).toUpperCase() + (key || '').slice(1),
                [dataKey]: value,
                color: getColorForPriority(key),
            }))
            : [];


    const getSeverityByStatus = async () => {
        try {
            const response = entity === "Severity" ? await getTesterSeverityDashboardService(projectId, status === "All" ? "" : status)
                : await getTesterPriorityDashboardService(projectId, status === "All" ? "" : status);
            setSeverity(response && typeof response === 'object' ? response : {});
        } catch (error) {
            toasterService.error();
        }
    }

    useEffect(() => {
        if (status) {
            getSeverityByStatus();
        }
    }, [status]);

    return (
        <Card className="mt-2 w-full shadow-none">
            <CardHeader className='flex-row items-start space-y-0 pb-0'>
                <div className='grid gap-1'>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>

                {isDropdown &&
                    <Select
                        onValueChange={(value) => setStatus(value)}
                    >
                        <SelectTrigger
                            className="ml-auto h-7 w-[150px] rounded-lg "
                            aria-label="Status"
                        >
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className='h-72'>
                            <SelectGroup>
                                <SelectItem value="All">
                                    <div className="flex items-center">All status</div>
                                </SelectItem>
                                {ISSUE_STATUS_LIST.map((role) => (
                                    <SelectItem value={role} >
                                        <div className="flex items-center">
                                            {role}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                }
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart accessibilityLayer data={formattedData}
                        margin={{ top: 20, bottom: 0 }}
                        barSize={40}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="level"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    hideLabel
                                    formatter={(value, name, props) => {
                                        const { payload } = props;
                                        if (!payload) return null;

                                        return (
                                            <div className="flex justify-between items-center w-full">
                                                <div className="flex items-center">
                                                    <div
                                                        className="w-3 h-3 rounded-full mr-2"
                                                        style={{ backgroundColor: payload.color }}
                                                    ></div>
                                                    <span>{payload.level}</span>
                                                </div>
                                                <div className="ml-auto">{value}</div>
                                            </div>
                                        );
                                    }}
                                />
                            }
                        />
                        <Bar
                            dataKey={dataKey}
                            fill={chartConfig[dataKey as PriorityType]?.color || 'hsl(var(--primary))'}
                            radius={8}
                        >
                            <LabelList
                                position="top"
                                offset={10}
                                className="fill-foreground"
                                fontSize={12}
                            />
                            {formattedData?.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
