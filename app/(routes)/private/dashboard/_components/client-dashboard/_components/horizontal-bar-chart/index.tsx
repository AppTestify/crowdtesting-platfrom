import { Priority } from '@/app/_constants/issue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, XAxis } from 'recharts';

const chartConfig = {
    severity: {
        label: "Severity",
        color: "hsl(var(--primary))",
    },
} satisfies ChartConfig;

const getColorForPriority = (level: string) => {
    switch (level) {
        case Priority.LOW.toLowerCase():
            return 'hsl(var(--primary))';
        case Priority.NORMAL.toLowerCase():
            return '#FACC15';
        case Priority.HIGH.toLowerCase():
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
                    <BarChart accessibilityLayer data={formattedData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="level"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar
                            dataKey={dataKey}
                            fill="var(--color-severity)"
                            radius={8}
                        >
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
