import { Priority } from '@/app/_constants/issue';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from 'recharts';

const chartConfig = {
    severity: {
        label: "Severity",
        color: "hsl(var(--primary))",
    },
} satisfies ChartConfig;

const getColorForPriority = (level: string) => {
    switch (level) {
        case Priority.LOW:
            return '#3B82F6'; // Blue
        case Priority.NORMAL:
            return '#10B981'; // Green
        case Priority.HIGH:
            return '#EF4444'; // Red
        default:
            return '#8B5CF6'; // Purple
    }
};

// Custom label component for inside bars
const CustomLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    const labelX = x + width / 2;
    const labelY = y + height / 2;
    
    return (
        <text
            x={labelX}
            y={labelY}
            fill="white"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="12"
            fontWeight="600"
        >
            {value}
        </text>
    );
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
            level: (item?.name || '').charAt(0).toUpperCase() + (item?.name || '').slice(1),
            [dataKey]: item?.count,
            color: getColorForPriority(item?.name),
        }))
        : [];
    const isEmpty = Object.values(chartData || {}).every((value) => value === 0);

    return (
        <div className="h-full">
            {isEmpty ? (
                <div className='flex justify-center items-center h-[280px]'>
                    <div className="text-center">
                        <div className="text-gray-400 text-sm">No device data available</div>
                    </div>
                </div>
            ) : (
                <div className="h-[280px]">
                    <ChartContainer config={chartConfig} className="h-full w-full">
                        <BarChart 
                            accessibilityLayer 
                            data={formattedData}
                            margin={{ 
                                top: 20, 
                                right: 20, 
                                bottom: 20, 
                                left: 20 
                            }}
                            barSize={32}
                        >
                            <CartesianGrid vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="level"
                                tickLine={false}
                                tickMargin={8}
                                axisLine={false}
                                tick={{ fontSize: 11, fill: '#64748b' }}
                                tickFormatter={(value) => value.length > 8 ? value.slice(0, 8) + '...' : value}
                            />
                            <YAxis hide />
                            <ChartTooltip
                                cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                                content={<ChartTooltipContent 
                                    nameKey="level" 
                                    className="bg-white border border-gray-200 shadow-lg rounded-lg"
                                />}
                            />
                            <Bar
                                dataKey={dataKey}
                                fill="hsl(var(--chart-2))"
                                radius={[6, 6, 0, 0]}
                            >
                                <LabelList
                                    content={<CustomLabel />}
                                />
                                {formattedData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </div>
            )}
        </div>
    );
}
