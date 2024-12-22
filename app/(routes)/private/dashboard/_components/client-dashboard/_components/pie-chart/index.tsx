import { IssueStatus } from '@/app/_constants/issue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import React from 'react'
import { LabelList, Pie, PieChart } from 'recharts'

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
} satisfies ChartConfig

const getColorForStatus = (status: string) => {
    switch (status) {
        case IssueStatus.REPORTED.toLowerCase():
            return '#9CA3AF';
        case IssueStatus.FIXED.toLowerCase():
            return '#FACC15';
        case IssueStatus.DUPLICATE.toLowerCase():
            return '#60A5FA';
        case IssueStatus.INVALID.toLowerCase():
            return '#F87171';
        case IssueStatus.DEFERRED.toLowerCase():
            return '#FACC15';
        case IssueStatus.RETEST_FAILED.toLowerCase().split(' ').join('_'):
            return '#FB923C';
        case IssueStatus.RETEST_PASSED.toLowerCase().split(' ').join('_'):
            return '#15803D';
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
            level: key.charAt(0).toUpperCase() + key.slice(1),
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
                    <PieChart>
                        <ChartTooltip
                            content={<ChartTooltipContent nameKey="level" hideLabel />}
                        />
                        <Pie data={filteredData} dataKey="status">
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
