import { Priority } from '@/app/_constants/issue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis } from 'recharts';

const chartConfig = {
    severity: {
        label: "Severity",
        color: "hsl(var(--primary))",
    },
} satisfies ChartConfig;

const getColorForPriority = (level: string) => {
    switch (level) {
        case Priority.LOW:
            return 'hsl(var(--primary))';
        case Priority.NORMAL:
            return '#FACC15';
        case Priority.HIGH:
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

export default function DeviceChart({ title, description, dataKey, chartData }: HorizontalBarChartProps) {
    const formattedData = chartData
        ? Object.values(chartData).map((item: any) => ({
            level: item?.name.charAt(0).toUpperCase() + item?.name.slice(1),
            [dataKey]: item?.count,
            color: getColorForPriority(item?.name),
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
                        margin={{ top: 20 }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="level"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 10)}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent nameKey="level" />}
                        />
                        <Bar
                            dataKey={dataKey}
                            fill="var(--color-severity)"
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
