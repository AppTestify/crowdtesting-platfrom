"use client";

import * as React from "react";
import { Label, Pie, PieChart, Sector } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartStyle,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { IssueType, TaskStatus } from "@/app/_constants/issue";
import { TEST_CASE_SEVERITY, TEST_TYPE } from "@/app/_constants/test-case";

// Enhanced color palette with more vibrant and modern colors
const enhancedColors = {
    // Issue Types
    [IssueType.FUNCTIONAL]: "#3B82F6", // Blue
    [IssueType.UI_UX]: "#8B5CF6", // Purple
    [IssueType.USABILITY]: "#06B6D4", // Cyan
    [IssueType.PERFORMANCE]: "#F59E0B", // Amber
    [IssueType.SECURITY]: "#EF4444", // Red
    
    // Task Status
    [TaskStatus.TODO]: "#6B7280", // Gray
    [TaskStatus.IN_PROGRESS]: "#F59E0B", // Amber
    [TaskStatus.BLOCKED]: "#EF4444", // Red
    [TaskStatus.DONE]: "#10B981", // Green
    
    // Test Types
    [TEST_TYPE.AUTOMATION]: "#10B981", // Green
    [TEST_TYPE.MANUAL]: "#3B82F6", // Blue
    
    // User Status
    active: "#10B981", // Green
    inactive: "#EF4444", // Red
    
    // Project Types & Device Usage (shared colors)
    web: "#3B82F6", // Blue
    mobile: "#8B5CF6", // Purple
    desktop: "#06B6D4", // Cyan
    tablet: "#06B6D4", // Cyan (same as desktop for consistency)
    
    // Default colors for unknown types
    unknown: "#6B7280", // Gray
    default: "#3B82F6", // Blue
};

const chartConfig = {
    [IssueType.FUNCTIONAL]: {
        label: IssueType.FUNCTIONAL,
        color: enhancedColors[IssueType.FUNCTIONAL],
    },
    [IssueType.UI_UX]: {
        label: IssueType.UI_UX,
        color: enhancedColors[IssueType.UI_UX],
    },
    [IssueType.USABILITY]: {
        label: IssueType.USABILITY,
        color: enhancedColors[IssueType.USABILITY],
    },
    [IssueType.PERFORMANCE]: {
        label: IssueType.PERFORMANCE,
        color: enhancedColors[IssueType.PERFORMANCE],
    },
    [IssueType.SECURITY]: {
        label: IssueType.SECURITY,
        color: enhancedColors[IssueType.SECURITY],
    },
    [TaskStatus.TODO]: {
        label: TaskStatus.TODO,
        color: enhancedColors[TaskStatus.TODO],
    },
    [TaskStatus.IN_PROGRESS]: {
        label: TaskStatus.IN_PROGRESS,
        color: enhancedColors[TaskStatus.IN_PROGRESS],
    },
    [TaskStatus.BLOCKED]: {
        label: TaskStatus.BLOCKED,
        color: enhancedColors[TaskStatus.BLOCKED],
    },
    [TaskStatus.DONE]: {
        label: TaskStatus.DONE,
        color: enhancedColors[TaskStatus.DONE],
    },
    [TEST_TYPE.AUTOMATION]: {
        label: TEST_TYPE.AUTOMATION,
        color: enhancedColors[TEST_TYPE.AUTOMATION],
    },
    [TEST_TYPE.MANUAL]: {
        label: TEST_TYPE.MANUAL,
        color: enhancedColors[TEST_TYPE.MANUAL],
    },
} satisfies ChartConfig;

const getColorForPriority = (level: string) => {
    // Check if it's a known type first
    if (enhancedColors[level as keyof typeof enhancedColors]) {
        return enhancedColors[level as keyof typeof enhancedColors];
    }
    
    // Handle common variations
    const lowerLevel = level.toLowerCase();
    if (lowerLevel.includes('active')) return enhancedColors.active;
    if (lowerLevel.includes('inactive')) return enhancedColors.inactive;
    if (lowerLevel.includes('web')) return enhancedColors.web;
    if (lowerLevel.includes('mobile')) return enhancedColors.mobile;
    if (lowerLevel.includes('desktop')) return enhancedColors.desktop;
    if (lowerLevel.includes('tablet')) return enhancedColors.tablet;
    
    // Fallback to default color
    return enhancedColors.default;
};

export function DonutChart({
    chartData,
    dataKey,
    title,
    description,
    headerTitle,
}: {
    chartData: Record<string, number>;
    dataKey: string;
    title: string;
    description: string;
    headerTitle: string;
}) {

    const formattedData = React.useMemo(() => {
        return chartData
            ? Object.entries(chartData)
                .filter(([key]) => key && key.toLowerCase() !== "total")
                .map(([key, value]) => ({
                    level: (key || '').charAt(0).toUpperCase() + (key || '').slice(1).replace(/_/g, '/'),
                    [dataKey]: value,
                    fill: getColorForPriority(key),
                    stroke: getColorForPriority(key),
                    strokeWidth: 2,
                }))
            : [];
    }, [chartData, dataKey]);

    const [activeLevel, setActiveLevel] = React.useState(
        formattedData[0]?.level
    );

    React.useEffect(() => {
        if (formattedData.length > 0) {
            setActiveLevel(formattedData[0]?.level);
        }
    }, [formattedData]);

    const activeIndex = React.useMemo(() => {
        return formattedData.findIndex((item) => item.level === activeLevel);
    }, [activeLevel, formattedData]);

    const levels = React.useMemo(
        () => formattedData.map((item) => item.level),
        [formattedData]
    );

    const formatKey = (key: string) => {
        return key.replace('_', '/').toUpperCase();
    };
    
    const isEmpty = Object.values(chartData || {}).every((value) => value === 0);
    
    // Calculate total for center display
    const total = React.useMemo(() => {
        return formattedData.reduce((sum, item) => sum + (Number(item[dataKey]) || 0), 0);
    }, [formattedData, dataKey]);

    return (
        <Card className="mt-2 shadow-none flex flex-col">
            <ChartStyle id="pie-interactive" config={chartConfig} />
            <CardContent className="flex flex-1 justify-center pb-0">
                {isEmpty ? (
                    <div className='flex justify-center items-center h-60'>
                        <div className="text-center text-xl text-gray-500">No data found</div>
                    </div>
                ) : (
                    <ChartContainer
                        id="pie-interactive"
                        config={chartConfig}
                        className="mx-auto aspect-square w-full max-w-[280px]"
                    >
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Pie
                                data={formattedData}
                                dataKey={dataKey}
                                nameKey="level"
                                innerRadius={70}
                                outerRadius={120}
                                strokeWidth={3}
                                stroke="#ffffff"
                                activeIndex={activeIndex}
                                activeShape={(props: any) => (
                                    <g>
                                        <Sector 
                                            {...props} 
                                            outerRadius={props.outerRadius + 8}
                                            stroke="#ffffff"
                                            strokeWidth={3}
                                        />
                                        <Sector
                                            {...props}
                                            outerRadius={props.outerRadius + 20}
                                            innerRadius={props.outerRadius + 10}
                                            fill="rgba(255, 255, 255, 0.1)"
                                            stroke="none"
                                        />
                                    </g>
                                )}
                            >
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox && typeof viewBox.cx === 'number' && typeof viewBox.cy === 'number') {
                                            return (
                                                <g>
                                                    {/* Enhanced background circle with gradient */}
                                                    <defs>
                                                        <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.95)" />
                                                            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.85)" />
                                                        </linearGradient>
                                                    </defs>
                                                    <circle
                                                        cx={viewBox.cx}
                                                        cy={viewBox.cy}
                                                        r={50}
                                                        fill="url(#centerGradient)"
                                                        stroke="rgba(0, 0, 0, 0.08)"
                                                        strokeWidth={1.5}
                                                        filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))"
                                                    />
                                                    
                                                    {/* Main number display */}
                                                    <text
                                                        x={viewBox.cx}
                                                        y={viewBox.cy - 5}
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                        className="fill-gray-900"
                                                        style={{
                                                            fontSize: '28px',
                                                            fontWeight: '700',
                                                            fontFamily: 'Inter, system-ui, sans-serif',
                                                            letterSpacing: '-0.025em'
                                                        }}
                                                    >
                                                        {total.toLocaleString()}
                                                    </text>
                                                    
                                                    {/* Label text with better styling */}
                                                    <text
                                                        x={viewBox.cx}
                                                        y={viewBox.cy + 18}
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                        className="fill-gray-600"
                                                        style={{
                                                            fontSize: '11px',
                                                            fontWeight: '500',
                                                            fontFamily: 'Inter, system-ui, sans-serif',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.05em'
                                                        }}
                                                    >
                                                        {title || 'Total'}
                                                    </text>
                                                    
                                                    {/* Subtle accent line */}
                                                    <line
                                                        x1={viewBox.cx - 20}
                                                        y1={viewBox.cy + 8}
                                                        x2={viewBox.cx + 20}
                                                        y2={viewBox.cy + 8}
                                                        stroke="rgba(0, 0, 0, 0.06)"
                                                        strokeWidth={1}
                                                    />
                                                </g>
                                            )
                                        }
                                        return null;
                                    }}
                                />
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}
