import { Priority, Severity } from '@/app/_constants/issue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import React from 'react';
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

export default function HorizontalBarChart({ title, description, dataKey, chartData }: HorizontalBarChartProps) {
    const formattedData = chartData
        ? Object.entries(chartData).map(([key, value]) => ({
            level: key.charAt(0).toUpperCase() + key.slice(1),
            [dataKey]: value,
            color: getColorForPriority(key),
        }))
        : [];

    return (
        <Card className="mt-2 w-full shadow-none">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
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
                            {formattedData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
