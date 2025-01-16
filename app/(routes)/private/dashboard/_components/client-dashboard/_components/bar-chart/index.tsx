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
    [IssueStatus.NEW]: {
        label: IssueStatus.NEW,
        color: "#2C3E50", // Dark blue-gray
    },
    [IssueStatus.FIXED]: {
        label: IssueStatus.FIXED,
        color: "hsl(var(--chart-2))", // Strong red
    },
    [IssueStatus.DUPLICATE]: {
        label: IssueStatus.DUPLICATE,
        color: "#8E44AD", // Purple
    },
    [IssueStatus.OPEN]: {
        label: IssueStatus.OPEN,
        color: "#3498DB", // Bright blue
    },
    [IssueStatus.DEFERRED]: {
        label: IssueStatus.DEFERRED,
        color: "#F39C12", // Yellow-orange
    },
    [IssueStatus.ASSIGNED]: {
        label: IssueStatus.ASSIGNED,
        color: "#1ABC9C", // Teal
    },
    [IssueStatus.IN_PROGRESS]: {
        label: IssueStatus.IN_PROGRESS,
        color: "#D4AC0D", // Muted gold
    },

    [IssueStatus.READY_FOR_RETEST]: {
        label: IssueStatus.READY_FOR_RETEST,
        color: "#E67E22", // Orange
    },
    [IssueStatus.RETESTING]: {
        label: IssueStatus.RETESTING,
        color: "#D35400", // Dark orange
    },
    [IssueStatus.VERIFIED]: {
        label: IssueStatus.VERIFIED,
        color: "#16A070", // Deep teal green
    },
    [IssueStatus.CLOSED]: {
        label: IssueStatus.CLOSED,
        color: "#7D7C7C", // Lighter gray
    },
    [IssueStatus.REOPENED]: {
        label: IssueStatus.REOPENED,
        color: "#C0392B", // Red
    },
    [IssueStatus.REJECTED]: {
        label: IssueStatus.REJECTED,
        color: "#D32F2F", // Dark red
    },

    [IssueStatus.CANNOT_REPRODUCE]: {
        label: IssueStatus.CANNOT_REPRODUCE,
        color: "#7F8C8D", // Gray
    },
    [IssueStatus.BLOCKED]: {
        label: IssueStatus.BLOCKED,
        color: "#E74C3C", // Strong red
    },
    [IssueStatus.NOT_A_BUG]: {
        label: IssueStatus.NOT_A_BUG,
        color: "#BDC3C7", // Light gray
    },
    Completed: {
        label: "Completed",
        color: "#27AE60", // Green
    },
    Ongoing: {
        label: 'Ongoing',
        color: "#E67E22", // Orange
    },
    Active: {
        label: 'Active',
        color: "#8E44AD", // Purple
    },
    InActive: {
        label: 'In Active',
        color: "#C0392B", // Red
    }
} satisfies ChartConfig;

const getColorForStatus = (status: string) => {
    switch (status) {
        case IssueStatus.NEW:
            return '#2C3E50'; // Dark blue-gray
        case IssueStatus.FIXED:
            return 'hsl(var(--chart-2))'; // Strong red
        case IssueStatus.DUPLICATE:
            return '#8E44AD'; // Purple
        case IssueStatus.OPEN:
            return '#3498DB'; // Bright blue
        case IssueStatus.DEFERRED:
            return '#F39C12'; // Yellow-orange
        case IssueStatus.ASSIGNED:
            return '#1ABC9C'; // Teal
        case IssueStatus.IN_PROGRESS:
            return '#D4AC0D'; // Bright yellow
        case IssueStatus.READY_FOR_RETEST:
            return '#E67E22'; // Orange
        case IssueStatus.RETESTING:
            return '#D35400'; // Dark orange
        case IssueStatus.VERIFIED:
            return '#16A070'; // Light green
        case IssueStatus.CLOSED:
            return '#7D7C7C'; // Purple
        case IssueStatus.REOPENED:
            return '#C0392B'; // Red
        case IssueStatus.REJECTED:
            return '#D32F2F'; // Yellow-orange
        case IssueStatus.CANNOT_REPRODUCE:
            return '#7F8C8D'; // Gray
        case IssueStatus.BLOCKED:
            return '#E74C3C'; // Strong red
        case IssueStatus.NOT_A_BUG:
            return '#BDC3C7'; // Light gray
        case "completed":
            return '#27AE60'; // Green
        case "ongoing":
            return '#E67E22'; // Orange
        case "active":
            return '#8E44AD'; // Purple
        case "inActive":
            return '#C0392B'; // Red
        default:
            return '#27AE60'; // Default to green
    }
};


const CustomYAxisTick = ({ x, y, payload, width }: any) => {
    const label = chartConfig[payload.value as keyof typeof chartConfig]?.label;
    const truncatedLabel = label && label.length > 8 ? label.substring(0, 8) + "..." : label;

    return (
        <text
            x={5}
            y={y + 3}
            fill="#666"
            fontSize={12}
            width={width}
            style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            }}
        >
            {truncatedLabel}
        </text >
    );
};

export default function StatusBarChart({ title, description, chartData, dataKey }: HorizontalBarChartProps) {
    const formattedData = chartData
        ? Object.entries(chartData).map(([key, value]) => ({
            level: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
            [dataKey]: value,
            fill: getColorForStatus(key),
        }))
            .filter((data) =>
                typeof data[dataKey] === 'number' && data[dataKey] > 0
            ) : [];

    const isEmpty = Object.values(chartData || {}).every((value) => value === 0);

    return (
        <Card className='mt-2 shadow-none'>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                {isEmpty ? (
                    <div className='flex justify-center items-center h-40'>
                        <div className="text-center text-xl text-gray-500">No data found</div>
                    </div>
                ) : (
                    <ChartContainer config={chartConfig}>
                        <BarChart
                            accessibilityLayer
                            data={formattedData}
                            layout="vertical"
                            margin={{
                                left: 10,
                                right: 10,
                            }}
                            barSize={25}
                        >
                            <YAxis
                                dataKey="level"
                                type="category"
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => {
                                    const label = chartConfig[value as keyof typeof chartConfig]?.label;
                                    return label && label.length > 8 ? label.substring(0, 8) + "..." : label;
                                }}
                                tick={<CustomYAxisTick />}
                                interval={0}
                            />
                            <XAxis dataKey={dataKey} type="number" hide />
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
                                                            style={{ backgroundColor: payload.fill }}
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
                                dataKey="status" layout="vertical" radius={5} />
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}
