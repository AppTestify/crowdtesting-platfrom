import { IssueStatus } from '@/app/_constants/issue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import React from 'react'
import { Bar, BarChart, XAxis, YAxis } from 'recharts'

interface HorizontalBarChartProps {
    title: string;
    description: string;
    dataKey: string;
    chartData: Record<string, number>;
}

const chartConfig = {
    [IssueStatus.REPORTED]: {
        label: IssueStatus.REPORTED,
        color: "#9CA3AF",
    },
    [IssueStatus.FIXED]: {
        label: IssueStatus.FIXED,
        color: "hsl(var(--primary))",
    },
    [IssueStatus.DUPLICATE]: {
        label: IssueStatus.DUPLICATE,
        color: "#60A5FA",
    },
    [IssueStatus.INVALID]: {
        label: IssueStatus.INVALID,
        color: "#F87171",
    },
    [IssueStatus.DEFERRED]: {
        label: IssueStatus.DEFERRED,
        color: "#FACC15",
    },
    [IssueStatus.RETEST_FAILED]: {
        label: IssueStatus.RETEST_FAILED,
        color: "#FB923C",
    },
    [IssueStatus.RETEST_PASSED]: {
        label: IssueStatus.RETEST_PASSED,
        color: "#15803D",
    },
    Completed: {
        label: "Completed",
        color: 'hsl(var(--primary))'
    },
    Ongoing: {
        label: 'Ongoing',
        color: '#F4A462'
    },
    Active: {
        label: 'Active',
        color: 'hsl(var(--primary))'
    },
    InActive: {
        label: 'In Active',
        color: '#F87171'
    }
} satisfies ChartConfig

const getColorForStatus = (status: string) => {
    switch (status) {
        case IssueStatus.REPORTED:
            return '#9CA3AF';
        case IssueStatus.FIXED:
            return 'hsl(var(--primary))';
        case IssueStatus.DUPLICATE:
            return '#60A5FA';
        case IssueStatus.INVALID:
            return '#F87171';
        case IssueStatus.DEFERRED:
            return '#FACC15';
        case IssueStatus.RETEST_FAILED:
            return '#FB923C';
        case IssueStatus.RETEST_PASSED:
            return '#15803D';
        case "completed":
            return 'hsl(var(--primary))';
        case "ongoing":
            return '#F4A462';
        case "active":
            return 'hsl(var(--primary))';
        case "inActive":
            return '#F87171';
        default:
            return 'hsl(var(--primary))';
    }
};

export default function StatusBarChart({ title, description, chartData, dataKey }: HorizontalBarChartProps) {
    const formattedData = chartData
        ? Object.entries(chartData).map(([key, value]) => ({
            level: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
            [dataKey]: value,
            fill: getColorForStatus(key),
        }))
        : [];

    return (
        <Card className='mt-2 shadow-none'>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart
                        accessibilityLayer
                        data={formattedData}
                        layout="vertical"
                        margin={{
                            left: 0,
                        }}
                    >
                        <YAxis
                            dataKey="level"
                            type="category"
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) =>
                                chartConfig[value as keyof typeof chartConfig]?.label
                            }
                        />
                        <XAxis dataKey="status" type="number" hide />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="status" layout="vertical" radius={5} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
