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

const chartConfig = {
    [IssueType.FUNCTIONAL]: {
        label: IssueType.FUNCTIONAL,
        color: "hsl(var(--chart-3))",
    },
    [IssueType.UI_UX]: {
        label: IssueType.UI_UX,
        color: "hsl(var(--chart-4))",
    },
    [IssueType.USABILITY]: {
        label: IssueType.USABILITY,
        color: "hsl(var(--chart-5))",
    },
    [IssueType.PERFORMANCE]: {
        label: IssueType.PERFORMANCE,
        color: "hsl(var(--chart-1))",
    },
    [IssueType.SECURITY]: {
        label: IssueType.SECURITY,
        color: "hsl(var(--chart-2))",
    },
    [TaskStatus.TODO]: {
        label: TaskStatus.TODO,
        color: "hsl(var(--chart-3))",
    },
    [TaskStatus.IN_PROGRESS]: {
        label: TaskStatus.IN_PROGRESS,
        color: "hsl(var(--chart-4))",
    },
    [TaskStatus.BLOCKED]: {
        label: TaskStatus.BLOCKED,
        color: "hsl(var(--chart-1))",
    },
    [TaskStatus.DONE]: {
        label: TaskStatus.DONE,
        color: "hsl(var(--chart-2))",
    },
    [TEST_TYPE.AUTOMATION]: {
        label: TEST_TYPE.AUTOMATION,
        color: "hsl(var(--chart-2))",
    },
    [TEST_TYPE.MANUAL]: {
        label: TEST_TYPE.MANUAL,
        color: "hsl(var(--chart-4))",
    },
    [TEST_CASE_SEVERITY.LOW]: {
        label: TEST_CASE_SEVERITY.LOW,
        color: "hsl(var(--chart-2))",
    },
    [TEST_CASE_SEVERITY.MEDIUM]: {
        label: TEST_CASE_SEVERITY.MEDIUM,
        color: "hsl(var(--chart-5))",
    },
    [TEST_CASE_SEVERITY.HIGH]: {
        label: TEST_CASE_SEVERITY.HIGH,
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;

const getColorForPriority = (level: string) => {
    switch (level) {
        case IssueType.FUNCTIONAL:
            return 'hsl(var(--chart-3))';
        case IssueType.UI_UX:
            return 'hsl(var(--chart-4))';
        case IssueType.USABILITY:
            return 'hsl(var(--chart-5))';
        case IssueType.PERFORMANCE:
            return 'hsl(var(--chart-1))';
        case IssueType.SECURITY:
            return 'hsl(var(--chart-2))';
        case TaskStatus.TODO:
            return 'hsl(var(--chart-3))';
        case TaskStatus.IN_PROGRESS:
            return 'hsl(var(--chart-4))';
        case TaskStatus.BLOCKED:
            return 'hsl(var(--chart-1))';
        case TaskStatus.DONE:
            return 'hsl(var(--chart-2))';
        case TEST_TYPE.AUTOMATION:
            return 'hsl(var(--chart-2))';
        case TEST_TYPE.MANUAL:
            return 'hsl(var(--chart-4))';
        case TEST_CASE_SEVERITY.LOW:
            return 'hsl(var(--chart-2))';
        case TEST_CASE_SEVERITY.MEDIUM:
            return 'hsl(var(--chart-5))';
        case TEST_CASE_SEVERITY.HIGH:
            return 'hsl(var(--chart-1))';
        default:
            return 'hsl(var(--primary))';
    }
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
                .filter(([key]) => key.toLowerCase() !== "total")
                .map(([key, value]) => ({
                    level: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, '/'),
                    [dataKey]: value,
                    fill: getColorForPriority(key),
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

    return (
        <Card className="mt-2 shadow-none flex flex-col">
            <ChartStyle id="pie-interactive" config={chartConfig} />
            <CardHeader className="flex-row items-start space-y-0 pb-0">
                <div className="grid gap-1">
                    <CardTitle>{headerTitle}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
                <Select value={activeLevel} onValueChange={setActiveLevel}>
                    <SelectTrigger
                        className="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
                        aria-label="Select an issue type"
                    >
                        <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                    <SelectContent align="end" className="rounded-xl">
                        {levels.map((level) => {
                            const formattedLevel = level === "Ui/ux" ? formatKey(level) : level;
                            const config = chartConfig[formattedLevel as keyof typeof chartConfig];

                            return config ? (
                                <SelectItem
                                    key={level}
                                    value={level}
                                    className="rounded-lg [&_span]:flex"
                                >
                                    <div className="flex items-center gap-2 text-xs">
                                        <span
                                            className="flex h-3 w-3 shrink-0 rounded-sm"
                                            style={{
                                                backgroundColor: config.color,
                                            }}
                                        />
                                        {config.label}
                                    </div>
                                </SelectItem>
                            ) : null;
                        })}
                    </SelectContent>
                </Select>
            </CardHeader>
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
                                innerRadius={60}
                                strokeWidth={5}
                                activeIndex={activeIndex}
                                activeShape={(props: any) => (
                                    <g>
                                        <Sector {...props} outerRadius={props.outerRadius + 10} />
                                        <Sector
                                            {...props}
                                            outerRadius={props.outerRadius + 25}
                                            innerRadius={props.outerRadius + 12}
                                        />
                                    </g>
                                )}
                            >
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                            return (
                                                <text
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                >
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        className="fill-foreground text-3xl font-bold"
                                                    >
                                                        {formattedData[activeIndex]?.issueType?.toLocaleString()}
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) + 24}
                                                        className="fill-muted-foreground"
                                                    >
                                                        {title}
                                                    </tspan>
                                                </text>
                                            )
                                        }
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
