import StatusBarChart from '@/app/(routes)/private/dashboard/_components/client-dashboard/_components/bar-chart';
import HorizontalBarChart from '@/app/(routes)/private/dashboard/_components/client-dashboard/_components/horizontal-bar-chart';
import { getTesterDashboardService } from '@/app/_services/dashboard.service';
import toasterService from '@/app/_services/toaster-service';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge';
import { Activity, Bug, TestTube, Zap, AlertTriangle, Target, BarChart3, TrendingUp, CheckCircle2 } from 'lucide-react';

// Simple Progress component
const Progress = ({ value = 0, className = "" }: { value?: number; className?: string }) => (
    <div className={`relative h-2 w-full overflow-hidden rounded-full bg-primary/20 ${className}`}>
        <div
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
    </div>
);

export default function ProjectTesterDashboard() {
    const [dashboard, setDashboard] = useState<any>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { projectId } = useParams<{ projectId: string }>();

    const getTesterDashboard = async () => {
        try {
            setIsLoading(true);
            const response = await getTesterDashboardService(projectId);
            setDashboard(response);
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getTesterDashboard();
    }, [projectId]);

    // Calculate tester-specific metrics
    const totalIssues = dashboard?.issue || 0;
    const completedIssues = dashboard?.status?.["CLOSED"] + dashboard?.status?.["VERIFIED"] || 0;
    const testingProgress = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;
    const criticalIssues = dashboard?.severity?.["CRITICAL"] + dashboard?.severity?.["BLOCKER"] || 0;
    const openIssues = dashboard?.status?.["OPEN"] + dashboard?.status?.["NEW"] + dashboard?.status?.["ASSIGNED"] || 0;

    return (
        <div className="space-y-8 pb-8">
            {!isLoading && (
                <>
                    {/* Header Section */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Testing Dashboard</h1>
                            <p className="text-muted-foreground mt-1">Focused testing metrics and quality assurance insights</p>
                        </div>
                        <Badge variant="outline" className="text-sm px-3 py-1">
                            <Activity className="w-4 h-4 mr-2" />
                            Active Testing
                        </Badge>
                    </div>

                    {/* Testing KPIs - Enhanced Layout */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className="text-sm font-medium text-blue-800">Total Issues</CardTitle>
                                <div className="p-2 bg-blue-200 rounded-full">
                                    <Bug className="h-5 w-5 text-blue-600" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="text-3xl font-bold text-blue-900">{totalIssues}</div>
                                <p className="text-xs text-blue-600 mt-2 font-medium">Issues to test</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className="text-sm font-medium text-green-800">Test Cycles</CardTitle>
                                <div className="p-2 bg-green-200 rounded-full">
                                    <TestTube className="h-5 w-5 text-green-600" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="text-3xl font-bold text-green-900">{dashboard?.testCycle || 0}</div>
                                <p className="text-xs text-green-600 mt-2 font-medium">Active cycles</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className="text-sm font-medium text-orange-800">Open Issues</CardTitle>
                                <div className="p-2 bg-orange-200 rounded-full">
                                    <Zap className="h-5 w-5 text-orange-600" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="text-3xl font-bold text-orange-900">{openIssues}</div>
                                <p className="text-xs text-orange-600 mt-2 font-medium">Awaiting testing</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-all duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className="text-sm font-medium text-red-800">Critical Issues</CardTitle>
                                <div className="p-2 bg-red-200 rounded-full">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="text-3xl font-bold text-red-900">{criticalIssues}</div>
                                <p className="text-xs text-red-600 mt-2 font-medium">High priority</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Testing Progress Overview - Enhanced Layout */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card className="hover:shadow-lg transition-all duration-300">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                    Testing Progress
                                </CardTitle>
                                <CardDescription>Overall testing completion status and efficiency</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm font-medium">
                                        <span>Completion Rate</span>
                                        <span className="text-primary font-bold">{testingProgress}%</span>
                                    </div>
                                    <Progress value={testingProgress} className="h-3" />
                                    <div className="text-xs text-muted-foreground text-center">
                                        {completedIssues} of {totalIssues} issues completed
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                                        <p className="text-xs text-green-600 font-medium">Completed</p>
                                        <p className="text-2xl font-bold text-green-700 mt-1">{completedIssues}</p>
                                    </div>
                                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                                        <p className="text-xs text-blue-600 font-medium">In Progress</p>
                                        <p className="text-2xl font-bold text-blue-700 mt-1">{totalIssues - completedIssues}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-all duration-300">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                    Quality Metrics
                                </CardTitle>
                                <CardDescription>Testing quality indicators and verification status</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors">
                                        <div className="text-3xl font-bold text-emerald-600">{dashboard?.status?.["VERIFIED"] || 0}</div>
                                        <div className="text-xs text-emerald-600 font-medium mt-1">Verified</div>
                                    </div>
                                    <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors">
                                        <div className="text-3xl font-bold text-amber-600">{dashboard?.status?.["RETESTING"] || 0}</div>
                                        <div className="text-xs text-amber-600 font-medium mt-1">Retesting</div>
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground text-center">
                                    Quality assurance metrics and verification progress
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Testing Analytics - Enhanced alignment and UI */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl">
                                <BarChart3 className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Testing Analytics</h2>
                                <p className="text-sm text-muted-foreground">Detailed analysis of testing patterns and issue distribution</p>
                            </div>
                        </div>
                        
                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="lg:col-span-1">
                                <Card className="h-full border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                            Issue Severity Distribution
                                        </CardTitle>
                                        <CardDescription className="text-sm text-gray-600">Critical, major, minor, and blocker issues</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <HorizontalBarChart
                                            title=""
                                            description=""
                                            dataKey="severity"
                                            chartData={dashboard?.severity || {}}
                                            projectId={projectId}
                                            entity={"Severity"}
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="lg:col-span-1">
                                <Card className="h-full border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            Testing Workflow Status
                                        </CardTitle>
                                        <CardDescription className="text-sm text-gray-600">Comprehensive view of all testing activities</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <HorizontalBarChart
                                            title=""
                                            description=""
                                            dataKey="status"
                                            chartData={dashboard?.status || {}}
                                            projectId={projectId}
                                            entity={"Status"}
                                            isDropdown={false}
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>

                    {/* Testing Insights - Enhanced Grid with improved UI */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl">
                                <Target className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Testing Insights</h2>
                                <p className="text-sm text-muted-foreground">Key focus areas and recent achievements</p>
                            </div>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-3">
                            <Card className="h-full border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-blue-50/20">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2 text-blue-700">
                                        <Target className="h-5 w-5" />
                                        Focus Areas
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4 text-sm">
                                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                                            <span className="font-medium text-red-700">Critical Issues</span>
                                            <Badge variant="destructive" className="text-xs">{criticalIssues}</Badge>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                                            <span className="font-medium text-orange-700">Open Issues</span>
                                            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">{openIssues}</Badge>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <span className="font-medium text-blue-700">In Progress</span>
                                            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-300">{dashboard?.status?.["IN_PROGRESS"] || 0}</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="h-full border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-green-50/20">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2 text-green-700">
                                        <CheckCircle2 className="h-5 w-5" />
                                        Recent Achievements
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4 text-sm">
                                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                                            <span className="font-medium text-green-700">Verified</span>
                                            <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">{dashboard?.status?.["VERIFIED"] || 0}</Badge>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                                            <span className="font-medium text-green-700">Fixed</span>
                                            <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">{dashboard?.status?.["FIXED"] || 0}</Badge>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                                            <span className="font-medium text-green-700">Closed</span>
                                            <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">{dashboard?.status?.["CLOSED"] || 0}</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="h-full border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-purple-50/20">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2 text-purple-700">
                                        <TestTube className="h-5 w-5" />
                                        Testing Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4 text-sm">
                                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                                            <span className="font-medium text-purple-700">Total Tests</span>
                                            <span className="font-bold text-purple-700 text-lg">{dashboard?.testCycle || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                                            <span className="font-medium text-purple-700">Completion</span>
                                            <span className="font-bold text-purple-700 text-lg">{testingProgress}%</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                                            <span className="font-medium text-purple-700">Efficiency</span>
                                            <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-300">
                                                {totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0}%
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
