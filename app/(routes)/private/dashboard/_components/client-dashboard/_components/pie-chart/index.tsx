import { IssueStatus } from '@/app/_constants/issue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import React from 'react'
import { LabelList, Pie, PieChart } from 'recharts'

const chartConfig = {
    [IssueStatus.NEW]: {
        label: IssueStatus.NEW,
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
    [IssueStatus.CLOSED]: {
        label: IssueStatus.CLOSED,
        color: "#F87171",
    },
    [IssueStatus.DEFERRED]: {
        label: IssueStatus.DEFERRED,
        color: "#FACC15",
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
        case IssueStatus.NEW:
            return '#9CA3AF';
        case IssueStatus.FIXED:
            return 'hsl(var(--primary))';
        case IssueStatus.DUPLICATE:
            return '#60A5FA';
        case IssueStatus.CLOSED:
            return '#F87171';
        case IssueStatus.DEFERRED:
            return '#FACC15';
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

interface HorizontalBarChartProps {
    title: string;
    description: string;
    dataKey: string;
    chartData: Record<string, number>;
}

export default function PieCharts({ title, description, chartData, dataKey }: HorizontalBarChartProps) {
    const formattedData = chartData
        ? Object.entries(chartData).map(([key, value]) => ({
            level: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
            [dataKey]: value,
            fill: getColorForStatus(key),
        }))
        : [];

    const filteredData = formattedData.filter((item) => Number(item[dataKey]) > 0);

    return (
        <Card className="flex flex-col mt-2 shadow-none">
            <CardHeader className=" pb-0">
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px] [&_.recharts-text]:fill-background"
                >
                    <PieChart >
                        <ChartTooltip
                            content={<ChartTooltipContent nameKey="level" hideLabel />}
                        />
                        <Pie data={filteredData} dataKey={dataKey}
                        >
                            <LabelList
                                dataKey="level"
                                className="fill-background"
                                stroke="none"
                                fontSize={12}
                                formatter={(value: keyof typeof chartConfig) =>
                                    chartConfig[value]?.label || value.split('_').join(' ')
                                }
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
