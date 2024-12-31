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
    [IssueStatus.OPEN]: {
        label: IssueStatus.OPEN,
        color: "#3B82F6",
    },
    [IssueStatus.DEFERRED]: {
        label: IssueStatus.DEFERRED,
        color: "#FACC15",
    },
    [IssueStatus.ASSIGNED]: {
        label: IssueStatus.ASSIGNED,
        color: "#6366F1",
    },
    [IssueStatus.IN_PROGRESS]: {
        label: IssueStatus.IN_PROGRESS,
        color: "#EAB308",
    },
    [IssueStatus.READY_FOR_RETEST]: {
        label: IssueStatus.READY_FOR_RETEST,
        color: "#2DD4BF",
    },
    [IssueStatus.RETESTING]: {
        label: IssueStatus.RETESTING,
        color: "#FB923C",
    },
    [IssueStatus.VERIFIED]: {
        label: IssueStatus.VERIFIED,
        color: "#15803D",
    },
    [IssueStatus.CLOSED]: {
        label: IssueStatus.CLOSED,
        color: "#A855F7",
    },
    [IssueStatus.REOPENED]: {
        label: IssueStatus.REOPENED,
        color: "#EC4899",
    },
    [IssueStatus.REJECTED]: {
        label: IssueStatus.REJECTED,
        color: "#F87171",
    },
    [IssueStatus.CANNOT_REPRODUCE]: {
        label: IssueStatus.CANNOT_REPRODUCE,
        color: "#4B5563",
    },
    [IssueStatus.BLOCKED]: {
        label: IssueStatus.BLOCKED,
        color: "#B91C1C",
    },
    [IssueStatus.NOT_A_BUG]: {
        label: IssueStatus.NOT_A_BUG,
        color: "#6B7280",
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
        case IssueStatus.OPEN:
            return '#3B82F6';
        case IssueStatus.DEFERRED:
            return '#FACC15';
        case IssueStatus.ASSIGNED:
            return '#6366F1';
        case IssueStatus.IN_PROGRESS:
            return '#EAB308';
        case IssueStatus.READY_FOR_RETEST:
            return '#2DD4BF';
        case IssueStatus.RETESTING:
            return '#FB923C';
        case IssueStatus.VERIFIED:
            return '#15803D';
        case IssueStatus.CLOSED:
            return '#A855F7';
        case IssueStatus.REOPENED:
            return '#EC4899';
        case IssueStatus.REJECTED:
            return '#F87171';
        case IssueStatus.CANNOT_REPRODUCE:
            return '#4B5563';
        case IssueStatus.BLOCKED:
            return '#B91C1C';
        case IssueStatus.NOT_A_BUG:
            return '#6B7280';
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
                            left: 10,
                            right: 10,
                        }}
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
                        <Bar dataKey="status" layout="vertical" radius={5} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
